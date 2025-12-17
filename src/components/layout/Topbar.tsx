import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
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

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { setTheme, theme } = useTheme();

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
      {/* Mobile sheet trigger (place in Topbar; duplicated here for standalone usage) */}
      <div className="">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <SheetHeader className="border-b h-16 border-border p-4">
              <SheetTitle>
                <div className="flex gap-4 items-center">
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
                </div>
              </SheetTitle>
            </SheetHeader>
            <nav className="p-3 space-y-1">
              {links.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground ring-1 ring-border shadow-sm before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1 before:rounded-full before:bg-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )
                  }
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="mr-3 size-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
