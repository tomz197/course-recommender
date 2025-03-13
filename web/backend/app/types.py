from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Ratings:
    theoretical_vs_practical: int
    usefulness: int
    interest: int
    stem_vs_humanities: int
    abstract_vs_specific: int
    difficulty: int
    multidisciplinary: int
    project_based: int
    creative: int

@dataclass
class Course:
    CODE: str
    FACULTY: str
    NAME: str
    LANGUAGE: str
    SEMESTER: str
    CREDITS: int
    DEPARTMENT: str
    TEACHERS: str
    COMPLETION: str
    PREREQUISITES: str
    FIELDS_OF_STUDY: Optional[str]
    TYPE_OF_STUDY: Optional[str]
    LECTURES_SEMINARS_HOMEWORK: str
    SYLLABUS: str
    OBJECTIVES: str
    TEXT_PREREQUISITS: Optional[str]
    ASSESMENT_METHODS: str
    TEACHING_METHODS: str
    TEACHER_INFO: Optional[str]
    LEARNING_OUTCOMES: str
    LITERATURE: str
    STUDENTS_ENROLLED: int
    STUDENTS_PASSED: int
    AVERAGE_GRADE: float
    FOLLOWUP_COURSES: Optional[str]
    KEYWORDS: List[str]
    DESCRIPTION: str
    RATINGS: Ratings 

@dataclass
class CourseWithId(Course):
    ID: Optional[int] = None
    SIMILARITY: float = 0.0

