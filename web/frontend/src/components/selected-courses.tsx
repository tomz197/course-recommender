"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CourseSearch } from "@/types";

interface SelectedCoursesProps {
  courses: CourseSearch[];
  onRemove: (courseId: string) => void;
  emptyMessage?: string;
  wrap?: boolean;
}

export function SelectedCourses({
  courses,
  onRemove,
  emptyMessage = "No courses selected",
  wrap = true,
}: SelectedCoursesProps) {
  if (courses.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">{emptyMessage}</div>
    );
  }

  return (
    <div className={`flex ${wrap ? "flex-wrap" : ""} gap-2 mb-2`}>
      {courses.map((course) => (
        <Badge
          key={course.CODE}
          variant="secondary"
          className="pl-2 pr-1 py-1 flex items-center gap-1"
        >
          <span className="mr-1">{course.CODE}</span>
          <button
            type="button"
            onClick={() => onRemove(course.CODE)}
            className="rounded-full hover:bg-muted p-0.5"
            aria-label={`Remove ${course.NAME}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
