import axiosClient from "@/api/axiosClient";
import type { DriverStatus } from "./store";

export async function goOnline(): Promise<void> {
  const res = await axiosClient.post(`/driver/go-online`);
  await res.data;
}

export async function goOffline(): Promise<void> {
  const res = await axiosClient.post(`/driver/go-offline`);
  await res.data;
}

export async function sendDriverLocation(payload: {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}): Promise<void> {
  const res = await axiosClient.post(`/driver/update-location`, payload);
  return res.data;
}

export async function getDriverStatus(): Promise<DriverStatus> {
  const res = await axiosClient.get(`/driver/status`);
  const data = res.data as { status: DriverStatus };
  return data.status;
}

export async function setDriverStatus(status: DriverStatus): Promise<void> {
  const res = await axiosClient.put(`/driver/status`, {
    status,
  });
  await res.data;
}

export type DriverSummary = {
  todaysEarnings: number;
  pendingPayout: number;
  activeJobId?: string | null;
};

export async function getDriverSummary(): Promise<DriverSummary> {
  const res = await axiosClient.get(`/driver/summary`);
  return res.data;
}

export async function acceptJob(jobId: string): Promise<void> {
  const res = await axiosClient.post(`/driver/accept-job`, { jobId });
  return res.data;
}

export async function rejectJob(jobId: string): Promise<void> {
  const res = await axiosClient.post(`/driver/reject-job`, { jobId });
  return res.data;
}

export async function getJob(id: string): Promise<{
  id: string;
  status:
    | "going_to_pickup"
    | "arrived"
    | "picked_up"
    | "dropping_off"
    | "completed";
  pickup: { lat: number; lng: number; address?: string };
  dropoff: { lat: number; lng: number; address?: string };
  customer?: { name?: string; phone?: string };
  earnings?: { base?: number; tip?: number; total?: number };
}> {
  const res = await axiosClient.get(`/driver/job/${encodeURIComponent(id)}`);
  return res.data;
}

export async function updateJobStatus(
  id: string,
  status:
    | "going_to_pickup"
    | "arrived"
    | "picked_up"
    | "dropping_off"
    | "completed"
): Promise<Awaited<ReturnType<typeof getJob>>> {
  const res = await axiosClient.post(
    `/driver/job/${encodeURIComponent(id)}/update-status`,
    {
      status,
    }
  );
  return res.data;
}

export async function getDriverHistory(): Promise<
  Array<{
    id: string;
    type: "delivery" | "ride";
    date: string;
    distanceKm?: number;
    earnings?: number;
    status?: string;
  }>
> {
  const res = await axiosClient.get(`/driver/history`);
  return res.data;
}

export async function getDriverEarnings(): Promise<{
  today: number;
  weekTotal: number;
  total: number;
  pendingPayout: number;
  completedPayouts: Array<{ id: string; amount: number; date: string }>;
  weeklyChart?: Array<{ date: string; amount: number }>;
}> {
  const res = await axiosClient.get(`/driver/earnings`);
  return res.data;
}

export async function getDriverMe(): Promise<{
  fullName: string;
  phone: string;
  email: string;
  licenseNumber?: string;
  photoUrl?: string;
}> {
  const res = await axiosClient.get(`/driver/me`);
  return res.data;
}

export async function updateDriverProfile(payload: {
  fullName: string;
  phone: string;
  email: string;
  licenseNumber?: string;
  photoFile?: File | null;
}): Promise<void> {
  let body: BodyInit;

  if (payload.photoFile) {
    // multipart for photo upload
    const form = new FormData();
    form.append("fullName", payload.fullName);
    form.append("phone", payload.phone);
    form.append("email", payload.email);
    if (payload.licenseNumber)
      form.append("licenseNumber", payload.licenseNumber);
    form.append("photo", payload.photoFile);
    body = form;
    // Allow browser to set Content-Type with boundary (do not set manually)
  } else {
    body = JSON.stringify({
      fullName: payload.fullName,
      phone: payload.phone,
      email: payload.email,
      licenseNumber: payload.licenseNumber,
    });
  }

  const res = await axiosClient.post(`/driver/update-profile`, {
    body,
  });
  return res.data;
}

export async function getDriverVehicle(): Promise<{
  type: string;
  plateNumber: string;
  model?: string;
  color?: string;
  year?: number;
}> {
  const res = await axiosClient.get(`/driver/vehicle`);
  return res.data;
}

export async function updateDriverVehicle(payload: {
  type: string;
  plateNumber: string;
  model?: string;
  color?: string;
  year?: number;
}): Promise<void> {
  const res = await axiosClient.post(`/driver/update-vehicle`, {
    ...payload,
  });
  return res.data;
}

export async function getDriverWallet(): Promise<{
  balance: number;
  withdrawalHistory: Array<{
    id: string;
    amount: number;
    date: string;
    status: "pending" | "completed" | "failed";
  }>;
  earningsLogs: Array<{
    id: string;
    amount: number;
    source: string;
    date: string;
  }>;
}> {
  const res = await axiosClient.get(`/driver/wallet`);
  return res.data;
}

export async function requestWithdraw(amount: number): Promise<void> {
  const res = await axiosClient.post(`/driver/withdraw`, {
    amount,
  });
  return res.data;
}
