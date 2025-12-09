import { Navigate } from "react-router";
import { useAuthStore } from "./store";

const RoleRoute = ({
  roles,
  children,
}: {
  roles: string[];
  children: React.ReactNode;
}) => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to={"/login"} />;
  if (!roles.includes(user.role)) return <Navigate to="/unauthorized" />;
  return children;
};

export default RoleRoute;
