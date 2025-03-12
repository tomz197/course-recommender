import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThumbsDown, Minus, ThumbsUp, ArrowLeft } from "lucide-react";
import { useRecommendCourses } from "@/hooks/use-recommend-courses";
import type { CoursePreferences } from "@/types";
import { useNavigate } from "react-router";

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const [likedCourses, setLikedCourses] = useState<string[]>([]);
  const [dislikedCourses, setDislikedCourses] = useState<string[]>([]);

  // Load saved courses from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("coursePreferences");
    if (!raw) return;

    const { liked, disliked } = JSON.parse(raw) as CoursePreferences;

    setLikedCourses(liked);
    setDislikedCourses(disliked);
  }, []);

  // Assuming this hook exists and returns a tanstack-query response
  const {
    data: recommendation,
    refetch,
    isLoading,
    isPending,
    isError,
    error,
  } = useRecommendCourses({
    liked: likedCourses,
    disliked: dislikedCourses,
  });

  const handleFeedback = async (feedback: "dislike" | "neutral" | "like") => {
    if (!recommendation) return;

    if (feedback === "dislike") {
      setDislikedCourses([...dislikedCourses, recommendation.CODE]);
    } else if (feedback === "like") {
      setLikedCourses([...likedCourses, recommendation.CODE]);
    }

    const preferences: CoursePreferences = {
      liked: likedCourses,
      disliked: dislikedCourses,
    };

    localStorage.setItem("coursePreferences", JSON.stringify(preferences));

    await refetch();
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <Button variant="ghost" onClick={() => navigate("/")} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Selection
      </Button>

      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
          Your Course Recommendations
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Based on your preferences, we think you might enjoy these courses.
          Give us feedback to improve your recommendations.
        </p>
      </div>

      {isError ? (
        <div >
          <p>Failed to load recommendations. Please try again later.</p>
          {error && (
            <p className="text-red-500 text-sm">{error.message}</p>
          )}
        </div>
      ) : null}
      <div className="flex justify-center mb-12">
        {isPending || !recommendation ? (
          <Card className="w-full max-w-2xl">
            <CardContent className="pt-6 flex justify-center">
              <div className="h-40 flex items-center justify-center">
                <p>Loading recommendations...</p>
              </div>
            </CardContent>
          </Card>
        ) : recommendation ? (
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div>
                  {recommendation.NAME}
                  <span className="block text-sm font-normal text-muted-foreground mt-1">
                    {recommendation.CODE} - {recommendation.FACULTY}
                  </span>
                </div>
              </CardTitle>
              <CardDescription>
                {recommendation.DESCRIPTION ||
                  "This course is recommended based on your preferences. No detailed description available."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-muted rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Course content preview</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                { !isLoading ? ( <>
              <Button
                variant="outline"
                onClick={() => handleFeedback("dislike")}
                className="flex-1 mr-2"
              >
                <ThumbsDown className="mr-2 h-4 w-4" />
                Dislike
              </Button>
              <Button
                variant="outline"
                onClick={() => handleFeedback("neutral")}
                className="flex-1 mx-2"
              >
                <Minus className="mr-2 h-4 w-4" />
                Neutral
              </Button>
              <Button
                onClick={() => handleFeedback("like")}
                className="flex-1 ml-2"
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                Like
              </Button>
            </>): null}
            </CardFooter>
          </Card>
        ) : (
          <Card className="w-full max-w-2xl">
            <CardContent className="pt-6">
              <div className="h-40 flex items-center justify-center">
                <p>
                  No recommendations available. Please go back and select more
                  courses.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/")} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Selection
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </main>
  );
}
