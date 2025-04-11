"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Star } from "lucide-react";
import api from "@/lib/utils";

interface UserFeedbackProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (rating: number | undefined, feedback: string | undefined, faculty: string | undefined) => void;
}

const FACULTIES = [
  { code: 'FI', name: 'Faculty of Informatics', color: '#f2d45c' },
  { code: 'FF', name: 'Faculty of Arts', color: '#4bc8ff' },
  { code: 'FSS', name: 'Faculty of Social Studies', color: '#008c78' },
  { code: 'ESF', name: 'Faculty of Economics and Administration', color: '#b9006e' },
  { code: 'PrF', name: 'Faculty of Law', color: '#9100dc' },
  { code: 'LF', name: 'Faculty of Medicine', color: '#f01928' },
  { code: 'PdF', name: 'Faculty of Education', color: '#ff7300' },
  { code: 'FaF', name: 'Faculty of Pharmacy', color: '#56788d' },
  { code: 'FSpS', name: 'Faculty of Sports Studies', color: '#5ac8af' },
  { code: 'CST', name: 'University studies', color: '#0031e7' },
  { code: 'PřF', name: 'Faculty of Science', color: '#00af3f' }
] as const;

export function UserFeedback({ isOpen, onOpenChange }: UserFeedbackProps) {
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [feedback, setFeedback] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");

  const handleSubmit = async () => {
    await api.post("/log_user_feedback", {
      body: {
        rating: rating ?? null,
        faculty: selectedFaculty ?? null,
        text: feedback ?? null,
      }
    });

    onOpenChange(false);
    setRating(undefined);
    setFeedback("");
    setSelectedFaculty("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>How are you enjoying the recommendations?</DialogTitle>
          <DialogDescription>
            Your feedback helps us improve the experience for everyone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Satisfaction Rating</label>
            <div className="flex justify-center items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Faculty</label>
            <div className="flex flex-wrap gap-2">
              {FACULTIES.map((faculty) => (
                <button
                  key={faculty.code}
                  onClick={() => setSelectedFaculty(faculty.code)}
                  className={`px-4 py-1 flex-1 rounded-full text-sm font-medium transition-colors ${
                    selectedFaculty === faculty.code
                      ? "text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  style={{
                    backgroundColor: selectedFaculty === faculty.code ? faculty.color : "transparent",
                    border: `1px solid ${faculty.color}`,
                  }}
                >
                  {faculty.code}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Additional Feedback</label>
            <Textarea
              placeholder="Tell us more about your experience..."
              value={feedback}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 grid grid-cols-1 sm:grid-cols-2">
          
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Skip
          </Button>
          <Button onClick={handleSubmit}>Submit Feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
