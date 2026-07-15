export type OrderStatus = "ordered" | "processing" | "done" | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  ordered: "Chờ thanh toán",
  processing: "Đang xử lý",
  done: "Hoàn thành",
  cancelled: "Đã hủy",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  ordered: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  done: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
};

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
    ordered: number;
    processing: number;
    done: number;
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
