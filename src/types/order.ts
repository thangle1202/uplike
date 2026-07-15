export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

/** @deprecated legacy statuses in older orders */
export type LegacyOrderStatus = "ordered" | "done";

export type AnyOrderStatus = OrderStatus | LegacyOrderStatus;

export function normalizeOrderStatus(status: string): OrderStatus {
  if (status === "ordered") return "pending";
  if (status === "done") return "completed";
  return status as OrderStatus;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[normalizeOrderStatus(status)] ?? status;
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
};

export function getOrderStatusColor(status: string): string {
  return ORDER_STATUS_COLORS[normalizeOrderStatus(status)] ?? "bg-gray-100 text-gray-600";
}

export function isAwaitingPayment(order: { status: string; paidAt?: string | null }): boolean {
  const status = normalizeOrderStatus(order.status);
  return status === "pending" && !order.paidAt;
}

export function isOrderPaid(order: { status: string; paidAt?: string | null }): boolean {
  if (order.paidAt) return true;
  const status = normalizeOrderStatus(order.status);
  return status === "processing" || status === "completed";
}

export interface User {
  id: string;
  email: string;
  name: string;
  walletBalance: number;
  role: "user" | "admin";
  createdAt: string;
}

export interface Deposit {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  note?: string;
  transferCode: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  processedAt?: string;
}

export interface AdminStats {
  orders: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    today: number;
    month: number;
    wallet: number;
    guest: number;
  };
  users: {
    total: number;
    admins: number;
  };
  deposits: {
    pending: number;
    pendingAmount: number;
    approvedTotal: number;
  };
}

export interface PaymentQR {
  orderId: string;
  totalAmount: number;
  qrPayload: string;
  bank: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    transferNote: string;
  };
}
