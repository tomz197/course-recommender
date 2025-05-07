import { Component, ErrorInfo, ReactNode, useState } from "react";
import { useNavigate, useLocation, useRouteError, isRouteErrorResponse } from "react-router";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <RouterErrorBoundary />;
    }

    return this.props.children;
  }
}

export function RouterErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hasErrorParam = searchParams.get("error");
  const [showDetails, setShowDetails] = useState(false);

  // If we already have an error parameter, don't reload
  if (!hasErrorParam) {
    // Add error parameter and reload
    searchParams.set("error", "true");
    navigate(`${location.pathname}?${searchParams.toString()}`);
    return null;
  }

  let errorMessage = "An unexpected error occurred";
  let errorDetails = null;

  if (isRouteErrorResponse(error)) {
    errorMessage = `${error.status} ${error.statusText}`;
    errorDetails = error.data;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.stack;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 rounded-lg border p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
        <div className="space-y-2">
          <p className="text-gray-600">{errorMessage}</p>
          {errorDetails && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide Developer Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show Developer Details
                  </>
                )}
              </Button>
              {showDetails && (
                <pre className="mt-4 overflow-auto rounded bg-gray-100 p-4 text-sm">
                  {errorDetails}
                </pre>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => {
              searchParams.delete("error");
              navigate(`${location.pathname}?${searchParams.toString()}`);
            }}
          >
            Try Again
          </Button>
          <Button
            onClick={() => {
              searchParams.delete("error");
              navigate("/");
            }}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
} 