import useMessage from "../helper/use-message";
import { cn } from "@/lib/utils";
import { createImage } from "@/lib/helper";
import { motion } from "framer-motion";
import { useState } from "react";
import { XIcon } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";

const variant = {
  initial: { opacity: 1, y: 200 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 1, y: 200 },
};
const Invester = () => {
  const [show, setShow] = useState(true);
  const open = (href) => {
    window.open(href + `?utm_source=web-dat-com&utm_url=${window.location.href}`, "_blank");
  };
  const isMd = useMediaQuery("(min-width: 768px)");

  return (
    <motion.div
      initial={isMd ? "animate" : "initial"}
      variants={variant}
      animate={show ? "animate" : "exit"}
      exit="exit"
      transition={{ duration: 0.3 }}
      className="py-4 md:py-3 bg-white md:bg-pastel-pink  md:static fixed bottom-0 left-0 right-0 z-[1000] "
    >
      <div className="root-wrapper flex items-center gap-4 md:gap-10 text-left">
        <div className="text-xs md:hidden text-[#164474]">Học IELTS cùng với: </div>
        <div onClick={() => open("https://ielts1984.vn")} className="flex items-center lg:items-end gap-4 cursor-pointer">
          <img src="/ielts.webp" className="h-8 md:h-10 w-auto" alt="" />{" "}
          <span className="text-white text-md mb-1 font-bold hidden md:block">Học bản chất, học 1 lần dùng cả đời</span>
        </div>
        <div onClick={() => open("https://youpass.vn")} className="flex items-center lg:items-end gap-4 cursor-pointer">
          <img src="/youpass.png" className="h-6 md:h-8 w-auto" alt="" />{" "}
          <span className="text-white text-md font-bold hidden md:block">Luyện tập IELTS miễn phí tại nhà</span>
        </div>
        <div
          onClick={() => setShow(false)}
          className="absolute md:hidden shadow-xl -translate-x-1/2 bottom-full left-1/2 p-1 bg-white rounded-full"
        >
          <XIcon className="text-primary-01 w-3 h-3" />
        </div>
      </div>
    </motion.div>
  );
};

const MarqueeChat = () => {
  const { messages = [] } = useMessage();

  if (messages.length === 0) return <Invester />;
  return (
    <marquee behavior="scroll" direction="left" scrollamount="10" className="bg-pastel-pink mb-0 pb-0">
      <div className="flex items-center py-3 gap-20 px-10">
        {messages.length > 0 &&
          messages.map((elm, index) => {
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
                  className={cn("text-sm md:text-base  w-fit text-white border-gray-300 rounded-md p-2 rounded-tr-2xl rounded-bl-none")}
                ></div>
              </div>
            );
          })}
      </div>
    </marquee>
  );
};

export default MarqueeChat;
