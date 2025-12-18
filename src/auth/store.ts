import { jwtDecode } from "jwt-decode";
import { create } from "zustand";

interface UserPayload {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "user" | "driver";
  phone?: string;
  location?: string;
  photoUrl?: string;
  photoFile?: string;
}

interface AuthState {
  accessToken: string | null;
  user: UserPayload | null;
  setToken: (token: string) => void;
  logout: () => void;
  setTestUser: () => void;
  setAdminTestUser: () => void;
  setDriverTestUser: () => void;
}

const loadInitialState = (): Pick<AuthState, "accessToken" | "user"> => {
  const token = localStorage.getItem("access_token");
  if (!token) return { accessToken: null, user: null };
  try {
    const decoded = jwtDecode<UserPayload>(token);
    return { accessToken: token, user: decoded };
  } catch {
    // bad/placeholder token
    return { accessToken: token, user: null };
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  ...loadInitialState(),
  setToken: (token: string) => {
    const decoded = jwtDecode<UserPayload>(token);
    set({ accessToken: token, user: decoded });
    localStorage.setItem("access_token", token);
  },
  setTestUser: () => {
    // store a simple test token and user
    const token = "test-token";
    set({
      accessToken: token,
      user: {
        id: "test-id",
        email: "test@test.com",
        name: "Test User",
        role: "user",
        phone: "1234567890",
        location: "Test City",
      },
    });

    localStorage.setItem("access_token", token);
    // no window.location.href here; let the component navigate
  },
  setAdminTestUser: () => {
    const token = "test-admin-token";
    set({
      accessToken: token,
      user: {
        id: "admin-id",
        email: "adminTest@test.com",
        name: "Admin Test User",
        role: "admin",
        phone: "0987654321",
        location: "Admin City",
      },
    });

    localStorage.setItem("access_token", token);
  },
  setDriverTestUser: () => {
    const token = "test-driver-token";
    set({
      accessToken: token,
      user: {
        id: "driver-id",
        email: "driverTest@test.com",
        name: "Driver Test User",
        role: "driver",
        phone: "1122334455",
        location: "Driver City",
      },
    });

    localStorage.setItem("access_token", token);
  },
  logout: () => {
    set({ accessToken: null, user: null });
    localStorage.removeItem("access_token");
  },
}));
