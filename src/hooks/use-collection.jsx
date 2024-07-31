import { staticToken, createDirectus, realtime } from "@directus/sdk";
import { useEffect } from "react";

const url = "https://admin.qnsport.vn/websocket";
const access_token = "6rYHvFJ2LRtR3Qg7DrhJK-_MTQGsBYnr";

const cache = new Map();
// cache list subcriber

const connection = createDirectus(url)
  .with(staticToken(access_token))
  .with(realtime());
connection.connect();
let id = null;

export const useCollection = (event, collection, cb) => {
  const key = `${event}-${collection}`;

  const current = cache.get(key);
  const listSub = current?.cbs || [];

  useEffect(() => {
    return () => {
      connection.sendMessage({
        type: "unsubscribe",
        uid: "identifier",
      });
    };
  }, []);
};
