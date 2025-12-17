import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden ">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col md:pl-58 flex-1">
        <Topbar />

        <main className=" overflow-y-auto flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
