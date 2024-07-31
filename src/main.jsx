import React, { useEffect, useMemo } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SWRConfig } from "swr";
import { fetcherClient } from "./libs/api/axios-client";
import Report from "@/pages/report";
import { Toaster } from "@/components/ui/toaster";
import Profile from "@/modules/info-user";
import { Button } from "./components/ui/button-hero.jsx";
import { SquaresPlusIcon } from "@heroicons/react/24/outline";

const GroupButtonHero = () => {
  const onScroll = () => {
    const menu = document.getElementById("menu");
    menu.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    console.log("render");
  }, []);
  return (
    <div className="flex items-center gap-6 mt-16">
      <Button variant="default" size="default" onClick={onScroll}>
        Lết xuống menu
      </Button>
      <Button
        variant="secondary"
        size="default"
        className="flex items-center gap-2"
      >
        Thêm menu
        <SquaresPlusIcon className="w-4 h-4" />
      </Button>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
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
            <div>
              <div className="flex items-center justify-between root-wrapper py-3">
                <h1 className="font-bold text-xl">
                  ĐẶT CƠM VĂN PHÒNG LÒNG VÒNG
                </h1>
                {/* <div className="">
                <div className="root-wrapper flex items-center gap-[20px] py-[10px]">
                  <Link to="/">
                    <p className="cursor-pointer text-white">Đặt cơm</p>
                  </Link>
                  <Link to="/report?week=thisWeek">
                    <p className="cursor-pointer text-white">Báo cáo</p>
                  </Link>
                </div>
              </div> */}
                <Profile />
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <img
                className="w-full object-contain aspect-[4/1]"
                src="/hero.png"
                alt=""
              />

              <div className="absolute root-wrapper w-full flex items-center justify-between">
                <div className="text-left">
                  <h1 className="text-xl font-bold text-black">
                    APP ĐẶT CƠM TOP #1 Việt Nam
                  </h1>
                  <div className="mt-6 text-gray-700">
                    Chúng tôi mang đến cho các bạn trải nghiệm 5 SAO <br /> như
                    các nhà hàng cao cấp Á Âu Châu Phi...
                  </div>
                  <GroupButtonHero />
                </div>
                <img
                  className="w-[512px] aspect-[512/256]"
                  src="/have-a-nice-day.png"
                  alt=""
                />
              </div>
            </div>

            <Routes>
              <Route
                element={
                  <>
                    <App />
                  </>
                }
                path="/"
              />
              <Route
                element={
                  <>
                    <Report />
                  </>
                }
                path="/report"
              />

              {/* <Route element={<PrivateRoute />} path="*" /> */}
            </Routes>
          </BrowserRouter>
          <Toaster />
        </div>
      </div>
    </SWRConfig>
  </React.StrictMode>
);
