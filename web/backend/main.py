from dotenv import load_dotenv
load_dotenv()
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List

import numpy.typing as npt
import numpy as np
import scipy.sparse as sp
import pickle
from datetime import datetime

from app.recommend.embeddings import recommend_courses, recommend_average, recommend_max, recommend_mmr_cos
from app.recommend.keywords import recommend_courses_keywords
from app.recommend.baseline import recommend_courses_baseline
from app.recommend.tfidf import recommend_courses_keywords_tfidf
from app.courses import CourseClient
from app.types import (
    CourseWithId,
    RecommendationFeedbackLog,
    UserFeedbackLog,
    RecommendationResponse,
)
from app.db.mongo import MongoDBLogger
from app.logger import logger

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


logger.info("Loading course data...")
courseClient = CourseClient(os.path.join("assets", "courses"))
logger.info(f"Course data loaded successfully with {len(courseClient.df)} courses")

logger.info("Loading embeddings...")
all_embeds: npt.NDArray = np.load(os.path.join("assets", "embeddings_tomas_03.npy"), allow_pickle=True)
logger.info(f"Embeddings loaded successfully with shape {all_embeds.shape}")

logger.info("Loading Gemini keyword intersections...")
kwd_intersects_gemini = sp.load_npz(os.path.join("assets", "intersects_sparse.npz")).toarray()
logger.info(f"Gemini keyword intersections loaded successfully with shape {kwd_intersects_gemini.shape}")

logger.info("Loading TF-IDF keyword intersections...")
kwd_intersects_tfidf = sp.load_npz(os.path.join("assets", "intersects_tfidf.npz")).toarray().astype(np.float32)
logger.info(f"TF-IDF keyword intersections loaded successfully with shape {kwd_intersects_tfidf.shape}")

logger.info("Loading TF-IDF course indices...")
with open(os.path.join("assets", "course_indices_tfidf.pkl"), "rb") as f:
    course_indices_tfidf = pickle.load(f)
logger.info(f"TF-IDF course indices loaded successfully with {len(course_indices_tfidf)} entries")

logger.info("Initializing MongoDB logger...")
db = MongoDBLogger()
logger.info("MongoDB logger initialized successfully")


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
        recommended_courses = recommend_courses_keywords_tfidf(
            liked, disliked, skipped, courseClient, n, kwd_intersects_tfidf, course_indices_tfidf
        )
    elif model == "average":
        recommended_courses = recommend_average(
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
    return ["baseline", "keywords_tfidf", "keywords_gemini", "embeddings_mmr", "embeddings_max"]


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

logger.info(f"API started successfully in {datetime.now() - server_start_time}")
