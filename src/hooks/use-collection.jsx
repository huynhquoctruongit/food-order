import { staticToken, createDirectus, realtime } from "@directus/sdk";
import { useEffect } from "react";

const url = "https://admin.qnsport.vn/websocket";
const access_token = "DudCvrFf8z2MYcSVfmr4WdzJfK7uHtjZ";

const cache = new Map();
// cache list subcriber

const connection = createDirectus(url).with(staticToken(access_token)).with(realtime());
connection.connect();

export const useCollection = (event, collection, cb) => {
  useEffect(() => {
    return () => {
      connection.sendMessage({
        type: "unsubscribe",
        uid: "identifier",
      });
    };
  }, []);
};
