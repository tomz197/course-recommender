import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  text?: string;
}

export function LoadingSpinner({ text = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
} 