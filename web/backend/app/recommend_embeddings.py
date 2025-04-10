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
    """Sorts candidate embeddings based on their similarity to liked and disliked embeddings.

    For each candidate embedding, calculate its cosine similarity with all liked and disliked embeddings.
    A candidate is assigned a score of 0 if its similarity with any disliked embedding is 0.9 or higher.
    Otherwise, the score is the sum of the squared cosine similarities between the candidate and all liked embeddings.

    The function returns a list of tuples, each containing the original index of the candidate,
    the candidate embedding itself, and its calculated similarity score. The list is sorted
    in descending order based on the similarity score.

    Args:
        liked_embeds: Embeddings of liked items.
        disliked_embeds: Embeddings of disliked items.
        candidate_embeds: Embeddings of items to be scored and sorted.

    Returns:
        A list of tuples (index, embedding, score), sorted by score in descending order.
    """
    # Precompute norms for efficiency
    liked_norms = np.linalg.norm(liked_embeds, axis=1)
    disliked_norms = np.linalg.norm(disliked_embeds, axis=1)

    scores = [] # List to store (index, embedding, score) tuples
    # Iterate through each candidate embedding
    for i, candidate in enumerate(candidate_embeds):
        # Calculate the norm of the current candidate embedding
        candidate_norm = np.linalg.norm(candidate)

        # Calculate dot products between the candidate and all disliked embeddings
        disliked_dots = np.dot(disliked_embeds, candidate)
        # Calculate cosine similarities with disliked embeddings
        disliked_similarities = disliked_dots / (disliked_norms * candidate_norm)

        # If similarity with any disliked item is too high, assign score 0 and skip
        if np.any(disliked_similarities >= 0.9):
            scores.append((i, candidate, 0))
            continue

        # Calculate dot products between the candidate and all liked embeddings
        liked_dots = np.dot(liked_embeds, candidate)
        # Calculate cosine similarities with liked embeddings
        liked_similarities = liked_dots / (liked_norms * candidate_norm)
        # Calculate the final score as the sum of squared similarities with liked items
        score = Similarity(np.sum(liked_similarities ** 2))

        # Append the result for this candidate
        scores.append((i, candidate, score))

    # Sort the candidates by score in descending order
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
    
    if not liked_ids:
        return []

    liked_embeds = all_embeds[liked_ids]
    disliked_embeds = all_embeds[disliked_ids]

    top_candidates = sort_by_similarity(liked_embeds, disliked_embeds, all_embeds)
    
    res: List[CourseWithId] = []
    for idx, _, sim in top_candidates:
        if len(res) == n:
            break

        found = courseClient.get_course_by_id(idx)
        if found is None:
            continue

        if found.CODE not in liked_codes and found.CODE not in disliked_codes:
            found.SIMILARITY = sim
            res.append(found)

    return res
