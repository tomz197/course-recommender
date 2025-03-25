import scipy.sparse as sp
from typing import List, Tuple
from app.courses import CourseClient
from app.types import CourseWithId

loaded_sparse_matrix = sp.load_npz("./assets/intersects_sparse.npz")
kwd_intersects = loaded_sparse_matrix.toarray()

def find_top_courses_multiple(idx_liked: List[int], idx_disliked: List[int], matrix: sp.csr_matrix, n: int) -> List[Tuple[int, float]]:
    liked_scores = matrix[idx_liked]
    disliked_scores = matrix[idx_disliked]

    summed = liked_scores.sum(axis=0) - disliked_scores.sum(axis=0)

    course_scores = [(i, score) for i, score in enumerate(summed)]
    course_scores.sort(key=lambda x: x[1], reverse=True)

    return course_scores[:n]

def recommend_courses_keywords(liked: List[str], disliked: List[str], courseClient: CourseClient, n: int) -> List[CourseWithId]:
    liked_ids = courseClient.get_course_ids_by_codes(liked)
    disliked_ids = courseClient.get_course_ids_by_codes(disliked)

    top_courses = find_top_courses_multiple(liked_ids, disliked_ids, kwd_intersects, n)

    res = []
    for idx, _ in top_courses:
        if idx in liked_ids or idx in disliked_ids:
            continue
        course = courseClient.get_course_by_id(idx)
        if course is not None:
            res.append(course)

    return res
