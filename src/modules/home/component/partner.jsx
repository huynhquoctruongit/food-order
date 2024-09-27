import AnimateText, { AnimateLineText, AnimateView } from "@/components/widget/animate-text";

const LoginByGoogle = () => {
  const loginByGoogle = () => {
    location.replace("https://cms.toidot.com/auth/login/google?redirect=" + location.origin + "?callback=" + location.pathname);
  };
  //   <AnimateLineText className="alata text-3xl justify-center leading-relaxed">Đăng nhập </AnimateLineText>
  //   <AnimateText delay={0.5} className="alata justify-center text-5xl mt-4 text-primary-01 leading-relaxed">
  //     BẰNG TÀI KHOẢN GOOGLE
  //   </AnimateText>
  //   <AnimateView delay={1} className=" text-gray-500 mt-6">
  //     Nhanh chóng, linh hoạt, bảo mật, an toàn, đồng bộ <br /> thông tin trên nhiều thiết bị cùng lúc
  //   </AnimateView>
  //   <AnimateView delay={1.3} className="mt-10 flex justify-center">
  //     <div
  //       onClick={loginByGoogle}
  //       className="rounded-full cursor-pointer hover:border-solid hover:-translate-y-0.5 hover:shadow-sm duration-200 border gap-3 border-primary-01 text-primary-01 p-1.5 pr-3 flex items-center justify-center bg-white w-fit"
  //     >
  //       <img src="/google.png" className="w-6 h-6 rounded-full" alt="" />
  //       Đăng nhập bằng Google
  //     </div>
  //   </AnimateView>

  const partners = [
   
    { title: "IELTS 1984" },
    { title: "YOUPASS" },
    { title: "VUTHIEN" },
    { title: "KYLONG TECH" },
    { title: "FARMILY MART" },
    { title: "STANDARD" },
    { title: "FPT TELECOM" },
  ];
  return (
    <div className="py-20">
      <div className="root-wrapper mx-auto">
        <div className="border rounded-md border-primary-01 grid grid-cols-4">
            <div className=""></div>
        </div>
      </div>
    </div>
  );
};

export default LoginByGoogle;
