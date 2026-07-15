export interface ServiceServer {
  id: string;
  name: string;
  pricePerUnit: number;
  status: "active" | "maintenance";
  description: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  requiresUrl: boolean;
  requiresComments: boolean;
  urlLabel: string;
  urlPlaceholder: string;
  pricePerUnit: number;
  minQuantity: number;
  maxQuantity: number;
  unit: string;
  servers?: ServiceServer[];
  instructions?: string[];
  warning?: string;
}

export interface Platform {
  id: string;
  name: string;
  color: string;
  description: string;
  services: Service[];
}

export interface OrderItem {
  platformId: string;
  platformName: string;
  serviceId: string;
  serviceName: string;
  serverId: string;
  serverName: string;
  url: string;
  quantity: number;
  pricePerUnit: number;
  requiresComments: boolean;
  comments: string[];
  unit: string;
}

export interface Order {
  id: string;
  userId?: string | null;
  items: OrderItem[];
  contact: string;
  note?: string;
  status: import("./order").OrderStatus;
  paymentMethod?: "guest_qr" | "wallet" | null;
  totalAmount: number;
  paidAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export function getServiceServers(service: Service): ServiceServer[] {
  if (service.servers?.length) return service.servers;

  const base = service.pricePerUnit;
  return [
    {
      id: "sv1",
      name: `Server 1: ${service.name} VN`,
      pricePerUnit: base,
      status: "active",
      description: "Tài khoản Việt Nam, tốc độ ổn định, chất lượng cao",
    },
    {
      id: "sv2",
      name: `Server 2: ${service.name} quốc tế`,
      pricePerUnit: Math.round(base * 0.85),
      status: "active",
      description: "Tài khoản quốc tế, giá tốt, phù hợp đơn lớn",
    },
    {
      id: "sv3",
      name: `Server 3: ${service.name} VIP`,
      pricePerUnit: Math.round(base * 1.2),
      status: "active",
      description: "Tài khoản real, tỷ lệ giữ cao, ưu tiên xử lý nhanh",
    },
    {
      id: "sv4",
      name: `Server 4: ${service.name} siêu tốc`,
      pricePerUnit: Math.round(base * 1.5),
      status: "active",
      description: "Tốc độ cao, bắt đầu trong 5–15 phút",
    },
    {
      id: "sv5",
      name: `Server 5: ${service.name} tiết kiệm`,
      pricePerUnit: Math.round(base * 0.7),
      status: "active",
      description: "Giá rẻ nhất, tốc độ chậm hơn, phù hợp test",
    },
    {
      id: "sv6",
      name: `Server 6: ${service.name} premium`,
      pricePerUnit: Math.round(base * 1.35),
      status: "active",
      description: "Chất lượng premium, ít drop, hỗ trợ bảo hành",
    },
    {
      id: "sv7",
      name: `Server 7: ${service.name} mix`,
      pricePerUnit: Math.round(base * 0.95),
      status: "maintenance",
      description: "Server đang bảo trì, vui lòng chọn server khác",
    },
    {
      id: "sv8",
      name: `Server 8: ${service.name} global`,
      pricePerUnit: Math.round(base * 0.9),
      status: "active",
      description: "Nguồn global đa quốc gia, ổn định 24/7",
    },
  ];
}

export function getServiceIcon(serviceId: string): string {
  if (serviceId.includes("like")) return "like";
  if (serviceId.includes("follow") || serviceId.includes("subscriber")) return "follow";
  if (serviceId.includes("comment")) return "comment";
  if (serviceId.includes("view")) return "view";
  if (serviceId.includes("share")) return "share";
  return "default";
}
