import { Outlet } from "react-router";

import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

export default function DriverLayout() {
  return (
    <div className="h-screen flex ">
      <Sidebar />
      <div className="flex-1 flex md:pl-64 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
