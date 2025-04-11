import type { CoursePreferences, CourseSearch } from "@/types";

type StorageCoursePreferences = {
  liked: CourseSearch[];
  disliked: CourseSearch[];
  skipped: CourseSearch[];
};

function getCoursePreferences(): CoursePreferences {
  const raw = localStorage.getItem("coursePreferences");
  if (!raw) return { liked: new Map(), disliked: new Map(), skipped: new Map() };
  const parsed: StorageCoursePreferences = JSON.parse(raw);

  return {
    liked: new Map(parsed.liked.map((course) => [course.CODE, course])),
    disliked: new Map(parsed.disliked.map((course) => [course.CODE, course])),
    skipped: new Map(parsed.skipped.map((course) => [course.CODE, course])),
  };
}

function setCoursePreferences(preferences: CoursePreferences) {
  const formatted: StorageCoursePreferences = {
    liked: Array.from(preferences.liked.values()),
    disliked: Array.from(preferences.disliked.values()),
    skipped: Array.from(preferences.skipped.values()),
  };
  localStorage.setItem("coursePreferences", JSON.stringify(formatted));
}

function resetCoursePreferences() {
  localStorage.removeItem("coursePreferences");
}

function getUserID() {
  if (localStorage.getItem('userId')) {
    return localStorage.getItem('userId');
  }
  const newUserId = crypto.randomUUID();
  localStorage.setItem('userId', newUserId);
  return newUserId;
}

function getPredictionModel() {
  return localStorage.getItem('predictionModel');
}

function setPredictionModel(model: string) {
  localStorage.setItem('predictionModel', model);
}

function resetStorage() {
  localStorage.clear();
}

function getRecommendedCount(): number {
  return parseInt(localStorage.getItem('recommendedCount') || '0');
}

function incrementRecommendedCount() {
  const count = getRecommendedCount();
  localStorage.setItem('recommendedCount', (count + 1).toString());
}

export const storageController = {
  getCoursePreferences,
  setCoursePreferences,
  resetCoursePreferences,
  resetStorage,
  getUserID,
  getPredictionModel,
  setPredictionModel,
  getRecommendedCount,
  incrementRecommendedCount,
};
