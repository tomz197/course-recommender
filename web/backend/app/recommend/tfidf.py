import scipy.sparse as sp
from typing import List, Tuple, Dict
from app.courses import CourseClient
from app.types import CourseWithId
import numpy as np
import pickle
import os

kwd_intersects = sp.load_npz(os.path.join("assets", "intersects_tfidf.npz")).toarray().astype(np.float32)
course_indices = pickle.load(open(os.path.join("assets", "course_indices_tfidf.pkl"), "rb"))

def find_top_courses(
    idx_liked: List[int], idx_disliked: List[int], matrix: np.ndarray
) -> List[Tuple[int, float]]:
    liked_scores = matrix[idx_liked]
    disliked_scores = matrix[idx_disliked]

    summed = liked_scores.sum(axis=0) - disliked_scores.sum(axis=0)

    print(summed.shape)

    course_scores = [(i, score) for i, score in enumerate(summed)]
    course_scores.sort(key=lambda x: x[1], reverse=True)

    return course_scores


def recommend_courses_keywords_tfidf(
    liked: List[str],
    disliked: List[str],
    skipped: List[str],
    courseClient: CourseClient,
    n: int,
    kwd_intersects: np.ndarray,
    course_indices: Dict[str, int]
) -> List[CourseWithId]:
    ctoi = {code: idx for idx, code in course_indices.items()}
    liked_ids = [ctoi[code] for code in liked]
    disliked_ids = [ctoi[code] for code in disliked]
    skipped_ids = [ctoi[code] for code in skipped]

    top_courses = find_top_courses(liked_ids, disliked_ids, kwd_intersects)

    res = []
    for idx, _ in top_courses:
        if idx in liked_ids or idx in disliked_ids or idx in skipped_ids:
            continue
        # course = courseClient.get_course_by_id(idx)
        print(idx)
        course_code = course_indices[idx]
        print(course_code)
        course = courseClient.get_course_by_code(course_code)
        if course is not None:
            res.append(course)
        if len(res) == n:
            break

    return res
