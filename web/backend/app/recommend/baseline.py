import random
from typing import List, Dict, Set
from app.courses import CourseClient
from app.types import CourseWithId

def recommend_courses_baseline(liked: List[str], disliked: List[str], skipped: List[str], courseClient: CourseClient, n: int) -> List[CourseWithId]:
    """
    Recommends courses based on shared teachers, faculty, and department.
    Only considers the first 2 teachers of each course.
    
    Args:
        liked: List of course codes that the user likes
        disliked: List of course codes that the user dislikes
        skipped: List of course codes to skip in recommendations
        courseClient: Client for retrieving course information
        n: Number of recommendations to return
        
    Returns:
        List of recommended courses
    """
    if not liked:
        return []
    
    # Get all liked courses with their details
    liked_courses = [courseClient.get_course_by_code(code) for code in liked]
    liked_courses = [course for course in liked_courses if course is not None]
    
    if not liked_courses:
        return []
    
    # Extract features from liked courses
    teachers_set: Set[str] = set()
    faculties_set: Set[str] = set()
    departments_set: Set[str] = set()
    
    for course in liked_courses:
        if course.TEACHERS:
            # Split teachers by comma and add only first 2 to set
            course_teachers = [teacher.strip() for teacher in course.TEACHERS.split('-') if teacher.strip()]
            for teacher in course_teachers[:2]:  # Only take first 2 teachers
                if teacher:
                    teachers_set.add(teacher)

        if course.FACULTY:
            faculties_set.add(course.FACULTY.strip())
        
        if course.DEPARTMENT:
            departments_set.add(course.DEPARTMENT.strip())

    # Calculate scores for all courses
    all_courses = courseClient.all_courses()
    course_scores: Dict[str, float] = {}
    
    excluded_codes = set(liked + disliked + skipped)

    for course in all_courses:
        if course.CODE in excluded_codes:
            continue
        
        score = 0.0
        
        # Check teachers (only first 2)
        if course.TEACHERS:
            course_teachers = [teacher.strip() for teacher in course.TEACHERS.split('-') if teacher.strip()]
            course_teachers = course_teachers[:2]  # Only consider first 2 teachers
            matching_teachers = sum(1 for teacher in course_teachers if teacher in teachers_set)
            if matching_teachers > 0 and course_teachers:
                score += 0.5
        
        # Check faculty
        if course.FACULTY and course.FACULTY.strip() in faculties_set:
            score += 0.25
        
        # Check department
        if course.DEPARTMENT and course.DEPARTMENT.strip() in departments_set:
            score += 0.25
        
        if score > 0:
            course_scores[course.CODE] = score
    
    # Sort courses by score
    sorted_codes = sorted(course_scores.keys(), key=lambda code: course_scores[code], reverse=True)
    
    # Group courses by score
    courses_grouped_by_score: Dict[float, List[str]] = {}
    for code in sorted_codes:
        score = course_scores[code]
        courses_grouped_by_score.setdefault(score, []).append(code)

    # Shuffle within each score group and reconstruct the list
    final_sorted_codes = []
    # Iterate through scores in descending order (implicit from sorted_codes_by_score)
    unique_scores_desc = sorted(courses_grouped_by_score.keys(), reverse=True)
    for score in unique_scores_desc:
        codes_with_same_score = courses_grouped_by_score[score]
        random.shuffle(codes_with_same_score)
        final_sorted_codes.extend(codes_with_same_score)
    
    # Get top N courses
    recommended_courses: List[CourseWithId] = []

    for code in final_sorted_codes[:n]:
        course = courseClient.get_course_by_code(code)
        if course is not None:
            course.SIMILARITY = course_scores[code]
            recommended_courses.append(course)

    return recommended_courses