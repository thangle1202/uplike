import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ";
}

export function formatQuantity(quantity: number, unit: string) {
  return `${quantity.toLocaleString("vi-VN")} ${unit}`;
}

/** Parse comments from textarea — one comment per line, empty lines ignored */
export function parseCommentsFromText(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
