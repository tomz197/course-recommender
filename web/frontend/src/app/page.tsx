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

export default function Home() {
  const navigate = useNavigate();
  const [likedCourses, setLikedCourses] = useState<CourseSearchType[]>([]);
  const [dislikedCourses, setDislikedCourses] = useState<CourseSearchType[]>(
    [],
  );

  useEffect(() => {
    const raw = localStorage.getItem("coursePreferences");
    if (!raw) return;

    const { liked, disliked } = JSON.parse(raw) as CoursePreferences;

    setLikedCourses(
      liked.map((code) => ({
        CODE: code,
        NAME: "Course Name",
        FACULTY: "Faculty",
      })),
    );
    setDislikedCourses(
      disliked.map((code) => ({
        CODE: code,
        NAME: "Course Name",
        FACULTY: "Faculty",
      })),
    );
  }, []);

  const handleAddLikedCourse = (course: CourseSearchType) => {
    if (!likedCourses.some((c) => c.CODE === course.CODE)) {
      setLikedCourses([...likedCourses, course]);
    }
  };

  const handleAddDislikedCourse = (course: CourseSearchType) => {
    if (!dislikedCourses.some((c) => c.CODE === course.CODE)) {
      setDislikedCourses([...dislikedCourses, course]);
    }
  };

  const handleRemoveLikedCourse = (courseId: string) => {
    setLikedCourses(likedCourses.filter((course) => course.CODE !== courseId));
  };

  const handleRemoveDislikedCourse = (courseId: string) => {
    setDislikedCourses(
      dislikedCourses.filter((course) => course.CODE !== courseId),
    );
  };

  const handleGetRecommendations = () => {
    const preferences: CoursePreferences = {
      liked: likedCourses.map((course) => course.CODE),
      disliked: dislikedCourses.map((course) => course.CODE),
    };

    localStorage.setItem("coursePreferences", JSON.stringify(preferences));
    navigate("/recommendations");
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
          MUNI Course Recommendation
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
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
          <CardContent className="space-y-4">
            <SelectedCourses
              courses={likedCourses}
              onRemove={handleRemoveLikedCourse}
              emptyMessage="No liked courses selected yet"
            />
            <CourseSearch
              onSelectCourse={handleAddLikedCourse}
              placeholder="Search for courses you like..."
              excludeCourses={[...likedCourses, ...dislikedCourses]}
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
          <CardContent className="space-y-4">
            <SelectedCourses
              courses={dislikedCourses}
              onRemove={handleRemoveDislikedCourse}
              emptyMessage="No disliked courses selected yet"
            />
            <CourseSearch
              onSelectCourse={handleAddDislikedCourse}
              placeholder="Search for courses you dislike..."
              excludeCourses={[...likedCourses, ...dislikedCourses]}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleGetRecommendations}
          disabled={likedCourses.length === 0}
        >
          Get Course Recommendations
        </Button>
      </div>
    </main>
  );
}
