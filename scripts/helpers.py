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
    for course in tqdm(courses, total=len(courses)):
        course["KEYWORDS"] = {
            ps.stem(keyword.lower()) for keyword in course["KEYWORDS"]
        }
    return courses


def keyword_intersection(courses):
    intersects = np.zeros((len(courses), len(courses)))

    for i, course in tqdm(enumerate(courses), total=len(courses)):
        for j, other_course in enumerate(courses):
            intersects[i, j] = len(
                set(course["KEYWORDS"]) & set(other_course["KEYWORDS"])
            )

    return intersects


# Example usage
if __name__ == "__main__":
    courses, ctoi = load_courses("./data/generated")
    courses = stem_keywords(courses)
    intersects = keyword_intersection(courses)

    print(intersects[ctoi["MB152"], :])
