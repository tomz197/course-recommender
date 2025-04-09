import os
import pandas as pd
from typing import List, Optional 
from app.types import CourseWithId

class CourseClient:
    """
    A client class to load and manage courses using pandas for optimized storage and retrieval.
    """

    def __init__(self, data_dir: str = "data/generated") -> None:
        """
        :param data_dir: Path to the directory with JSON files containing courses.
        """
        self.data_dir: str = data_dir
        self.df: Optional[pd.DataFrame] = None
        self.id_df: Optional[pd.DataFrame] = None
        self._load_courses()

    def _load_courses(self) -> None:
        self.df = pd.read_csv(os.path.join(self.data_dir, "courses.csv"))
        self.id_df = pd.read_csv(os.path.join(self.data_dir, "id_lookup.csv"))

        self.df.set_index('CODE', drop=False, inplace=True)
        self.id_df.set_index('ID', drop=False, inplace=True)
        
        return
        
    def get_course_by_code(self, code: str) -> Optional[CourseWithId]:
        """
        Retrieves a single course by its code.

        :param code: The course code, e.g., 'CORE012'.
        :return: The course or None if not found.
        """
        try:
            row = self.df.loc[code]
            return CourseWithId(**row.to_dict())
        except (KeyError, TypeError):
            return None

    def get_course_by_id(self, course_id: int) -> Optional[CourseWithId]:
        """
        Retrieves a single course by its ID.

        :param course_id: The course ID.
        :return: The course or None if not found.
        """
        try:
            idx = self.id_df.loc[course_id, 'index']
            row = self.df.iloc[idx]
            return CourseWithId(**row.to_dict())
        except (KeyError, TypeError):
            return None
        
    def get_course_ids_by_codes(self, courses_codes: List[str]) -> List[int]:
        """
        Gets a list of course IDs from their codes.
        
        :param courses_codes: List of course codes
        :return: List of course IDs for valid codes
        """
        result = []
        for code in courses_codes:
            try:
                course = self.df.loc[code]
                result.append(int(course['ID']))
            except KeyError:
                continue
        return result

    def all_courses(self) -> List[CourseWithId]:
        """
        Returns all courses as a list, sorted by ID.

        :return: A list of all courses sorted by ID.
        """
        # Sort by ID before converting to records
        sorted_df = self.df.sort_values('ID')
        records = sorted_df.to_dict(orient='records')
        return [CourseWithId(**record) for record in records]
