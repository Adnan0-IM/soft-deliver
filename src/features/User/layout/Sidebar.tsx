import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { NavLink } from "react-router";

const links = [
  { name: "Home", path: "/user/home" },
  { name: "Ride", path: "/user/request-ride" },
  { name: "Delivery", path: "/user/request-delivery" },
  { name: "Payments", path: "/user/payments" },
  { name: "Notifications", path: "/user/notifications" },
  { name: "My Orders", path: "/user/history" },
  { name: "Profile", path: "/user/profile" },
];

export default function Sidebar() {

  const [open, setOpen] = useState(false);
  return (
    <>
   {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border h-full fixed left-0 top-0 flex-col ">
        <div className="p-4 text-xl font-semibold border-b border-border">
          SOFT DELIVER
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
              <SheetTitle>SOFT DELIVER</SheetTitle>
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
