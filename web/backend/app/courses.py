import os
import json
from typing import Dict, Any, List, Tuple

def load_courses(dir_path) -> Tuple[List[Dict[str, Any]], Dict[str, int]]:
    files = os.listdir(dir_path)
    courses = []
    for file in files:
        with open(f"{dir_path}/{file}", "r") as f:
            courses.append(json.load(f))
    courses = courses[0]
    ctoi = {course["CODE"]: i for i, course in enumerate(courses)}
    return courses, ctoi
