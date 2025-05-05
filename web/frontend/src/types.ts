type CourseRatings = {
  theoretical_vs_practical: string;
  usefulness: string;
  interest: string;
  stem_vs_humanities: string;
  abstract_vs_specific: string;
  difficulty: string;
  multidisciplinary: string;
  project_based: string;
  creative: string;
};

export type Course = {
  CODE: string;
  FACULTY: string;
  NAME: string;
  LANGUAGE: string;
  SEMESTER: string;
  CREDITS: string;
  DEPARTMENT: string;
  TEACHERS: string;
  COMPLETION: string;
  PREREQUISITES: string;
  FIELDS_OF_STUDY: string;
  TYPE_OF_STUDY: string;
  LECTURES_SEMINARS_HOMEWORK: string;
  SYLLABUS: string;
  OBJECTIVES: string;
  TEXT_PREREQUISITS: string;
  ASSESMENT_METHODS: string;
  TEACHING_METHODS: string;
  TEACHER_INFO: string;
  LEARNING_OUTCOMES: string;
  LITERATURE: string;
  STUDENTS_ENROLLED: string;
  STUDENTS_PASSED: string;
  AVERAGE_GRADE: string;
  FOLLOWUP_COURSES: string;
  KEYWORDS: string[];
  DESCRIPTION: string;
  RATINGS: CourseRatings;
  RECOMMENDED_FROM: string[] | null;
};

export type CourseSearch = Pick<Course, "CODE" | "NAME" | "FACULTY">;

export type CoursePreferences = {
  liked: Map<CourseSearch["CODE"], CourseSearch>;
  disliked: Map<CourseSearch["CODE"], CourseSearch>;
  skipped: Map<CourseSearch["CODE"], CourseSearch>;
};
