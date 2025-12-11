import { Outlet } from "react-router";
import { Button } from "@/components/ui/button";

export default function AuthLayout() {
  return (
    <div className="">
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

      <main className="flex-1 mx-auto pr-4 pt-4 lg:pt-6">
        <Outlet />
      </main>

      <footer className="border-t fixed bottom-0 left-0 w-full">
        <div className="px-4 w-full lg:px-6 py-3 text-sm text-muted-foreground flex flex-col md:flex-row gap-4 items-center justify-between">
          <span>© {new Date().getFullYear()} Soft Deliver</span>
          <span className="hidden md:inline "> All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
