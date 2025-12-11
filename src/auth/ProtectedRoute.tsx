import { Navigate } from "react-router";
import { useAuthStore } from "@/auth/store";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) return <Navigate to={"/auth/login"} />;
  return children;
};

export default ProtectedRoute;
