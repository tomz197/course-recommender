from typing import List, Tuple
import numpy as np
import numpy.typing as npt

from app.courses import CourseClient
from app.types import CourseWithId

def compute_similarity(vector1, vector2):
    cosine_similarity = np.dot(vector1, vector2) / (np.linalg.norm(vector1) * np.linalg.norm(vector2))
    return cosine_similarity

def combine_pos_neg_embeds(pos_vectors, neg_vectors):
    total = len(pos_vectors) + len(neg_vectors)
    return (np.sum(pos_vectors, axis=0) - np.sum(neg_vectors, axis=0)) / total

def score_with_one_interest_embed(liked_embeds, disliked_embeds, candidate_embed):
    combined_embed = combine_pos_neg_embeds(liked_embeds, disliked_embeds)
    return compute_similarity(combined_embed, candidate_embed)

def score_by_adding_scores(liked_embeds, disliked_embeds, candidate_embed):
    score = 0
    for liked_embed in liked_embeds:
        score += compute_similarity(liked_embed, candidate_embed) ** 2
    
    for disliked_embed in disliked_embeds:
        score -= 0.5 * compute_similarity(disliked_embed, candidate_embed) ** 2

    return score

def sort_by_similarity(liked_embeds, disliked_embeds, candidate_embeds, algorithm):
    if algorithm == "new":
        candidates = [(i, c, score_by_adding_scores(liked_embeds, disliked_embeds, c)) for i, c in enumerate(candidate_embeds)]
    else:
        candidates = [(i, c, score_with_one_interest_embed(liked_embeds, disliked_embeds, c)) for i, c in enumerate(candidate_embeds)]
    candidates.sort(key=lambda x: x[2], reverse=True)
    return candidates

def recommend_courses(liked: List[str], disliked: List[str], all_embeds: npt.NDArray, courseClient: CourseClient, n: int) -> Tuple[List[CourseWithId], List[float]]:
    liked_ids = courseClient.get_course_ids_by_codes(liked)
    disliked_ids = courseClient.get_course_ids_by_codes(disliked)

    liked_embeds = all_embeds[liked_ids]
    disliked_embeds = all_embeds[disliked_ids]

    res: Tuple[List[CourseWithId], List[float]] = [], []
    for idx, _, sim in sort_by_similarity(liked_embeds, disliked_embeds, all_embeds, "new"):
        if len(res[0]) == n:
            break

        found = courseClient.get_course_by_id(idx)
        if found is None:
            continue

        if found.CODE not in liked and found.CODE not in disliked:

            res[0].append(found)
            res[1].append(sim)

    return res
