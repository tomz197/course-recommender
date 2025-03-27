import { Button } from "@/components/ui/button";
import { storageController } from "@/storage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Outlet, useNavigate } from "react-router";
import { ModeToggle } from "@/components/mode-toggle";
import { Github } from "lucide-react";

export default function RootLayout() {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-col justify-center min-h-screen">
        <header className="bg-primary-foreground flex justify-between text-primary-background p-4">
          <h2 className="text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>RecSys</h2>
          <div className="flex gap-4 items-center">
            <Button
              onClick={() => {
                navigate("/");
              }}
              variant="ghost"
            >
              Home
            </Button>
            <ResetButton
              onClick={() => {
                storageController.resetCoursePreferences();
                navigate("/");
                window.location.reload();
              }}
            />
            <ModeToggle />
          </div>
        </header>

        <div className="flex justify-center flex-1">
          <Outlet />
        </div>
      </div>
      <footer className="bg-primary-foreground text-primary-background p-4 text-center">
        <a href="https://github.com/tomz197/pv254-project" target="_blank" rel="noreferrer">
          <Button variant="outline">GitHub <Github className="h-5 w-5" /></Button>
        </a>
      </footer>
    </>
  );
}

function ResetButton({
  onClick,
}: {
  onClick: () => void,
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Reset</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>This action will RESET algorithm</DialogTitle>
          <DialogDescription>
            By reseting algorithm, like and disliked courses will be removed with no way of returning them.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClick}>Reset</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
