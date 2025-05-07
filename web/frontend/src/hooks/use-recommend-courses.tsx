import { useQuery } from "@tanstack/react-query";
import type {
  Course,
  CoursePreferences,
  Course as CourseSearch,
} from "@/types";
import { storageController } from "@/storage";
import api from "@/lib/utils";

const getRecommendations = async (
  params: CoursePreferences,
): Promise<Course> => {
  storageController.incrementRecommendedCount();
  let model = storageController.getPredictionModel() ?? "max_with_combinations";
  const relevance = storageController.getRelevance();

  const res = (await api.post(`/recommendations?n=1&model=${model}&relevance=${relevance}`, {
    body: {
      liked: [...params.liked.values()].map((course) => course.CODE),
      disliked: [...params.disliked.values()].map((course) => course.CODE),
      skipped: [...params.skipped.values()].map((course) => course.CODE),
    },
  })) as {
    recommended_courses: CourseSearch[];
  };

  return res.recommended_courses[0];
};

export function useRecommendCourses(params: CoursePreferences) {
  return useQuery({
    queryKey: ["recommendations", params.liked, params.disliked, params.skipped],
    queryFn: () => getRecommendations(params),
    enabled: params.liked.size > 0,
    staleTime: 1000 * 60, // 1 minutes
  });
}
