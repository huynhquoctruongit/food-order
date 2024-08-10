import { authentication, createDirectus, rest } from "@directus/sdk";
import { cms } from "./config";

export const directus = createDirectus(cms)
  .with(authentication("cookie", { credentials: "include", autoRefresh: true }))
  .with(rest());
