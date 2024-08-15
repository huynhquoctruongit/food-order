import ReactDOM from "react-dom/client";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SWRConfig } from "swr";
import { fetcherClient } from "@/lib/api/axios-client";
import Report from "@/pages/report";
import { Toaster } from "@/components/ui/toaster";
import Order from "./pages/detail";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import MainPage from "./pages";
import ModalLogin from "./modules/auth/screen/login";
dayjs.extend(utc);
import "./index.css";
import Header from "./components/widget/header";

const MainApp = () => {
  return (
    // <React.StrictMode>
    <SWRConfig
      value={{
        revalidateIfStale: false,
        revalidateOnFocus: false,
        fetcher: fetcherClient,
      }}
    >
      <BrowserRouter>
        <div className="text-primary bg-[url(/background.png)] bg-contain text-left overflow-hidden min-h-[100vh] flex flex-col">
          <Header />
          <div className="bg-white/40 flex-1 relative">
            <Routes>
              <Route element={<Order />} path="/company/:companyId/provider/:providerId" />
              <Route element={<Report />} path="/report" />
              <Route element={<MainPage />} path="/" />
            </Routes>

            <Toaster />
            <ModalLogin />
          </div>
        </div>
      </BrowserRouter>
    </SWRConfig>
    // </React.StrictMode>
  );
};
ReactDOM.createRoot(document.getElementById("root")).render(<MainApp />);
