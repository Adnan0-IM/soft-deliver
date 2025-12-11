import { Outlet } from "react-router";
import { Button } from "@/components/ui/button";

export default function AuthLayout() {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <header className="border-b ">
        <div className=" flex justify-between p-4">
            <div className="font-semibold">Soft Deliver</div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                Help
              </Button>
              <Button variant="outline" size="sm">
                Back to Home
              </Button>
            </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <Outlet />
      </main>

      <footer className="border-t ">
        <div className="px-4 lg:px-6 py-3 text-sm text-muted-foreground flex items-center justify-between">
          <span>© {new Date().getFullYear()} Soft Deliver</span>
          <span className="hidden sm:inline">All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
