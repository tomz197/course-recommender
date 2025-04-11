import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CourseSearch } from "@/types";
import { storageController } from "@/storage";
import { toast } from "sonner";

type CoursePreferencesMap = Map<string, CourseSearch>;

interface CourseContextType {
  likedCourses: CoursePreferencesMap;
  dislikedCourses: CoursePreferencesMap;
  skippedCourses: CoursePreferencesMap;
  addLikedCourse: (course: CourseSearch) => void;
  addDislikedCourse: (course: CourseSearch) => void;
  addSkippedCourse: (course: CourseSearch) => void;
  removeLikedCourse: (courseId: string) => void;
  removeDislikedCourse: (courseId: string) => void;
  removeSkippedCourse: (courseId: string) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [likedCourses, setLikedCourses] = useState<CoursePreferencesMap>(new Map());
  const [dislikedCourses, setDislikedCourses] = useState<CoursePreferencesMap>(new Map());
  const [skippedCourses, setSkippedCourses] = useState<CoursePreferencesMap>(new Map());

  useEffect(() => {
    const { liked, disliked, skipped } = storageController.getCoursePreferences();
    setLikedCourses(liked);
    setDislikedCourses(disliked);
    setSkippedCourses(skipped);
  }, []);

  const addLikedCourse = (course: CourseSearch) => {
    if (likedCourses.has(course.CODE)) return;
    const newLikedCourses = new Map(likedCourses.set(course.CODE, course));
    setLikedCourses(newLikedCourses);
    storageController.setCoursePreferences({
      liked: newLikedCourses,
      disliked: dislikedCourses,
      skipped: skippedCourses,
    });
  };

  const addDislikedCourse = (course: CourseSearch) => {
    if (dislikedCourses.has(course.CODE)) return;
    const newDislikedCourses = new Map(dislikedCourses.set(course.CODE, course));
    setDislikedCourses(newDislikedCourses);
    storageController.setCoursePreferences({
      liked: likedCourses,
      disliked: newDislikedCourses,
      skipped: skippedCourses,
    });
  };

  const addSkippedCourse = (course: CourseSearch) => {
    if (skippedCourses.has(course.CODE)) return;
    const newSkippedCourses = new Map(skippedCourses.set(course.CODE, course));
    setSkippedCourses(newSkippedCourses);
    storageController.setCoursePreferences({
      liked: likedCourses,
      disliked: dislikedCourses,
      skipped: newSkippedCourses,
    });
  };

  const removeLikedCourse = (courseId: string) => {
    const toRemove = likedCourses.get(courseId);
    if (!toRemove) return;

    const newLikedCourses = new Map(likedCourses);
    newLikedCourses.delete(courseId);
    setLikedCourses(newLikedCourses);
    storageController.setCoursePreferences({
      liked: newLikedCourses,
      disliked: dislikedCourses,
      skipped: skippedCourses,
    });

    toast(`${courseId} removed from liked`, {
      description: "Course removed from liked courses",
      action: {
        label: "Undo",
        onClick: () => addLikedCourse(toRemove),
      }
    });
  };

  const removeDislikedCourse = (courseId: string) => {
    const toRemove = dislikedCourses.get(courseId);
    if (!toRemove) return;

    const newDislikedCourses = new Map(dislikedCourses);
    newDislikedCourses.delete(courseId);
    setDislikedCourses(newDislikedCourses);
    storageController.setCoursePreferences({
      liked: likedCourses,
      disliked: newDislikedCourses,
      skipped: skippedCourses,
    });

    toast(`${courseId} removed from disliked`, {
      description: "Course removed from disliked courses",
      action: {
        label: "Undo",
        onClick: () => addDislikedCourse(toRemove),
      }
    });
  };

  const removeSkippedCourse = (courseId: string) => {
    const toRemove = skippedCourses.get(courseId);
    if (!toRemove) return;

    const newSkippedCourses = new Map(skippedCourses);
    newSkippedCourses.delete(courseId);
    setSkippedCourses(newSkippedCourses);
    storageController.setCoursePreferences({
      liked: likedCourses,
      disliked: dislikedCourses,
      skipped: newSkippedCourses,
    });

    toast(`${courseId} removed from skipped`, {
      description: "Course removed from skipped courses",
      action: {
        label: "Undo",
        onClick: () => addSkippedCourse(toRemove),
      }
    });
  };

  return (
    <CourseContext.Provider
      value={{
        likedCourses,
        dislikedCourses,
        skippedCourses,
        addLikedCourse,
        addDislikedCourse,
        addSkippedCourse,
        removeLikedCourse,
        removeDislikedCourse,
        removeSkippedCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCoursePreferences() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error("useCoursePreferences must be used within a CourseProvider");
  }
  return context;
}
