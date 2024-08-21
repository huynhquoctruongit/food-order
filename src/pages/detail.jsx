import { useEffect, useRef, useState } from "react";
import Profile from "@/modules/info-user";
import { Button } from "@/components/ui/button-hero.jsx";
import { SquaresPlusIcon } from "@heroicons/react/24/outline";
import { Loader2Icon } from "lucide-react";
import OCRComponent from "@/modules/order/screen";
import { mode } from "@/lib/config";
import useSWR from "swr";
import { useNavigate, useParams, Link } from "react-router-dom";
import { LoadingPage } from "@/components/widget/loading";
import CreateMenu from "@/modules/order/screen/create-menu";
import { cn } from "@/lib/utils";
import { useCompany } from "@/hooks/use-company";
import { useAuth } from "@/hooks/use-auth";
import AxiosClient from "@/lib/api/axios-client";

const GroupButtonHero = () => {
  const [loading, setLoading] = useState();
  const refMenu = useRef();
  const onScroll = () => {
    const menu = document.getElementById("menu");
    menu.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="flex flex-col md:flex-row items-center gap-6 mt-6 md:mt-16">
      <Button variant="default" size="default" onClick={onScroll}>
        Lết xuống menu
      </Button>

      <Button variant="secondary" size="default" className="relative" onClick={() => refMenu.current.setOpen(true)}>
        <span className="flex items-center gap-2 ">
          Thêm menu <SquaresPlusIcon className="w-4 h-4" />
        </span>
      </Button>
      <Link to="/report?week=this_week">
        <Button variant="secondary" size="default">
          Báo cáo
        </Button>
      </Link>
      <CreateMenu refMenu={refMenu} />
    </div>
  );
};

let isPlaying = false;
const listHaveANiceDay = ["/have-a-nice-day.png", "/have-a-nice-day-1.png", "/have-a-nice-day-2.png"];
const Order = () => {
  const { company } = useCompany();
  const [play, setPlay] = useState(false);
  const { profile } = useAuth();
  useEffect(() => {
    const audio = document.getElementById("audio");
    audio.volumn = 0.5;
    document.addEventListener("click", function () {
      if (isPlaying || mode === "development") return;
      isPlaying = true;
      setPlay(true);
      audio.play();
    });
    if (profile.company !== company?.id) {
      AxiosClient.patch("/users/me", { company: company?.id });
    }
  }, []);
  const onClick = () => {
    const audio = document.getElementById("audio");
    if (play) audio.pause();
    else audio.play();
    setPlay(!play);
  };

  const imgActive = listHaveANiceDay[Math.floor(Math.random() * listHaveANiceDay.length)];

  return (
    <div>
      <div className="relative flex items-center justify-center md:pt-0 min-h-[calc(100vh-56px)] md:min-h-fit">
        <img
          className="w-full h-[calc(100vh-56px)] md:h-full object-cover md:object-contain aspect-square md:aspect-[4/1]"
          src="/hero.png"
          alt=""
        />

        <div className="absolute root-wrapper w-full">
          <div className="flex flex-col-reverse gap-10 md:flex-row items-center justify-between relative">
            <div className="text-left">
              <h1 className="text-[20px] md:text-3xl font-bold text-black text-left">{company?.name}</h1>
              <h6 className="italic mt-2 text-gray-400">{company?.address}</h6>
              <div className="mt-6  text-gray-700 hidden md:block pr-40">{company?.description}</div>
              <GroupButtonHero />
            </div>
            <div className="relative">
              <img className="w-[512px] aspect-[512/256] object-cover" src={imgActive} alt="" />
            </div>

            <img
              onClick={onClick}
              className={cn(
                "w-12 h-12 absolute top-0 right-0 cursor-pointer hover:shadow-button rounded-full",
                play ? "animate-spin" : "",
              )}
              src="/audio.png"
              alt=""
            />
            <audio id="audio">
              <source src="/audio.mp3" type="audio/mpeg" />
            </audio>
          </div>
        </div>
      </div>
      <OCRComponent />
    </div>
  );
};

const Wrap = () => {
  const { providerId, companyId } = useParams();
  const { data: provider, isLoading: isLoadingProvider } = useSWR("/items/bulk_food_provider/" + providerId);
  const { data: company, isLoading: isLoadingCompany } = useSWR("/items/company/" + companyId);
  const existProvider = provider?.data;
  const existCompany = company?.data;
  if (isLoadingCompany || isLoadingProvider) return <LoadingPage />;
  if (!existProvider || !existCompany)
    return (
      <div className="text-center h-screen flex items-center justify-center text-3xl">
        Không tồn tại nhà hàng hoặc nhà cung cấp
      </div>
    );
  return <Order />;
};

export default Wrap;
