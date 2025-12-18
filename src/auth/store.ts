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
  photoFile?: Pick<File, "name" | "size" | "type">;
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
        photoUrl:
          "blob:http://localhost:5173/0b213cb7-826b-4a02-8a5b-7d9bdbc0d0f3",
        photoFile: {
          name: "cap-mockup2.jpg ",
          size: 195861,
          type: "image/jpeg",
        },
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
        photoUrl:
          "blob:http://localhost:5173/0b213cb7-826b-4a02-8a5b-7d9bdbc0d0f3",
        photoFile: {
          name: "cap-mockup2.jpg ",
          size: 195861,
          type: "image/jpeg",
        },
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
        photoUrl:
          "blob:http://localhost:5173/0b213cb7-826b-4a02-8a5b-7d9bdbc0d0f3",
        photoFile: {
          name: "cap-mockup2.jpg ",
          size: 195861,
          type: "image/jpeg",
        },
      },
    });

    localStorage.setItem("access_token", token);
  },
  logout: () => {
    set({ accessToken: null, user: null });
    localStorage.removeItem("access_token");
  },
}));
