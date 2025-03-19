import type { CoursePreferences, CourseSearch } from "@/types";

type StorageCoursePreferences = {
  liked: CourseSearch[];
  disliked: CourseSearch[];
};

function getCoursePreferences(): CoursePreferences {
  const raw = localStorage.getItem("coursePreferences");
  if (!raw) return { liked: new Map(), disliked: new Map() };
  const parsed: StorageCoursePreferences = JSON.parse(raw);

  return {
    liked: new Map(parsed.liked.map((course) => [course.CODE, course])),
    disliked: new Map(parsed.disliked.map((course) => [course.CODE, course])),
  };
}

function setCoursePreferences(preferences: CoursePreferences) {
  const formatted: StorageCoursePreferences = {
    liked: Array.from(preferences.liked.values()),
    disliked: Array.from(preferences.disliked.values()),
  };
  localStorage.setItem("coursePreferences", JSON.stringify(formatted));
}

function resetCoursePreferences() {
  localStorage.removeItem("coursePreferences");
}

export const storageController = {
  getCoursePreferences,
  setCoursePreferences,
  resetCoursePreferences,
};
