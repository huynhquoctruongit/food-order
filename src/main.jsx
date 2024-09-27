import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet, useSearchParams, useNavigate } from "react-router-dom";
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
import Debtor from "./modules/debtor/screen";
import Home from "./modules/home/screen";
import { useAuth } from "./hooks/use-auth";
import { useEffect } from "react";
import Background from "./modules/home/component/local";

dayjs.extend(isoWeek);
dayjs.extend(utc);

// const publicApiKey = "pk_prod_2oVxL3i1hs4YnjgBRzAvH3-G9GLo1e2HWjVS7NUf3oPEsn1mpfJVpkaHuguE4VMC";
export const publicApiKey = "pk_dev_uoTGKQGMLG3uDQB7VCdsooAq1zaBjg7Wz6G35hzvgiWeGEnnrkbMr8BwaFh9x_ts";

const Layout = () => {
  const { isLogin } = useAuth();
  const [query, setQuery] = useSearchParams();
  const callback = query.get("callback");
  const navigate = useNavigate();
  useEffect(() => {
    console.log(callback);

    if (callback) {
      navigate(callback);
    }
  }, [callback, isLogin]);

  return (
    <>
      <Outlet />
      <ModalLogin />
      {isLogin && (
        <>
          <Toaster />
        </>
      )}
    </>
  );
};
const MainApp = () => {
  return (
    <SWRConfig
      value={{
        revalidateIfStale: false,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        fetcher: fetcherClient,
      }}
    >
      <TooltipProvider>
        <Background />
        <BrowserRouter>
          {/* bg-[url(/background.png)] */}
          <div className="text-primary bg-contain text-left overflow-hidden min-h-[100vh] flex flex-col">
            <Header />
            <div className="bg-white/40 flex-1 relative text-gray-700">
              <Routes>
                <Route element={<Layout />}>
                  <Route element={<Order />} path="/company/:companyId/provider/:providerId" />
                  <Route element={<ReportByAdmin />} path="/admin-report" />
                  <Route element={<Report />} path="/report" />
                  <Route element={<Relax />} path="/relax" />
                  <Route element={<Debtor />} path="/company/:companyId/debtor" />
                  <Route element={<Home />} path="/" />
                </Route>
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </SWRConfig>
  );
};
ReactDOM.createRoot(document.getElementById("root")).render(<MainApp />);
