import useMessage from "../helper/use-message";
import { cn } from "@/lib/utils";
import { createImage } from "@/lib/helper";

const Invester = () => {
  const open = (href) => {
    window.open(href + `?utm_source=web-dat-com&utm_url=${window.location.href}`, "_blank");
  };
  return (
    <div className="flex items-center gap-10 root-wrapper justify-start">
      <div onClick={() => open("https://ielts1984.vn")} className="flex items-end gap-4 cursor-pointer">
        <img src="/ielts.webp" className="h-10 w-auto" alt="" />{" "}
        <span className="text-white text-md mb-1 font-bold">Học bản chất, học 1 lần dùng cả đời</span>
      </div>
      <div onClick={() => open("https://youpass.vn")} className="flex items-end gap-4 cursor-pointer">
        <img src="/youpass.png" className="h-8 w-auto" alt="" />{" "}
        <span className="text-white text-md font-bold">Luyện tập IELTS miễn phí tại nhà</span>
      </div>
    </div>
  );
};

const MarqueeChat = () => {
  const { messages = [] } = useMessage();
  console.log(messages);
  if (messages.length === 0)
    return (
      <div className="py-3 bg-pastel-pink">
        <Invester />
      </div>
    );
  return (
    // <marquee behavior="scroll" direction="left" scrollamount="10" className="bg-pastel-pink mb-0 pb-0">
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
                className={cn("text-base  w-fit text-white border-gray-300 rounded-md p-2 rounded-tr-2xl rounded-bl-none")}
              ></div>
            </div>
          );
        })}
    </div>
    // </marquee>
  );
};

export default MarqueeChat;
