import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CourseSearch } from "@/components/course-search";
import { SelectedCourses } from "@/components/selected-courses";
import type {
  CoursePreferences,
  CourseSearch as CourseSearchType,
} from "@/types";
import { useNavigate } from "react-router";
import { storageController } from "@/storage";
import { toast } from "sonner";

export default function Home() {
  const navigate = useNavigate();
  const [likedCourses, setLikedCourses] = useState<CoursePreferences["liked"]>(
    new Map(),
  );
  const [dislikedCourses, setDislikedCourses] = useState<
    CoursePreferences["disliked"]
  >(new Map());

  useEffect(() => {
    const { liked, disliked } = storageController.getCoursePreferences();

    setLikedCourses(liked);
    setDislikedCourses(disliked);
  }, []);

  const handleAddLikedCourse = (course: CourseSearchType) => {
    if (likedCourses.has(course.CODE)) return;
    setLikedCourses(new Map(likedCourses.set(course.CODE, course)));
  };

  const handleAddDislikedCourse = (course: CourseSearchType) => {
    if (dislikedCourses.has(course.CODE)) return;
    setDislikedCourses(new Map(dislikedCourses.set(course.CODE, course)));
  };

  const handleRemoveLikedCourse = (courseId: string) => {
    const toRemove = likedCourses.get(courseId);
    if (!toRemove) return;

    likedCourses.delete(courseId);
    setLikedCourses(new Map(likedCourses));

    toast(`${courseId} removed from liked`, {
      description: "Course removed from liked courses",
      action: {
        label: "Undo",
        onClick: () => handleAddLikedCourse(toRemove),
      }
    }
    );
  };

  const handleRemoveDislikedCourse = (courseId: string) => {
    const toRemove = dislikedCourses.get(courseId);
    if (!toRemove) return;

    dislikedCourses.delete(courseId);
    setDislikedCourses(new Map(dislikedCourses));

    toast(`${courseId} removed from disliked`, {
      description: "Course removed from disliked courses",
      action: {
        label: "Undo",
        onClick: () => handleAddDislikedCourse(toRemove),
      }
    }
    );
  };

  const handleGetRecommendations = () => {
    storageController.setCoursePreferences({
      liked: likedCourses,
      disliked: dislikedCourses,
    });
    navigate("/recommendations");
  };

  return (
    <main className="container mx-auto px-1 sm:px-4 py-4 sm:p-8 md:py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
          MUNI Course Recommendation
        </h1>
        <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl">
          Help us understand your preferences by selecting courses you like and
          dislike, and we'll recommend courses tailored to your interests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Courses You Like</CardTitle>
            <CardDescription>
              Select courses that interest you or that you've enjoyed in the
              past
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col justify-between flex-1">
            <SelectedCourses
              courses={Array.from(likedCourses.values())}
              onRemove={handleRemoveLikedCourse}
              emptyMessage="No liked courses selected yet"
              title="Liked courses"
            />
            <CourseSearch
              onSelectCourse={handleAddLikedCourse}
              placeholder="Search for courses you like..."
              excludeCourses={[
                ...likedCourses.values(),
                ...dislikedCourses.values(),
              ]}
            />
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Courses You Dislike</CardTitle>
            <CardDescription>
              Select courses that don't interest you or that you didn't enjoy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col justify-between flex-1">
            <SelectedCourses
              courses={Array.from(dislikedCourses.values())}
              onRemove={handleRemoveDislikedCourse}
              emptyMessage="No disliked courses selected yet"
              title="Disliked courses"
            />
            <CourseSearch
              onSelectCourse={handleAddDislikedCourse}
              placeholder="Search for courses you dislike..."
              excludeCourses={[
                ...likedCourses.values(),
                ...dislikedCourses.values(),
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col justify-center sm:items-center">
        <Button
          size="lg"
          onClick={handleGetRecommendations}
          disabled={likedCourses.size === 0}
        >
          Get Course Recommendations
        </Button>
        {likedCourses.size === 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            Select at least one course you like to get recommendations
          </p>
        )}
      </div>
    </main>
  );
}
