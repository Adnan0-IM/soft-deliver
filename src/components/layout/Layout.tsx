import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useSwipeable } from "react-swipeable";
import { useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function Layout() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  // Use separate handlers to avoid conflicts and make the intent clear
  const closedHandlers = useSwipeable({
    onSwipedRight: () => setOpen(true),
    trackMouse: false,
    delta: 20,
    preventScrollOnSwipe: true,
  });

  const openHandlers = useSwipeable({
    onSwipedLeft: () => setOpen(false),
    trackMouse: false,
    delta: 20,
    preventScrollOnSwipe: true,
  });

  return (
    <div className="flex h-screen overflow-hidden ">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        {...(isMobile ? (open ? openHandlers : closedHandlers) : {})}
        className="flex flex-col md:pl-64 flex-1 touch-pan-y"
      >
        <Topbar open={open} setOpen={setOpen} />

        {/* Mobile edge handle to open via swipe without fighting iOS back-swipe */}
        {!open && (
          <div
            {...(isMobile ? closedHandlers : {})}
            className="fixed left-0 top-16 bottom-0 w-3 md:hidden z-30 touch-pan-y"
            aria-hidden
          />
        )}

        <main className=" overflow-y-auto flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
