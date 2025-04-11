from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Ratings:
    theoretical_vs_practical: str
    usefulness: str
    interest: str
    stem_vs_humanities: str
    abstract_vs_specific: str
    difficulty: str
    multidisciplinary: str
    project_based: str
    creative: str

@dataclass
class Course:
    CODE: str
    FACULTY: str
    NAME: str
    NAME_EN: str
    LANGUAGE: str
    SEMESTER: str
    CREDITS: str
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
    STUDENTS_ENROLLED: str
    STUDENTS_PASSED: str
    AVERAGE_GRADE: str
    FOLLOWUP_COURSES: Optional[str]
    KEYWORDS: List[str]
    DESCRIPTION: str
    RATINGS: Ratings 

@dataclass
class CourseWithId(Course):
    ID: Optional[int] = 0
    SIMILARITY: float = 0.0

@dataclass
class RecommendationFeedbackLog():
    liked: List[str]
    disliked: List[str]
    skipped: List[str]
    course: str
    action: str
    user_id: str
    model: str

@dataclass
class UserFeedbackLog():
    text: Optional[str] = None
    rating: Optional[int] = None
    faculty: Optional[str] = None
