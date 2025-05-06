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

// Lazy load pages
const Home = lazy(() => import("@/app/page"));
const RecommendationsPage = lazy(() => import("@/app/recommendations/page"));
const VisualizationPage = lazy(() => import("@/app/visualization/page"));

const root = document.getElementById("root")!;

void setPredictionModel();

const router = createHashRouter(
  [
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { 
          path: "", 
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <Home />
            </Suspense>
          ) 
        },
        { 
          path: "recommendations", 
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <RecommendationsPage />
            </Suspense>
          ) 
        },
        { 
          path: "visualization", 
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <VisualizationPage />
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
