import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "@/app/page";
import RecommendationsPage from "@/app/recommendations/page";
import { QueryProvider } from "@/lib/query-provider";
import RootLayout from "@/app/layout";
import "./index.css";

const root = document.getElementById("root")!;

const router = createBrowserRouter(
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
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  </StrictMode>,
);
