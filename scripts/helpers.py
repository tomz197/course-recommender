import os
import json
import random
import unicodedata
import numpy as np
from tqdm import tqdm
from nltk.stem import PorterStemmer


def load_courses(dir_path):
    files = os.listdir(dir_path)
    courses = []
    for file in files:
        with open(f"{dir_path}/{file}", "r") as f:
            courses.extend(json.load(f))
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

def remove_accents(text):
    return ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')

def edit_catalogue_for_llm(course):
    new_course = json.loads(json.dumps(course))

    # Strip whitespaces and all \n
    for key in new_course.keys():
        new_course[key] = new_course[key].strip()
        new_course[key] = new_course[key].replace("\n", " ")

    # Change faculty to more readable form
    faculties = {
        "FI": "Faculty of Informatics",
        "FSS": "Faculty of Social Studies",
        "Přf": "Faculty of Science",
        "LF": "Faculty of Medicine",
        "PrF": "Faculty of Law",
        "FF": "Faculty of Arts",
        "PdF": "Faculty of Education",
        "FSpS": "Faculty of Sports Studies",
        "FPharm": "Faculty of Pharmacy",
        "ESF": "Faculty of Economics and Administration"
    }
    new_course["FACULTY"] = faculties.get(new_course["FACULTY"], new_course["FACULTY"])
    
    # Fix encoding, e.g. \u00e1 -> a
    for key in new_course.keys():
        new_course[key] = remove_accents(new_course[key])

    ls = new_course["LECTURES_SEMINARS_HOMEWORK"].split("/")
    if '' not in ls and sum([float(x) for x in ls]) != 0:
        new_course["TIME_PER_WEEK"] = (f"This course has {ls[0]} hours of lectures, {ls[1]} hours of seminars and {ls[2]} hours of homework per week.")

    if new_course["STUDENTS_ENROLLED"] not in ["", "0"] and new_course["STUDENTS_PASSED"] not in ["", "0"]:
        new_course["SUCCESS_RATE"] = str(int((float(new_course["STUDENTS_PASSED"]) / float(new_course["STUDENTS_ENROLLED"])) * 100)) + "%"

    new_course["LANGUAGE"] = new_course["LANGUAGE"].replace("anglictina", "English").replace("cestina", "Czech").replace("slovenstina", "Slovak")

    # Change completion to more readable form
    completions = {
        "k": "colloquium",
        "z": "fulfilling requirements",
        "zk": "examination",
        "SZk": "final state examination",
        "SDzk": "doctoral state examination"
    }
    new_course["COMPLETION"] = completions.get(new_course["COMPLETION"], new_course["COMPLETION"])

    # Change type of study to more readable form
    types_of_study = {
        "bakalarsky": "bachelor",
        "magistersky navazujici": "follow-up master",
        "magistersky": "master",
        "doktorsky": "doctoral",
        "celozivotni": "lifelong"
    }
    for type in types_of_study.keys():
        new_course["TYPE_OF_STUDY"] = new_course["TYPE_OF_STUDY"].replace(type, types_of_study[type])

    # Remove unnecessary fields
    unneccessary_fields = ["SEMESTER", "DEPARTMENT", "FIELDS_OF_STUDY", "LECTURES_SEMINARS_HOMEWORK",
                           "STUDENTS_ENROLLED", "STUDENTS_PASSED", "AVERAGE_GRADE", "FOLLOWUP_COURSES",
                           "PREREQUISITES", "TEACHERS"]
    
    for field in unneccessary_fields:
        new_course.pop(field)

    # Remove empty fields
    for key in list(new_course.keys()):
        if new_course[key] == "":
            new_course.pop(key)

    return new_course


def dict_print(d):
    res = ""
    for k, v in d.items():
        res += f"{k}: {v}\n"
    return res


# Example usage
if __name__ == "__main__":
    courses, ctoi = load_courses("./data/formatted")

    for i in random.sample(range(len(courses)), 20):
        print(dict_print(edit_catalogue_for_llm(courses[i])))

    # courses = stem_keywords(courses)
    # intersects = keyword_intersection(courses)

    # print(intersects[ctoi["MB152"], :])
