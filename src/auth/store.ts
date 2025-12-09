import { jwtDecode } from "jwt-decode";
import { create } from "zustand";

interface UserPayload {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "user" | "driver";
}

interface AuthState {
  accessToken: string | null;
  user: UserPayload | null;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  // "skjslkssklskjdsljdljslkjd",
  user: null,
  // {
  //     email: "blabla@gmail.com",
  //     role: "admin",
  //     id: "blabla",
  //     name: "blabla",
  //   }
  setToken: (token: string) => {
    const decoded = jwtDecode<UserPayload>(token);
    set({ accessToken: token, user: decoded });
    localStorage.setItem("access_token", token);
  },

  logout: () => {
    set({ accessToken: null, user: null });
    localStorage.removeItem("access_token");
  },
}));
