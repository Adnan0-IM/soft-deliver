import { jwtDecode } from "jwt-decode";
import { create } from "zustand";

interface UserPayload {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "user" | "driver";
  phone?: string;
  location?: string;
}

interface AuthState {
  accessToken: string | null;
  user: UserPayload | null;
  setToken: (token: string) => void;
  logout: () => void;
  setTestUser: () => void;
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
        role: "admin",
        phone: "1234567890",
        location: "Test City",
      },
    });
    localStorage.setItem("access_token", token);
    // no window.location.href here; let the component navigate
  },
  logout: () => {
    set({ accessToken: null, user: null });
    localStorage.removeItem("access_token");
  },
}));
