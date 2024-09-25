import { motion } from "framer-motion";
const Transfer = () => {
  const dataTransfer = [
    { title: "OvenBaked Germaô tô kê", image: "/foods/mon-1.png" },
    { title: "OvenBaked Germa OvenBaked q Germa", image: "/foods/mon-2.png" },
    { title: "OvenBaked Germa OvenBaked  Germa", image: "/foods/mon-3.png" },
  ];
  return (
    <div className="root-wrapper mx-auto text-left min-h-[30rem] py-20 bg-gradient-to-t from-white via-white/70 via-70%">
      <div className="flex">
        <div className="w-1/3">
          <div className="alata text-3xl">Tạo món ăn từ</div>
          <div className="alata text-5xl mt-4 text-primary-01">HÌNH ẢNH</div>
          <div className=" text-gray-500 mt-6">
            Giảm thời gian nhập menu, <br /> tận hưởng sự thoải ở văn phòng
          </div>
        </div>
        <div className="w-2/3 flex items-center">
          <div className="w-60 border border-pastel-pink p-2 rounded-md relative overflow-hidden">
            <img src="/p4.png" className="w-full" alt="" />
            <div className="absolute top-[-4rem] left-0 z-20 animate-bg">
              <div className="w-20 h-[50rem] bg-white/40 animate-pulse rotate-[20deg] z-20 "> </div>
            </div>
            <div className="absolute top-[-4rem] left-0 z-20 animate-bg" style={{ animationDelay: "0.5s" }}>
              <div className="w-20 h-[50rem] bg-white/40 animate-pulse rotate-[20deg] z-20 "> </div>
            </div>
          </div>
          <div className="flex flex-col gap-10 w-52 py-10 px-4">
            {dataTransfer.map((item) => (
              <div key={item.image} className="w-full">
                <div className="truncate w-full  text-gray-700 whitespace-nowrap text-sm">{item.title}</div>
                <motion.div
                  initial={{
                    backgroundPosition: "0% 50%",
                  }}
                  animate={{
                    backgroundPosition: ["0% 50%", "300% 50%"], // Di chuyển vị trí gradient
                  }}
                  transition={{
                    duration: 5, // Thời gian của mỗi chu kỳ chuyển màu
                    ease: "easeInOut",
                    repeat: Infinity, // Lặp vô hạn
                    // repeatType: "reverse", // Đảo ngược để tạo hiệu ứng mượt hơn
                  }}
                  className="w-full h-[1px] border-gradient rounded-md"
                ></motion.div>
              </div>
            ))}
          </div>
          <div className="flex-1 relative h-fit rounded-xl">
            <div className="absolute shadow-button top-0 left-0 w-full h-full rounded-xl animate-pulse"></div>
            <div className="border border-primary-01 rounded-xl flex flex-col gap-3 p-2 relative z-10 bg-white overflow-hidden">
              {dataTransfer.map((item) => (
                <div
                  key={item.image}
                  className="w-full border border-dashed border-pastel-pink rounded-lg gap-2 items-center flex"
                >
                  <div className="min-w-24 w-24 aspect-square bg-pastel-pink/20 flex items-center justify-center">
                    <img src={item.image} alt="" className="w-20" />
                  </div>
                  <div className="w-fulltext-gray-700 text-sm">{item.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transfer;
