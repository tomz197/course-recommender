import cProfile
import pstats
import io
import time
import random
from typing import List, Callable, Literal
import numpy as np

from app.recommend_embeddings import recommend_courses, sort_by_similarity
from app.recommend_keywords import recommend_courses_keywords
from app.courses import CourseClient
from app.types import CourseWithId

# Initialize the CourseClient
course_client = CourseClient("./assets/courses/")
all_embeds = np.load("./assets/embeds_all.npy", allow_pickle=True)

def get_random_course_codes(n: int) -> List[str]:
    """Get random course codes from the course client"""
    all_courses = course_client.all_courses()
    selected_courses = random.sample(all_courses, min(n, len(all_courses)))
    return [course.CODE for course in selected_courses]

def line_profiler_analysis():
    """Run line-by-line profiling on the recommendation functions"""
    try:
        import line_profiler
        
        print("\n=== Line-by-line profiling ===")
        
        # Create a line profiler
        lp = line_profiler.LineProfiler()
        
        # Import the specific functions we want to profile
        from app.recommend_embeddings import sort_by_similarity, recommend_courses  
        
        # Add the functions to the profiler
        lp.add_function(sort_by_similarity)
        lp.add_function(recommend_courses)
        
        # Prepare test data
        liked_codes = get_random_course_codes(5)
        disliked_codes = get_random_course_codes(2)
        
        # Get the IDs and embeddings
        liked_ids = course_client.get_course_ids_by_codes(liked_codes)
        disliked_ids = course_client.get_course_ids_by_codes(disliked_codes)
        liked_embeds = all_embeds[liked_ids]
        disliked_embeds = all_embeds[disliked_ids]
        
        # Wrap the function call
        wrapped_func = lp(recommend_courses)
        
        # Run the wrapped function
        wrapped_func(
            liked_codes,
            disliked_codes,
            all_embeds,
            course_client,
            1  # Request only one recommendation
        )
        
        # Print the line profiler stats
        lp.print_stats()
        
    except ImportError as e:
        print(f"Error importing line_profiler: {e}")
        import sys
        print(f"Python executable: {sys.executable}")
        print(f"Python version: {sys.version}")
        print(f"Python path: {sys.path}")
        print("line_profiler module not available. Install it with 'pip install line_profiler'")
        print("Skipping line-by-line profiling.")

if __name__ == "__main__":
    line_profiler_analysis()
