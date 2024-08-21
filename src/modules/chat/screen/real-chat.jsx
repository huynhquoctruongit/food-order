import AxiosClient from "@/lib/api/axios-client";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { ChevronDown, SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMediaQuery } from "usehooks-ts";
import useMessage from "../helper/use-message";
import { useSubscribe } from "@/hooks/use-connection";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { createImage } from "@/lib/helper";
import dayjs from "dayjs";

const MarqueeChat = () => {
  const { messages } = useMessage();
  if (messages.length === 0) return null;
  return (
    <marquee behavior="scroll" direction="left" scrollamount="10" className="bg-pastel-pink mb-0 pb-0">
      <div className="flex items-center py-3 gap-20 px-10">
        {messages.map((elm, index) => {
          const fullname = elm.user_created?.first_name + " " + elm.user_created?.last_name;
          return (
            <div key={elm.id} className="flex items-center gap-1">
              <div className="rounded-md bg-white/20 p-1 flex items-center px-3 gap-4">
                <img src={createImage(elm.user_created.avatar, 300)} className="min-w-8 w-8 h-8  aspect-square " />
                <div className="text-xs">{fullname}</div>
                {/* <div className={cn("text-[10px] mt-1 text-slate-300 text-right absolute top-full left-0")}>
                    {dayjs(elm.date_created).format("HH:mm:ss")}
                  </div> */}
              </div>

              <div
                dangerouslySetInnerHTML={{ __html: elm.message }}
                className={cn("text-base  w-fit text-white border-gray-300 rounded-md p-2 rounded-tr-2xl rounded-bl-none")}
              ></div>
            </div>
          );
        })}
      </div>
    </marquee>
  );
};

export default MarqueeChat;
