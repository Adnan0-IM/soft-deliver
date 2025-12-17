import { NavLink } from "react-router";
import { adminLinks, driverLinks, userLinks } from "./constants.ts";
import { useAuthStore } from "@/auth/store.ts";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  let links = userLinks;
  if (user?.role === "admin") {
    links = adminLinks;
  } else if (user?.role === "driver") {
    links = driverLinks;
  }
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border h-full fixed left-0 top-0 flex-col">
        <div className="p-4  h-16 border-b border-border">
          <img
            className="dark:hidden h-8"
            src="/soft-deliver-green.png"
            alt="soft deliver logo"
          />
          <img
            className="hidden dark:block h-8"
            src="/soft-deliver-white-green.png"
            alt="soft deliver logo"
          />
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
            >
              <item.icon className="mr-3 size-4 shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
