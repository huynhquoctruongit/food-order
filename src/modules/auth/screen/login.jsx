import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { enumFood } from "@/lib/utils";

const ModalLogin = () => {
  const { profile } = useAuth();
  console.log(profile);

  const loginByGoogle = () => {
    location.replace(
      "https://cms.toidot.com/auth/login/google?redirect=" + location.href
    );
  };
  const loginByFacebook = () => {
    alert("Đang đợi facebook duyệt nha má :3");
  };

  return (
    <Dialog open={true} className="">
      <DialogContent className="sm:max-w-[425px] bg-white text-black bg-[url(/background-auth.png)] bg-cover">
        <DialogHeader>
          <DialogTitle className="text-black">
            Đăng nhập đi mấy ní
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 w-fit mx-auto mt-4">
          <div
            onClick={loginByGoogle}
            className="rounded-full cursor-pointer hover:border-solid hover:-translate-y-0.5 hover:shadow-sm duration-200 border gap-3 border-dashed border-light-03 p-1 pr-3 flex items-center justify-center bg-white w-fit"
          >
            <img src="/google.png" className="w-6 h-6 rounded-full" alt="" />
            Đăng nhập bằng Google
          </div>
          <div
            onClick={loginByFacebook}
            className="rounded-full  cursor-pointer hover:border-solid hover:-translate-y-0.5 hover:shadow-sm duration-200  mt-6 border gap-3 border-dashed border-light-03 p-1 pr-3 flex items-center justify-center bg-white w-fit"
          >
            <img src="/facebook.png" className="w-6 h-6 rounded-full" alt="" />
            Đăng nhập bằng Facebook
          </div>
        </div>
        <div className="flex items-center gap-4 justify-center mt-10">
          {enumFood.slice(0, 6).map((item, index) => {
            return (
              <div
                key={"login" + index}
                className="rounded-full w-12 h-12 bg-pastel-pink/50 flex items-center justify-center"
              >
                <img src={item} className="w-10 h-10" alt="" />
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalLogin;
