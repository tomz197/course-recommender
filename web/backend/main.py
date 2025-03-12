from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from scripts.embedding_helpers import recommend_based_on_liked_disliked
from typing import List
from pydantic import BaseModel
import numpy as np
from scripts.helpers import load_courses

class Item(BaseModel):
    recommended_courses: List[dict]

#app = FastAPI()
# init fast api with cors
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


courses, ctoi = load_courses("data/generated")
all_embeds = np.load(f"data/embeddings/embeds.npy", allow_pickle=True)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/recommendations", response_model=Item)
async def recommendations(liked: List[str], disliked: List[str], n: int) -> Item:
    recommended_courses_indices, similarities = recommend_based_on_liked_disliked(liked, disliked, all_embeds, ctoi, n)
    recommended_courses = [courses[i] for i in recommended_courses_indices]
    for i, recommended_course in enumerate(recommended_courses):
        recommended_course["similarity"] = similarities[i]
    return {"recommended_courses": recommended_courses}
