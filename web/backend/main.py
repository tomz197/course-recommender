from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from app.recommend import recommend_based_on_liked_disliked
from app.courses import load_courses
from typing import List
from pydantic import BaseModel
import numpy as np

class Item(BaseModel):
    recommended_courses: List[dict]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

courses, ctoi = load_courses("./assets/courses/")
all_embeds = np.load(f"./assets/embeds.npy", allow_pickle=True)

@app.post("/recommendations", response_model=Item)
async def recommendations(liked: List[str], disliked: List[str], n: int) -> Item:
    recommended_courses_indices, similarities = recommend_based_on_liked_disliked(liked, disliked, all_embeds, ctoi, n)
    recommended_courses = [courses[i] for i in recommended_courses_indices]

    for i, recommended_course in enumerate(recommended_courses):
        recommended_course["similarity"] = similarities[i]

    return {"recommended_courses": recommended_courses}

