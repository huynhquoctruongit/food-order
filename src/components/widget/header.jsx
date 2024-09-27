import { useAuth } from "@/hooks/use-auth";
import Profile from "@/modules/info-user";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const onGoHome = () => {
    navigate("/");
  };
  return (
    <div className="bg-white">
      <div className="flex items-center justify-between text-black root-wrapper py-3">
        <h1 onClick={onGoHome} className="font-bold text-sm md:text-xl cursor-pointer" id="logo">
          NƯỚC{" "}
          <span className="font-black bg-gradient-to-r from-[#E5624D] drop-shadow-md to-[#FA9382] text-transparent bg-clip-text">
            XẾ CHIỀU TÀ
          </span>
        </h1>
        <Profile />
      </div>
    </div>
  );
};

export default Header;
