import { NavLink } from "react-router";
import { adminLinks, driverLinks, userLinks } from "./constants.ts";
import { useAuthStore } from "@/auth/store.ts";

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
      <aside className="hidden md:flex w-58 bg-card border-r border-border h-full fixed left-0 top-0 flex-col ">
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
    </>
  );
}
