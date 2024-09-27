import ChartBar from "./chart-bar";
import { motion } from "framer-motion";

const ItemReport = ({ label = "", value = "" }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  return (
    <div className="border-primary-01/40 border rounded-lg h-fit border-dashed  bg-white w-full">
      <div className="p-5">
        <div className="text-lg text-black font-black uppercase">{label}</div>
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-4xl text-primary-01 mt-4 font-bold "
        >
          {value} cá
        </motion.div>
      </div>
    </div>
  );
};

const TotalReport = () => {
  return (
    <div className="py-20">
      <div className="flex root-wrapper mx-auto items-stretch gap-10">
        <div className="w-1/2">
          <img src="/bill.png" className="w-full h-fit object-contain rounded-md" alt="" />
          <div className="flex items-center gap-4 py-4">
            <ItemReport label="Tổng" value={300} />
            <ItemReport label="Tổng" value={300} />
          </div>
        </div>
        <div className="w-1/2 text-left flex flex-col">
          <div className="">
            <div className="alata text-3xl">Nhắc trả tiền </div>
            <div className="alata text-5xl mt-4 text-primary-01">MỖI TUẦN, MỖI NGÀY</div>
            <div className=" text-gray-500 mt-6">Tiền bạc rỏ ràng, dui cả làng cả xóm</div>
          </div>
          <div className="w-full flex-1 mt-8">
            <ChartBar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalReport;
