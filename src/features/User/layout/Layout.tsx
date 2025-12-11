import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function UserLayout() {
  return (
    <div className="flex h-screen  overflow-hidden">
      <Sidebar />

      <div className="flex flex-col md:pl-64 flex-1">
        <Topbar />

        <main className="p-6 overflow-y-auto flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
