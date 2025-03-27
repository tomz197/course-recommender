"use client"

import * as React from "react"
import { useSearchCourses } from "@/hooks/use-search-courses"
import type { CourseSearch } from "@/types"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CourseSearchProps {
  onSelectCourse: (course: CourseSearch) => void
  placeholder?: string
  excludeCourses?: CourseSearch[]
}

const loadCoursesNumber = 100

export function CourseSearch({
  onSelectCourse,
  placeholder = "Search courses...",
  excludeCourses = [],
}: CourseSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const { data: courses = [], isLoading } = useSearchCourses(searchQuery, loadCoursesNumber)

  // Filter out excluded courses
  const filteredCourses = React.useMemo(() => {
    if (!courses.length) return []

    return courses.filter((course) => !excludeCourses.some((excluded) => excluded.CODE === course.CODE))
  }, [courses, excludeCourses])

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        dropdownRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    if (value.length > 0) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }

  // Handle course selection
  const handleSelectCourse = (course: CourseSearch) => {
    onSelectCourse(course)
    setSearchQuery("")
    setOpen(false)
  }

  // Handle key press for Enter key to select top result
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && open && filteredCourses.length > 0 && !isLoading) {
      e.preventDefault()
      handleSelectCourse(filteredCourses[0])
    }
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full rounded-md border border-input bg-background shadow-md"
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Searching courses...</span>
            </div>
          ) : filteredCourses.length > 0 ? (
            <ul className="max-h-60 overflow-auto py-1">
              {filteredCourses.map((course) => (
                <li
                  key={course.CODE}
                  onClick={() => handleSelectCourse(course)}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                    "transition-colors duration-150",
                  )}
                >
                  <div className="font-medium">{course.CODE} - {course.FACULTY}</div>
                  {course.NAME && (
                    <div className="text-xs text-muted-foreground truncate">{course.NAME}</div>
                  )}
                </li>
              ))}
            {filteredCourses.length === loadCoursesNumber ? (
              <li className="px-3 py-2 text-sm text-center text-muted-foreground">
                Showing first {loadCoursesNumber} results. Try a more specific search term.
              </li>
            ) : null}
            </ul>
          ) : searchQuery.length > 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No courses found. Try a different search term.
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

