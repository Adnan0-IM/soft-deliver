
import { NavLink } from "react-router";
import { links } from "./Topbar";



export default function Sidebar() {

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
    </>
  );
}

