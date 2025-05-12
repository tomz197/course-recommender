import { StrictMode, lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router";
import { QueryProvider } from "@/lib/query-provider";
import RootLayout from "@/app/layout";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider"
import "./index.css";
import { setPredictionModel } from "@/lib/set-prediction-model";
import { CourseProvider } from "@/components/course-provider";
import { RouterErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";

// Lazy load pages
const Home = lazy(() => import("@/app/page"));
const RecommendationsPage = lazy(() => import("@/app/recommendations/page"));
const VisualizationPage = lazy(() => import("@/app/visualization/page"));
const AboutPage = lazy(() => import("@/app/about/page"));

const root = document.getElementById("root")!;

void setPredictionModel();

const router = createHashRouter(
  [
    {
      path: "/",
      element: <RootLayout />,
      errorElement: <RouterErrorBoundary />,
      children: [
        { 
          path: "", 
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <Home />
            </Suspense>
          ) 
        },
        { 
          path: "recommendations", 
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <RecommendationsPage />
            </Suspense>
          ) 
        },
        { 
          path: "visualization", 
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <VisualizationPage />
            </Suspense>
          ) 
        },
        { 
          path: "about", 
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <AboutPage />
            </Suspense>
          ) 
        },
      ],
    },
  ],
  { basename: "/" },
);

ReactDOM.createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <QueryProvider>
        <CourseProvider>
          <RouterProvider router={router} />
          <Toaster />
        </CourseProvider>
      </QueryProvider>
    </ThemeProvider>
  </StrictMode>,
);
