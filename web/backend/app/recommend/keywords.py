import scipy.sparse as sp
import numpy as np
from typing import List, Tuple
from app.courses import CourseClient
from app.types import CourseWithId


def find_top_courses(idx_liked: List[int], idx_disliked: List[int], matrix: sp.csr_matrix) -> List[Tuple[int, float]]:
    liked_scores = matrix[idx_liked]
    disliked_scores = matrix[idx_disliked]

    summed = liked_scores.sum(axis=0) - disliked_scores.sum(axis=0)
    arr = np.asarray(summed).ravel()
    course_scores = list(enumerate(arr))
    course_scores.sort(key=lambda x: x[1], reverse=True)

    return course_scores


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
        if course is not None:
            res.append(course)
        if len(res) == n:
            break

    return res
