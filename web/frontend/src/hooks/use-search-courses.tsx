"use client";

import { useQuery } from "@tanstack/react-query";
import type { CourseSearch } from "@/types";
import { allFacultySearch } from "@/lib/all_code_name_faculty";

// Simulated API call
const searchCourses = async (query: string): Promise<CourseSearch[]> => {
  // Simulate network delay
  if (!query) return [];

  const lowercaseQuery = query.toLowerCase();
  const filtered = allFacultySearch
    .filter(
      (course) =>
        course.CODE.toLowerCase().includes(lowercaseQuery) ||
        course.NAME.toLowerCase().includes(lowercaseQuery),
    )
  if (filtered.length > 10) {
    return filtered.slice(0, 10);
  }
  return filtered;
};

export function useSearchCourses(query: string) {
  return useQuery({
    queryKey: ["courses", query],
    queryFn: () => searchCourses(query),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
