import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const url = "https://admin.qnsport.vn/websocket";
export const access_token = "6rYHvFJ2LRtR3Qg7DrhJK-_MTQGsBYnr";