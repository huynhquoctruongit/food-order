import { connection } from "@/lib/directus";
import { useEffect, useState } from "react";
import { useAuth } from "./use-auth";
import { getCookie } from "react-use-cookie";
let statusConnected = "disconnected";
const useConnection = () => {
  const { isLogin } = useAuth();
  const [status, setStatus] = useState(statusConnected);

  useEffect(() => {
    if (!isLogin) return;
    if (status === "connected") return;

    const cleanup = connection.onWebSocket("message", function (data) {
      if (data.type == "auth" && data.status == "ok") {
        statusConnected = "connected";
        setStatus("connected");
        subscribe("create");
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

    return () => {
      cleanup();
    };
  }, [isLogin]);

  async function subscribe(event) {
    const { subscription } = await connection.subscribe("order", {
      event,
      query: {
        fields: ["*"],
        filter: {
          bulk_food_provider: { _eq: 1 },
          company: { _eq: 1 },
        },
      },
    });

    for await (const message of subscription) {
      console.log("receiveMessage", message);
      // receiveMessage(message);
    }
  }

  return { connection };
};

export default useConnection;
