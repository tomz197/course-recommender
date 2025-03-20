from dataclasses import dataclass
from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from typing import List

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
    allow_methods=["*"],
    allow_headers=["*"]
)

courseClient = CourseClient("./assets/courses/")
#all_embeds: npt.NDArray = np.load(f"./assets/embeds.npy", allow_pickle=True)
all_embeds: npt.NDArray = np.load(f"./assets/embeds_all.npy", allow_pickle=True)

@app.post("/recommendations", response_model=RecommendationResponse)
async def recommendations(liked: List[str], disliked: List[str], n: int, model: str = "embeddings_v1") -> RecommendationResponse:
    if model == "embeddings_v1":
        recommended_courses, _ = recommend_courses(liked, disliked, all_embeds, courseClient, n)
        return RecommendationResponse(recommended_courses=recommended_courses)
    elif model == "keywords":
        return RecommendationResponse(recommended_courses=recommend_courses_keywords(liked, disliked, courseClient, n))

