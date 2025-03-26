import { useQuery } from "@tanstack/react-query";
import type {
  Course,
  CoursePreferences,
  Course as CourseSearch,
} from "@/types";

const getRecommendations = async (
  params: CoursePreferences,
): Promise<Course> => {
  const res = (await fetch(
    import.meta.env.VITE_API_URL + "/recommendations?n=1",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        liked: [...params.liked.values()].map((course) => course.CODE),
        disliked: [...params.disliked.values()].map((course) => course.CODE),
      }),
    },
  ).then((res) => {
    return res.json();
  })) as {
    recommended_courses: CourseSearch[];
  };

  return res.recommended_courses[0];
};

export function useRecommendCourses(params: CoursePreferences) {
  return useQuery({
    queryKey: ["recommendations", params.liked, params.disliked],
    queryFn: () => getRecommendations(params),
    enabled: params.liked.size > 0,
    staleTime: 1000 * 60, // 1 minutes
  });
}
