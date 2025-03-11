"use client"

import { useQuery } from "@tanstack/react-query"
import type { Course } from "@/types"

// Mock data for demonstration
const mockCourses: Course[] = [
  { id: "1", code: "CS101", name: "Introduction to Computer Science", department: "Computer Science" },
  { id: "2", code: "MATH201", name: "Calculus I", department: "Mathematics" },
  { id: "3", code: "PHYS101", name: "Physics for Scientists", department: "Physics" },
  { id: "4", code: "ENG102", name: "English Composition", department: "English" },
  { id: "5", code: "HIST101", name: "World History", department: "History" },
  { id: "6", code: "BIO101", name: "Introduction to Biology", department: "Biology" },
  { id: "7", code: "CHEM101", name: "General Chemistry", department: "Chemistry" },
  { id: "8", code: "PSYCH101", name: "Introduction to Psychology", department: "Psychology" },
  { id: "9", code: "ECON101", name: "Principles of Economics", department: "Economics" },
  { id: "10", code: "ART101", name: "Art Appreciation", department: "Fine Arts" },
]

// Simulated API call
const searchCourses = async (query: string): Promise<Course[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (!query) return mockCourses

  const lowercaseQuery = query.toLowerCase()
  return mockCourses.filter(
    (course) =>
      course.name.toLowerCase().includes(lowercaseQuery) ||
      course.code.toLowerCase().includes(lowercaseQuery) ||
      course.department.toLowerCase().includes(lowercaseQuery),
  )
}

export function useSearchCourses(query: string) {
  return useQuery({
    queryKey: ["courses", query],
    queryFn: () => searchCourses(query),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

