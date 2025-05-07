"use client";

import { useQuery } from "@tanstack/react-query";
import type { CourseSearch } from "@/types";
const { allFacultySearch } = await import("@/lib/all_code_name_faculty");

// New helper for normalization
const normalizeString = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Preprocess and normalize once per course
const preprocessed = allFacultySearch.map(course => ({
  course,
  code: normalizeString(course.CODE),
  name: normalizeString(course.NAME),
}));

export const filterCourses = (query: string): CourseSearch[] => {
  const queryNorm = normalizeString(query).trim();
  if (!queryNorm) return allFacultySearch;

  return preprocessed.filter(({ code, name }) => code.includes(queryNorm) || name.includes(queryNorm)).map(({ course }) => course);
}

// Refactored filterAndSort using normalized values and reduced computation
const filterAndSort = (query: string): CourseSearch[] => {
  const queryNorm = normalizeString(query).trim();
  if (!queryNorm) return [];

  // Filter based on normalized fields
  const filtered = preprocessed.filter(({ code, name }) => code.includes(queryNorm) || name.includes(queryNorm));

  // Sort prioritized by exact matches, match position, code matches first
  filtered.sort((a, b) => {
    const { code: aC, name: aN } = a;
    const { code: bC, name: bN } = b;

    // 1. Exact code match: courses whose code exactly equals the query come first
    if (aC === queryNorm && bC !== queryNorm) return -1;
    if (bC === queryNorm && aC !== queryNorm) return 1;

    // 2. Exact name match: courses whose name exactly equals the query come next
    if (aN === queryNorm && bN !== queryNorm) return -1;
    if (bN === queryNorm && aN !== queryNorm) return 1;

    // 3. Position of code match: earlier match in the code string is better
    const aCIndex = aC.indexOf(queryNorm);
    const bCIndex = bC.indexOf(queryNorm);
    if (aCIndex !== -1 && bCIndex !== -1) return aCIndex - bCIndex;
    if (aCIndex !== -1) return -1;
    if (bCIndex !== -1) return 1;

    // 4. Position of name match: earlier match in the name string is better
    const aNIndex = aN.indexOf(queryNorm);
    const bNIndex = bN.indexOf(queryNorm);
    return aNIndex - bNIndex;
  });

  return filtered.map(({ course }) => course);
};

const searchCourses = async (
  query: string,
  limit: number,
): Promise<CourseSearch[]> => {
  if (!query) return [];

  const filteredAndSorted = filterAndSort(query);
  return filteredAndSorted.slice(0, limit);
};

export function useSearchCourses(query: string, limit = 100) {
  return useQuery({
    queryKey: ["courses", query],
    queryFn: () => searchCourses(query, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
