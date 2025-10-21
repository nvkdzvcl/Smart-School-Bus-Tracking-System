import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Gộp className an toàn, ưu tiên Tailwind khi trùng lặp.
 * Ví dụ: cn("p-2", condition && "bg-red-500") => "p-2 bg-red-500"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
