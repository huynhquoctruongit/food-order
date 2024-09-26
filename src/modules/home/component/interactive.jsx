import { FollowerPointer, FollowPointer } from "@/components/ui/follow-pointer";
import { AnimateLineText } from "@/components/widget/animate-text";
import { motion } from "framer-motion";

const TitleComponent = ({ author }) => (
  <div className="flex space-x-2 items-center">
    <img
      src={author.avatar}
      height="32"
      width="32"
      alt="thumbnail"
      className="rounded-full w-8 h-8 min-w-5 border-2 bg-white border-white"
    />
    <p>{author.name}</p>
  </div>
);
const blogContent = {
  name: "Nhất Nguyên",
  date: "28th March, 2023",
  title: "Amazing Tailwindcss Grid Layout Examples",
  description:
    "Grids are cool, but Tailwindcss grids are cooler. In this article, we will learn how to create amazing Grid layouts with Tailwindcs grid and React.",
  avatar: "/foods/mon-1.png",
  authorAvatar: "/foods/mon-1.png",
};

const Linh = {
  name: "Món này được không nhỉ",
  avatar: "/foods/mon-1.png",
};
const Nhat = {
  name: "Cũng tạm tạm",
  avatar: "/foods/mon-2.png",
};

const dataTransfer = [
  { title: "OvenBaked Germaô tô kê", image: "/foods/mon-1.png" },
  { title: "OvenBaked Germa OvenBaked q Germa", image: "/foods/mon-2.png" },
  { title: "OvenBaked Germa OvenBaked  Germa", image: "/foods/mon-3.png" },
  { title: "Món ngon mỗi ngày", image: "/foods/mon-4.png" },
];

const Interactive = () => {
  return (
    <>
      <AnimateLineText className="alata mb-10 text-5xl justify-center mt-4 text-primary-01 uppercase text-center">
        Tương tác cùng với nhau
      </AnimateLineText>
      <FollowerPointer title={<TitleComponent author={blogContent} />} className="">
        <div className="h-fit bg-gradient-to-tr from-pastel-pink/5 to-primary-01/30 flex items-center justify-center min-h-[60vh] w-screen relative">
          <div className="absolute w-96 h-72 z-10 top-10/12 right-10 bg-[#fca98ddf] blur-3xl"></div>
          <div className="absolute w-96 h-72 z-10 top-2/12 -right-10 bg-[#edfffd9e] blur-3xl"></div>

          <div className="root-wrapper mx-auto relative flex gap-10 z-10">
            <div className="grid grid-cols-2 h-fit items-center flex-wrap w-2/3 gap-5">
              {dataTransfer.map((item) => (
                <div
                  key={item.image}
                  className="w-full bg-white hover:shadow-button duration-200 border border-pastel-pink rounded-lg items-center relative flex"
                >
                  <div className="min-w-24 w-24 aspect-square bg-pastel-pink/20 flex items-center justify-center">
                    <img src={item.image} alt="" className="w-20" />
                  </div>
                  <div className="w-full text-gray-700 text-sm text-left p-2">{item.title}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4 ml-auto">
              <Notification />
              <Notification />
              <Notification />
              <Notification />
              <Notification />
            </div>
          </div>
          <ElementCursor x={400} y={200} vx={7} vy={4} title={<TitleComponent author={Linh} />} />
          <ElementCursor delay={0.5} x={700} y={100} vx={3} vy={6} title={<TitleComponent author={Nhat} />} />
        </div>
      </FollowerPointer>
    </>
  );
};

export default Interactive;

const Notification = () => {
  return (
    <div className="w-60 px-2 bg-white rounded-md border border-dashed border-pastel-pink flex items-center">
      <div className="w-10 h-10 min-w-10 p-1 border-pastel-pink border-2 rounded-full">
        <img className="w-full h-full object-contain" src={"/foods/mon-1.png"} alt="" />
      </div>
      <div className="p-2">
        <div className="text-gray-500 text-left text-sm">Vừa đặt món</div>
        <div className="text-gray-800 text-left line-clamp-1 text-xs">Cá chiên mắm đù tuyệt vời</div>
      </div>
    </div>
  );
};

const ElementCursor = ({ delay = 0, x, y, title, vx, vy }) => {
  const colors = [
    "var(--sky-500)",
    "var(--teal-500)",
    "var(--green-500)",
    "var(--blue-500)",
    "var(--red-500)",
    "var(--yellow-500)",
  ];
  return (
    <motion.div
      className="h-4 w-4 rounded-full absolute z-50"
      style={
        {
          // pointerEvents: "none",
        }
      }
      initial={{
        top: y,
        left: x,
        scale: 1,
        opacity: 1,
      }}
      animate={{
        top: y + vy,
        left: x + vx,
        scale: 1,
        opacity: 1,
      }}
      exit={{
        scale: 0,
        opacity: 0,
      }}
      transition={{
        duration: 1,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
        delay: delay,
      }}
    >
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="1"
        viewBox="0 0 16 16"
        className="h-6 w-6 text-primary-01 transform -rotate-[70deg] -translate-x-[12px] -translate-y-[10px] stroke-pastel-06"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"></path>
      </svg>
      <motion.div
        style={{
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        }}
        initial={{
          scale: 0.5,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        exit={{
          scale: 0.5,
          opacity: 0,
        }}
        className={"px-2 py-2 bg-neutral-200 text-white whitespace-nowrap min-w-max text-xs rounded-full"}
      >
        {title || `William Shakespeare`}
      </motion.div>
    </motion.div>
  );
};
