import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SWRConfig } from "swr";
import { fetcherClient } from "./lib/api/axios-client";
import Report from "@/pages/report";
import { Toaster } from "@/components/ui/toaster";

import MainPage from "./pages";

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
                <Route element={<MainPage />} path="/" />
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
