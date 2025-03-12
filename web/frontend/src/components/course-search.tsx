import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSearchCourses } from "@/hooks/use-search-courses";
import type { CourseSearch } from "@/types";

interface CourseSearchProps {
  onSelectCourse: (course: CourseSearch) => void;
  placeholder?: string;
  excludeCourses?: CourseSearch[];
}

export function CourseSearch({
  onSelectCourse,
  placeholder = "Search courses...",
  excludeCourses = [],
}: CourseSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Assuming this hook exists and returns a tanstack-query response
  const { data: courses = [], isLoading } = useSearchCourses(searchQuery);

  // Filter out excluded courses
  const filteredCourses = courses.filter(
    (course) =>
      !excludeCourses.some((excluded) => excluded.CODE === course.CODE),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Searching..." : "No courses found."}
            </CommandEmpty>
            <CommandGroup>
              {filteredCourses.map((course) => (
                <CommandItem
                  key={course.CODE}
                  value={course.CODE}
                  onSelect={() => {
                    onSelectCourse(course);
                    setOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  <div className="flex flex-col">
                    <span>{course.NAME}</span>
                    <span className="text-xs text-muted-foreground">
                      {course.CODE} - {course.NAME}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
