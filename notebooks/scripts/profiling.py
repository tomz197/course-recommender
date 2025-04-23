import cProfile
import pstats
import io
import time
import random
from typing import List, Callable, Literal
import numpy as np

from app.courses import CourseClient
from app.types import CourseWithId

# Initialize the CourseClient
course_client = CourseClient("./assets/courses/")
all_embeds = np.load("./assets/embeddings_tomas_03.npy", allow_pickle=True)

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
        from app.recommend.embeddings import recommend_mmr
        
        # Add the functions to the profiler
        lp.add_function(recommend_mmr)
        
        # Prepare test data
        liked_codes = get_random_course_codes(5)
        disliked_codes = get_random_course_codes(2)
        
        # Wrap the function call
        wrapped_func = lp(recommend_mmr)
        
        # Run the wrapped function
        wrapped_func(
            liked_codes,
            disliked_codes,
            [],
            all_embeds,
            course_client,
            1,
            0.8
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
