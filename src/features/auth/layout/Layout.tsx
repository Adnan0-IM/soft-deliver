import { Outlet, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export default function AuthLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="mx-auto w-full max-w-7xl flex items-center justify-between px-4 lg:px-6 py-3">
          <div className="font-semibold tracking-tight">Soft Deliver</div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate("/help")}>
              Help
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 lg:px-6 py-4 lg:py-6">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-6 py-3 text-sm text-muted-foreground flex flex-col md:flex-row gap-4 items-center justify-between">
          <span>© {new Date().getFullYear()} Soft Deliver</span>
          <span className="hidden md:inline">All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
