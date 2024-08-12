import { connection } from "@/lib/directus";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./use-auth";
import { getCookie } from "react-use-cookie";
import _ from "lodash";
let statusConnected = "disconnected";
const useConnection = () => {
  const { isLogin } = useAuth();
  const [status, setStatus] = useState(statusConnected);
  console.log(statusConnected);

  useEffect(() => {
    if (!isLogin) return;
    if (status === "connected" || statusConnected === "connected") return;
    const cleanup = connection.onWebSocket("message", function (data) {
      if (data.type == "auth" && data.status == "ok") {
        statusConnected = "connected";
        setStatus("connected");
      }
      if (data.type == "auth" && data.status == "error") {
        statusConnected = "disconnected";
        setStatus("disconnected");
      }
    });
    connection
      .connect()
      .then((data) => {
        connection.sendMessage({ type: "auth", access_token: getCookie("auth_token") });
      })
      .catch((error) => {
        console.log("Error: ", error);
        statusConnected = "disconnected";
        setStatus("disconnected");
      });

    return () => {};
  }, [isLogin]);
  return { connection, status };
};

const cache = {
  keys: {},
};

const createSubscribe = _.debounce(async (event, collection, filter, callback) => {
  const key = event + collection + JSON.stringify(filter);
  const { subscription, unsubscribe } = await connection.subscribe(collection, {
    event,
    query: {
      fields: ["*"],
      filter,
    },
  });
  cache.keys[key] = { subscription, unsubscribe };
  console.log(cache.keys);

  for await (const message of subscription) {
    callback.current(message);
  }
  return unsubscribe;
}, 100);

export const useSubscribe = (event, collection, filter, callback) => {
  const key = event + collection + JSON.stringify(filter);
  const { connection, status } = useConnection();

  useEffect(() => {
    const handler = cache.keys[key];

    if (!event || !collection || !filter || !callback) return;
    if (!connection || status !== "connected" || handler) return;

    createSubscribe(event, collection, filter, callback);
    return () => {
      cache.keys[key]?.unsubscribe();
      cache.keys[key] = null;
    };
  }, [status]);
};

export default useConnection;
