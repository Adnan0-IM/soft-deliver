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

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  let links;
  if (user?.role === "admin") {
    links = adminLinks;
  } else if (user?.role === "driver") {
    links = driverLinks;
  } else {
    links = userLinks;
  }
  if (!user) return null;
  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <button className="cursor-pointer" onClick={() => setOpen(true)}>
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
              <DropdownMenuItem onClick={() => navigate("/admin")}>
                Dashboard
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
            <nav className="p-4 space-y-1">
              {links.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `block p-3 rounded-md font-medium transition ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`
                  }
                  onClick={() => setOpen(false)}
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
