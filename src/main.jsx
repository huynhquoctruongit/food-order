import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { SWRConfig } from "swr";
import { fetcherClient } from "@/lib/api/axios-client";
import Report from "@/pages/report/index";
import { Toaster } from "@/components/ui/toaster";
import Order from "./pages/detail";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import MainPage from "./pages";
import ModalLogin from "./modules/auth/screen/login";
import "./index.css";
import Header from "./components/widget/header";
import isoWeek from "dayjs/plugin/isoWeek";
import { TooltipProvider } from "@/components/ui/tooltip";
import ReportByAdmin from "./pages/report/report-by-admin";
import Relax from "./modules/relax/screen";
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react/suspense";
import Widgets from "./modules/chat/screen";

dayjs.extend(isoWeek);
dayjs.extend(utc);

const publicApiKey = "pk_prod_2oVxL3i1hs4YnjgBRzAvH3-G9GLo1e2HWjVS7NUf3oPEsn1mpfJVpkaHuguE4VMC";

const Layout = ({ children }) => {
  return (
    <>
      <Outlet />
      <Toaster />
      <ModalLogin />
      <Widgets />
    </>
  );
};
const MainApp = () => {
  return (
    // <React.StrictMode>
    <LiveblocksProvider publicApiKey={publicApiKey} initialPresence={{ profile: "", id: "", avatar: "" }}>
      <SWRConfig
        value={{
          revalidateIfStale: false,
          revalidateOnFocus: false,
          fetcher: fetcherClient,
        }}
      >
        <TooltipProvider>
          <BrowserRouter>
            <div className="text-primary bg-[url(/background.png)] bg-contain text-left overflow-hidden min-h-[100vh] flex flex-col">
              <Header />
              <div className="bg-white/40 flex-1 relative text-gray-700">
                <Routes>
                  <Route element={<Layout />}>
                    <Route element={<Order />} path="/company/:companyId/provider/:providerId" />
                    <Route element={<ReportByAdmin />} path="/admin-report" />
                    <Route element={<Report />} path="/report" />
                    <Route element={<Relax />} path="/relax" />
                    <Route element={<MainPage />} path="/" />
                  </Route>
                </Routes>
              </div>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </SWRConfig>
    </LiveblocksProvider>
  );
};
ReactDOM.createRoot(document.getElementById("root")).render(<MainApp />);
