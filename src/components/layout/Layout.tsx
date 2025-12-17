import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useSwipeable } from "react-swipeable";
import { useState } from "react";

export default function Layout() {
  const [open, setOpen] = useState(false);
  const handlers = useSwipeable({
    onSwipedLeft: () => setOpen(false),
    onSwipedRight: () => setOpen(true),
  });
  return (
    <div className="flex h-screen overflow-hidden ">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div {...handlers} className="flex flex-col md:pl-64 flex-1">
        <Topbar open={open} setOpen={setOpen} />

        <main className=" overflow-y-auto flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
