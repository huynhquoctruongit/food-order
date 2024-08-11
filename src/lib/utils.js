import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const url = "https://admin.qnsport.vn/websocket";
export const access_token = "DudCvrFf8z2MYcSVfmr4WdzJfK7uHtjZ";

export const enumFood = [
  "/food1.png",
  "/food2.png",
  "/food3.png",
  "/food4.png",
  "/food5.png",
  "/food6.png",
  "/food7.png",
  "/food8.png",
  "/food9.png",
  "/food10.png",
];
