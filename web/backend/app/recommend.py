from typing import List, Tuple
import numpy as np
import numpy.typing as npt

from app.courses import CourseClient
from app.types import CourseWithId

def compute_similarity(vector1, vector2):
    cosine_similarity = np.dot(vector1, vector2) / (np.linalg.norm(vector1) * np.linalg.norm(vector2))
    return cosine_similarity

def add_embeddings(pos_vectors, neg_vectors):
    all_vectors = np.concatenate([pos_vectors, neg_vectors], axis=0)
    return np.mean(all_vectors, axis=0)

def sort_by_similarity(target, candidates):
    candidates = [(i, c, compute_similarity(target, c)) for i, c in enumerate(candidates)]
    candidates.sort(key=lambda x: x[2], reverse=True)
    return candidates

def codes_to_ids(courses_codes: List[str], courseClient: CourseClient) -> List[int]:
    res = []
    for code in courses_codes:
        course = courseClient.get_course_by_code(code)
        if course is not None:
            res.append(course.ID)
    return res

def recommend_courses(liked: List[str], disliked: List[str], all_embeds: npt.NDArray, courseClient: CourseClient, n: int) -> Tuple[List[CourseWithId], List[float]]:
    liked_ids = codes_to_ids(liked, courseClient)
    disliked_ids = codes_to_ids(disliked, courseClient)

    liked_embeds = all_embeds[liked_ids]
    disliked_embeds = all_embeds[disliked_ids]

    combined_embed = add_embeddings(liked_embeds, disliked_embeds)

    res: Tuple[List[CourseWithId], List[float]] = [], []
    for idx, _, sim in sort_by_similarity(combined_embed, all_embeds):
        if len(res[0]) == n:
            break

        found = courseClient.get_course_by_id(idx)
        if found is None:
            continue

        if found.CODE not in liked and found.CODE not in disliked:

            res[0].append(found)
            res[1].append(sim)

    return res
