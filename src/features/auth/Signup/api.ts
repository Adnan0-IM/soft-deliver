import axiosClient from "@/api/axiosClient";
import { useMutation } from "@tanstack/react-query";

type Signup = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

export const signup = async (data: Signup) => {
  const res = await axiosClient.post("/auth/signup", data);
  return res.data;
};

export const useSignupMutation = () => {
  return useMutation({
    mutationFn: (data: Signup) => signup(data),
    onSuccess: () => {
      window.location.href = "/dashboard";
    },
  });
};
