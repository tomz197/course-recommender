"use client";

import { ExternalLink } from "lucide-react";
import type { CourseSearch } from "@/types";

export function CourseIsLink({ course }: { course: CourseSearch }) {
  return (
    <a
      href={`https://is.muni.cz/predmet/${
        course.FACULTY === "P\u0159F" ? "sci" : course.FACULTY
      }/${course.CODE}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center hover:underline text-sm text-blue-500 hover:text-blue-600"
    >
      View in IS MU <ExternalLink className="h-4 w-4 ml-1" />
    </a>
  );
}