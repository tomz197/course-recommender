"use client";

import { useQuery } from "@tanstack/react-query";
import type { CourseSearch } from "@/types";
import { allFacultySearch } from "@/lib/all_code_name_faculty";

const searchCourses = async (
  query: string,
  limit: number,
): Promise<CourseSearch[]> => {
  if (!query) return [];

  const lowercaseQuery = query.toLowerCase();
  let filtered = allFacultySearch.filter((course) =>
    course.CODE.toLowerCase().includes(lowercaseQuery),
  );
  if (filtered.length >= limit) {
    return filtered.slice(0, limit);
  }

  filtered = filtered.concat(
    allFacultySearch.filter((course) =>
      course.NAME.toLowerCase().includes(lowercaseQuery),
    ),
  );
  if (filtered.length >= limit) {
    return filtered.slice(0, limit);
  }
  return filtered;
};

export function useSearchCourses(query: string, limit = 100) {
  return useQuery({
    queryKey: ["courses", query],
    queryFn: () => searchCourses(query, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
