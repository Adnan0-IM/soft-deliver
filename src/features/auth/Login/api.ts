import axiosClient from "@/api/axiosClient";
import { useAuthStore } from "@/auth/store";
import { useMutation } from "@tanstack/react-query";

export const login = async (data: { email: string; password: string }) => {
  const res = await axiosClient.post("/auth/login", data);
  return res.data;
};

// Provide a reusable hook for login mutation
export const useLoginMutation = () => {
  const setToken = useAuthStore.getState().setToken;

  return useMutation({
    mutationFn: (data: { email: string; password: string }) => login(data),
    onSuccess: (data) => {
      setToken(data.accessToken);
      window.location.href = "/dashboard";
    },
  });
};
