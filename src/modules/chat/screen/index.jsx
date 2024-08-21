import AxiosClient from "@/lib/api/axios-client";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { ChevronDown, SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useOnClickOutside } from "usehooks-ts";
import useMessage from "../helper/use-message";
import { useSubscribe } from "@/hooks/use-connection";
import { call } from "lodash/groupBy";

const ChatWiget = () => {
  const ref = useRef(null);
  const wrap = useRef(null);
  const { companyId } = useParams();
  const { messages, setMessages } = useMessage();
  const [focus, setFocus] = useState(false);

  const sendMessage = () => {
    AxiosClient.post("/items/message", {
      message: ref.current.innerHTML,
      company: companyId,
    });
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
  }, [messages]);

  useOnClickOutside(ref, () => {
    setFocus(false);
  });
  return (
    <div className="fixed bottom-0 right-10 w-96 h-[30rem] bg-white  border border-b-0 border-gray-400 rounded-b-none rounded-md flex flex-col">
      <div className="flex items-center justify-between w-full border-gray-200 border-b p-4 ">
        <h1 className="text-base">Tậm sự cơm trưa</h1>
        <div className="p-l cursor-pointer">
          <ChevronDown className="stroke-gray-500" />
        </div>
      </div>
      <div className="flex-1 relative">
        <div className="absolute top-0 left-0 h-full w-full overflow-y-auto p-4 " ref={wrap}>
          <div className="flex flex-col gap-4">
            {messages.map((elm, index) => {
              const fullname = elm.user_created?.first_name + " " + elm.user_created?.last_name;
              return (
                <div className="flex flex-col items-end" key={elm.id}>
                  <div
                    dangerouslySetInnerHTML={{ __html: elm.message || "tin nhắn rổng" }}
                    className="text-sm border border-dashed w-fit border-gray-300 rounded-md p-2  rounded-tr-2xl rounded-br-none"
                  ></div>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="text-xs text-gray-400">{fullname}</div>
                    <img src="/avatar.png" className="w-6 h-6 aspect-square rounded-full" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-gray-300 text-sm flex items-end">
        <div ref={ref} onClick={() => setFocus(true)} contentEditable className="focus:outline-none flex-1 pr-2"></div>
        <div className="cursor-pointer" onClick={sendMessage}>
          <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
        </div>
      </div>
    </div>
  );
};

export default ChatWiget;
