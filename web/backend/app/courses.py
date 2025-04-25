import os
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any
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

        self.df = pd.read_parquet(
            os.path.join(self.data_dir, "courses.parquet"),
            engine="pyarrow",
            memory_map=True,
        )
        self.id_df = pd.read_parquet(
            os.path.join(self.data_dir, "id_lookup.parquet"),
            engine="pyarrow",
            memory_map=True,
        )

        self.df.set_index('CODE', drop=False, inplace=True)
        self.id_df.set_index('ID', drop=False, inplace=True)

    def _convert_numpy_arrays(self, course_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert any numpy arrays in the course dictionary to Python lists for serialization.
        
        :param course_dict: Dictionary containing course data
        :return: Dictionary with numpy arrays converted to lists
        """
        for key, value in course_dict.items():
            if isinstance(value, np.ndarray):
                course_dict[key] = value.tolist()
        return course_dict

    def get_course_by_code(self, code: str) -> Optional[CourseWithId]:
        """
        Retrieves a single course by its code.

        :param code: The course code, e.g., 'CORE012'.
        :return: The course or None if not found.
        """
        try:
            row = self.df.loc[code]
            course_dict = self._convert_numpy_arrays(row.to_dict())
            return CourseWithId(**course_dict)
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
            course_dict = self._convert_numpy_arrays(row.to_dict())
            return CourseWithId(**course_dict)
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

                if isinstance(course, pd.DataFrame): # TODO: Solve duplicate course codes
                    for _, row in course.iterrows():
                        result.append(int(row['ID']))
                    continue

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
        return [CourseWithId(**self._convert_numpy_arrays(record)) for record in records]
