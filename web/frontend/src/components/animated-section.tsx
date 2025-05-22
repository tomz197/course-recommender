import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedSection({ children, delay = 0.3, className = "" }: AnimatedSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay }}
      className={`container mx-auto px-4 py-8 flex flex-col items-center gap-6 mt-8 bg-muted/30 rounded-lg border shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
} 