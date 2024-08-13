import { cms } from "./config";

export function getHostname() {
  const href = location.hostname;
  if (href.indexOf("youpass") > -1) {
    return ".vercel.vn";
  } else {
    return "localhost";
  }
}

export const createImage = (id, width, placeholder) => {
  if (!id) return placeholder || "";
  const domain = cms;
  return domain + "/assets/" + id + "?width=" + width;
};

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}