import { connection } from "@/lib/directus";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./use-auth";
import { getCookie } from "react-use-cookie";
import { create } from "zustand";
import _ from "lodash";
let statusConnected = "disconnected";

const useStatusConnection = create((set) => ({
  status: "disconnected",
  setStatus: (status) => set({ status }),
}));

const useConnection = () => {
  const { isLogin } = useAuth();
  const { status, setStatus } = useStatusConnection();

  useEffect(() => {
    if (!isLogin) return;
    if (status === "connected" || statusConnected !== "disconnected") return;
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
    statusConnected = "connecting";
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

const createSubscribe = async (event, collection, fields, filter, callback) => {
  const key = event + collection + JSON.stringify(filter);
  const { subscription, unsubscribe } = await connection.subscribe(collection, {
    event,
    query: {
      fields: fields || ["*"],
      filter,
    },
  });
  cache.keys[key] = { subscription, unsubscribe };
  for await (const message of subscription) {
    console.log("hihi");
    callback.current(message);
  }
  return unsubscribe;
};

export const useSubscribe = (event, collection, fields, filter, callback) => {
  const key = event + collection + JSON.stringify(filter);
  const { connection, status } = useConnection();

  useEffect(() => {
    const handler = cache.keys[key];

    if (!event || !collection || !filter || !callback) return;
    if (!connection || status !== "connected" || handler) return;

    createSubscribe(event, collection, fields, filter, callback);
    return () => {
      cache.keys[key]?.unsubscribe();
      cache.keys[key] = null;
    };
  }, [status]);
};

export default useConnection;
