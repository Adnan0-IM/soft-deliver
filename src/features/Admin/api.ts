import axiosClient from "@/api/axiosClient";

// Types (aligned with pages)
export type AdminUser = {
  id: string | number;
  name: string;
  email: string;
  phone?: string | null;
  totalOrders?: number;
  status: "active" | "banned" | "new" | string;
  createdAt?: string;
  avatarUrl?: string | null;
  address?: string | null;
};

export type AdminOrder = {
  id: string | number;
  customerName?: string;
  driverName?: string | null;
  amount: number;
  status: "pending" | "assigned" | "delivered" | "cancelled" | string;
  createdAt: string;
};

export type AdminDriver = {
  id: string | number;
  name: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  status: "approved" | "pending" | "disabled" | string;
  presence?: "online" | "offline";
  online?: boolean;
  createdAt?: string;
  earnings?: number;
  totalCompleted?: number;
  vehicle?:
    | string
    | {
        make?: string | null;
        model?: string | null;
        plate?: string | null;
        color?: string | null;
        year?: number | null;
      }
    | null;
  licenseNumber?: string | null;
  licenseDocumentUrl?: string | null;
  address?: string | null;
};

export type AdminPayout = {
  id: string | number;
  driverId: string | number;
  driverName?: string | null;
  driverAvatarUrl?: string | null;
  amount: number;
  currency?: string | null;
  status: "pending" | "approved" | "rejected" | string;
  createdAt: string;
};

export type DashboardStats = {
  totalUsers: number;
  totalDrivers: number;
  ordersToday: number;
  activeDrivers?: number;
  pendingPayouts?: number;
};

// Users API
export async function adminGetUsers(params: {
  status?: "active" | "banned" | "new";
  q?: string;
  page?: number;
  limit?: number;
}): Promise<
  | { data: AdminUser[]; total?: number; page?: number; pageSize?: number }
  | AdminUser[]
> {
  const res = await axiosClient.get(`/admin/users`, { params });
  return res.data;
}

export async function adminGetUser(
  id: string | number
): Promise<AdminUser | { user: AdminUser; orders?: AdminOrder[] }> {
  const res = await axiosClient.get(`/admin/users/${id}`);
  return res.data;
}

export async function adminBanUser(id: string | number): Promise<void> {
  const res = await axiosClient.post(`/admin/users/${id}/ban`);
  return res.data;
}

export async function adminUnbanUser(id: string | number): Promise<void> {
  const res = await axiosClient.post(`/admin/users/${id}/unban`);
  return res.data;
}

export async function adminResetUserPassword(
  id: string | number
): Promise<void> {
  const res = await axiosClient.post(`/admin/users/${id}/reset-password`);
  return res.data;
}

// Drivers API
export async function adminGetDrivers(params: {
  status?: "approved" | "pending";
  online?: boolean;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<
  | { data: AdminDriver[]; total?: number; page?: number; pageSize?: number }
  | AdminDriver[]
> {
  const res = await axiosClient.get(`/admin/drivers`, { params });
  return res.data;
}

export async function adminGetDriver(
  id: string | number
): Promise<
  | AdminDriver
  | { driver: AdminDriver; jobs?: AdminOrder[]; currentJob?: AdminOrder | null }
> {
  const res = await axiosClient.get(`/admin/drivers/${id}`);
  return res.data;
}

export async function adminApproveDriver(id: string | number): Promise<void> {
  const res = await axiosClient.post(`/admin/drivers/${id}/approve`);
  return res.data;
}

export async function adminDisableDriver(id: string | number): Promise<void> {
  const res = await axiosClient.post(`/admin/drivers/${id}/disable`);
  return res.data;
}

export async function adminResetDriverPassword(
  id: string | number
): Promise<void> {
  const res = await axiosClient.post(`/admin/drivers/${id}/reset-password`);
  return res.data;
}

// Payouts API
export async function adminGetPayouts(params: {
  status?: "pending" | "approved" | "rejected";
  q?: string;
  page?: number;
  limit?: number;
}): Promise<
  | { data: AdminPayout[]; total?: number; page?: number; pageSize?: number }
  | AdminPayout[]
> {
  const res = await axiosClient.get(`/admin/payouts`, { params });
  return res.data;
}

export async function adminApprovePayout(id: string | number): Promise<void> {
  const res = await axiosClient.post(`/admin/payouts/${id}/approve`);
  return res.data;
}

export async function adminRejectPayout(id: string | number): Promise<void> {
  const res = await axiosClient.post(`/admin/payouts/${id}/reject`);
  return res.data;
}

// Settings API
export type AdminSettingsResponse = Partial<{
  company: {
    name?: string;
    email?: string;
    supportEmail?: string;
    supportPhone?: string;
  };
  rideRates: {
    baseFare?: number;
    perKm?: number;
    perMin?: number;
    currency?: string;
  };
  deliveryRates: {
    baseFare?: number;
    perKm?: number;
    perKg?: number;
    currency?: string;
  };
  requirements: {
    minDriverAge?: number;
    minVehicleYear?: number;
    requireLicense?: boolean;
    requireInsurance?: boolean;
  };
}>;

export async function adminGetSettings(): Promise<AdminSettingsResponse> {
  const res = await axiosClient.get(`/admin/settings`);
  return res.data;
}

export async function adminUpdateSettings(body: {
  company?: AdminSettingsResponse["company"];
  requirements?: AdminSettingsResponse["requirements"];
  password?: { current: string; next: string };
}): Promise<void> {
  const res = await axiosClient.post(`/admin/settings/update`, body);
  return res.data;
}

export async function adminUpdateRates(body: {
  rideRates?: AdminSettingsResponse["rideRates"];
  deliveryRates?: AdminSettingsResponse["deliveryRates"];
}): Promise<void> {
  const res = await axiosClient.post(`/admin/settings/update-rates`, body);
  return res.data;
}

// Dashboard API
export async function adminGetDashboard(): Promise<{
  stats: DashboardStats;
  recentOrders: AdminOrder[];
  activeDrivers: AdminDriver[];
}> {
  const [statsData, recentOrdersData, activeDriversData] = await Promise.all([
    axiosClient
      .get(`/admin/dashboard/stats`)
      .then((res) => res.data)
      .catch(() => ({ totalUsers: 0, totalDrivers: 0, ordersToday: 0 })),
    axiosClient
      .get(`/admin/dashboard/recent-orders`)
      .then((res) => res.data)
      .catch(() => []),
    axiosClient
      .get(`/admin/dashboard/active-drivers`)
      .then((res) => res.data)
      .catch(() => []),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toArray = (v: any): any[] =>
    Array.isArray(v) ? v : v?.data ?? v?.orders ?? v?.drivers ?? [];

  return {
    stats: statsData as DashboardStats,
    recentOrders: toArray(recentOrdersData) as AdminOrder[],
    activeDrivers: toArray(activeDriversData) as AdminDriver[],
  };
}

// Compatibility helpers for current pages (plain endpoints)
export async function adminGetStats(): Promise<DashboardStats> {
  const res = await axiosClient.get(`/admin/stats`);
  return res.data;
}

export async function adminGetRecentOrders(): Promise<AdminOrder[]> {
  const res = await axiosClient.get(`/admin/recent-orders`);
  return res.data;
}

export async function adminGetActiveDrivers(): Promise<AdminDriver[]> {
  const res = await axiosClient.get(`/admin/active-drivers`);
  return res.data;
}

// Analytics API
export type OrdersPoint = { date: string; count: number };
export type EarningsPoint = { week: string; total: number; currency?: string };
export type UsersPoint = { month: string; count: number };
export type DriverPoint = { date: string; online: number; active?: number };

export async function adminGetAnalyticsOrders(params: {
  range: string;
}): Promise<OrdersPoint[] | { data?: OrdersPoint[]; orders?: OrdersPoint[] }> {
  const res = await axiosClient.get(`/admin/analytics/orders`, { params });
  return res.data;
}

export async function adminGetAnalyticsEarnings(params: {
  range: string;
}): Promise<
  EarningsPoint[] | { data?: EarningsPoint[]; earnings?: EarningsPoint[] }
> {
  const res = await axiosClient.get(`/admin/analytics/earnings`, { params });
  return res.data;
}

export async function adminGetAnalyticsUsers(params: {
  range: string;
}): Promise<UsersPoint[] | { data?: UsersPoint[]; users?: UsersPoint[] }> {
  const res = await axiosClient.get(`/admin/analytics/users`, { params });
  return res.data;
}

export async function adminGetAnalyticsDrivers(params: {
  range: string;
}): Promise<DriverPoint[] | { data?: DriverPoint[]; drivers?: DriverPoint[] }> {
  const res = await axiosClient.get(`/admin/analytics/drivers`, { params });
  return res.data;
}

// Orders API
export type AdminOrdersListItem = {
  id: string | number;
  type: string;
  status: string;
  userName?: string | null;
  driverName?: string | null;
  pickup?: string | null;
  dropoff?: string | null;
  amount: number;
  createdAt: string;
};

export async function adminGetOrders(params: {
  type?: string;
  status?: string;
  q?: string;
  userId?: string | number;
  driverId?: string | number;
  page?: number;
  limit?: number;
}): Promise<
  | {
      data: AdminOrdersListItem[];
      total?: number;
      page?: number;
      pageSize?: number;
    }
  | AdminOrdersListItem[]
> {
  const res = await axiosClient.get(`/admin/orders`, { params });
  return res.data;
}

export type AdminOrderDetail = {
  id: string | number;
  type: string;
  status: string;
  amount: number;
  currency?: string | null;
  user?: {
    id: string | number;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
  } | null;
  driver?: {
    id: string | number;
    name?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    vehicle?: string | null;
  } | null;
  pickup?: string | null;
  dropoff?: string | null;
  pickupLat?: number | null;
  pickupLng?: number | null;
  dropoffLat?: number | null;
  dropoffLng?: number | null;
  payment?: {
    method?: string | null;
    status?: string;
    paidAt?: string | null;
    reference?: string | null;
    fee?: number | null;
    total?: number | null;
    currency?: string | null;
  } | null;
  createdAt: string;
  updatedAt?: string | null;
  assignedAt?: string | null;
  startedAt?: string | null;
  deliveredAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
};

export async function adminGetOrder(
  id: string | number
): Promise<AdminOrderDetail | { order: AdminOrderDetail }> {
  const res = await axiosClient.get(`/admin/orders/${id}`);
  return res.data;
}

export async function adminCancelOrder(id: string | number): Promise<void> {
  const res = await axiosClient.post(`/admin/orders/${id}/cancel`);
  return res.data;
}

export async function adminAssignDriver(
  orderId: string | number,
  driverId: string | number | string
): Promise<void> {
  const res = await axiosClient.post(`/admin/orders/${orderId}/assign-driver`, {
    driverId,
  });
  return res.data;
}
