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
    code: str
    faculty: str
    name: str
    language: str
    semester: str
    credits: int
    department: str
    teachers: str
    completion: str
    prerequisites: str
    fields_of_study: Optional[str]
    type_of_study: Optional[str]
    lectures_seminars_homework: str
    syllabus: str
    objectives: str
    text_prerequisits: Optional[str]
    assessment_methods: str
    teaching_methods: str
    teacher_info: Optional[str]
    learning_outcomes: str
    literature: str
    students_enrolled: int
    students_passed: int
    average_grade: float
    followup_courses: Optional[str]
    keywords: List[str]
    description: str
    ratings: Ratings
