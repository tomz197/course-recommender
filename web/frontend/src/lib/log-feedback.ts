import type {
  Course,
  CoursePreferences,
} from "@/types";
import { storageController } from "@/storage";

export async function logFeedback(
  params: CoursePreferences,
  course: Course,
  like: boolean,
) {
  const model = storageController.getPredictionModel();
  await fetch(
    import.meta.env.VITE_API_URL + "/log_feedback",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        liked: [...params.liked.values()].map((course) => course.CODE),
        disliked: [...params.disliked.values()].map((course) => course.CODE),
        course: course.CODE,
        like: like,
        model: model,
        user_id: storageController.getUserID(),
    }),
    });
};
