from dataclasses import dataclass
from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

import numpy.typing as npt
import numpy as np

from app.recommend_embeddings import recommend_courses
from app.recommend_keywords import recommend_courses_keywords
from app.courses import CourseClient
from app.types import CourseWithId

@dataclass
class RecommendationResponse:
    recommended_courses: List[CourseWithId]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"]
)

courseClient = CourseClient("./assets/courses/")
all_embeds: npt.NDArray = np.load(f"./assets/embeds_all.npy", allow_pickle=True)

@app.post("/recommendations", response_model=RecommendationResponse)
async def recommendations(liked: List[str], disliked: List[str], n: int = 1, model: str = "embeddings_v1") -> RecommendationResponse:
    """
    Get course recommendations based on liked and disliked courses.
    Optimized for the common case where n=1.
    """
    if not liked:
        return RecommendationResponse(recommended_courses=[])
        
    recommended_courses = None

    if model == "embeddings_v1":
        recommended_courses = recommend_courses(liked, disliked, all_embeds, courseClient, n)
    elif model == "keywords":
        recommended_courses = recommend_courses_keywords(liked, disliked, courseClient, n)
    else:
        raise ValueError(f"Model not found: {model}")

    if recommended_courses is None:
        raise ValueError("Failed to get recommendations")
        
    return RecommendationResponse(recommended_courses=recommended_courses)

@app.get("/course/{course_id}", response_model=CourseWithId)
async def course(course_id: str) -> CourseWithId:
    found = courseClient.get_course_by_code(course_id)
    if found is None:
        raise ValueError("Course not found")
    return found

@app.get("/models", response_model=List[str])
async def models() -> List[str]:
    return ["embeddings_v1", "keywords"]

@app.get("/health")
async def health():
    return {"status": "ok"}
