import { Link, Outlet } from "react-router";
import { ModeToggle } from "@/components/mode-toggle";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="mx-auto w-full max-w-7xl flex items-center justify-between px-4 lg:px-6 py-3">
          <Link to={"/"} className="">
            <img
              className="dark:hidden h-8"
              src="/soft-deliver-green.png"
              alt=""
            />
            <img
              className="hidden dark:block h-8"
              src="/soft-deliver-white-green.png"
              alt=""
            />
          </Link>
          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 grid place-content-center">
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
