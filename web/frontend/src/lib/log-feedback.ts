import type {
  Course,
  CoursePreferences,
} from "@/types";
import { storageController } from "@/storage";

export async function logFeedback(
  params: CoursePreferences,
  course: Course,
  action: "like" | "dislike" | "skip",
) {
  const model = storageController.getPredictionModel();
  await fetch(
    import.meta.env.VITE_API_URL + "/log_recommendation_feedback",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        liked: [...params.liked.values()].map((course) => course.CODE),
        disliked: [...params.disliked.values()].map((course) => course.CODE),
        skipped: [...params.skipped.values()].map((course) => course.CODE),
        course: course.CODE,
        action: action,
        model: model,
        user_id: storageController.getUserID(),
    }),
    });
};
