"use client";

import { Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CourseSearch } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"

interface SelectedCoursesProps {
  courses: CourseSearch[];
  onRemove: (courseId: string) => void;
  emptyMessage?: string;
  title?: string;
  wrap?: boolean;
}

export function SelectedCourses({
  courses,
  onRemove,
  emptyMessage = "No courses selected",
  title = "Selected courses",
  wrap = true,
}: SelectedCoursesProps) {
  if (courses.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">{emptyMessage}</div>
    );
  }

  return (
    <div className="flex flex-col justify-center">
      <div className="flex justify-between items-center">
        <p className="text-sm">{title}</p>
        <ShowDetails courses={courses} onRemove={onRemove} title={title} />
      </div>
      <div className="overflow-scroll py-1 max-h-32">
        <div className={`flex ${wrap ? "flex-wrap" : ""} gap-2 mb-2`}>
          {courses.map((course) => (
            <CourseBadge key={course.CODE} course={course} onRemove={onRemove} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CourseBadge({
  course,
  onRemove,
}: {
  course: CourseSearch;
  onRemove: SelectedCoursesProps["onRemove"];
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Badge
          variant="secondary"
          className="pl-2 pr-1 py-1 flex items-center gap-1 cursor-pointer hover:shadow-md"
        >
          <span className="mr-1">{course.CODE}</span>
          <button
            type="button"
            onClick={() => onRemove(course.CODE)}
            className="rounded-full p-0.5 cursor-pointer hover:bg-muted-foreground hover:text-muted"
            aria-label={`Remove ${course.NAME}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{course.NAME}</DialogTitle>
          <DialogDescription>{course.FACULTY}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function ShowDetails({
  courses,
  onRemove,
  title,
}: {
  courses: CourseSearch[];
  onRemove: SelectedCoursesProps["onRemove"];
  title?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger >
        <span className="text-muted-foreground underline text-sm">Show details</span>
      </DialogTrigger>
      <DialogContent>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60dvh]">
            <div className="flex flex-col divide-y px-1">
              {courses.map((course) => (
                <div key={course.CODE} className="flex justify-between py-2 px-1 items-center">
                  <div className="flex flex-col">
                    <span ><span className="font-bold">{course.CODE} </span> - {course.FACULTY}</span>
                    <span>{course.NAME}</span>
                  </div>
                  <Button
                    onClick={() => onRemove(course.CODE)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </DialogContent>
    </Dialog>
  )
}
