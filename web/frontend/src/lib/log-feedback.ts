import type {
  Course,
  CoursePreferences,
} from "@/types";
import { storageController } from "@/storage";
import api from "./utils";

export async function logFeedback(
  params: CoursePreferences,
  course: Course,
  action: "like" | "dislike" | "skip",
) {
  await api.post("/log_recommendation_feedback", {
      body: {
        liked: [...params.liked.values()].map((course) => course.CODE),
        disliked: [...params.disliked.values()].map((course) => course.CODE),
        skipped: [...params.skipped.values()].map((course) => course.CODE),
        course: course.CODE,
        action: action,
        model: storageController.getPredictionModel(),
        user_id: storageController.getUserID(),
    },
  });
};
