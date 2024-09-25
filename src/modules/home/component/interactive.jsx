import { AnimateLineText } from "@/components/widget/animate-text";
import { motion } from "framer-motion";
const Interactive = () => {
  return (
    <div>
      <AnimateLineText className="alata text-5xl justify-center mt-4 text-primary-01 uppercase text-center">Tương tác cùng với nhau</AnimateLineText>
      <div className="h-fit bg-gradient-to-tr to-pastel-pink/20 from-primary-01/40 flex items-center justify-center min-h-[60vh] w-screen relative mt-8">
        <div className="root-wrapper mx-auto"></div>
      </div>
    </div>
  );
};

export default Interactive;
