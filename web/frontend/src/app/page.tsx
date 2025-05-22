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
import { Link, useNavigate } from "react-router";
import { useCoursePreferences } from "@/components/course-provider";
import { ThumbsUp, ThumbsDown, SquareArrowOutUpRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import BuyMeCoffee from "@/components/buy-me-coffee";
import { AnimatedSection } from "@/components/animated-section";


export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HomeInner />
    </Suspense>
  );
}

function HomeInner() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <main className="min-h-screen max-w-screen-lg mx-auto w-full py-4 pb-24 relative">
      {isMobile ? <HomeMobile /> : <HomeDesktop />}
      
      {/* Visualization Advertisement Section */}
      <AnimatedSection delay={0.3}>
        <Link to="/visualization" className="flex flex-col md:flex-row items-center gap-4 w-full group hover:bg-muted/50 transition-colors rounded-lg p-2">
          <img
            src="/tsne_reduction_plot.png"
            alt="Course Visualization Preview"
            loading="lazy"
            decoding="async"
            width="400"
            height="220"
            className="w-full max-w-xs md:max-w-sm rounded-lg border shadow-md group-hover:scale-105 transition-transform"
            style={{ background: '#fff' }}
          />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-semibold mb-2">Explore All Courses Visually</h2>
            <p className="text-muted-foreground mb-2 max-w-prose">
              Discover the relationships between courses across all faculties with our interactive visualization. Each point represents a course, colored by faculty and sized by student enrollment. Click to explore!
            </p>
            <span className="inline-block mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium shadow hover:bg-primary/90 transition-colors">Go to Visualization</span>
          </div>
        </Link>
      </AnimatedSection>

      {/* About Us Section */}
      <AnimatedSection delay={0.4}>
        <div className="text-center max-w-2xl" id="about-us">
          <h2 className="text-2xl font-bold mb-4">About This Project</h2>
          <p className="text-muted-foreground mb-6">
            This is a group project for the{" "}
            <a 
              href="https://is.muni.cz/predmet/fi/PV254" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline items-center gap-1 inline-flex"
            >
              Recommender Systems (PV254)
              <SquareArrowOutUpRight className="w-4 h-4 inline-block self-center mt-0.5" />
            </a>{" "}
            course at Masaryk University. 
            Our goal is to help students discover courses that match their interests and preferences 
            using modern recommendation techniques.
          </p>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Team Members</h3>
            <div className="grid grid-cols-2 gap-4 text-sm max-w-prose mx-auto relative">
              {[
                {
                  name: "Tomáš Žifčák",
                  url: "https://zifcak.dev"
                },
                {
                  name: "Peter Dražkovec",
                  url: "https://www.linkedin.com/in/peter-drazkovec/"
                },
                {
                  name: "Marek Ličko",
                  url: "https://www.linkedin.com/in/mareklicko/"
                },
                {
                  name: "Martin Dražkovec",
                  url: "https://www.linkedin.com/in/martin-drazkovec/"
                }
              ].map((member) => (
                <div key={member.url}>
                  <Button
                    variant="ghost"
                    asChild
                    className="w-full hover:bg-muted/50"
                  >
                    <a href={member.url} target="_blank" rel="noopener noreferrer">
                      {member.name}
                      <SquareArrowOutUpRight className="w-4 h-4 ml-1" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Support Section */}
      <AnimatedSection delay={0.5}>
        <div className="text-center max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Support Ongoing Maintenance</h2>
          <p className="text-muted-foreground mb-6">
            If you find this tool helpful and would like to support its ongoing maintenance and development,
            consider buying us a coffee! Your support helps keep this project running and improving.
          </p>
          <BuyMeCoffee />
        </div>
      </AnimatedSection>
    </main>
  );
}

function HomeMobile() {
  const navigate = useNavigate();
  const { likedCourses, dislikedCourses, addLikedCourse, addDislikedCourse, removeLikedCourse, removeDislikedCourse } = useCoursePreferences();

  const handleGetRecommendations = () => {
    navigate("/recommendations");
  };

  return (
    <div className="mx-auto px-4 py-4 pb-24 flex flex-col gap-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center mb-6"
      >
        <h1 className="text-2xl font-bold mb-3">
          MUNI Course Recommendation
        </h1>
        <p className="text-sm text-muted-foreground">
          Select courses you like and dislike to get personalized recommendations
        </p>
        <Link 
          to="/about" 
          className="text-sm text-primary hover:underline mt-2 inline-flex items-center"
        >
          Read more about us
          <ArrowRight className="w-4 h-4 ml-1 mt-0.5" />
        </Link>
      </motion.div>

      <div className="flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold">Liked Courses</h3>
              </div>
              <SelectedCourses
                courses={Array.from(likedCourses.values())}
                onRemove={removeLikedCourse}
                emptyMessage="No liked courses"
                title="Liked courses"
              />
              <CourseSearch
                onSelectCourse={addLikedCourse}
                placeholder="Search by name, code..." 
                inputStyle="shadow-green-500/10 border-green-500/20"
                excludeCourses={[
                  ...likedCourses.values(),
                  ...dislikedCourses.values(),
                ]}
              />
            </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ThumbsDown className="w-5 h-5 text-destructive" />
                <h3 className="text-lg font-semibold">Disliked Courses</h3>
              </div>
              <SelectedCourses
                courses={Array.from(dislikedCourses.values())}
                onRemove={removeDislikedCourse}
                emptyMessage="No disliked courses"
                title="Disliked courses"
              />
              <CourseSearch
                onSelectCourse={addDislikedCourse}
                placeholder="Search by name, code..." 
                inputStyle="shadow-destructive/10 border-destructive/20"
                excludeCourses={[
                  ...likedCourses.values(),
                  ...dislikedCourses.values(),
                ]}
              />
            </div>
      </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="fixed bottom-0 left-0 right-0 p-4 bg-background/30 backdrop-blur-sm border-t z-10"
      >
        <Button
          size="lg"
          onClick={handleGetRecommendations}
          disabled={likedCourses.size === 0}
          className="w-full group relative overflow-hidden py-4 text-lg font-semibold transition-all hover:scale-105 hover:cursor-pointer"
        >
          Get Recommendations
        </Button>
        {likedCourses.size === 0 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground text-center mt-2"
          >
            Select at least one course you like
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

function HomeDesktop() {
  const navigate = useNavigate();
  const { likedCourses, dislikedCourses, addLikedCourse, addDislikedCourse, removeLikedCourse, removeDislikedCourse } = useCoursePreferences();

  const handleGetRecommendations = () => {
    navigate("/recommendations");
  };

  return (
    <>
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
            <Card className="h-full border-2 border-green-500/10 hover:border-green-500/20 transition-colors duration-200">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-green-500" />
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
            className="group relative overflow-hidden px-8 py-6 text-lg font-semibold transition-all hover:scale-105 hover:cursor-pointer"
          >
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
    </>
  );
}
