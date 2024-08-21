import AxiosClient from "@/lib/api/axios-client";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { ChevronDown, SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMediaQuery, useOnClickOutside } from "usehooks-ts";
import useMessage from "../helper/use-message";
import { useSubscribe } from "@/hooks/use-connection";
import { call } from "lodash/groupBy";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { createImage } from "@/lib/helper";
import dayjs from "dayjs";

const ChatWiget = () => {
  const ref = useRef(null);
  const wrap = useRef(null);
  const refLoading = useRef(null);
  const { companyId } = useParams();
  const { profile } = useAuth();
  const { messages, setMessages } = useMessage();
  const isMd = useMediaQuery("(min-width: 768px)");
  // const [show, setShow] = useState(isMd ? true : false);
  const [show, setShow] = useState(false);

  const sendMessage = async () => {
    if (refLoading.current) return;
    refLoading.current = true;
    await AxiosClient.post("/items/message", {
      message: ref.current.innerHTML,
      company: companyId,
    });
    refLoading.current = false;
    ref.current.innerHTML = "";
  };
  const callback = useRef(null);
  callback.current = (message) => {
    if (message.event !== "create") return;
    setMessages(message.data[0]);
  };
  useSubscribe("create", "message", ["*,user_created.*"], { company: { _eq: companyId } }, callback);

  useEffect(() => {
    ref.current.addEventListener("keydown", (e) => {
      if (e.ctrlKey === false && e.shiftKey === false && e.metaKey === false && e.key === "Enter") {
        e.preventDefault();
        if (ref.current.innerHTML.trim() === "") return;
        sendMessage();
      }
    });
  }, []);

  useEffect(() => {
    wrap.current.scrollTop = wrap.current.firstChild.clientHeight;
  }, [messages, show]);

  return (
    <>
      {!show && (
        <div className="fixed cursor-pointer bottom-4 md:bottom-10 right-4 md:right-10 z-100">
          <div className=" rounded-full p-2 bg-white shadow-md relative" onClick={() => setShow(true)}>
            <img src="/chat.png" className="w-8 h-8 object-contain" />
            <div className="w-2 h-2 rounded-full absolute top-0 right-0 animate-ping bg-primary-01"></div>
          </div>
        </div>
      )}

      <div
        className={cn(
          "fixed bottom-0 z-[100] right-0 md:right-10 w-full md:w-96 h-[30rem] bg-white  border border-b-0 border-pastel-pink rounded-b-none rounded-md flex flex-col",
          { hidden: !show },
        )}
      >
        <div className="flex items-center justify-between w-full border-pastel-pink border-b p-4 ">
          <h1 className="text-base">Tậm sự cơm trưa</h1>
          <div className="p-l cursor-pointer" onClick={() => setShow(false)}>
            <ChevronDown className="stroke-gray-500" />
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="absolute top-0 left-0 h-full w-full overflow-y-auto p-4 " ref={wrap}>
            <div className="flex flex-col gap-4">
              {messages.map((elm, index) => {
                const isMe = elm.user_created?.id === profile.id;
                const fullname = elm.user_created?.first_name + " " + elm.user_created?.last_name;
                return (
                  <div>
                    <div className={cn("flex gap-2 flex-row-reverse ", !isMe ? "justify-start " : "justify-end")} key={elm.id}>
                      <div className="relative">
                        <div
                          dangerouslySetInnerHTML={{ __html: elm.message || "tin nhắn rổng" }}
                          className={cn(
                            "text-sm  w-fit border-gray-300 rounded-md p-2  rounded-tr-2xl rounded-bl-none",
                            isMe ? "bg-primary-01 text-white" : "bg-secondary-01 text-white",
                          )}
                        ></div>
                        <div className={cn("text-[10px] mt-1 text-slate-300 text-right absolute top-full left-0")}>
                          {dayjs(elm.date_created).format("HH:mm:ss")}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-2 ">
                        <div className="relative group">
                          <div
                            className={cn(
                              "text-xs text-gray-400 top-full left-0 hidden group-hover:block absolute  mt-1  whitespace-nowrap bg-slate-50 rounded-md px-2 py-0.5",
                            )}
                          >
                            {fullname}
                          </div>
                          <img
                            src={createImage(elm.user_created.avatar, 300)}
                            className="min-w-8 w-8 h-8 bg-slate-50 p-1 shadow-lg aspect-square rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                    <div className={cn("text-[10px] mt-1 text-slate-300 text-right opacity-0")}>
                      {dayjs(elm.date_created).format("HH:mm:ss")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-300 text-sm flex items-end">
          <div ref={ref} contentEditable className="focus:outline-none flex-1 pr-2"></div>
          <div className="cursor-pointer" onClick={sendMessage}>
            <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatWiget;
