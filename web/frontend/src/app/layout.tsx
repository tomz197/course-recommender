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
import { Github, Menu } from "lucide-react";
import Brandmark from "@/components/brandmark";
import { getPredictionModels, setPredictionModel } from "@/lib/set-prediction-model";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function RootLayout() {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-col justify-center min-h-screen">
        <header className="bg-primary-foreground flex justify-between text-primary-background p-4">
          <Link className="cursor-pointer" to="/">
            <Brandmark className="inline-block h-8 max-w-none fill-foreground" />
          </Link>
          <div className="hidden sm:flex gap-4 items-center">
            <Button
              onClick={() => {
                navigate("/");
              }}
              variant="ghost"
            >
              Course search
            </Button>
            <ResetButton
              onClick={() => {
                storageController.resetStorage();
                navigate("/");
                void (async () => {
                  await setPredictionModel(true);
                  window.location.reload();
                })();
              }}
            />
            <ModeToggle />
          </div>
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/")}>
                  Course search
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    storageController.resetStorage();
                    navigate("/");
                    void (async () => {
                      await setPredictionModel(true);
                      window.location.reload();
                    })();
                  }}
                >
                  Reset
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <div className="flex items-center justify-between">
                    <span>Theme:</span>
                    <ModeToggle />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
