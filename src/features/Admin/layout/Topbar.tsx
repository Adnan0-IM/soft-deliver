import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import { NavLink } from "react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/auth/store";
import { useNavigate } from "react-router";

export const links = [
  { name: "Dashboard", path: "/admin" },
  { name: "Users", path: "/admin/users" },
  { name: "Drivers", path: "/admin/drivers" },
  { name: "Orders", path: "/admin/orders" },
  { name: "Payments", path: "/admin/manage-payments" },
  { name: "Analytics", path: "/admin/analytics" },
  { name: "Settings", path: "/admin/settings" },
];
export default function Topbar() {
  const [open, setOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            className="md:hidden"
            variant={"outline"}
            onClick={() => setOpen(true)}
          >
            <Menu />
          </Button>
          <h1 className="text-lg font-semibold">Admin</h1>
        </div>

        <div className="flex items-center gap-4">
          <Bell size={20} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 rounded-full h-9 w-9">
                <Avatar className="h-9 w-9">
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
            <SheetHeader className="border-b border-border p-4">
              <SheetTitle>Admin Panel</SheetTitle>
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
