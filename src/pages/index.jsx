import { Button } from "@/components/ui/button-hero";
import { useAuth } from "@/hooks/use-auth";
import useCompanyManager from "@/hooks/use-company";
import { createLinkOrder, enumFood } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();
  const { company } = useCompanyManager();
  const { isLogin, profile } = useAuth();
  const { bulk_food_provider } = company || {};

  const onClick = () => {
    navigate(createLinkOrder(company.id, bulk_food_provider));
  };
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-pastel-pink/40 flex items-center justify-center">
      <div className="p-4">
        <div>
          <img src="/not-found.png" className="w-60 mx-auto" alt="" />
        </div>
        <div className="w-full md:w-96 text-xs md:text-base mx-auto mt-2 md:mt-10 text-center italic">
          Chị Hồng đã dành nhiều thời gian để đặt đồ ăn trưa cho chúng mình ở công ty, lưu ý từng phần ăn, tổng hợp chi phí và
          theo dõi việc thanh toán cho mọi người. Tụi mình được tạo ra để hỗ trợ chị Hồng, giúp công việc này trở nên nhanh chóng
          và dễ dàng hơn.
        </div>
        <div className="flex items-center gap-4 justify-center mt-10">
          {enumFood.slice(0, 4).map((item, index) => {
            return (
              <div
                key={"login" + index}
                className="rounded-md w-16 h-16 md:w-20 md:h-20 bg-pastel-pink/50 flex items-center cursor-pointer justify-center relative"
              >
                <img src={item} className="w-12 h-12 md:w-16 md:h-16" alt="" />
              </div>
            );
          })}
        </div>
        {isLogin && profile.company && (
          <div className="text-center mt-10">
            <Button variant="default" size="default" onClick={onClick}>
              ĐI TỚI TRANG ĐẶT MÓN
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
