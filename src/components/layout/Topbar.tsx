import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, LogOut, Moon, Sun } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Link, NavLink } from "react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/auth/store";
import { adminLinks, driverLinks, userLinks } from "./constants.ts";
import { cn } from "@/lib/utils";
import { useTheme } from "../theme-provider.tsx";
import { useSwipeable } from "react-swipeable";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function Topbar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { setTheme, theme } = useTheme();
  const isMobile = useIsMobile();

  // Only swipe-to-close inside the Sheet; opening is handled in Layout
  const closeHandlers = useSwipeable({
    onSwipedLeft: () => setOpen(false),
    trackMouse: false,
    delta: 20,
    preventScrollOnSwipe: true,
  });

  let links;
  if (user?.role === "admin") {
    links = adminLinks;
  } else if (user?.role === "driver") {
    links = driverLinks;
  } else {
    links = userLinks;
  }
  if (!user) return null;
  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            className="cursor-pointer md:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-6" />
          </button>
          <Link to={"/"} className="md:hidden">
            <img
              className="dark:hidden h-7"
              src="/soft-deliver-green.png"
              alt="soft deliver logo"
            />
            <img
              className="hidden dark:block h-7"
              src="/soft-deliver-white-green.png"
              alt="soft deliver logo"
            />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button size={"icon"} variant={"ghost"}>
            <Bell className="size-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 rounded-full size-8">
                <Avatar className="size-8">
                  <AvatarImage src="/avatar-admin.png" alt="Admin Avatar" />
                  <AvatarFallback>
                    {(user?.name?.[0] ?? "A").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span className="font-medium">{user?.name ?? "Admin"}</span>
                <span className="text-xs text-muted-foreground">
                  {user?.email ?? "admin@example.com"}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                Settings
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => toggleTheme()}>
                {theme === "dark" ? "Light" : "Dark"} Theme
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  navigate("/auth/login");
                }}
                className="text-destructive focus:text-destructive"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="left"
            // Use dvh so the sheet truly fills the viewport when the URL bar collapses
            className="p-0 w-full h-dvh flex flex-col touch-pan-y pb-[env(safe-area-inset-bottom)]"
            {...(isMobile ? closeHandlers : {})}
          >
            <SheetHeader className="border-b h-16 border-border p-4">
              <SheetTitle>
                <Link to={"/"} className="flex gap-4 items-center">
                  <img
                    src="/soft-deliver-icon-white-green.png"
                    alt="soft deliver logo icon"
                    className="h-8 hidden dark:block"
                  />
                  <img
                    src="/soft-deliver-icon-green.png"
                    alt="soft deliver logo icon"
                    className="h-8 dark:hidden"
                  />
                  {user.role === "admin"
                    ? "Admin Panel"
                    : user.role === "driver"
                    ? "Welcome Driver!"
                    : user.role === "user"
                    ? "Welcome User!"
                    : null}
                </Link>
              </SheetTitle>
            </SheetHeader>

            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {links.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center rounded-md px-3 py-3 text-base font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground ring-1 ring-border shadow-sm before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1 before:rounded-full before:bg-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )
                  }
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="mr-3 size-5 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t mt-auto">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="flex-1 dark:hover:text-white justify-center gap-2"
                  onClick={() => toggleTheme()}
                >
                  {theme === "dark" ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )}
                  <span className="text-sm">
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </span>
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 justify-center gap-2"
                  onClick={() => {
                    logout();
                    setOpen(false);
                    navigate("/auth/login");
                  }}
                >
                  <LogOut className="size-4" />
                  <span className="text-sm">Logout</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
