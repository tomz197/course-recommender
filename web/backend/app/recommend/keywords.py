import scipy.sparse as sp
import numpy as np
from typing import List, Tuple
from app.courses import CourseClient
from app.types import CourseWithId


def find_top_courses(idx_liked: List[int], idx_disliked: List[int], matrix: sp.csr_matrix) -> List[Tuple[int, float]]:
    # If we have no liked courses, we can't make recommendations
    if not idx_liked:
        return []
    
    # Extract rows from the similarity matrix for liked courses
    liked_scores = matrix[idx_liked]
    
    # Calculate the base score by summing all liked course similarities
    summed = liked_scores.sum(axis=0)
    
    # Apply penalty for disliked courses if any exist
    if idx_disliked:
        # Extract rows from the similarity matrix for disliked courses
        disliked_scores = matrix[idx_disliked]
        
        # Instead of direct subtraction, apply a weighted penalty
        # This prevents disliked courses from having too much influence
        # We scale down the disliked penalty to avoid over-penalization
        disliked_penalty = disliked_scores.sum(axis=0) * (0.5 / max(len(idx_disliked), 1))
        summed = summed - disliked_penalty
    
    # Convert sparse matrix to dense numpy array and flatten to 1D
    arr = np.asarray(summed).ravel()
    
    # Create list of (course_index, score) tuples
    course_scores = list(enumerate(arr))
    
    # Sort courses by score in descending order (highest similarity first)
    course_scores.sort(key=lambda x: x[1], reverse=True)

    # Return sorted list of (course_index, score) tuples
    return course_scores


def calculate_recommended_from(recommended: int, idx_liked: List[int], idx_disliked: List[int], matrix: sp.csr_matrix, courseClient: CourseClient) -> List[str]:
    # Return list of 2 liked courses' ids that have the largest intersection with the recommendation
    if not idx_liked:
        return []
    
    # Extract the similarity scores between the recommended course and all liked courses
    similarities = []
    for liked_idx in idx_liked:
        # Get similarity score between recommended course and this liked course
        score = matrix[liked_idx, recommended].item()
        similarities.append((liked_idx, score))
    
    # Sort by similarity score in descending order
    similarities.sort(key=lambda x: x[1], reverse=True)
    
    # The IDs of up to 2 most similar liked courses
    return [courseClient.get_course_by_id(idx).CODE for idx, _ in similarities[:2]]


def recommend_courses_keywords(liked: List[str], disliked: List[str], skipped: List[str], courseClient: CourseClient, n: int, kwd_intersects: sp.csr_matrix) -> List[CourseWithId]:
    liked_ids = courseClient.get_course_ids_by_codes(liked)
    disliked_ids = courseClient.get_course_ids_by_codes(disliked)
    skipped_ids = courseClient.get_course_ids_by_codes(skipped)

    top_courses = find_top_courses(liked_ids, disliked_ids, kwd_intersects)

    res = []
    excluded_ids = set(liked_ids + disliked_ids + skipped_ids)
    for idx, _ in top_courses:
        if idx in excluded_ids:
            continue
        course = courseClient.get_course_by_id(idx)
        course.RECOMMENDED_FROM = calculate_recommended_from(idx, liked_ids, disliked_ids, kwd_intersects, courseClient)
        if course is not None:
            res.append(course)
        if len(res) == n:
            break

    return res
