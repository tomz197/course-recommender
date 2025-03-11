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
import type { Course } from "@/types";
import { useNavigate } from "react-router";

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const [likedCourses, setLikedCourses] = useState<Course[]>([]);
  const [dislikedCourses, setDislikedCourses] = useState<Course[]>([]);
  const [currentRecommendation, setCurrentRecommendation] =
    useState<Course | null>(null);

  // Load saved courses from localStorage
  useEffect(() => {
    const savedLikedCourses = localStorage.getItem("likedCourses");
    const savedDislikedCourses = localStorage.getItem("dislikedCourses");

    if (savedLikedCourses) {
      setLikedCourses(JSON.parse(savedLikedCourses));
    }

    if (savedDislikedCourses) {
      setDislikedCourses(JSON.parse(savedDislikedCourses));
    }
  }, []);

  // Assuming this hook exists and returns a tanstack-query response
  const {
    data: recommendations = [],
    refetch,
    isLoading,
  } = useRecommendCourses({
    likedCourses,
    dislikedCourses,
  });

  // Set initial recommendation when data is loaded
  useEffect(() => {
    if (recommendations.length > 0 && !currentRecommendation) {
      setCurrentRecommendation(recommendations[0]);
    }
  }, [recommendations, currentRecommendation]);

  const handleFeedback = async (feedback: "dislike" | "neutral" | "like") => {
    // In a real app, you would send this feedback to your backend
    console.log(`User ${feedback}d course:`, currentRecommendation);

    // Get next recommendation
    await refetch();

    // For demo purposes, just pick a random course from recommendations
    if (recommendations.length > 1) {
      const filteredRecs = recommendations.filter(
        (rec) => rec.id !== currentRecommendation?.id,
      );
      const randomIndex = Math.floor(Math.random() * filteredRecs.length);
      setCurrentRecommendation(filteredRecs[randomIndex]);
    }
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

      <div className="flex justify-center mb-12">
        {isLoading ? (
          <Card className="w-full max-w-2xl">
            <CardContent className="pt-6 flex justify-center">
              <div className="h-40 flex items-center justify-center">
                <p>Loading recommendations...</p>
              </div>
            </CardContent>
          </Card>
        ) : currentRecommendation ? (
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div>
                  {currentRecommendation.name}
                  <span className="block text-sm font-normal text-muted-foreground mt-1">
                    {currentRecommendation.code} -{" "}
                    {currentRecommendation.department}
                  </span>
                </div>
              </CardTitle>
              <CardDescription>
                {currentRecommendation.description ||
                  "This course is recommended based on your preferences. No detailed description available."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-muted rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Course content preview</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
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
