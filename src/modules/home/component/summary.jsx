import dayjs from "dayjs";
import { XIcon } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import { enumFood } from "@/lib/utils";
import groupBy from "lodash/groupBy";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";

import { createImage } from "@/lib/helper";
import useOrder from "@/modules/order/helper/use-menu";
import { orders } from "../helper/user-data";
import AnimateText, { AnimateLineText, AnimateView } from "@/components/widget/animate-text";

export const ItemTable = ({ children, className }) => {
  return (
    <div className={className + " text-left border-r border-gray-300 last:border-none"}>
      <div className="py-3 px-5 h-full flex items-center">{children}</div>
    </div>
  );
};
const options = [
  { title: "Sen", value: "dongchi", className: "w-4/12" },
  { title: "Món", value: "mon", className: "w-4/12" },
  { title: "Ghi chú", value: "ghi-chu", className: "w-3/12" },
  { title: "Thời gian", value: "date-luc", className: "w-2/12" },
  { title: "Tổng", value: "tong", className: "w-2/12" },
];
const SumaryOrder = () => {
  const groups = groupBy(orders.slice(0, 10), "user_created.id");
  const list = Object.keys(groups).map((key) => {
    const items = groups[key];
    return {
      user: items[0].user_created,
      items: items,
    };
  });

  const md = useMediaQuery("(min-width: 768px)");
  if (md)
    return (
      <div className="root-wrapper mx-auto my-32">
        <div className="tex-center">
          <AnimateLineText className="alata text-3xl justify-center leading-relaxed">Tổng hợp</AnimateLineText>
          <AnimateText delay={0.5} className="alata text-5xl justify-center text-primary-01 leading-relaxed">CÁC MÓN ĐÃ ĐẶT </AnimateText>
          <AnimateView delay={2} className=" text-gray-500 mb-10">
            Không cần kiếm tra tin nhắn trên <br /> zalo / lark / teamview ...
          </AnimateView>
        </div>
        <div className="w-full border border-gray-300 rounded-md">
          <div className="flex items-center w-full">
            {options.map((option, index) => {
              return (
                <ItemTable className={option.className + " font-bold text-gray-600"} key={index + "-option"}>
                  {option.title}
                </ItemTable>
              );
            })}
          </div>
          <div>
            {list?.map((elm, index) => {
              const fullname = elm.user.first_name + " " + elm.user.last_name;
              return (
                <div key={index + "-elm"} className="flex items-stretch border-gray-300 border-t text-gray-500 text-md">
                  <ItemTable className={options[0].className}>
                    <div className="flex items-center gap-2 w-full">
                      <img
                        src={elm?.user?.avatar ? createImage(elm.user.avatar, 200) : enumFood[index % enumFood.length]}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border-2 border-white"
                      />
                      <span>{fullname}</span>
                    </div>
                  </ItemTable>
                  <ItemTable className={options[1].className}>
                    <div className="flex flex-col gap-2">
                      {elm.items.map((el, index) => {
                        return (
                          <div key={el.name + index + "name"} className="flex items-center">
                            <span className="mr-3"> - {el.name} </span>
                          </div>
                        );
                      })}
                    </div>
                  </ItemTable>
                  <ItemTable className={options[2].className}>
                    <div className="flex flex-col gap-2">
                      {elm.items.map((el, index) => {
                        return (
                          <div key={el.note + "note" + index}>
                            {el.note ? "-" : ""}
                            {el.note || " "}
                          </div>
                        );
                      })}
                    </div>
                  </ItemTable>
                  <ItemTable className={options[3].className}>
                    <div className="flex flex-col gap-2">
                      {elm.items.map((el, index) => (
                        <div key={el.date_created + "note" + index}>{dayjs(el.date_created).format("HH:mm")}</div>
                      ))}
                    </div>
                  </ItemTable>
                  <ItemTable className={options[4].className}>
                    {elm.items.reduce((total, item) => total + parseInt(item.price), 0)} cá
                  </ItemTable>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  return (
    <div>
      <div className="text-xl text-left mb-4">Danh sách đặt món</div>
      <div className="border border-dashed border-gray-200 px-1 rounded-md">
        {list?.map((elm, index) => {
          const fullname = elm.user.first_name + " " + elm.user.last_name;

          return (
            <div key={index + "-elm"} className="flex flex-col gap-2 border-b border-gray-200 last:border-b-0 pb-4 mb-2">
              <div className="flex items-center gap-2 w-full">
                <img
                  src={elm?.user?.avatar ? createImage(elm.user.avatar, 200) : enumFood[index % enumFood.length]}
                  alt=""
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-white"
                />
                <span>{fullname}</span>
              </div>
              <div className="flex flex-col gap-2">
                {elm.items.map((el, index) => {
                  return (
                    <div key={el.name + index + "name"} className="flex items-center">
                      <span className="mr-3"> -{el.name} </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SumaryOrder;
