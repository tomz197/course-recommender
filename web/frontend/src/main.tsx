import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router";
import Home from "@/app/page";
import RecommendationsPage from "@/app/recommendations/page";
import { QueryProvider } from "@/lib/query-provider";
import RootLayout from "@/app/layout";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider"
import "./index.css";
import { setPredictionModel } from "@/lib/set-prediction-model";

const root = document.getElementById("root")!;

void setPredictionModel();

const router = createHashRouter(
  [
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { path: "", element: <Home /> },
        { path: "recommendations", element: <RecommendationsPage /> },
      ],
    },
  ],
  { basename: "/" },
);

ReactDOM.createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <QueryProvider>
        <RouterProvider router={router} />
        <Toaster />
      </QueryProvider>
    </ThemeProvider>
  </StrictMode>,
);
