"use client";

import { Copy, Download, Share2, Trash2 } from "lucide-react";
import type { CourseSearch } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"
import { CourseIsLink } from "./course-is-link";
import { toast } from "sonner";

export function CourseDialogModal({
  courses,
  onRemove,
  title,
  triggerText,
}: {
  courses: CourseSearch[];
  onRemove: (courseId: string) => void;
  title?: string;
  triggerText?: string;
}) {
  const formatCourseList = () => {
    return courses.map(course => 
      `${course.CODE} - ${course.NAME} (${course.FACULTY})`
    ).join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatCourseList());
      toast.success('Course list copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy course list');
    }
  };

  const handleShare = async () => {
    const text = formatCourseList();
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Course List',
          text: text
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error('Failed to share course list');
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleExport = () => {
    const courseList = courses.map(course => ({
      code: course.CODE,
      name: course.NAME,
      faculty: course.FACULTY
    }));
    
    const blob = new Blob([JSON.stringify(courseList, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course-list.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Course list exported successfully');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          {triggerText || 'View Course List'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{title || 'Course List'}</DialogTitle>
          <div className="flex gap-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </DialogHeader>
        <ScrollArea className="h-[60dvh]">
          <div className="flex flex-col divide-y px-1">
            {courses.map((course) => (
              <div 
                key={course.CODE} 
                className="flex justify-between py-3 px-2 items-center hover:bg-muted/50 rounded-md transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">{course.CODE}</span>
                    <span className="text-muted-foreground text-sm">{course.FACULTY}</span>
                  </div>
                  <span>{course.NAME}</span>
                  <CourseIsLink course={course} />
                </div>
                <Button
                  onClick={() => onRemove(course.CODE)}
                  size="icon"
                  variant="ghost"
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
