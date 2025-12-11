import { NavLink } from "react-router";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import React from "react";

const links = [
  { name: "Dashboard", path: "/admin/dashboard" },
  { name: "Users", path: "/admin/users" },
  { name: "Drivers", path: "/admin/drivers" },
  { name: "Orders", path: "/admin/orders" },
  { name: "Payments", path: "/admin/manage-payments" },
  { name: "Analytics", path: "/admin/analytics" },
  { name: "Settings", path: "/admin/settings" },
];

export default function Sidebar() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border h-full fixed left-0 top-0 flex-col ">
        <div className="p-4 text-xl font-semibold border-b border-border">
          Admin Panel <sub>Soft deliver</sub>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

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
