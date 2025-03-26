from typing import List, Literal, Optional, Tuple, TypeAlias
import numpy as np
import numpy.typing as npt

from app.courses import CourseClient
from app.types import CourseWithId

Embedding: TypeAlias = npt.NDArray[np.float32]
Embeddings: TypeAlias = npt.NDArray[np.float32]
Similarity: TypeAlias = float # or score


def sort_by_similarity(
        liked_embeds: Embeddings,
        disliked_embeds: Embeddings,
        candidate_embeds: Embeddings,
    ) -> List[Tuple[int, Embedding, Similarity]]:
    liked_norms = np.linalg.norm(liked_embeds, axis=1)
    disliked_norms = np.linalg.norm(disliked_embeds, axis=1)
    
    scores = []
    for i, candidate in enumerate(candidate_embeds):
        candidate_norm = np.linalg.norm(candidate)
        
        disliked_dots = np.dot(disliked_embeds, candidate)
        disliked_similarities = disliked_dots / (disliked_norms * candidate_norm)
        
        if np.any(disliked_similarities >= 0.9):
            scores.append((i, candidate, 0))
            continue
            
        liked_dots = np.dot(liked_embeds, candidate)
        liked_similarities = liked_dots / (liked_norms * candidate_norm)
        score = np.sum(liked_similarities ** 2)
        
        scores.append((i, candidate, score))
    
    scores.sort(key=lambda x: x[2], reverse=True)
    return scores

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

    top_candidates = sort_by_similarity(liked_embeds, disliked_embeds, all_embeds)
    
    res: List[CourseWithId] = []
    for idx, _, _ in top_candidates:
        if len(res) == n:
            break

        found = courseClient.get_course_by_id(idx)
        if found is None:
            continue

        if found.CODE not in liked_codes and found.CODE not in disliked_codes:
            res.append(found)

    return res
