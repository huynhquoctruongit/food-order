import { Button } from "@/components/ui/button-hero";
import { useNavigate } from "react-router-dom";
import { BackgroundGradientAnimation } from "../component/background";
import AnimateText, { AnimateLineText, AnimateView } from "@/components/widget/animate-text";
import Transfer from "../component/transfer";
import Interactive from "../component/interactive";
import SumaryOrder from "../component/summary";
import TotalReport from "../component/total-report";
import LoginByGoogle from "../component/login";
import Partners from "../component/partner";
import Background from "../component/local";
import { useAuth } from "@/hooks/use-auth";
import useOrder from "@/modules/order/helper/use-menu";
import Testimonials from "../component/testimonial";
import Footer from "../component/footer";

const foods = ["/foods/mon-1.png", "/foods/mon-2.png", "/foods/mon-3.png", "/foods/mon-4.png", "/foods/mon-5.png"];
const Home = () => {
  const navigate = useNavigate();
  const { profile, isLogin } = useAuth();

  const onUse = () => {
    navigate(`/company/${profile.company}/provider/1`);
  };
  return (
    <div className="text-left">
      <BackgroundGradientAnimation>
        <div className="h-fit bg-gradient-to-tr to-pastel-pink/10 from-primary-01/5 flex items-center justify-center  min-h-[30rem] lg:min-h-[45rem] w-screen relative">
          <div className="absolute w-96 h-64 z-10 top-2/12 right-12 bg-[#F6FFFE] blur-3xl"></div>
          <div className="p-4 relative z-10 flex flex-col gap-12">
            <div className="text-md md:text-5xl text-center alata leading-normal [mix-blend-mode:hard-light]">
              <AnimateLineText className="">Ứng dụng tập trung cho văn phòng.</AnimateLineText>
              <div className="flex items-center gap-2 justify-center">
                <AnimateLineText>Tạo món, chọn món</AnimateLineText>
                <AnimateText className="text-primary-01">nhanh hơn điện giật.</AnimateText>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <AnimateLineText delay={0.5}>Hoàn toàn</AnimateLineText>
                <AnimateText delay={1} className="text-primary-01">
                  miễn phí
                </AnimateText>
              </div>
            </div>

            <AnimateView delay={0.5} className="text-sm lg:text-xl text-gray-700 text-center">
              Tạo menu đồ ăn bằng hình ảnh, đăng nhập nhanh lắm, <br className="hidden lg:block" /> nhắc trả tiền liền, tùy biến
              theo công ty...
            </AnimateView>

            <AnimateView delay={1} className="flex items-center flex-col lg:flex-row justify-center gap-10 mb-10">
              <Button variant="default" size="lg" onClick={onUse}>
                ĐẶT MÓN NGAY
              </Button>
              <Button variant="outline-primary" size="lg">
                SỬ DỤNG MIỄN PHÍ
              </Button>
            </AnimateView>
          </div>
        </div>
      </BackgroundGradientAnimation>
      <div className="root-wrapper mx-auto hidden lg:block">
        <div className=" grid grid-cols-3 lg:grid-cols-5 items-center justify-center gap-8 lg:-translate-y-1/2">
          {foods.map((item) => {
            return (
              <div key={item}>
                <img className="w-32" src={item} alt="" />
              </div>
            );
          })}
        </div>
      </div>
      <Transfer />
      <Interactive />
      <SumaryOrder />
      <TotalReport />
      <LoginByGoogle />
      <Partners />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Home;
