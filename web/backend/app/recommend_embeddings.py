from typing import List, Literal, Optional, Tuple, TypeAlias
import numpy as np
import numpy.typing as npt
import heapq

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
        similarity = compute_similarity(vec, candidate) ** 2 
        if similarity >= 0.9: # Immediate rejection for high similarity to disliked items
            return 0

    return score

def find_top_n_similar(
        liked_embeds: Embeddings,
        disliked_embeds: Embeddings,
        candidate_embeds: Embeddings,
        n: int,
        algorithm: Optional[Literal["new", "old"]] = "new"
    ) -> List[Tuple[int, Embedding, Similarity]]:
    """
    Find the top n similar embeddings more efficiently than sorting all candidates.
    """
    if n <= 0:
        return []
    
    # Use a min heap to keep track of the top n items
    top_n = []
    
    scoring_func = score_by_adding_scores if algorithm == "new" else score_with_one_interest_embed
    
    for i, candidate in enumerate(candidate_embeds):
        score = scoring_func(liked_embeds, disliked_embeds, candidate)
        
        # If we haven't collected n items yet, add it to the heap
        if len(top_n) < n:
            heapq.heappush(top_n, (score, i, candidate))
        # Otherwise, if this score is better than our minimum, replace it
        elif score > top_n[0][0]:
            heapq.heappushpop(top_n, (score, i, candidate))
    
    # Convert from min heap to the expected format and sort by score (descending)
    result = [(i, embed, score) for score, i, embed in top_n]
    result.sort(key=lambda x: x[2], reverse=True)
    
    return result

def sort_by_similarity(
        liked_embeds: Embeddings,
        disliked_embeds: Embeddings,
        candidate_embeds: Embeddings,
        algorithm: Optional[Literal["new", "old"]] = "new"
    ) -> List[Tuple[int, Embedding, Similarity]]:
    """
    Legacy function that sorts all candidates by similarity.
    Consider using find_top_n_similar for better performance when n is small.
    """
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

    # Early return for edge cases
    if not liked_ids or n <= 0:
        return []

    liked_embeds = all_embeds[liked_ids]
    disliked_embeds = all_embeds[disliked_ids] if disliked_ids else np.empty((0, all_embeds.shape[1]), dtype=all_embeds.dtype)

    # Pre-filter to exclude liked and disliked courses
    excluded_codes = set(liked_codes) | set(disliked_codes)
    
    # Use the more efficient find_top_n_similar function since n is typically small
    candidates = find_top_n_similar(liked_embeds, disliked_embeds, all_embeds, n * 2, "new")
    
    res: List[CourseWithId] = []
    for idx, _, similarity in candidates:
        if len(res) == n:
            break

        found = courseClient.get_course_by_id(idx)
        if found is None or found.CODE in excluded_codes:
            continue

        # Convert numpy.float32 to regular Python float to avoid serialization issues
        found.SIMILARITY = float(similarity)
        res.append(found)

    return res
