from dotenv import load_dotenv

load_dotenv()
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List

import numpy.typing as npt
import numpy as np

from app.recommend.embeddings import recommend_courses, recommend_average, recommend_mmr
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


app = FastAPI()
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


courseClient = CourseClient(os.path.join("assets", "courses"))
all_embeds: npt.NDArray = np.load(
    os.path.join("assets", "embeddings_tomas_03.npy"), allow_pickle=True
)
db = MongoDBLogger()


@app.post("/recommendations", response_model=RecommendationResponse)
async def recommendations(
    liked: List[str],
    disliked: List[str],
    skipped: List[str],
    n: int,
    model: str = "average",
) -> RecommendationResponse:
    recommended_courses = None
    if model == "embeddings_v1":
        recommended_courses = recommend_courses(liked, disliked, skipped, all_embeds, courseClient, n)
    elif model == "mmr":
        recommended_courses = recommend_mmr(liked, disliked, skipped, all_embeds, courseClient, n, lambda_param=0.8)
    elif model == "average":
        recommended_courses = recommend_average(
            liked, disliked, skipped, all_embeds, courseClient, n
        )
    elif model == "keywords":
        recommended_courses = recommend_courses_keywords(
            liked, disliked, skipped, courseClient, n
        )
    elif model == "baseline":
        recommended_courses = recommend_courses_baseline(
            liked, disliked, skipped, courseClient, n
        )
    elif model == "keywords_tfidf":
        recommended_courses = recommend_courses_keywords_tfidf(
            liked, disliked, skipped, courseClient, n
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
    return ["average", "keywords", "baseline", "embeddings_v1", "keywords_tfidf", "mmr"]


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
