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
    if (status !== "disconnected") return;

    connection
      .connect()
      .then(() => {
        setStatus("connected");
        connection.sendMessage({ type: "auth", access_token: getCookie("auth_token") });
        statusConnected = "connected";
      })
      .catch((error) => {
        console.log("Error: ", error);
        setStatus("disconnected");
      });
  }, [isLogin]);
  return { connection };
};

export default useConnection;
