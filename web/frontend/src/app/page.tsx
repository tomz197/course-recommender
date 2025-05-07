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
import { useNavigate } from "react-router";
import { useCoursePreferences } from "@/components/course-provider";
import { Heart, ThumbsDown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();
  const { likedCourses, dislikedCourses, addLikedCourse, addDislikedCourse, removeLikedCourse, removeDislikedCourse } = useCoursePreferences();

  const handleGetRecommendations = () => {
    navigate("/recommendations");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-1 sm:px-4 py-4 sm:p-8 md:py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            MUNI Course Recommendation
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Help us understand your preferences by selecting courses you like and
            dislike, and we'll recommend courses tailored to your interests.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full border-2 border-primary/10 hover:border-primary/20 transition-colors duration-200">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  <CardTitle>Courses You Like</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Select courses that interest you or that you've enjoyed in the
                  past
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex flex-col justify-between flex-1">
                <SelectedCourses
                  courses={Array.from(likedCourses.values())}
                  onRemove={removeLikedCourse}
                  emptyMessage="No liked courses selected yet"
                  title="Liked courses"
                />
                <CourseSearch
                  onSelectCourse={addLikedCourse}
                  placeholder="Search by course name, code, or faculty..."
                  excludeCourses={[
                    ...likedCourses.values(),
                    ...dislikedCourses.values(),
                  ]}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="h-full border-2 border-destructive/10 hover:border-destructive/20 transition-colors duration-200">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2">
                  <ThumbsDown className="w-5 h-5 text-destructive" />
                  <CardTitle>Courses You Dislike</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Select courses that don't interest you or that you didn't enjoy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex flex-col justify-between flex-1">
                <SelectedCourses
                  courses={Array.from(dislikedCourses.values())}
                  onRemove={removeDislikedCourse}
                  emptyMessage="No disliked courses selected yet"
                  title="Disliked courses"
                />
                <CourseSearch
                  onSelectCourse={addDislikedCourse}
                  placeholder="Search by course name, code, or faculty..."
                  excludeCourses={[
                    ...likedCourses.values(),
                    ...dislikedCourses.values(),
                  ]}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col justify-center sm:items-center"
        >
          <Button
            size="lg"
            onClick={handleGetRecommendations}
            disabled={likedCourses.size === 0}
            className="group relative overflow-hidden px-8 py-6 text-lg font-semibold transition-all hover:scale-105"
          >
            <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
            Get Course Recommendations
          </Button>
          {likedCourses.size === 0 && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground mt-3"
            >
              Select at least one course you like to get recommendations
            </motion.p>
          )}
        </motion.div>
      </div>
    </main>
  );
}
