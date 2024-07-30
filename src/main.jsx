import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SWRConfig } from "swr";
import { fetcherClient } from "./libs/api/axios-client";
import Report from "@/pages/report";
import { Link } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Profile from "@/modules/info-user";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SWRConfig
      value={{
        revalidateIfStale: false,
        revalidateOnFocus: false,
        fetcher: fetcherClient,
      }}
    >
      <div className="bg-[url(/background.png)] bg-contain">
        <BrowserRouter>
          <div>
            <div className="flex items-center justify-between root-wrapper py-3">
              <h1 className="font-bold text-xl mb-[20px]">
                ĐẶT CƠM VĂN PHÒNG LÒNG VÒNG
              </h1>
              <div className="">
                <div className="root-wrapper flex items-center gap-[20px] py-[10px]">
                  <Link to="/">
                    <p className="cursor-pointer text-white">Đặt cơm</p>
                  </Link>
                  <Link to="/report?week=thisWeek">
                    <p className="cursor-pointer text-white">Báo cáo</p>
                  </Link>
                </div>
              </div>
              <Profile />
            </div>
          </div>

          <Routes>
            <Route
              element={
                <>
                  <App />
                  <Toaster> </Toaster>
                </>
              }
              path="/"
            />
            <Route
              element={
                <>
                  <Toaster></Toaster>
                  <Report />
                </>
              }
              path="/report"
            />

            {/* <Route element={<PrivateRoute />} path="*" /> */}
          </Routes>
        </BrowserRouter>
      </div>
    </SWRConfig>
  </React.StrictMode>
);
