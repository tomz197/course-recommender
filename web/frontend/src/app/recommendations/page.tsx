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
import { ThumbsDown, ThumbsUp, ExternalLink, MessageSquare } from "lucide-react";
import { useRecommendCourses } from "@/hooks/use-recommend-courses";
import { storageController } from "@/storage";
import { CourseSearch, Course } from "@/types";
import { SelectedCourses } from "@/components/selected-courses";
import { logFeedback } from "@/lib/log-feedback";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserFeedback } from "@/components/user-feedback";

export default function RecommendationsPage() {
  const [likedCourses, setLikedCourses] = useState<Map<string, CourseSearch>>(
    new Map(),
  );
  const [dislikedCourses, setDislikedCourses] = useState<Map<string, CourseSearch>>(
    new Map(),
  );
  const [skippedCourses, setSkippedCourses] = useState<Map<string, CourseSearch>>(
    new Map(),
  );
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    const { liked, disliked, skipped } = storageController.getCoursePreferences();

    setLikedCourses(liked);
    setDislikedCourses(disliked);
    setSkippedCourses(skipped);
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
    skipped: skippedCourses,
  });

  const handleFeedback = async (feedback: "dislike" | "skip" | "like") => {
    if (!recommendation) return;

    void logFeedback({
      liked: likedCourses,
      disliked: dislikedCourses,
      skipped: skippedCourses,
    }, recommendation, feedback);

    if (storageController.getRecommendedCount() > 6) {
      setIsFeedbackOpen(true);
    }

    if (feedback === "dislike") {
      setDislikedCourses(
        new Map(dislikedCourses.set(recommendation.CODE, recommendation)),
      );
    } else if (feedback === "like") {
      setLikedCourses(
        new Map(likedCourses.set(recommendation.CODE, recommendation)),
      );
    } else if (feedback === "skip") {
      setSkippedCourses(
        new Map(skippedCourses.set(recommendation.CODE, recommendation)),
      );
    }


    storageController.setCoursePreferences({
      liked: likedCourses,
      disliked: dislikedCourses,
      skipped: skippedCourses,
    });
    await refetch();
  };

  const handleAddLikedCourse = (course: CourseSearch) => {
    if (likedCourses.has(course.CODE)) return;
    setLikedCourses(new Map(likedCourses.set(course.CODE, course)));
    void refetch();
  };

  const handleAddDislikedCourse = (course: CourseSearch) => {
    if (dislikedCourses.has(course.CODE)) return;
    setDislikedCourses(new Map(dislikedCourses.set(course.CODE, course)));
    void refetch();
  };

  const handleRemoveLikedCourse = (courseId: string) => {
    const toRemove = likedCourses.get(courseId);
    if (!toRemove) return;

    likedCourses.delete(courseId);
    setLikedCourses(new Map(likedCourses));
    void refetch();

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
    void refetch();

    toast(`${courseId} removed from disliked`, {
      description: "Course removed from disliked courses",
      action: {
        label: "Undo",
        onClick: () => handleAddDislikedCourse(toRemove),
      }
    }
    );
  };

  return (
    <main className="container mx-auto sm:px-4 sm:py-8 md:py-12 gap-0 sm:gap-8 my-auto">
      <div className="flex flex-col justify-center max-w-2xl mx-auto gap-2 p-2">
        <SelectedCourses
          courses={Array.from(likedCourses.values()).reverse()}
          onRemove={handleRemoveLikedCourse}
          emptyMessage="No liked courses selected yet"
          wrap={false}
          title="Liked courses"
        />
        <SelectedCourses
          courses={Array.from(dislikedCourses.values()).reverse()}
          onRemove={handleRemoveDislikedCourse}
          emptyMessage="No disliked courses selected yet"
          wrap={false}
          title="Disiked courses"
        />
      </div>

      <div className="flex justify-center">
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
      <UserFeedback
        isOpen={isFeedbackOpen}
        onOpenChange={setIsFeedbackOpen}
      />
      <div className="flex justify-center my-8">
        <Button 
          variant="outline" 
          onClick={() => setIsFeedbackOpen(true)}
          className="flex items-center gap-2"
        >
          Give Feedback
          <MessageSquare className="h-4 w-4" />
        </Button>
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
  handleFeedback: handleFeedbackProp,
  isLoading,
  recommendation,
}: {
  handleFeedback: (x: "like" | "dislike" | "skip") => void;
  isLoading: boolean;
  recommendation: Course;
}) {
  const [showSlowFeedback, setShowSlowFeedback] = useState(false);
  const [showVerySlowFeedback, setShowVerySlowFeedback] = useState(false);

  const handleFeedback = (feedback: "like" | "dislike" | "skip") => {
    handleFeedbackProp(feedback);

    setShowSlowFeedback(false);
    setShowVerySlowFeedback(false);
    setTimeout(() => {
      setShowSlowFeedback(true);
    }, 3000);
    setTimeout(() => {
      setShowVerySlowFeedback(true);
    }, 8000);
  };

  const getFacultyColor = (faculty: string) => ({
    'FI': '#f2d45c',
    'FF': '#4bc8ff',
    'FSS': '#008c78',
    'ESF': '#b9006e',
    'PrF': '#9100dc',
    'LF': '#f01928',
    'PdF': '#ff7300',
    'FaF': '#56788d',
    'FSpS': '#5ac8af',
    'CST': '#0031e7',
    'PřF': '#00af3f'
  })[faculty] || '#000000';

  return (
    <div className="flex flex-col gap-2">
    {showSlowFeedback && !showVerySlowFeedback && isLoading && (
      <Alert variant="default">
        <AlertTitle>Slow response</AlertTitle>
        <AlertDescription>
          The response is taking longer than expected. Please be patient.
        </AlertDescription>
      </Alert>
    )}
    {showVerySlowFeedback && isLoading && (
      <Alert variant="default">
        <AlertTitle>Almost there!</AlertTitle>
        <AlertDescription>
          Sometimes it takes a while for the first response. Other will be much faster!!!
        </AlertDescription>
      </Alert>
    )}
    
    <Card className="w-full max-w-2xl rounded-none sm:rounded-lg">
      <CardHeader className={`space-y-4 ${isLoading ? "animate-pulse opacity-50" : ""}`}>
        <CardTitle className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-white px-2 py-1 rounded text-nowrap" style={{ backgroundColor: getFacultyColor(recommendation.FACULTY) }}>
                {recommendation.CODE}
                {" "}
                {recommendation.FACULTY}
              </span>
              <div className="flex items-center gap-2 mb-0.5 text-sm text-muted-foreground flex-wrap">
                <span>{recommendation.SEMESTER}</span>
                <span>•</span>
                <span>{recommendation.LANGUAGE}</span>
                {recommendation.CREDITS && (
                  <>
                    <span>•</span>
                    <span>{recommendation.CREDITS} credits</span>
                  </>
                )}
                <span>•</span>
                <span>{recommendation.COMPLETION}</span>
              </div>
            </div>
            <h2 className="text-xl font-semibold mt-2">{recommendation.NAME}</h2>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className={`space-y-4 ${isLoading ? "animate-pulse opacity-50" : ""}`}>
        {/* Description */}
        <div>
          <h3 className="font-medium mb-1">Description</h3>
          <p className="font-light">
            {recommendation.DESCRIPTION ||
              "This course is recommended based on your preferences. No detailed description available."}
          </p>
        </div>

        {/* Keywords */}
        {recommendation.KEYWORDS && recommendation.KEYWORDS.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Keywords</h3>
            <div className="overflow-x-auto pb-1">
              <div className="flex gap-2 min-w-max">
                {recommendation.KEYWORDS.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-sm whitespace-nowrap"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* External Link */}
        <a
          href={`https://is.muni.cz/predmet/${
            recommendation.FACULTY === "P\u0159F" ? "sci" : recommendation.FACULTY
          }/${recommendation.CODE}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center hover:underline text-sm text-blue-500 hover:text-blue-600"
        >
          View in IS MU <ExternalLink className="h-4 w-4 ml-1" />
        </a>
      </CardContent>
      <CardFooter className="flex justify-between">
        {!isLoading ? (
          <div className="grid grid-cols-3 gap-2 flex-1">
            <Button
              variant="outline"
              onClick={() => handleFeedback("dislike")}
              className="flex-1"
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              Dislike
            </Button>
            <Button
              onClick={() => handleFeedback("skip")}
              className="flex-1 ml-2"
              variant="outline"
            >
              Skip
            </Button>
            <Button
              onClick={() => handleFeedback("like")}
              className="flex-1"
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Like
            </Button>
          </div>
        ) : (
          <Button variant="outline" className="w-full">
            Loading...
          </Button>
        )}
      </CardFooter>
    </Card>
    </div>
  );
}
