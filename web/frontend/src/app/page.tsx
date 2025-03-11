import { useState } from "react";
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
import type { Course } from "@/types";
import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();
  const [likedCourses, setLikedCourses] = useState<Course[]>([]);
  const [dislikedCourses, setDislikedCourses] = useState<Course[]>([]);

  const handleAddLikedCourse = (course: Course) => {
    if (!likedCourses.some((c) => c.id === course.id)) {
      setLikedCourses([...likedCourses, course]);
    }
  };

  const handleAddDislikedCourse = (course: Course) => {
    if (!dislikedCourses.some((c) => c.id === course.id)) {
      setDislikedCourses([...dislikedCourses, course]);
    }
  };

  const handleRemoveLikedCourse = (courseId: string) => {
    setLikedCourses(likedCourses.filter((course) => course.id !== courseId));
  };

  const handleRemoveDislikedCourse = (courseId: string) => {
    setDislikedCourses(
      dislikedCourses.filter((course) => course.id !== courseId),
    );
  };

  const handleGetRecommendations = () => {
    // Store selected courses in localStorage or state management
    localStorage.setItem("likedCourses", JSON.stringify(likedCourses));
    localStorage.setItem("dislikedCourses", JSON.stringify(dislikedCourses));
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
