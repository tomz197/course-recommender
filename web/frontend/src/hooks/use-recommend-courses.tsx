import { useQuery } from "@tanstack/react-query"
import type { Course } from "@/types"

interface RecommendCoursesParams {
  likedCourses: Course[]
  dislikedCourses: Course[]
}

// Mock data for demonstration
const mockRecommendations: Course[] = [
  {
    id: "11",
    code: "CS201",
    name: "Data Structures and Algorithms",
    department: "Computer Science",
    description:
      "A comprehensive study of data structures and algorithms, including their design, analysis, and implementation.",
  },
  {
    id: "12",
    code: "MATH301",
    name: "Linear Algebra",
    department: "Mathematics",
    description: "Study of vector spaces, linear transformations, matrices, and systems of linear equations.",
  },
  {
    id: "13",
    code: "PHYS201",
    name: "Electricity and Magnetism",
    department: "Physics",
    description:
      "An introduction to the principles of electricity and magnetism, including electric fields, magnetic fields, and electromagnetic waves.",
  },
  {
    id: "14",
    code: "CS301",
    name: "Database Systems",
    department: "Computer Science",
    description: "Introduction to database design, implementation, and management, including SQL and NoSQL databases.",
  },
  {
    id: "15",
    code: "STAT201",
    name: "Statistics for Data Science",
    department: "Statistics",
    description:
      "Statistical methods for analyzing and interpreting data, with applications in data science and machine learning.",
  },
]

// Simulated API call
const getRecommendations = async (params: RecommendCoursesParams): Promise<Course[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real app, you would use the liked and disliked courses to generate recommendations
  console.log("Generating recommendations based on:", {
    liked: params.likedCourses.map((c) => c.code),
    disliked: params.dislikedCourses.map((c) => c.code),
  })

  // For demo purposes, return mock recommendations
  // In a real app, you would filter these based on the user's preferences
  return mockRecommendations
}

export function useRecommendCourses(params: RecommendCoursesParams) {
  return useQuery({
    queryKey: ["recommendations", params.likedCourses, params.dislikedCourses],
    queryFn: () => getRecommendations(params),
    enabled: params.likedCourses.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

