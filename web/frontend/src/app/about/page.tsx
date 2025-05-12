import { Button } from "@/components/ui/button";
import { SquareArrowOutUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <main className="min-h-screen w-full">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-16"
        >
          {/* Hero Section */}
          <section className="text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight">About This Project</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
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
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our goal is to help students discover courses that match their interests and preferences 
              using modern recommendation techniques.
            </p>
          </section>

          {/* Team Section */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-center">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {[
                  { name: "Tomáš Žifčák", url: "https://zifcak.dev" },
                  { name: "Peter Dražkovec", url: "https://www.linkedin.com/in/peter-drazkovec/" },
                  { name: "Marek Ličko", url: "https://www.linkedin.com/in/mareklicko/" },
                  { name: "Martin Dražkovec", url: "https://www.linkedin.com/in/martin-drazkovec/" }
                ].map(member => (
                  <Button
                    key={member.name}
                    variant="outline"
                    size="lg"
                    asChild
                    className="w-full text-xl hover:bg-transparent py-8"
                  >
                    <a href={member.url} target="_blank" rel="noopener noreferrer">
                      {member.name}
                      <SquareArrowOutUpRight className="w-4 h-4 ml-1" />
                    </a>
                  </Button>
                ))}
            </div>
          </section>
        </motion.div>
      </div>
    </main>
  );
} 