import { Button } from "@/components/ui/button";
import { storageController } from "@/storage";
import { Outlet, useNavigate } from "react-router";

export default function RootLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center min-h-screen">
      <header className="bg-primary-foreground flex justify-between text-primary-background p-4">
        <h1 className="text-2xl font-bold">RecSys</h1>
        <Button
          onClick={() => {
            storageController.resetCoursePreferences();
            navigate("/");
            window.location.reload();
          }}
        >
          Reset
        </Button>
      </header>

      <div className="flex justify-center p-4 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
