import AxiosClient from "@/lib/api/axios-client";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { ChevronDown, SendIcon } from "lucide-react";
import { act, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMediaQuery, useOnClickOutside } from "usehooks-ts";
import useMessage from "../helper/use-message";
import useConnection, { useSubscribe } from "@/hooks/use-connection";
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
  const { messages, setMessages, isLoading } = useMessage();
  const init = useRef();
  const { connection, status } = useConnection();
  const [idActivity, setIdActivity] = useState(null);
  const prevent = useRef(false);

  const isMd = useMediaQuery("(min-width: 768px)");
  // const [show, setShow] = useState(isMd ? true : false);
  const [show, setShow] = useState(false);

  const sendMessage = async () => {
    if (refLoading.current) return;
    refLoading.current = true;
    ref.current.innerHTML = "";
    await AxiosClient.post("/items/message", {
      message: ref.current.innerHTML,
      company: companyId,
    });
    refLoading.current = false;
  };
  const callback = useRef(null);
  callback.current = (message) => {
    if (message.event !== "create") return;
    setMessages(message.data[0]);
  };

  useSubscribe("create", "message", ["*,user_created.*"], { company: { _eq: companyId } }, callback);

  const typing = useRef(null);

  typing.current = (message) => {
    // if (message.event !== "create" && message.event !== "delete") return;
    console.log(message);

    if (message.event === "create") setIdActivity(message.data[0]);
    if (message.event === "delete") setIdActivity(null);
  };

  useSubscribe("create", "activity_user", ["*,user_created.*"], { company: companyId, name: "typing" }, typing);

  useEffect(() => {
    ref.current.addEventListener("keydown", (e) => {
      if (e.ctrlKey === false && e.shiftKey === false && e.metaKey === false && e.key === "Enter") {
        e.preventDefault();
        if (!ref.current.innerHTML.trim()) return;
        sendMessage();
      }
    });
  }, []);
  useLayoutEffect(() => {
    if ((messages && messages.length === 0) || init.current || !show) return;
    init.current = true;
    wrap.current.scrollTo({
      top: wrap.current.firstChild.clientHeight,
    });
  }, [messages, show]);

  useEffect(() => {
    wrap.current.scrollTo({
      top: wrap.current.firstChild.clientHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const createType = () => {
    if (prevent.current) return;
    prevent.current = true;
    connection.sendMessage({
      type: "items",
      collection: "activity_user",
      action: "create",
      data: { name: "typing", company: companyId },
    });
  };
  const deleteType = (id) => {
    if (!id) return;
    console.log("delte");

    prevent.current = false;
    connection.sendMessage({
      type: "items",
      collection: "activity_user",
      action: "delete",
      id: id,
    });
  };

  const onChange = () => {
    console.log(ref.current.innerHTML.trim());
    
    if (ref.current.innerHTML.trim()) {
      createType();
    } else {
      console.log('kạdkjskd',idActivity);
      
      deleteType(idActivity.id);
    }
  };

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
          <h1 className="text-base">Tâm sự cơm trưa</h1>
          <div className="p-l cursor-pointer" onClick={() => setShow(false)}>
            <ChevronDown className="stroke-gray-500" />
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="absolute top-0 left-0 h-full w-full overflow-y-auto p-4" ref={wrap}>
            <div className="flex flex-col gap-4">
              {messages.length === 0 && <div>Chưa có tin nhắn nào</div>}
              {messages.map((elm, index) => {
                const isMe = elm.user_created?.id === profile.id;
                const fullname = elm.user_created?.first_name + " " + elm.user_created?.last_name;
                return (
                  <div className={cn("flex justify-start pb-4", isMe ? "justify-end" : "justify-start")}>
                    <div className={cn("flex gap-2 items-start justify-start max-w-[90%]")} key={elm.id}>
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative group">
                          <img
                            src={createImage(elm.user_created.avatar, 300)}
                            className="min-w-10 w-10 h-10 bg-white p-1 border border-dashed border-gray-500 aspect-square rounded-full"
                          />
                        </div>
                      </div>
                      <div
                        className={cn(
                          "relative w-fit border-gray-300 p-2 rounded-2xl rounded-tl-md",
                          isMe ? "bg-primary-01 text-white" : "bg-secondary-01 text-white",
                        )}
                      >
                        <div className="text-xs mb-2 text-gray-200">{fullname}</div>
                        <div
                          dangerouslySetInnerHTML={{ __html: elm.message }}
                          className={cn("text-sm  ", isMe ? "bg-primary-01 text-white" : "bg-secondary-01 text-white")}
                        ></div>
                        <div className={cn("text-[10px] mt-1 text-slate-400 text-right absolute top-full left-0")}>
                          {dayjs(elm.date_created).format("HH:mm:ss")}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {idActivity && <div> {idActivity.user_created.first_name} Typing...</div>}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-300 text-sm flex items-end">
          <div ref={ref} contentEditable onInput={onChange} className="focus:outline-none flex-1 pr-2"></div>
          <div className="cursor-pointer" onClick={sendMessage}>
            <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatWiget;
