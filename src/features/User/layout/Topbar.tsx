import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";

export default function Topbar() {
  return (
  <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
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
  );
}
