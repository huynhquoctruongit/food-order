import useConnection from "@/hooks/use-connection";
import ModalLogin from "@/modules/auth/screen/login";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();
   return (
    <div className="w-screen h-screen bg-pastel-pink/40 flex items-center justify-center">
      <div>
        <div className="font-bold text-4xl text-center">HIHI</div>
        <div className="text-center mt-4" onClick={() => navigate("company/1/provider/1")}>
          COMMING SOON
        </div>
      </div>
      <ModalLogin />
    </div>
  );
};

export default MainPage;
