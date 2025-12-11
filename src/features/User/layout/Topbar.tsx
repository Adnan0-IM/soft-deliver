import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { NavLink } from "react-router";

export const links = [
  { name: "Home", path: "/user" },
  { name: "Ride", path: "/user/request-ride" },
  { name: "Delivery", path: "/user/request-delivery" },
  { name: "Payments", path: "/user/payments" },
  { name: "Notifications", path: "/user/notifications" },
  { name: "My Orders", path: "/user/history" },
  { name: "Profile", path: "/user/profile" },
];
export default function Topbar() {

  const [open, setOpen] = useState(false);
  return (
    <>
  <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">

        <Button className="md:hidden" variant={"outline"} onClick={()=> setOpen(true)}><Menu/></Button>
        <h1 className="text-lg font-semibold">Welcome</h1>
      </div>

      <div className="flex items-center gap-4">
        <Bell size={20} className="" />
        <Avatar>
          <AvatarImage src="/avatar-admin.png" alt="Admin Avatar" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
      </div>
    </header>

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
