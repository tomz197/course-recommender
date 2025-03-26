from typing import List, Literal, Optional, Tuple, TypeAlias
import numpy as np
import numpy.typing as npt

from app.courses import CourseClient
from app.types import CourseWithId

Embedding: TypeAlias = npt.NDArray[np.float32]
Embeddings: TypeAlias = npt.NDArray[np.float32]
Similarity: TypeAlias = float # or score

def compute_similarity(vector1: Embedding, vector2: Embedding) -> Similarity:
    '''
        Compute cosine (similarity) between two vectors:
         - `1`: vectors are the same
         - `0`: vectors are orthogonal
         - `-1`: vectors are opposite
    '''
    return np.dot(vector1, vector2) / (np.linalg.norm(vector1) * np.linalg.norm(vector2))

def score_with_one_interest_embed(liked: Embeddings, disliked: Embeddings, candidate: Embedding) -> Similarity:
    total = len(liked) + len(disliked)
    combined_embed = (np.sum(liked, axis=0) - np.sum(disliked, axis=0)) / total

    return compute_similarity(combined_embed, candidate)

def score_by_adding_scores(liked: Embeddings, disliked: Embeddings, candidate: Embedding) -> Similarity:
    score: Similarity = 0
    for vec in liked:
        score += compute_similarity(vec, candidate) ** 2

    for vec in disliked:
        # score -= 0.5 * compute_similarity(disliked_embed, candidate_embed) ** 2
        similarity =  compute_similarity(vec, candidate) ** 2 
        if similarity >= 0.9: # TODO: WTF 
            return 0

    return score

def sort_by_similarity(
        liked_embeds: Embeddings,
        disliked_embeds: Embeddings,
        candidate_embeds: Embeddings,
        algorithm: Optional[Literal["new", "old"]] = "new"
    ) -> List[Tuple[int, Embedding, Similarity]]:
    candidates: List[Tuple[int, Embedding, Similarity]]

    if algorithm == "new":
        candidates = [(i, c, score_by_adding_scores(liked_embeds, disliked_embeds, c)) for i, c in enumerate(candidate_embeds)]
    elif algorithm == "old":
        candidates = [(i, c, score_with_one_interest_embed(liked_embeds, disliked_embeds, c)) for i, c in enumerate(candidate_embeds)]
    else:
        raise ValueError(f"Unknown algorithm: {algorithm}")

    candidates.sort(key=lambda x: x[2], reverse=True)
    return candidates

def recommend_courses(
        liked_codes: List[str],
        disliked_codes: List[str],
        all_embeds: npt.NDArray,
        courseClient: CourseClient,
        n: int
    ) -> List[CourseWithId]:
    liked_ids = courseClient.get_course_ids_by_codes(liked_codes)
    disliked_ids = courseClient.get_course_ids_by_codes(disliked_codes)

    liked_embeds = all_embeds[liked_ids]
    disliked_embeds = all_embeds[disliked_ids]

    res: List[CourseWithId] = []
    for idx, _, _ in sort_by_similarity(liked_embeds, disliked_embeds, all_embeds, "new"):
        if len(res) == n:
            break

        found = courseClient.get_course_by_id(idx)
        if found is None:
            continue

        if found.CODE not in liked_codes and found.CODE not in disliked_codes:
            res.append(found)

    return res
