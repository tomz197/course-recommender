import os
import json
from typing import Dict, List, Optional
from app.types import CourseWithId

"""
def load_courses(dir_path) -> Tuple[List[Dict[str, Any]], Dict[str, int]]:
    files = os.listdir(dir_path)
    courses = []
    for file in files:
        with open(f"{dir_path}/{file}", "r") as f:
            courses.append(json.load(f))
    courses = courses[0]
    ctoi = {course["CODE"]: i for i, course in enumerate(courses)}
    return courses, ctoi
"""

class CourseClient:
    """
    A client class to load and manage courses in an in-memory dictionary keyed by 'CODE'.
    """

    def __init__(self, data_dir: str = "data/generated") -> None:
        """
        :param data_dir: Path to the directory with JSON files containing courses.
        """
        self.data_dir: str = data_dir
        self.coursesCode: Dict[str, CourseWithId] = {}
        self.courseId: Dict[int, CourseWithId] = {}
        self._load_courses()

    def _load_courses(self) -> None:
        """Loads all courses from JSON files in the data directory into a dictionary keyed by 'CODE'."""
        files: List[str] = os.listdir(self.data_dir)
        for filename in files:
            if not filename.lower().endswith(".json"):
                continue

            with open(os.path.join(self.data_dir, filename), "r", encoding="utf-8") as f:
                data: List[dict] = json.load(f) 
                for idx, c in enumerate(data):
                    course = CourseWithId(**c)
                    course.ID = idx
                    course_code = course.CODE
                    self.coursesCode[course_code] = course
                    self.courseId[idx] = course

    def get_course_by_code(self, code: str) -> Optional[CourseWithId]:
        """
        Retrieves a single course by its code.

        :param code: The course code, e.g., 'CORE012'.
        :return: The course dictionary or None if not found.
        """
        return self.coursesCode.get(code)

    def get_course_by_id(self, course_id: int) -> Optional[CourseWithId]:
        """
        Retrieves a single course by its ID.

        :param course_id: The course ID.
        :return: The course dictionary or None if not found.
        """
        return self.courseId.get(course_id)

    def all_courses(self) -> List[CourseWithId]:
        """
        Returns all courses as a list of dictionaries.

        :return: A list of course dictionaries.
        """
        return list(self.coursesCode.values())
