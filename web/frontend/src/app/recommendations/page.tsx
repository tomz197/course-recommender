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
import { ThumbsDown, ThumbsUp, ArrowLeft, ExternalLink } from "lucide-react";
import { useRecommendCourses } from "@/hooks/use-recommend-courses";
import { useNavigate } from "react-router";
import { storageController } from "@/storage";
import { CourseSearch, Course, fullFacultyName } from "@/types";
import { SelectedCourses } from "@/components/selected-courses";

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const [likedCourses, setLikedCourses] = useState<Map<string, CourseSearch>>(
    new Map(),
  );
  const [dislikedCourses, setDislikedCourses] = useState<
    Map<string, CourseSearch>
  >(new Map());

  useEffect(() => {
    const { liked, disliked } = storageController.getCoursePreferences();

    setLikedCourses(liked);
    setDislikedCourses(disliked);
  }, []);

  const {
    data: recommendation,
    refetch,
    isLoading,
    isFetching,
    isError,
    error,
  } = useRecommendCourses({
    liked: likedCourses,
    disliked: dislikedCourses,
  });

  const handleFeedback = async (feedback: "dislike" | "neutral" | "like") => {
    if (!recommendation) return;

    if (feedback === "dislike") {
      setDislikedCourses(
        new Map(dislikedCourses.set(recommendation.CODE, recommendation)),
      );
    } else if (feedback === "like") {
      setLikedCourses(
        new Map(likedCourses.set(recommendation.CODE, recommendation)),
      );
    }

    storageController.setCoursePreferences({
      liked: likedCourses,
      disliked: dislikedCourses,
    });
    await refetch();
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 gap-8">
      <Button variant="ghost" onClick={() => navigate("/")} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Selection
      </Button>

      <div className="flex flex-col items-center text-center mb-14">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
          Your Course Recommendations
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Based on your preferences, we think you might enjoy these courses.
          Give us feedback to improve your recommendations.
        </p>
      </div>

      <div className="flex flex-col justify-center max-w-2xl mx-auto">
        <p className="text-muted-foreground text-sm">Liked: </p>
        <div className="overflow-x-scroll max-h-">
          <SelectedCourses
            courses={Array.from(likedCourses.values())}
            onRemove={(courseId: string) => {
              likedCourses.delete(courseId);
              setLikedCourses(new Map(likedCourses));
              void refetch();
            }}
            emptyMessage="No liked courses selected yet"
            wrap={false}
          />
        </div>
      </div>

      <div className="flex flex-col justify-center max-w-2xl mx-auto">
        <p className="text-muted-foreground text-sm">Disliked: </p>
        <div className="overflow-x-scroll">
          <SelectedCourses
            courses={Array.from(dislikedCourses.values())}
            onRemove={(courseId: string) => {
              dislikedCourses.delete(courseId);
              setDislikedCourses(new Map(dislikedCourses));
              void refetch();
            }}
            emptyMessage="No disliked courses selected yet"
          />
        </div>
      </div>

      <div className="flex justify-center mt-8">
        {isError ? <ErrorCard error={error} /> : null}

        {recommendation ? (
          <CourseCard
            handleFeedback={handleFeedback}
            isLoading={isLoading || isFetching}
            recommendation={recommendation}
          />
        ) : null}

        {!recommendation && isLoading && !isError ? (
          <CourseCardSkeleton />
        ) : null}
      </div>
    </main>
  );
}

function CourseCardSkeleton() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <div>
            <div className="h-6 bg-muted rounded-md w-1/2 mb-2"></div>
            <div className="h-4 bg-muted rounded-md w-1/4"></div>
          </div>
        </CardTitle>
        <CardDescription>
          <div className="h-4 bg-muted rounded-md w-3/4"></div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-40 bg-muted rounded-md flex items-center justify-center">
          <p className="text-muted-foreground">Course content preview</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" className="w-full">
          Loading...
        </Button>
      </CardFooter>
    </Card>
  );
}

function ErrorCard({ error }: { error: Error }) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Error</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>
          Failed to load recommendations. Please try again later.
        </CardDescription>
        <CardDescription className="text-red-500 text-sm">
          {error.message}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

function CourseCard({
  handleFeedback,
  isLoading,
  recommendation,
}: {
  handleFeedback: (x: "like" | "dislike" | "neutral") => void;
  isLoading: boolean;
  recommendation: Course;
}) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <div>
            {recommendation.CODE} {recommendation.NAME}
            <span className="block text-sm font-normal text-muted-foreground mt-1">
              {fullFacultyName(recommendation.FACULTY)}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p>
          {recommendation.DESCRIPTION ||
            "This course is recommended based on your preferences. No detailed description available."}
        </p>
        <a
          href={`https://is.muni.cz/predmet/${recommendation.FACULTY}/${recommendation.CODE}`}
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 hover:text-blue-700 hover:underline text-sm flex items-center"
        >
          Open in IS MU <ExternalLink className="h-4 w-4 ml-1 " />
        </a>
      </CardContent>
      <CardFooter className="flex justify-between">
        {!isLoading ? (
          <>
            <Button
              variant="outline"
              onClick={() => handleFeedback("dislike")}
              className="flex-1 mr-2"
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              Dislike
            </Button>
            {/*
            <Button
              variant="outline"
              onClick={() => handleFeedback("neutral")}
              className="flex-1 mx-2"
            >
              <Minus className="mr-2 h-4 w-4" />
              Neutral
            </Button>
                */}
            <Button
              onClick={() => handleFeedback("like")}
              className="flex-1 ml-2"
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Like
            </Button>
          </>
        ) : (
          <Button variant="outline" className="w-full">
            Loading...
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
