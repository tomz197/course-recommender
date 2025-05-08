"use client";

import { useState, useEffect } from "react";
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
import api from "@/lib/utils";
import { storageController } from "@/storage";
import { ScrollArea } from "./ui/scroll-area";

const FEEDBACK_PHRASES = [
  "Spot-on",
  "Highly relevant",
  "Good surprises",
  "Interesting options",
  "Helpful start",
  "Good fit",
  "Great!",
  "Mixed relevance",
  "Just okay",
  "Some useful",
  "Hit or miss",
  "Not relevant",
  "Mostly irrelevant",
  "Poor fit",
  "Obvious choices",
  "Not helpful",
  "Confusing"
];

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

const STUDY_TYPES = [
  { code: 'bc', name: 'Bachelor' },
  { code: 'mgr', name: 'Master' },
  { code: 'ing', name: 'Engineering' },
  { code: 'phd', name: 'PhD' },
] as const;

const SEMESTERS = [
  { number: 'I', name: 'First Semester' },
  { number: 'II', name: 'Second Semester' },
  { number: 'III', name: 'Third Semester' },
  { number: 'IV', name: 'Fourth Semester' },
  { number: 'V', name: 'Fifth Semester' },
  { number: 'VI', name: 'Sixth Semester' },
  { number: 'other', name: 'More than Sixth Semester' },
] as const;

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function UserFeedback({ isOpen, onOpenChange }: UserFeedbackProps) {
  const [feedback, setFeedback] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [selectedStudyType, setSelectedStudyType] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>([]);
  const [shuffledPhrases, setShuffledPhrases] = useState<string[]>([]);
  const [showAllPhrases, setShowAllPhrases] = useState(false);

  useEffect(() => {
    setShuffledPhrases(shuffleArray(FEEDBACK_PHRASES));
  }, []);

  const displayedPhrases = showAllPhrases ? shuffledPhrases : shuffledPhrases.slice(0, 6);

  const handlePhraseClick = (phrase: string) => {
    setSelectedPhrases(prev => {
      const newSelection = prev.includes(phrase)
        ? prev.filter(p => p !== phrase)
        : [...prev, phrase];
      
      // Show all phrases if there's at least one selection
      if (newSelection.length > 0) {
        setShowAllPhrases(true);
      }
      
      return newSelection;
    });
  };

  const handleSubmit = async () => {
    onOpenChange(false);

    await api.post("/log_user_feedback", {
      body: {
        faculty: selectedFaculty ?? null,
        study_type: selectedStudyType ?? null,
        semester: selectedSemester ?? null,
        text: feedback ?? null,
        phrases: selectedPhrases,
        model: storageController.getPredictionModel(),
        user_id: storageController.getUserID(),
      }
    });

    setFeedback("");
    setSelectedFaculty("");
    setSelectedStudyType("");
    setSelectedSemester("");
    setSelectedPhrases([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] px-0">
        <ScrollArea className="max-h-[90vh] px-4">
        <DialogHeader>
          <DialogTitle>How are you enjoying the recommendation algorithm?</DialogTitle>
          <DialogDescription>
            Your feedback helps us improve the experience for everyone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Your faculty</label>
            <div className="flex flex-wrap gap-2">
              {FACULTIES.map((faculty) => (
                <button
                  key={faculty.code}
                  onClick={() => {
                    setSelectedFaculty(faculty.code);
                    setSelectedStudyType(""); // Reset study type when faculty changes
                    setSelectedSemester(""); // Reset semester when faculty changes
                  }}
                  className={`px-4 py-1 flex-1 rounded-full text-sm font-medium transition-all duration-300 ease-out transform hover:scale-105 ${
                    selectedFaculty === faculty.code
                      ? "text-white"
                      : "hover:bg-gray-100"
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

          <div className={`grid gap-2 transition-all duration-500 ease-out transform origin-top ${
            selectedFaculty ? 'opacity-100 max-h-[200px] translate-y-0' : 'opacity-0 max-h-0 translate-y-[-20px] pointer-events-none'
          }`}>
            <label className="text-sm font-medium">Study Type</label>
            <div className="flex flex-wrap gap-2">
              {STUDY_TYPES.map((type) => (
                <button
                  key={type.code}
                  onClick={() => {
                    setSelectedStudyType(type.code);
                    setSelectedSemester(""); // Reset semester when study type changes
                  }}
                  className={`px-4 py-1 flex-1 rounded-full text-sm font-medium transition-all duration-300 ease-out transform hover:scale-105 ${
                    selectedStudyType === type.code
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          <div className={`grid gap-2 transition-all duration-500 ease-out transform origin-top ${
            selectedStudyType ? 'opacity-100 max-h-[200px] translate-y-0' : 'opacity-0 max-h-0 translate-y-[-20px] pointer-events-none'
          }`}>
            <label className="text-sm font-medium">Semester</label>
            <div className="flex flex-wrap gap-2">
              {SEMESTERS.map((semester) => (
                <button
                  key={semester.number}
                  onClick={() => setSelectedSemester(semester.number)}
                  className={`px-4 py-1 flex-1 rounded-full text-sm font-medium transition-all duration-300 ease-out transform hover:scale-105 ${
                    selectedSemester === semester.number
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {semester.number}
                </button>
              ))}
            </div>
          </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">How do you feel about the recommendations?</label>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {displayedPhrases.map((phrase, index) => (
                <button
                  key={phrase}
                  onClick={() => handlePhraseClick(phrase)}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-300 ease-out transform hover:scale-105 ${
                    selectedPhrases.includes(phrase)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInUp 0.5s ease-out forwards',
                    opacity: 0,
                    transform: 'translateY(10px)'
                  }}
                >
                  {phrase}
                </button>
              ))}
            </div>
            {shuffledPhrases.length > 6 && (
              <button
                onClick={() => setShowAllPhrases(!showAllPhrases)}
                className="text-xs text-muted-foreground hover:text-foreground transition-all duration-300 ease-out transform hover:scale-105 mt-1"
              >
                {showAllPhrases ? "Show less" : "Show more"}
              </button>
            )}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Additional Feedback</label>
            <Textarea
              placeholder="Tell us more about your experience..."
              value={feedback}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)}
              className="min-h-[100px] transition-all duration-300 ease-out"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 grid grid-cols-1 sm:grid-cols-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="transition-all duration-300 ease-out transform hover:scale-105 order-2 sm:order-1"
          >
            Skip
          </Button>
          <Button 
            onClick={handleSubmit}
            className="transition-all duration-300 ease-out transform hover:scale-105 order-1 sm:order-2"
          >
            Submit Feedback
          </Button>
        </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Add this at the end of the file, before the last closing brace
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);
