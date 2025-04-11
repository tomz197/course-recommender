"use client";

import { useQuery } from "@tanstack/react-query";
import type { CourseSearch } from "@/types";
const { allFacultySearch } = await import("@/lib/all_code_name_faculty");

const filterAndSort = (list: CourseSearch[], query: string): CourseSearch[] => {
  const queryLower = query.toLowerCase();
  
  // Filter courses that contain the query (case-insensitive)
  const filtered = list.filter(course => 
    course.CODE.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(queryLower) || 
    course.NAME.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(queryLower)
  );
  
  // Sort the filtered list
  filtered.sort((a, b) => {
    const aCodeLower = a.CODE.toLowerCase();
    const bCodeLower = b.CODE.toLowerCase();
    const aNameLower = a.NAME.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const bNameLower = b.NAME.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Check for exact matches first (both in code and name)
    if (aCodeLower === queryLower && bCodeLower !== queryLower) return -1;
    if (bCodeLower === queryLower && aCodeLower !== queryLower) return 1;
    if (aNameLower === queryLower && bNameLower !== queryLower) return -1;
    if (bNameLower === queryLower && aNameLower !== queryLower) return 1;
    
    // Then compare based on the index of the match (lower index means a better match)
    const aCodeIndex = aCodeLower.indexOf(queryLower);
    const bCodeIndex = bCodeLower.indexOf(queryLower);
    const aNameIndex = aNameLower.indexOf(queryLower);
    const bNameIndex = bNameLower.indexOf(queryLower);

    // If both have matches in code, compare code matches
    if (aCodeIndex !== -1 && bCodeIndex !== -1) {
      return aCodeIndex - bCodeIndex;
    }
    // If only one has a code match, prioritize it
    if (aCodeIndex !== -1) return -1;
    if (bCodeIndex !== -1) return 1;
    // If neither has a code match, compare name matches
    return aNameIndex - bNameIndex;
  });
  
  return filtered;
};

const searchCourses = async (
  query: string,
  limit: number,
): Promise<CourseSearch[]> => {
  if (!query) return [];

  const filteredAndSorted = filterAndSort(allFacultySearch, query);
  return filteredAndSorted.slice(0, limit);
};

export function useSearchCourses(query: string, limit = 100) {
  return useQuery({
    queryKey: ["courses", query],
    queryFn: () => searchCourses(query, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
