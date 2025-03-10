import os
import json
import numpy as np
from tqdm import tqdm
from nltk.stem import PorterStemmer


def load_courses(dir_path):
    files = os.listdir(dir_path)
    courses = []
    for file in files:
        with open(f"{dir_path}/{file}", "r") as f:
            courses.append(json.load(f))
    courses = courses[0]
    ctoi = {course["CODE"].strip(): i for i, course in enumerate(courses)}
    return courses, ctoi


def stem_keywords(courses):
    ps = PorterStemmer()
    courses_copy = json.loads(json.dumps(courses))
    for course in tqdm(courses_copy, total=len(courses_copy)):
        course["KEYWORDS"] = {
            ps.stem(keyword.lower()) for keyword in course["KEYWORDS"]
        }
    return courses_copy


def keyword_intersection(courses):
    intersects = np.zeros((len(courses), len(courses)))

    for i, course in tqdm(enumerate(courses), total=len(courses)):
        for j, other_course in enumerate(courses):
            intersects[i, j] = len(
                set(course["KEYWORDS"]) & set(other_course["KEYWORDS"])
            )

    return intersects


def get_only_generated_info(courses):
    return [
        {
            "KEYWORDS": " ".join(course["KEYWORDS"]),
            "RATINGS": ratings_to_string(course["RATINGS"]),
        }
        for course in courses
    ]

def nice_dict_print(d):
    res = ""
    for k, v in d.items():
        res += f" {v} "
    return res

def ratings_to_string(ratings):
    res = ""
    modifiers = ["", "quite-", "very-", "very-", "extremely-", "extremely-"]
    for k, v in ratings.items():
        v = int(v)
        if k == "theoretical_vs_practical":
            if v > 5:
                res += f"{modifiers[v-5]}theoretical"
            else:
                res += f"{modifiers[5-v]}practical"
        elif k == "usefulness":
            res += f"{modifiers[v//2]}useful"
        elif k == "interest":
            res += f"{modifiers[v//2]}interesting"
        elif k == "stem_vs_humanities":
            if v > 5:
                res += f"{modifiers[v-5]}STEM"
            else:
                res += f"{modifiers[5-v]}Humanities"
        elif k == "abstract_vs_specific":
            if v > 5:
                res += f"{modifiers[v-5]}abstract"
            else:
                res += f"{modifiers[5-v]}specific"
        elif k == "difficulty":
            res += f"{modifiers[v//2]}difficult"
        elif k == "multidisciplinary":
            res += f"{modifiers[v//2]}multidisciplinary"
        elif k == "project_based":
            res += f"{modifiers[v//2]}project-based"
        elif k == "creative":
            res += f"{modifiers[v//2]}creative"
        res += " "
    return res

# Example usage
if __name__ == "__main__":
    courses, ctoi = load_courses("./data/generated")
    courses = stem_keywords(courses)
    intersects = keyword_intersection(courses)

    print(intersects[ctoi["MB152"], :])
