import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SWRConfig } from "swr";
import { AxiosAPI, fetcherClient } from "./libs/api/axios-client";
import Report from "@/pages/report";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import Profile from "@/modules/info-user";
import { Button } from "./components/ui/button-hero.jsx";
import { SquaresPlusIcon } from "@heroicons/react/24/outline";
import { access_token, cn } from "./lib/utils";
import { Loader2Icon } from "lucide-react";
import Tesseract from "tesseract.js";
import useMenu from "./hooks/use-menu";
import dayjs from "dayjs";
import { useLocalStorage } from "usehooks-ts";

const GroupButtonHero = () => {
  const [loading, setLoading] = useState();
  const [user, _] = useLocalStorage("user", {});
  const onScroll = () => {
    const menu = document.getElementById("menu");
    menu.scrollIntoView({ behavior: "smooth" });
  };
  const { mutate } = useMenu();
  const { toast } = useToast();
  const handleFileChange = async (event) => {
    if (user.fullname !== "Hồng Phạm") {
      toast({
        variant: "destructive",
        title: "Không có quyền !",
        description: "Có phải chị Hồng đó không ta :)))",
      });
    } else {
      const file = event.target.files[0];
      if (file) {
        const newFormData = new FormData();
        newFormData.append("file", file);
        const imageUpload = await AxiosAPI.post("/files", newFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: "Bearer " + access_token,
          },
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          recognizeText(reader.result, imageUpload);
        };
        setLoading(true);
        reader.readAsDataURL(file);
      }
    }
  };

  const recognizeText = (imageBase64, imageUpload) => {
    Tesseract.recognize(
      imageBase64,
      "vie+eng" // Chỉ định mã ngôn ngữ là 'vie+eng' cho tiếng Việt và tiếng Anh
    )
      .then(({ data: { text } }) => {
        processText(text, imageUpload);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const processText = async (text, imageUpload) => {
    const startIndex = text.toLowerCase().indexOf("có");
    if (startIndex !== -1) {
      text = text.substring(startIndex + 2);
    }
    const arr = generateText(text);
    const now = dayjs().add(7, "hour");
    const utcTime = now.utc().format();
    const params = {
      extract_menus: arr,
      image: imageUpload.data.data.id,
      date_created: utcTime,
    };
    await AxiosAPI.post("/items/menus", params);
    mutate();
  };
  const generateText = (text) => {
    text = text.replaceAll("#", "");
    text = text.replaceAll("14", "4");
    text = text.replaceAll(",", ".");
    text = text.replaceAll("CƠM CHAY", "(CƠM CHAY) - ");
    text = text.replaceAll("Cơm chay", "(CƠM CHAY) - ");
    text = text.replaceAll("cơm chay", "(CƠM CHAY) - ");

    let lines = text.split("\n");
    let arr = [];
    let currentMeal = "";
    let filteredArr = lines.filter(
      (item) => item !== "" && item !== "." && !/^\d+$/.test(item)
    );
    for (let line of filteredArr) {
      if (/^\d+[.,]?\s*(.*)$/.test(line.trim())) {
        if (currentMeal !== "") {
          arr.push(currentMeal.trim());
        }
        currentMeal = line.trim();
      } else {
        currentMeal += " " + line.trim();
      }
    }

    if (currentMeal !== "") {
      arr.push(currentMeal.trim());
    }

    return arr;
  };
  return (
    <div className="flex flex-col md:flex-row items-center gap-6 mt-6 md:mt-16">
      <Button variant="default" size="default" onClick={onScroll}>
        Lết xuống menu
      </Button>
      <input
        type="file"
        id="files"
        className="hidden"
        onChange={handleFileChange}
      />

      <Button variant="secondary" size="default" className="relative">
        <span className="flex items-center gap-2 opacity-0 ">
          Thêm menu{" "}
          {loading ? (
            <Loader2Icon className="w-4 h-4 animate-spin" />
          ) : (
            <SquaresPlusIcon className="w-4 h-4" />
          )}
        </span>
        <label
          className="absolute top-0 left-0 py-2 px-4 w-full flex items-center gap-2 cursor-pointer"
          htmlFor="files"
        >
          Thêm menu
          {loading ? (
            <Loader2Icon className="w-4 h-4 animate-spin" />
          ) : (
            <SquaresPlusIcon className="w-4 h-4" />
          )}
        </label>
      </Button>
    </div>
  );
};

let isPlaying = false;
const MainApp = () => {
  const [play, setPlay] = useState(false);
  useEffect(() => {
    if (isPlaying) return;
    const audio = new Audio("/audio.mp3");
    audio.volumn = 0.5;
    document.addEventListener("click", function () {
      if (isPlaying) return;
      setPlay(true);
      audio.play();
      isPlaying = true;
    });
  }, []);
  const onClick = () => {
    const audio = document.getElementById("audio");
    if (play) audio.pause();
    else audio.play();
    setPlay(!play);
  };
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
              <div>
                <div className="flex items-center justify-between text-black root-wrapper py-3">
                  <h1 className="font-bold text-sm md:text-xl" id="logo">
                    NƯỚC{" "}
                    <span className="font-black bg-gradient-to-r from-[#E5624D] drop-shadow-md to-[#FA9382] text-transparent bg-clip-text">
                      XẾ CHIỀU TÀ
                    </span>
                  </h1>
                  <Profile />
                </div>
              </div>
              <div className="relative flex items-center justify-center md:pt-0 min-h-[calc(100vh-56px)] md:min-h-fit">
                <img
                  className="w-full h-[calc(100vh-56px)] md:h-full object-cover md:object-contain aspect-square md:aspect-[4/1]"
                  src="/hero.png"
                  alt=""
                />
                <div className="absolute root-wrapper w-full">
                  <div className="flex flex-col-reverse gap-10 md:flex-row items-center justify-between relative">
                    <div className="text-left">
                      <h1 className="text-[20px] md:text-3xl font-bold text-black text-center">
                        APP ĐẶT CƠM {" "}
                        <br className="md:hidden" />
                        <br className="md:hidden" />
                        TOP #1 Việt Nam
                      </h1>
                      <div className="mt-6 text-gray-700 hidden md:block">
                        Một miếng khi đói bằng một gói khi no lòi họng. <br />
                        Ông kẹ sẽ bắt các bạn ăn cơm còn thừa
                      </div>
                      <GroupButtonHero />
                    </div>
                    <img
                      className="w-[512px] aspect-[512/256]"
                      src="/have-a-nice-day.png"
                      alt=""
                    />
                    <img
                      onClick={onClick}
                      className={cn(
                        "w-12 h-12 absolute top-0 right-0 cursor-pointer hover:shadow-button rounded-full",
                        play ? "animate-spin" : ""
                      )}
                      src="/audio.png"
                      alt=""
                    />
                  </div>
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
};
ReactDOM.createRoot(document.getElementById("root")).render(<MainApp />);
