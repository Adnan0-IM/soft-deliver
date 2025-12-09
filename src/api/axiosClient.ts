import axios from "axios";
import { useAuthStore } from "@/auth/store";

const axiosClient = axios.create({
  baseURL: import.meta.env.BASE_URL,
});

// Attach token
axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle expired token
axiosClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const res = await axios.post("/auth/refresh");
        const newAccess = res.data.accessToken;
        useAuthStore.getState().setToken(newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return axiosClient(original);
      } catch {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(err);
  },
);

export default axiosClient;

