"use client"

import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Course } from "@/types"

interface SelectedCoursesProps {
  courses: Course[]
  onRemove: (courseId: string) => void
  emptyMessage?: string
}

export function SelectedCourses({ courses, onRemove, emptyMessage = "No courses selected" }: SelectedCoursesProps) {
  if (courses.length === 0) {
    return <div className="text-sm text-muted-foreground py-2">{emptyMessage}</div>
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {courses.map((course) => (
        <Badge key={course.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
          <span className="mr-1">{course.code}</span>
          <button
            type="button"
            onClick={() => onRemove(course.id)}
            className="rounded-full hover:bg-muted p-0.5"
            aria-label={`Remove ${course.name}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  )
}

