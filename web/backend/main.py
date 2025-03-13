from dataclasses import dataclass
from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from typing import List

import numpy.typing as npt
import numpy as np

from app.recommend import recommend_courses
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
    allow_methods=["*"],
    allow_headers=["*"]
)

courseClient = CourseClient("./assets/courses/")
all_embeds: npt.NDArray = np.load(f"./assets/embeds.npy", allow_pickle=True)

@app.post("/recommendations", response_model=RecommendationResponse)
async def recommendations(liked: List[str], disliked: List[str], n: int) -> RecommendationResponse:
    recommended_courses, similarities = recommend_courses(liked, disliked, all_embeds, courseClient, n)

    for i, recommended_course in enumerate(recommended_courses):
        recommended_course.SIMILARITY = similarities[i]

    return RecommendationResponse(recommended_courses=recommended_courses)

