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
import { Link, Outlet, useNavigate } from "react-router";
import { ModeToggle } from "@/components/mode-toggle";
import { Check, ChevronDown, Command, Github } from "lucide-react";
import Brandmark from "@/components/brandmark";
import { getPredictionModels, setPredictionModel } from "@/lib/set-prediction-model";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function RootLayout() {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-col justify-center min-h-screen">
        <header className="bg-primary-foreground flex justify-between text-primary-background p-4">
          <Link className="cursor-pointer" to="/">
            <Brandmark className="inline-block h-8 max-w-none fill-foreground" />
          </Link>
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
                void (async () => {
                  await setPredictionModel(true);

                  window.location.reload();
                })();
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
        <div className="flex justify-center">
          <ModelSelector />
        </div>
      </footer>
    </>
  );
}

function ModelSelector() {
  const [selectedModel, setSelectedModel] = useState<string>(storageController.getPredictionModel() || "");
  const [open, setOpen] = useState(false);

  const modelsQuery = useQuery({
    queryKey: ["models"],
    queryFn: () => getPredictionModels(),
  });

  const handleModelChange = async (model: string) => {
    setSelectedModel(model);
    storageController.setPredictionModel(model);
    setOpen(false);
    window.location.reload();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <p className="text-muted-foreground text-xs mt-2">
          {selectedModel ? "Prediction model: " + selectedModel : ""}
        </p>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <div className="flex flex-col gap-2">
          {modelsQuery.data?.map((model) => (
            <Button key={model} variant="ghost" onClick={() => handleModelChange(model)}>
              {model}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
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
