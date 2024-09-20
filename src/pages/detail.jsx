import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button-hero.jsx";
import { PresentationChartBarIcon } from "@heroicons/react/24/outline";
import OCRComponent from "@/modules/order/screen";
import { mode } from "@/lib/config";
import useSWR from "swr";
import { useParams, Link } from "react-router-dom";
import { LoadingPage } from "@/components/widget/loading";
import { cn } from "@/lib/utils";
import { useCompany } from "@/hooks/use-company";
import { useAuth } from "@/hooks/use-auth";
import { useOdersIsNotPaid } from "@/hooks/use-order";
import AxiosClient from "@/lib/api/axios-client";
import ModalRemind from "@/modules/order/components/remind";
import EditCompany from "@/modules/order/screen/config";
import MarqueeChat from "@/modules/chat/screen/real-chat";
import useMessage from "@/modules/chat/helper/use-message";
import { ClientSideSuspense, RoomProvider } from "@liveblocks/react/suspense";
import BoxCursor from "@/modules/order/components/box-cursor";
import { Environment, OrbitControls, Outlines, useAnimations, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshStandardMaterial } from "three";

const GroupButtonHero = () => {
  const onScroll = () => {
    const menu = document.getElementById("menu");
    menu.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="flex flex-col flex-wrap md:flex-row items-center gap-6 mt-6 md:mt-16">
      <Button className="whitespace-nowrap" variant="default" size="default" onClick={onScroll}>
        Lết xuống menu
      </Button>

      <Link to="/report?week=this_week" className="text-[#218d7f] hover:text-[#34756c]">
        <Button
          variant="outline"
          size="default"
          className="flex whitespace-nowrap items-center gap-2 border-[1px] border-[#188E7E]"
        >
          <PresentationChartBarIcon className="w-4 h-4" />
          Báo cáo
        </Button>
      </Link>
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
      <EditCompany />
      <div className="">
        <MarqueeChat />
        <div className="-translate-y-1.5 relative flex items-center justify-center md:pt-0 ">
          <img className="w-full absolute top-0 left-0 h-full object-cover" src="/hero.png" alt="" />

          <div className="root-wrapper w-full py-20">
            <div className="flex w-full flex-col-reverse gap-10 md:flex-row items-center justify-between relative">
              <div className="text-left w-full md:w-1/2 relative z-10">
                <h1 className="text-[20px] md:text-3xl font-bold text-black text-center md:text-left">{company?.name}</h1>
                <h6 className="italic mt-2 text-gray-400 text-center md:text-left">{company?.address}</h6>
                <div className="mt-6 text-gray-700 hidden md:block pr-40 text-center md:text-left">{company?.description}</div>
                <GroupButtonHero />
              </div>
              <div className="relative w-full md:w-1/2 h-[400px]">
                <div className="absolute bottom-0 -translate-x-1/2 w-96 left-1/2 h-2 rounded-md bg-red-400 blur-md"></div>
                <div className="absolute top-1/2 left-1/2 w-screen lg:w-full -translate-y-1/2 -translate-x-1/2 aspect-square">
                  <iframe
                  className="mb-32"
                    src="https://my.spline.design/roomrelaxingcopy-ace6cfcc6449daeed47bc7128c8b3829/"
                    // src="https://my.spline.design/littleworldkawaiipigcopy-d724a97745e7299502f798f6251394f0/"
                    frameborder="0"
                    
                    id="hihi"
                    width="100%"
                    height="100%"
                  ></iframe>
                </div>
                <div className="absolute bottom-3 pointer-events-none -right-10 w-52 h-10 rounded-md bg-white z-10 backdrop-blur-sm flex items-center justify-center shadow-lg font-semibold">
                  NGỌC NHẤT COPY
                </div>
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
      </div>

      <OCRComponent />
      <ModalRemind />
    </div>
  );
};

const Wrap = () => {
  const { providerId, companyId } = useParams();
  const { data: provider, isLoading: isLoadingProvider } = useSWR("/items/bulk_food_provider/" + providerId);
  const { data: company, isLoading: isLoadingCompany } = useSWR("/items/company/" + companyId);
  const { isLoading: isLoadingOrderHistory } = useOdersIsNotPaid();
  const { isLoading: isLoadingUseCompany } = useCompany();
  const { isLoading: isLoadingMessage } = useMessage();
  const existProvider = provider?.data;
  const existCompany = company?.data;
  if (isLoadingCompany || isLoadingProvider || isLoadingOrderHistory || isLoadingUseCompany || isLoadingMessage)
    return <LoadingPage />;
  if (!existProvider || !existCompany)
    return (
      <div className="text-center h-screen flex items-center justify-center text-3xl">
        Không tồn tại nhà hàng hoặc nhà cung cấp
      </div>
    );
  return (
    <>
      <RoomProvider id={companyId}>
        <ClientSideSuspense fallback={<LoadingPage />}>
          <BoxCursor>
            <Order />
          </BoxCursor>
        </ClientSideSuspense>
      </RoomProvider>
    </>
  );
};

export default Wrap;

function Model({ outlines, ...props }) {
  const { nodes, materials, scene } = useGLTF("/modal.gltf");
  // modal.gltf /jump-transformed.glb

  return <primitive object={scene} scale={0.7} />;
}

function Sphere({ outlines, ...props }) {
  return (
    <mesh castShadow receiveShadow {...props}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial />
      {outlines && <Outlines screenspace thickness={8} />}
    </mesh>
  );
}

// jump-transformed.glb
