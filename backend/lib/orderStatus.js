export const ORDER_STATUSES = ["pending", "processing", "completed", "cancelled"];

/** @deprecated legacy status from older orders */
export const LEGACY_ORDER_STATUSES = ["ordered", "done"];

export function isAwaitingPayment(order) {
  const status = order.status;
  return (status === "pending" || status === "ordered") && !order.paidAt;
}

export function normalizeOrderStatus(status) {
  if (status === "ordered") return "pending";
  if (status === "done") return "completed";
  return status;
}

export function isPaidOrder(order) {
  if (order.paidAt) return true;
  const status = normalizeOrderStatus(order.status);
  return status === "processing" || status === "completed";
}
