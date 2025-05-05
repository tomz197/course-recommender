from dotenv import load_dotenv
load_dotenv()
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List

import numpy as np
import scipy.sparse as sp
from datetime import datetime

from app.recommend.embeddings import recommend_courses, recommend_average, recommend_max, recommend_mmr_cos, recommend_max_with_combinations
from app.recommend.keywords import recommend_courses_keywords
from app.recommend.baseline import recommend_courses_baseline
from app.courses import CourseClient
from app.types import (
    CourseWithId,
    RecommendationFeedbackLog,
    UserFeedbackLog,
    RecommendationResponse,
)
from app.db.mongo import MongoDBLogger
from app.logger import logger

import asyncio
from concurrent.futures import ThreadPoolExecutor

# Resource placeholders
courseClient = None
all_embeds = None
kwd_intersects_gemini = None
kwd_intersects_tfidf = None
db = None

logger.info("Starting Muni Courses API")
server_start_time = datetime.now()

app = FastAPI(logger=logger)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL"),
        "https://recommend.muni.courses",
        "https://muni.courses",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware to log all incoming HTTP requests."""
    start_time = datetime.now()
    path = request.url.path
    query_params = str(request.query_params)
    client_host = request.client.host if request.client else "unknown"
    
    logger.info(f"Request started: {request.method} {path} from {client_host}")
    
    response = await call_next(request)
    
    process_time = (datetime.now() - start_time).total_seconds()
    status_code = response.status_code
    
    logger.info(f"Request completed: {request.method} {path} - Status: {status_code} - Duration: {process_time:.3f}s - Query params: {query_params}")
    
    return response


assets = "assets"
def load_course_client():
    logger.info("Loading course data...")
    cc = CourseClient(os.path.join(assets, "courses"))
    logger.info(f"Course data loaded successfully with {len(cc.df)} courses")
    return cc

def load_embeddings():
    logger.info("Loading embeddings...")
    emb = np.load(os.path.join(assets, "embeddings_tomas_03.npy"), allow_pickle=True, mmap_mode="r")
    logger.info(f"Embeddings loaded successfully with shape {emb.shape}")
    return emb

def load_gemini_intersects():
    logger.info("Loading Gemini keyword intersections...")
    gi = sp.load_npz(os.path.join(assets, "intersects_sparse.npz"))
    logger.info(f"Gemini keyword intersections loaded successfully with shape {gi.shape}")
    return gi

def load_tfidf_intersects():
    logger.info("Loading TF-IDF keyword intersections...")
    ti = sp.load_npz(os.path.join(assets, "intersects_tfidf.npz"))
    logger.info(f"TF-IDF keyword intersections loaded successfully with shape {ti.shape}")
    return ti

def init_db_logger():
    logger.info("Initializing MongoDB logger...")
    d = MongoDBLogger()
    logger.info("MongoDB logger initialized successfully")
    return d

@app.on_event("startup")
async def startup_event(assets_path: str = assets):
    global assets
    assets = assets_path
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as executor:
        results = await asyncio.gather(
            loop.run_in_executor(executor, load_course_client),
            loop.run_in_executor(executor, load_embeddings),
            loop.run_in_executor(executor, load_gemini_intersects),
            loop.run_in_executor(executor, load_tfidf_intersects),
            loop.run_in_executor(executor, init_db_logger),
        )
    global courseClient, all_embeds, kwd_intersects_gemini, kwd_intersects_tfidf, db
    courseClient, all_embeds, kwd_intersects_gemini, kwd_intersects_tfidf, db = results
    logger.info(f"API started successfully in {datetime.now() - server_start_time}")

@app.post("/recommendations", response_model=RecommendationResponse)
async def recommendations(
    liked: List[str],
    disliked: List[str],
    skipped: List[str],
    n: int,
    model: str = "average",
    relevance: float = 0.8,
) -> RecommendationResponse:
    recommended_courses = None
    if model == "embeddings_v1":
        recommended_courses = recommend_courses(liked, disliked, skipped, all_embeds, courseClient, n)
    elif model == "embeddings_mmr":
        recommended_courses = recommend_mmr_cos(liked, disliked, skipped, all_embeds, courseClient, n, lambda_param=relevance)
    elif model == "embeddings_max":
        recommended_courses = recommend_max(liked, disliked, skipped, all_embeds, courseClient, n)
    elif model == "baseline":
        recommended_courses = recommend_courses_baseline(
            liked, disliked, skipped, courseClient, n
        )
    elif model == "keywords_gemini":
        recommended_courses = recommend_courses_keywords(
            liked, disliked, skipped, courseClient, n, kwd_intersects_gemini
        )
    elif model == "keywords_tfidf":
        recommended_courses = recommend_courses_keywords(
            liked, disliked, skipped, courseClient, n, kwd_intersects_tfidf
        )
    elif model == "average":
        recommended_courses = recommend_average(
            liked, disliked, skipped, all_embeds, courseClient, n
        )
    elif model == "max_with_combinations":
        recommended_courses = recommend_max_with_combinations(
            liked, disliked, skipped, all_embeds, courseClient, n
        )

    if recommended_courses is None:
        raise ValueError("Model not found")
    return RecommendationResponse(recommended_courses=recommended_courses)


@app.get("/course/{course_id}", response_model=CourseWithId)
async def course(course_id: str) -> CourseWithId:
    found = courseClient.get_course_by_code(course_id)
    if found is None:
        raise ValueError("Course not found")
    return found


@app.get("/models", response_model=List[str])
async def models() -> List[str]:
    return ["max_with_combinations", "keywords_tfidf", "embeddings_mmr", "embeddings_max", "baseline"]


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/log_recommendation_feedback")
async def log_recommendation_feedback(log: RecommendationFeedbackLog) -> None:
    db.log_recommendation_feedback(
        log.liked,
        log.disliked,
        log.skipped,
        log.course,
        log.action,
        log.user_id,
        log.model,
    )


@app.post("/log_user_feedback")
async def log_user_feedback(log: UserFeedbackLog) -> None:
    db.log_user_feedback(log.text, log.rating, log.faculty, log.user_id)
