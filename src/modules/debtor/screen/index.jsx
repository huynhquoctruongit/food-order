import { motion } from "framer-motion";
import ListUserPoint from "../component/list-user-point";

const Debtor = () => {
  return (
    <motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="root-wrapper text-left relative my-10"
      >
        <div className="absolute top-[8rem] left-0 bg-pastel-pink/20  blur-xl w-72 h-72 rounded-full"></div>
        <div className="absolute top-[4rem] left-1/2 bg-secondary-01/10  blur-[100px] w-96 h-96 rounded-full"></div>
        <div className="w-full md:w-8/12 mx-auto border border-primary-01 rounded-xl p-6 bg-white">
          <div className="text-primary-01 text-xl font-bold">DANH SÁCH CHỊ HỒNG CHƯA XÁC NHẬN GIAO DỊCH</div>
          <div className="mt-4 flex flex-col gap-4">
            <ListUserPoint />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
export default Debtor;
