import axiosClient from "@/api/axiosClient"
import { useMutation } from "@tanstack/react-query";

export const sendResetLink = async (data: { email: string }) => {
  const res = await axiosClient.post("/auth/reset-link", data);
  return res.data;
};

export const useSendResetLinkMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string }) => sendResetLink(data),
  });
}

export const resetPassword = async (data: {password: string;}) => {
    const res = await axiosClient.post("/auth/reset-password", data)
    return res.data
}

export const useResetPasswordMutation = () => {
    return useMutation({
        mutationFn: (data: {password: string}) => resetPassword(data)
    })
}