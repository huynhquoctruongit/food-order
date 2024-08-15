import { Button } from "@/components/ui/button-hero";
import { useAuth } from "@/hooks/use-auth";
import useCompanyManager from "@/hooks/use-company";
import { createLinkOrder, enumFood } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();
  const { company } = useCompanyManager();
  const { isLogin } = useAuth();
  const { bulk_food_provider } = company || {};

  const onClick = () => {
    navigate(createLinkOrder(company.id, bulk_food_provider));
  };
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-pastel-pink/40 flex items-center justify-center">
      <div>
        <div>
          <img src="/not-found.png" className="w-60 mx-auto" alt="" />
        </div>
        {isLogin && !company && (
          <div className="w-80 mx-auto mt-10 text-center italic">
            Hiện tại bạn không có quyền tạo đơn hàng, vui lòng liên hệ quản trị viên để được cấp quyền.
          </div>
        )}

        <div className="flex items-center gap-4 justify-center mt-10">
          {enumFood.slice(0, 4).map((item, index) => {
            return (
              <div
                key={"login" + index}
                className="rounded-md w-20 h-20 bg-pastel-pink/50 flex items-center cursor-pointer justify-center relative"
              >
                <img src={item} className="w-16 h-16" alt="" />
              </div>
            );
          })}
        </div>
        {isLogin && company && (
          <div className="text-center mt-10">
            <Button variant="default" size="default" onClick={onClick}>
              ĐẶT MENU THÔI
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
