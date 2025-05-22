import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThumbsDown, ThumbsUp, MessageSquare } from "lucide-react";
import { useRecommendCourses } from "@/hooks/use-recommend-courses";
import { storageController } from "@/storage";
import { Course } from "@/types";
import { CourseBadge } from "@/components/selected-courses";
import { logFeedback } from "@/lib/log-feedback";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserFeedback } from "@/components/user-feedback";
import { useCoursePreferences } from "@/components/course-provider";
import { CourseIsLink } from "@/components/course-is-link";
import { CourseDialogModal } from "@/components/course-list-modal";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "@/components/loading-spinner";
import BuyMeCoffee from "@/components/buy-me-coffee";

export default function RecommendationsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RecommendationsPageInner />
    </Suspense>
  );
}

function RecommendationsPageInner() {
  const { likedCourses, dislikedCourses, skippedCourses, addLikedCourse, addDislikedCourse, addSkippedCourse, removeLikedCourse, removeDislikedCourse, removeSkippedCourse } = useCoursePreferences();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

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

    if (storageController.getRecommendedCount() == 8) {
      setIsFeedbackOpen(true);
    }

    switch (feedback) {
      case "dislike":
        storageController.incrementRelevance();
        addDislikedCourse(recommendation);
        break;
      case "like":
        storageController.decrementRelevance();
        addLikedCourse(recommendation);
        break;
      case "skip":
        addSkippedCourse(recommendation);
        break;
    }

    await refetch();
  };

  const handleRemoveLikedCourse = (courseId: string) => {
    removeLikedCourse(courseId);
    void refetch();
  };

  const handleRemoveDislikedCourse = (courseId: string) => {
    removeDislikedCourse(courseId);
    void refetch();
  };

  const handleRemoveSkippedCourse = (courseId: string) => {
    removeSkippedCourse(courseId);
    void refetch();
  };

  return (
    <main className="container mx-auto sm:px-4 sm:py-8 md:py-12 gap-0 sm:gap-8 my-auto overflow-x-hidden">
      <div className="grid grid-cols-3 max-w-2xl mx-auto gap-2 py-2">
        <CourseDialogModal
          courses={Array.from(likedCourses.values()).reverse()}
          onRemove={handleRemoveLikedCourse}
          title={`Liked courses (${likedCourses.size})`}
          triggerText={`Liked (${likedCourses.size})`}
        />
        <CourseDialogModal
          courses={Array.from(dislikedCourses.values()).reverse()}
          onRemove={handleRemoveDislikedCourse}
          title={`Disliked courses (${dislikedCourses.size})`}
          triggerText={`Disliked (${dislikedCourses.size})`}
        />
        <CourseDialogModal
          courses={Array.from(skippedCourses.values()).reverse()}
          onRemove={handleRemoveSkippedCourse}
          title={`Skipped courses (${skippedCourses.size})`}
          triggerText={`Skipped (${skippedCourses.size})`}
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
      {recommendation?.RECOMMENDED_FROM && recommendation.RECOMMENDED_FROM.length > 0 && (
        <div className="flex flex-row items-center max-w-2xl mx-auto p-2">
          <p className="text-sm text-muted-foreground">
            Because you liked:
          </p>
            <span className="ml-1 flex flex-wrap gap-2">
              {recommendation.RECOMMENDED_FROM.map((course) => {
                const found = likedCourses.get(course) || dislikedCourses.get(course) || skippedCourses.get(course);
                if (!found) return null;
                return <CourseBadge key={found.CODE} course={found} showCode={false} showName={true} />;
              })}
            </span>
        </div>
      )}

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

      <div className="flex justify-center my-8">
        <BuyMeCoffee size="default" />
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
  const [slowFeedbackTimeout, setSlowFeedbackTimeout] = useState<number | null>(null);
  const [verySlowFeedbackTimeout, setVerySlowFeedbackTimeout] = useState<number | null>(null);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | "up" | null>(null);

  const handleFeedback = (feedback: "like" | "dislike" | "skip") => {
    // Set exit direction based on feedback type
    switch (feedback) {
      case "like":
        setExitDirection("right");
        break;
      case "dislike":
        setExitDirection("left");
        break;
      case "skip":
        setExitDirection("up");
        break;
    }

    handleFeedbackProp(feedback);

    if (slowFeedbackTimeout) {
      clearTimeout(slowFeedbackTimeout);
      setSlowFeedbackTimeout(null);
    }
    
    if (verySlowFeedbackTimeout) {
      clearTimeout(verySlowFeedbackTimeout);
      setVerySlowFeedbackTimeout(null);
    }

    setShowSlowFeedback(false);
    setShowVerySlowFeedback(false);
    
    const slowTimeout = setTimeout(() => {
      setShowSlowFeedback(true);
    }, 3000);
    
    const verySlowTimeout = setTimeout(() => {
      setShowVerySlowFeedback(true);
    }, 8000);
    
    setSlowFeedbackTimeout(slowTimeout as unknown as number);
    setVerySlowFeedbackTimeout(verySlowTimeout as unknown as number);
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

  const cardVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: (direction: "left" | "right" | "up" | null) => {
      switch (direction) {
        case "left":
          return { x: -50, opacity: 0 };
        case "right":
          return { x: 50, opacity: 0 };
        case "up":
          return { y: -50, opacity: 0 };
        default:
          return { opacity: 0 };
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence mode="wait">
        {showSlowFeedback && !showVerySlowFeedback && isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert variant="default">
              <AlertTitle>Slow response</AlertTitle>
              <AlertDescription>
                The response is taking longer than expected. Please be patient.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        {showVerySlowFeedback && isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert variant="default">
              <AlertTitle>Almost there!</AlertTitle>
              <AlertDescription>
                Sometimes it takes a while for the first response. Other will be much faster!!!
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={recommendation.CODE}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          custom={exitDirection}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
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
                      <span>{recommendation.SEMESTER.split(" ")[0]}</span>
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
              <CourseIsLink course={recommendation} />
            </CardContent>
            <CardFooter className="flex justify-between">
              {!isLoading ? (
                <div className="grid grid-cols-3 gap-2 flex-1">
                  <Button
                    onClick={() => handleFeedback("dislike")}
                    className="flex-1 bg-muted hover:bg-red-100 transition-colors duration-150"
                    variant="outline"
                    asChild
                  >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <div className="flex items-center justify-center">
                        <ThumbsDown className="mr-2 h-4 w-4" />
                        Dislike
                      </div>
                    </motion.div>
                  </Button>
                  <Button
                    onClick={() => handleFeedback("skip")}
                    className="flex-1 hover:bg-gray-50 transition-colors duration-150"
                    variant="outline"
                    asChild
                  >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <div className="flex items-center justify-center">
                        Skip
                      </div>
                    </motion.div>
                  </Button>
                  <Button
                    onClick={() => handleFeedback("like")}
                    className="flex-1 bg-muted hover:bg-green-100 transition-colors duration-150"
                    variant="outline"
                    asChild
                  >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <div className="flex items-center justify-center">
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Like
                      </div>
                    </motion.div>
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full">
                  Loading...
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
