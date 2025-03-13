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

    # {
    #     "CODE": " PV259 ",
    #     "FACULTY": " FI ",
    #     "NAME": " Generative Design Programming ",
    #     "LANGUAGE": " angli\u010dtina ",
    #     "SEMESTER": " podzim 2024 ",
    #     "CREDITS": " 3 ",
    #     "DEPARTMENT": " KVI ",
    #     "TEACHERS": " \u0158eh\u00e1\u010dek, M. - Luk\u00e1\u0161ov\u00e1, H. - Bertko, M. - Dohnal, M. ",
    #     "COMPLETION": " k ",
    #     "PREREQUISITES": " ",
    #     "FIELDS_OF_STUDY": " UCIMAJ, IB, PPJ, PGV, GD, AZO, SL, KB, SUUI, BIO, KBA, SSA, PGVA, HW, SW, KVM, ZARD, VPHA, FAPS, VPH, ZPJ, GDA, PSKA, UCISS, UCIMIN, PSK, SS, SLA, AZOA, HWA, IBA, DAM ",
    #     "TYPE_OF_STUDY": " magistersk\u00fd navazuj\u00edc\u00ed ",
    #     "LECTURES_SEMINARS_HOMEWORK": " 1/2/1 ",
    #     "SYLLABUS": " Introduction to generative design and art, programming in p5.js, examples of works of international and local artists.\n    Basic geometry: how to use colors, color palettes and their interpolation, color models (RGB vs. HSL), transparency and blending, basic shapes, organizing shapes into rhythmic patterns, generating growing structures.\n    Interactivity: using mouse and keyboard input to alter the artwork.\n    Geometric transformations: how to position elements, coordinate systems, linear interpolation.\n    Randomness vs. order: let computer make decisions, use Perlin noise.\n    Use of generative techniques in graphic design.\n    Multi-agent systems: artificial life, forces, physics, digital brush, flowfields, emergent patterns.\n    Complex shapes, vectors, curves\n    Computer audition: what are the qualities of sound, spectral analysis using FFT, creating audio-reactive visuals\n    Typography: playing with text and font parameters, curves, font rasterization, font mutations.\n    Basics of image processing.\n    AI in art: using ml5.js, generative and other models, such as PoseNet.\n    Final project: ideation, first concepts and drafts, implementation, and presentation. Using Figma to document and present the ideas. ",
    #     "OBJECTIVES": " Show how art intersects with technology and how to use programming skills in graphic design and art projects. The course explains generative design techniques and fundamental art principles through programming in p5.js (Processing). The students will profoundly understand generative design process, improve their design thinking, and create unique audio-visual works to present to their peers and public. ",
    #     "TEXT_PREREQUISITS": " Basic knowledge of programming, algorithms & data structures (as taught within introductory programming courses such as IB111 Foundations of Programming and IB002 Algorithms I). ",
    #     "ASSESMENT_METHODS": " Students complete several small generative art exercises on given topics during the course. Towards the end of the course, each student designs and solo-implements a standalone project. They will document the process and present their projects to other AGD+M students, lecturers, and the public.\n    Students will regularly consult their outputs with the teachers. The quality of both design and code will be considered in the evaluation. ",
    #     "TEACHING_METHODS": " Lectures and seminars outlined in the schedule of the course are identical. The classes are interactive, set up in a way that mixes programming exercises with very brief lectures and own experimentation. Therefore, attendance is expected on the lectures. The classes consist of:\n    lectures about given topics from an artistic point of view\n    lectures about specific programming principles\n    creative programming exercises where the students apply their knowledge from the lectures\n    collaborative creative activities that support idea sharing and inspiration\n    presentations of students' works\n    ",
    #     "TEACHER_INFO": " https://www.generativedesign.cz/\n    Examples of projects created in course ",
    #     "LEARNING_OUTCOMES": " Students passing this course will be able to:\n    create own (interactive) audio-visual works (static images, video, interactive graphics, web application, art installation) using generative design techniques\n    apply generative design techniques in other fields (graphic and web design, data visualization, games, art, ...)\n    create presentations of ideas for designs or artworks using design sotware (Figma)\n    prototype the ideas in p5.js or Processing\n    ",
    #     "LITERATURE": "\n        BOHNACKER, Hartmut, Benedikt GROSS a Julia LAUB. Generative design : visualize, program, and create with processing. Edited by Claudius Lazzeroni. 1st ed. New York: Princeton Architectural Press, 2012, 474 s. ISBN 9781616890773. info\n        PEARSON, Matt. Generative art : a practical guide using processing. Edited by Marius Watz. Shelter Island, NY: Manning ;, 2011, xli, 197. ISBN 9781935182627. info\n        REAS, Casey a Chandler MCWILLIAMS. Form+code in design, art, and architecture. 1st ed. New York: Princeton Architectural Press, 2010, 176 s. ISBN 9781568989372. info \n    ",
    #     "STUDENTS_ENROLLED": " 20 ",
    #     "STUDENTS_PASSED": " 18 ",
    #     "AVERAGE_GRADE": " 4.00 ",
    #     "FOLLOWUP_COURSES": " PV066,PV067,PV078,PV083,PV084,PV085,PV099,PV100,PV101,PV251,PV257,VV035,VV036,VV050,VV051,VV067,VV068 "
    # },


def edit_catalogue_for_llm(course):
    new_course = json.loads(json.dumps(course))
    # Remove SEMESTER
    new_course.pop("SEMESTER")
    new_course.pop("DEPARTMENT")
    new_course.pop("FIELDS_OF_STUDY")
    ls = new_course["LECTURES_SEMINARS_HOMEWORK"].split("/")
    new_course["TIME_PER_WEEK"] = (
        f"This course has {ls[0]} hours of lectures, {ls[1]} hours of seminars and {ls[2]} hours of homework per week."
    )
    new_course.pop("LECTURES_SEMINARS_HOMEWORK")
    new_course["SUCCESS_RATE"] = f"{int((
        float(new_course["STUDENTS_PASSED"]) / float(new_course["STUDENTS_ENROLLED"])
    ) * 100)}%"
    new_course.pop("STUDENTS_ENROLLED")
    new_course.pop("STUDENTS_PASSED")
    new_course.pop("AVERAGE_GRADE")
    new_course.pop("FOLLOWUP_COURSES")

    return new_course


# Example usage
if __name__ == "__main__":
    courses, ctoi = load_courses("./data/formatted")

    print(json.dumps(edit_catalogue_for_llm(courses[0]), indent=4))

    # courses = stem_keywords(courses)
    # intersects = keyword_intersection(courses)

    # print(intersects[ctoi["MB152"], :])
