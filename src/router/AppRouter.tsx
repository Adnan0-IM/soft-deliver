import { BrowserRouter as Router, Routes, Route } from "react-router";
import ProtectedRoute from "@/auth/ProtectedRoute";
import RoleRoute from "@/auth/RoleRoute";
import Home from "@/pages/Home";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Login from "@/features/auth/Login/pages/Login";
import User from "@/features/User/pages/User";
import Driver from "@/features/Driver/pages/Driver";
import Admin from "@/features/Admin/pages/Admin";
import Register from "@/features/auth/Signup/pages/Register";
import ForgetPassword from "@/features/auth/reset/forget";
import ResetPassword from "@/features/auth/reset/reset";

export const AppRouter = () => {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/" element={<Home />} />
          {/* User */}
          <Route
            path="/dashboard/user"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["user", "admin"]}>
                  <User />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          {/* Driver */}
          <Route
            path="/dashboard/driver"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["driver", "admin"]}>
                  <Driver />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          {/* Admin */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["admin"]}>
                  <Admin />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
};
