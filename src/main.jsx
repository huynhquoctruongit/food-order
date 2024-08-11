import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SWRConfig } from "swr";
import { fetcherClient } from "@/lib/api/axios-client";
import Report from "@/pages/report";
import { Toaster } from "@/components/ui/toaster";
import Order from "./pages/main";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "./index.css";
dayjs.extend(utc);

const MainApp = () => {
  return (
    <React.StrictMode>
      <SWRConfig
        value={{
          revalidateIfStale: false,
          revalidateOnFocus: false,
          fetcher: fetcherClient,
        }}
      >
        <div className="bg-[url(/background.png)] bg-contain text-left">
          <div className="bg-white/40">
            <BrowserRouter>
              <Routes>
                <Route element={<Order />} path="/" />
                <Route element={<Report />} path="/report" />
              </Routes>
            </BrowserRouter>
            <Toaster />
          </div>
        </div>
      </SWRConfig>
    </React.StrictMode>
  );
};
ReactDOM.createRoot(document.getElementById("root")).render(<MainApp />);
