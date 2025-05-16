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
        skipped_codes: List[str],
        all_embeds: npt.NDArray,
        courseClient: CourseClient,
        n: int
    ) -> List[CourseWithId]:
    liked_ids = courseClient.get_course_ids_by_codes(liked_codes)
    disliked_ids = courseClient.get_course_ids_by_codes(disliked_codes)

    if not liked_ids:
        raise ValueError("No liked courses found")

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

        if found.CODE not in liked_codes \
            and found.CODE not in disliked_codes \
            and found.CODE not in skipped_codes:
            found.SIMILARITY = sim
            res.append(found)

    return res

def recommend_average(
    liked_codes: list[str],
    disliked_codes: list[str],
    skipped_codes: list[str],
    all_embeds: np.ndarray,
    courseClient,
    n: int = 10
) -> list[dict]:
    """
    Recommends courses based on the average of liked embeddings minus the average of disliked embeddings.
    
    Args:
        liked_codes: List of course codes that the user likes
        disliked_codes: List of course codes that the user dislikes
        skipped_codes: List of course codes to skip in recommendations
        all_embeds: Array of all course embeddings
        courseClient: Client for retrieving course information
        n: Number of recommendations to return
        
    Returns:
        List of recommended courses with similarity scores
    """
    # Get indices of liked and disliked courses
    liked_indices = courseClient.get_course_ids_by_codes(liked_codes)
    disliked_indices = courseClient.get_course_ids_by_codes(disliked_codes)
    
    # Skip empty sets
    if not liked_indices:
        return []
    
    # Calculate average embeddings
    liked_avg = np.mean(all_embeds[liked_indices], axis=0)
    
    # If there are disliked courses, subtract their average from the liked average
    if disliked_indices:
        disliked_avg = np.mean(all_embeds[disliked_indices], axis=0)
        target_embedding = liked_avg - disliked_avg*0.5
    else:
        target_embedding = liked_avg
    
    # Calculate Euclidean distances
    distances = np.linalg.norm(all_embeds - target_embedding, axis=1)
    
    # Create a list of (index, distance) tuples and sort by distance (ascending)
    indices_with_distances = [(i, dist) for i, dist in enumerate(distances)]
    indices_with_distances.sort(key=lambda x: x[1])
    
    # Filter out liked, disliked, and skipped courses
    excluded_codes = set(liked_codes + disliked_codes + skipped_codes)
    recommendations = []
    
    for i in range(len(indices_with_distances)):
        if len(recommendations) >= n:
            break
            
        idx, distance = indices_with_distances[i]
        code = courseClient.get_course_by_id(idx).CODE
        if code in excluded_codes:
            continue
        course = courseClient.get_course_by_id(idx)
        if not course:
            continue

        # Convert distance to similarity (lower distance = higher similarity)
        similarity = 1.0 / (1.0 + distance)  # Simple conversion to a 0-1 scale
        course.SIMILARITY = similarity
        recommendations.append(course)
    
    return recommendations

def recommend_mmr(
  liked_codes: list[str],
  disliked_codes: list[str],
  skipped_codes: list[str],
  all_embeds: np.ndarray,
  courseClient,
  n: int = 10,
  lambda_param: float = 0.7
) -> list[dict]:
  # … same setup as before …
  liked_indices = courseClient.get_course_ids_by_codes(liked_codes)
  if not liked_indices:
    return []
  liked_avg = np.mean(all_embeds[liked_indices], axis=0)
  if disliked_codes:
    disliked_indices = courseClient.get_course_ids_by_codes(disliked_codes)
    disliked_avg = np.mean(all_embeds[disliked_indices], axis=0)
    target_embed = liked_avg - 0.5 * disliked_avg
  else:
    target_embed = liked_avg

  # 1) compute raw distances and raw target‐similarities
  distances = np.linalg.norm(all_embeds - target_embed, axis=1)
  sim_to_target = 1.0 / (1.0 + distances)

  excluded = set(liked_codes + disliked_codes + skipped_codes)

  # 2) build initial candidate list, sorted by descending sim_to_target
  candidate_idxs = [
    i for i in np.argsort(-sim_to_target)
  ][:(max(n, 100) + len(excluded))]

  excluded_idxs = courseClient.get_course_ids_by_codes(excluded)
  candidate_idxs = [
    c for c in candidate_idxs
    if c not in excluded_idxs
  ]

  # 3) MMR re‐ranking loop
  selected_idxs: list[int] = []
  while len(selected_idxs) < n and candidate_idxs:
    # Get current candidate and liked embeddings
    current_candidate_embeds = all_embeds[candidate_idxs]
    # liked_embeds can be calculated once outside the loop if liked_indices is static
    liked_embeds = all_embeds[liked_indices]

    # 1) Relevance term (vectorized)
    rel_vector = sim_to_target[candidate_idxs]

    # 2) Diversity term (vectorized)
    # Calculate distances between each candidate and all liked embeddings
    # Shape: (len(candidate_idxs), len(liked_indices))
    distances_cl = np.linalg.norm(
        current_candidate_embeds[:, None, :] - liked_embeds[None, :, :],
        axis=2
    )
    # Convert distances to similarities
    similarities_cl = 1.0 / (1.0 + distances_cl)
    # Calculate diversity for each candidate (max similarity to any liked item)
    # Shape: (len(candidate_idxs),)
    div_vector = np.max(similarities_cl, axis=1)

    # 3) Calculate MMR scores (vectorized)
    mmr_scores_vector = lambda_param * rel_vector - (1 - lambda_param) * div_vector

    # 4) Find the index *within candidate_idxs* corresponding to the max score
    max_score_local_idx = np.argmax(mmr_scores_vector)

    # 5) Get the actual course index (ID) with the highest score
    next_idx = candidate_idxs[max_score_local_idx]

    # 6) Add the best candidate to selected list and remove from candidates
    selected_idxs.append(next_idx)
    candidate_idxs.pop(max_score_local_idx) # More efficient than remove() when we have the index


  # 4) fetch the courses in the final order
  recommendations: list[CourseWithId] = []
  for idx in selected_idxs:
    course = courseClient.get_course_by_id(idx)
    if course:
      # you can still store the original distance or sim in an attribute
      #course.SIMILARITY = float(distances[idx])
      recommendations.append(course)

  return recommendations

def recommend_max(
  liked_codes: list[str],
  disliked_codes: list[str],
  skipped_codes: list[str],
  all_embeds: np.ndarray,
  courseClient,
  n: int = 10,
) -> list[dict]:
  """
  Most smimilar to any of the liked based on cosine
  """
  excluded = set(liked_codes + disliked_codes + skipped_codes)

  liked_indices = courseClient.get_course_ids_by_codes(liked_codes)
  disliked_indices = courseClient.get_course_ids_by_codes(disliked_codes)
  excluded_indices = courseClient.get_course_ids_by_codes(excluded)

  liked_embeds = all_embeds[liked_indices]
  disliked_embeds = all_embeds[disliked_indices]

  # 1. calculate overall similarity
  candidate_embeds_norm = all_embeds / np.linalg.norm(all_embeds, axis=1, keepdims=True)
  liked_embeds_norm = liked_embeds / np.linalg.norm(liked_embeds, axis=1, keepdims=True)
  # Shape: (len(candidate_idxs), len(liked_indices))
  similarity_liked = np.dot(candidate_embeds_norm, liked_embeds_norm.T)

  # 2. select best match for each course
  best_match_liked = np.max(similarity_liked, axis=1)

  # 3. filter out courses that are too similar
  if disliked_embeds.shape[0] > 0:
    disliked_embeds_norm = disliked_embeds / np.linalg.norm(disliked_embeds, axis=1, keepdims=True)
    similarity_disliked = np.dot(candidate_embeds_norm, disliked_embeds_norm.T)
    best_match_disliked = np.max(similarity_disliked, axis=1)

    to_filter_idx = np.where(best_match_disliked > 0.9)[0]
    best_match_liked[to_filter_idx] = -np.inf

  # 4. get indices of top n courses
  selected_idxs = np.argsort(-best_match_liked)[:(n + len(excluded))]
  selected_idxs = [i for i in selected_idxs if i not in excluded_indices]

  # 5. fetch the courses in the final order
  recommendations: list[dict] = []
  for idx in selected_idxs:
    course = courseClient.get_course_by_id(idx)
    if course:
      # Optionally, attach the similarity score
      # course.SIMILARITY = float(best_match_liked[idx])
      course.RECOMMENDED_FROM = [courseClient.get_course_by_id(liked_indices[np.argmax(similarity_liked[idx])]).CODE]
      recommendations.append(course)

  return recommendations

def recommend_mmr_cos(
  liked_codes: list[str],
  disliked_codes: list[str],
  skipped_codes: list[str],
  all_embeds: np.ndarray,
  courseClient,
  n: int = 10,
  lambda_param: float = 0.7
) -> list[dict]:
  liked_indices = courseClient.get_course_ids_by_codes(liked_codes)
  if not liked_indices:
    return []
  liked_avg = np.mean(all_embeds[liked_indices], axis=0)
  if disliked_codes:
    disliked_indices = courseClient.get_course_ids_by_codes(disliked_codes)
    disliked_avg = np.mean(all_embeds[disliked_indices], axis=0)
    target_embed = liked_avg - 0.5 * disliked_avg
  else:
    target_embed = liked_avg

  # 1) compute cosine similarities directly
  target_norm = np.linalg.norm(target_embed)
  target_embed_norm = target_embed / target_norm if target_norm > 0 else target_embed
  all_embeds_norm = all_embeds / np.linalg.norm(all_embeds, axis=1, keepdims=True)
  
  sim_to_target = np.dot(all_embeds_norm, target_embed_norm)

  # 2) build initial candidate list, sorted by descending sim_to_target
  excluded = set(liked_codes + disliked_codes + skipped_codes)
  excluded_idxs = courseClient.get_course_ids_by_codes(excluded)

  # Filter out courses that are too similar to liked courses
  # Calculate similarity to individual liked courses
  liked_embeds_single = all_embeds[liked_indices]
  liked_embeds_single_norm = liked_embeds_single / np.linalg.norm(liked_embeds_single, axis=1, keepdims=True)
  similarity_to_single = np.dot(all_embeds_norm, liked_embeds_single_norm.T)
  max_similarity_to_single = np.max(similarity_to_single, axis=1)
  sim_to_target[max_similarity_to_single > 0.8] = -np.inf

  print(f"[average] Filtered out {np.sum(max_similarity_to_single > 0.8)} courses that are too similar to liked ones")

  candidate_idxs = [
    i for i in np.argsort(-sim_to_target)
  ][:(max(n, 100) + len(excluded))]

  candidate_idxs = [
    c for c in candidate_idxs
    if c not in excluded_idxs
  ]

  # 3) MMR re‐ranking loop
  liked_embeds = all_embeds[liked_indices]
  liked_embeds_norm = liked_embeds / np.linalg.norm(liked_embeds, axis=1, keepdims=True)

  selected_idxs: list[int] = []
  while len(selected_idxs) < n and candidate_idxs:
    current_candidate_embeds = all_embeds[candidate_idxs]

    # 1) Relevance term (vectorized)
    rel_vector = sim_to_target[candidate_idxs]

    # 2) Diversity term (vectorized)
    # Normalize for cosine similarity
    current_candidate_embeds_norm = current_candidate_embeds / np.linalg.norm(current_candidate_embeds, axis=1, keepdims=True)
    
    # Calculate cosine similarities between each candidate and all liked embeddings
    # Shape: (len(candidate_idxs), len(liked_indices))
    similarities_cl = np.dot(current_candidate_embeds_norm, liked_embeds_norm.T)
    
    # Calculate diversity for each candidate (max similarity to any liked item)
    # Shape: (len(candidate_idxs),)
    div_vector = np.max(similarities_cl, axis=1)

    # 3) Calculate MMR scores (vectorized)
    mmr_scores_vector = lambda_param * rel_vector - (1 - lambda_param) * div_vector

    # 4) Find the index *within candidate_idxs* corresponding to the max score
    max_score_local_idx = np.argmax(mmr_scores_vector)

    # 5) Get the actual course index (ID) with the highest score
    next_idx = candidate_idxs[max_score_local_idx]

    # 6) Add the best candidate to selected list and remove from candidates
    selected_idxs.append(next_idx)
    candidate_idxs.pop(max_score_local_idx) # More efficient than remove() when we have the index


  # 4) fetch the courses in the final order
  recommendations: list[dict] = []
  for idx in selected_idxs:
    course = courseClient.get_course_by_id(idx)
    if course:
      # Store the cosine similarity directly
      # course.SIMILARITY = float(sim_to_target[idx])
      recommendations.append(course)

  return recommendations

def recommend_max_with_combinations(
  liked_codes: list[str],
  disliked_codes: list[str],
  skipped_codes: list[str],
  all_embeds: np.ndarray,
  courseClient,
  n: int = 10,
) -> list[dict]:
  """
  Most smimilar to any pair of liked based on cosine
  """
  excluded = set(liked_codes + disliked_codes + skipped_codes)

  liked_indices = courseClient.get_course_ids_by_codes(liked_codes)
  disliked_indices = courseClient.get_course_ids_by_codes(disliked_codes)
  excluded_indices = courseClient.get_course_ids_by_codes(excluded)

  liked_embeds = all_embeds[liked_indices]
  disliked_embeds = all_embeds[disliked_indices]

  # The average of each pair of liked embeddings
  targed_embeds = np.array([
    np.mean(liked_embeds[[i, j]], axis=0)
    for i in range(len(liked_embeds))
    for j in range(i, len(liked_embeds))
  ])

  target_embeds_index_to_pair = [
    (i, j) for i in range(len(liked_embeds)) for j in range(i, len(liked_embeds))
  ]

  indices_of_non_combinations_candidates = [k for k, (i, j) in enumerate(target_embeds_index_to_pair) if i == j]

  # 1. calculate overall similarity
  candidate_embeds_norm = all_embeds / np.linalg.norm(all_embeds, axis=1, keepdims=True)
  target_embeds_norm = targed_embeds / np.linalg.norm(targed_embeds, axis=1, keepdims=True)
  # Shape: (len(candidate_idxs), len(targed_embeds))
  similarity_target = np.dot(candidate_embeds_norm, target_embeds_norm.T)

  # 2. select best match for each course and note to which target it matched best
  best_match_target_score = np.max(similarity_target, axis=1)
  best_match_target = np.argmax(similarity_target, axis=1)

  # Penalize courses that are closest to non-combinations
  closest_to_non_combinations_candidates = np.isin(best_match_target, indices_of_non_combinations_candidates)
  best_match_target_score[closest_to_non_combinations_candidates] *= 0.95

  # Calculate similarity to original liked courses for filtering
  liked_embeds_norm = liked_embeds / np.linalg.norm(liked_embeds, axis=1, keepdims=True)
  similarity_liked = np.dot(candidate_embeds_norm, liked_embeds_norm.T)
  best_match_liked = np.max(similarity_liked, axis=1)

  # Filter out courses that are too similar to liked ones
  to_filter_idx = np.where(best_match_liked > 0.94)[0]
  best_match_target_score[to_filter_idx] = -np.inf
  num_filtered_out_liked = len(to_filter_idx)
  print(f"Filtered out {num_filtered_out_liked} courses that are too similar to liked ones")

  # 3. filter out courses that are too similar to disliked ones
  if disliked_embeds.shape[0] > 0:
    disliked_embeds_norm = disliked_embeds / np.linalg.norm(disliked_embeds, axis=1, keepdims=True)
    similarity_disliked = np.dot(candidate_embeds_norm, disliked_embeds_norm.T)
    best_match_disliked = np.max(similarity_disliked, axis=1)

    to_filter_idx = np.where(best_match_disliked > 0.8)[0]
    best_match_target_score[to_filter_idx] = -np.inf
    num_filtered_out_disliked = len(to_filter_idx)
    print(f"Filtered out {num_filtered_out_disliked} courses that are too similar to disliked ones")

  # 4. get indices of top n courses
  selected_idxs = np.argsort(-best_match_target_score)
  
  # 5. fetch the courses in the final order
  recommendations: list[dict] = []
  for idx in selected_idxs:
    course = courseClient.get_course_by_id(idx)
    if idx in excluded_indices:
      continue
    if courseClient.filter_courses(course):
      continue
    if course:
      # Optionally, attach the similarity score
      # course.SIMILARITY = float(best_match_liked[idx])
      best_match_target_idx = best_match_target[idx]
      best_match_target1, best_match_target2 = target_embeds_index_to_pair[best_match_target_idx]
      best_match_course1 = courseClient.get_course_by_id(liked_indices[best_match_target1])
      best_match_course2 = courseClient.get_course_by_id(liked_indices[best_match_target2])
      if best_match_course1.CODE == best_match_course2.CODE:
        course.RECOMMENDED_FROM = [best_match_course1.CODE]
      else:
         course.RECOMMENDED_FROM = [best_match_course1.CODE, best_match_course2.CODE]
      recommendations.append(course)
      if len(recommendations) >= n:
        break

  return recommendations

def recommend_max_with_combinations_with_mmr(
  liked_codes: list[str],
  disliked_codes: list[str],
  skipped_codes: list[str],
  all_embeds: np.ndarray,
  courseClient,
  n: int = 10,
  lambda_param: float = 0.7
) -> list[dict]:
  """
  Most smimilar to any pair of liked based on cosine with MMR
  """
  excluded = set(liked_codes + disliked_codes + skipped_codes)

  liked_indices = courseClient.get_course_ids_by_codes(liked_codes)
  disliked_indices = courseClient.get_course_ids_by_codes(disliked_codes)
  excluded_indices = courseClient.get_course_ids_by_codes(excluded)
  
  liked_embeds = all_embeds[liked_indices]
  orig_liked_embeds = all_embeds[liked_indices]
  disliked_embeds = all_embeds[disliked_indices]

  # The average of each pair of liked embeddings
  liked_embeds = np.array([
    np.mean(liked_embeds[[i, j]], axis=0)
    for i in range(len(liked_embeds))
    for j in range(i, len(liked_embeds))
  ])

  # 1. calculate overall similarity
  candidate_embeds_norm = all_embeds / np.linalg.norm(all_embeds, axis=1, keepdims=True)
  liked_embeds_norm = liked_embeds / np.linalg.norm(liked_embeds, axis=1, keepdims=True)
  original_liked_embeds_norm = orig_liked_embeds / np.linalg.norm(orig_liked_embeds, axis=1, keepdims=True)
  # Shape: (len(candidate_idxs), len(liked_indices))
  similarity_liked = np.dot(candidate_embeds_norm, liked_embeds_norm.T)

  # 2. select best match for each course
  best_match_liked = np.max(similarity_liked, axis=1)

  # 3. filter out courses that are too similar
  if disliked_embeds.shape[0] > 0:
    disliked_embeds_norm = disliked_embeds / np.linalg.norm(disliked_embeds, axis=1, keepdims=True)
    similarity_disliked = np.dot(candidate_embeds_norm, disliked_embeds_norm.T)
    best_match_disliked = np.max(similarity_disliked, axis=1)

    to_filter_idx = np.where(best_match_disliked > 0.9)[0]
    best_match_liked[to_filter_idx] = -np.inf

  excluded = set(liked_codes + disliked_codes + skipped_codes)
  excluded_idxs = courseClient.get_course_ids_by_codes(excluded)

  candidate_idxs = [
    i for i in np.argsort(-best_match_liked)
  ][:(max(n, 500) + len(excluded))]

  candidate_idxs = [
    c for c in candidate_idxs
    if c not in excluded_idxs
  ]

  # 3) MMR re‐ranking loop
  selected_idxs: list[int] = []
  while len(selected_idxs) < n and candidate_idxs:
    current_candidate_embeds = all_embeds[candidate_idxs]

    # 1) Relevance term (vectorized)
    rel_vector = best_match_liked[candidate_idxs]

    # 2) Diversity term (vectorized)
    # Normalize for cosine similarity
    current_candidate_embeds_norm = current_candidate_embeds / np.linalg.norm(current_candidate_embeds, axis=1, keepdims=True)
    
    # Calculate cosine similarities between each candidate and all liked embeddings
    # Shape: (len(candidate_idxs), len(liked_indices))
    similarities_cl = np.dot(current_candidate_embeds_norm, original_liked_embeds_norm.T)
    
    # Calculate diversity for each candidate (max similarity to any liked item)
    # Shape: (len(candidate_idxs),)
    div_vector = np.max(similarities_cl, axis=1)

    # 3) Calculate MMR scores (vectorized)
    mmr_scores_vector = lambda_param * rel_vector - (1 - lambda_param) * div_vector

    # 4) Find the index *within candidate_idxs* corresponding to the max score
    max_score_local_idx = np.argmax(mmr_scores_vector)

    # 5) Get the actual course index (ID) with the highest score
    next_idx = candidate_idxs[max_score_local_idx]

    # 6) Add the best candidate to selected list and remove from candidates
    selected_idxs.append(next_idx)
    candidate_idxs.pop(max_score_local_idx) # More efficient than remove() when we have the index


  # 4) fetch the courses in the final order
  recommendations: list[dict] = []
  for idx in selected_idxs:
    course = courseClient.get_course_by_id(idx)
    if course:
      # Store the cosine similarity directly
      # course.SIMILARITY = float(sim_to_target[idx])
      recommendations.append(course)

  return recommendations