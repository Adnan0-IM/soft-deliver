import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  CreditCard,
  BarChart3,
  Settings,
  Home,
  ListChecks,
  History,
  Wallet,
  Car,
  Bell,
  User as UserIcon,
} from "lucide-react";

type LinkItem = {
  name: string;
  path: string;
  icon: LucideIcon;
};

export const adminLinks: LinkItem[] = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Drivers", path: "/admin/drivers", icon: Truck },
  { name: "Orders", path: "/admin/orders", icon: Package },
  { name: "Payments", path: "/admin/manage-payments", icon: CreditCard },
  { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", path: "/admin/settings", icon: Settings },
];

export const driverLinks: LinkItem[] = [
  { name: "Home", path: "/driver/home", icon: Home },
  { name: "Jobs", path: "/driver/Jobs", icon: ListChecks },
  { name: "History", path: "/driver/history", icon: History },
  { name: "Earnings", path: "/driver/earnings", icon: Wallet },
  { name: "Vehicle", path: "/driver/vehicle", icon: Car },
  { name: "Profile", path: "/driver/profile", icon: UserIcon },
];
export const userLinks: LinkItem[] = [
  { name: "Home", path: "/user/home", icon: Home },
  { name: "Ride", path: "/user/request-ride", icon: Car },
  { name: "Delivery", path: "/user/request-delivery", icon: Package },
  { name: "Payments", path: "/user/payments", icon: CreditCard },
  { name: "Notifications", path: "/user/notifications", icon: Bell },
  { name: "My Orders", path: "/user/history", icon: History },
  { name: "Profile", path: "/user/profile", icon: UserIcon },
];
