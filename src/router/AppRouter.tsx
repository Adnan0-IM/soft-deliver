import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Home from "@/pages/Home";
import ProtectedRoute from "@/auth/ProtectedRoute";
import RoleRoute from "@/auth/RoleRoute";
import Register from "@/features/auth/Signup/pages/Register";
import Login from "@/features/auth/Login/pages/Login";
import ForgetPassword from "@/features/auth/reset/forget";
import ResetPassword from "@/features/auth/reset/reset";

import Admin from "@/features/Admin/pages/Admin";

import UserLayout from "@/features/User/layout/Layout";
import UserDashboard from "@/features/User/pages/Dashboard";
import RequestRide from "@/features/User/pages/RequestRide";
import RequestDelivery from "@/features/User/pages/RequestDelivery";
import TrackOrderAndRide from "@/features/User/pages/TrackOrderAndRide";
import UserHistory from "@/features/User/pages/History";
import Notifications from "@/features/User/pages/Notifications";
import Payment from "@/features/User/pages/Payment";
import UserProfile from "@/features/User/pages/Profile";

import DriverLayout from "@/features/Driver/layout/Layout";
import DriverDashboard from "@/features/Driver/pages/Dashboard";
import Jobs from "@/features/Driver/pages/Jobs";
import JobPage from "@/features/Driver/pages/Job";
import DriverHistory from "@/features/Driver/pages/History";
import Earnings from "@/features/Driver/pages/Earnings";
import DriverProfile from "@/features/Driver/pages/Profile";
import Vehicle from "@/features/Driver/pages/Vehicle";
import Wallet from "@/features/Driver/pages/Wallet";

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
                  <UserLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<UserDashboard />} />
            <Route path="request-ride" element={<RequestRide />} />
            <Route path="request-delivery" element={<RequestDelivery />} />
            <Route path="track/:orderId" element={<TrackOrderAndRide />} />
            <Route path="history" element={<UserHistory />} />
            <Route path="payments" element={<Payment />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
          {/* Driver */}
          <Route
            path="/driver"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["driver", "admin"]}>
                  <DriverLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<DriverDashboard />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="job/:jobId" element={<JobPage />} />
            <Route path="history" element={<DriverHistory />} />
            <Route path="earnings" element={<Earnings />} />
            <Route path="profile" element={<DriverProfile />} />
            <Route path="vehicle" element={<Vehicle />} />
            <Route path="wallet" element={<Wallet />} />
          </Route>
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
