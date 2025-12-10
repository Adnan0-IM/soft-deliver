import { BrowserRouter as Router, Routes, Route } from "react-router";
import ProtectedRoute from "@/auth/ProtectedRoute";
import RoleRoute from "@/auth/RoleRoute";
import Home from "@/pages/Home";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Login from "@/features/auth/Login/pages/Login";
import User from "@/features/User/pages/Home";
import Driver from "@/features/Driver/pages/Driver";
import Admin from "@/features/Admin/pages/Admin";
import Register from "@/features/auth/Signup/pages/Register";
import ForgetPassword from "@/features/auth/reset/forget";
import ResetPassword from "@/features/auth/reset/reset";
import Profile from "@/features/profile/profile";
import RequestRide from "@/features/User/pages/RequestRide";
import RequestDelivery from "@/features/User/pages/RequestDelivery";
import TrackOrderAndRide from "@/features/User/pages/TrackOrderAndRide";
import History from "@/features/User/pages/History";
import Notifications from "@/features/User/pages/Notifications";
import Payment from "@/features/User/pages/Payment";

export const AppRouter = () => {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route
            path="*"
            element={
              <div className="grid place-content-center min-h-screen">
                404 Not Found
              </div>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<Home />} />
          {/* User */}
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["user", "admin"]}>
                  <User />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route path="home" element={<Home />} />
            <Route path="request-ride" element={<RequestRide />} />
            <Route path="request-delivery" element={<RequestDelivery />} />
            <Route path="track/:orderId" element={<TrackOrderAndRide />} />
            <Route path="history" element={<History />} />
            <Route path="payments" element={<Payment />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          {/* Driver */}
          <Route
            path="/driver"
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
            path="/admin"
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
