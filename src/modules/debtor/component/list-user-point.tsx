import UserProfile from "@/components/widget/user";
import { useSubscribe } from "@/hooks/use-connection";
import { createImage } from "@/lib/helper";
import groupBy from "lodash/groupBy";
import { useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import useSWR from "swr";
const top = [
  { img: "/top/top-1.png", title: "Thông hiểu cả trời đất" },
  { img: "/top/top-2.png", title: "Trên thông thiên văn dưới tường địa lý" },
  { img: "/top/top-3.png", title: "Đa mưu túc trí" },
  { img: "/top/top-4.png", title: "Sáng suốt như rồng bay" },
  { img: "/top/top-5.png", title: "Tài năng vững như bàn thạch" },
];

const ListUserPoint = () => {
  const { companyId } = useParams();
  const limit = 5;
  const payload = {
    fields: "*,user_created.*",
    filter: {
      confirm_paid: { _eq: false },
      company: { _eq: companyId || 3 },
      status: { _eq: "published" },
    },
  };
  const { data, mutate } = useSWR([`/items/order`, payload]);
  const listOrrder = data?.data || [];
  const user = groupBy(listOrrder, "user_created.id");

  const topUserDebtor = useMemo(() => {
    const data = Object.keys(user).map((key) => {
      const total = user[key].reduce((acc, item) => {
        return acc + item.price;
      }, 0);
      return { total, user_created: user[key][0].user_created, count: user[key].length };
    });
    return data.sort((a, b) => b.total - a.total);
  }, [data?.data]);

  return (
    <div className="flex flex-col gap-10">
      {(topUserDebtor || []).map((item, index) => {
        const profile = item?.user_created || {};
        const fullname = profile.first_name + " " + profile.last_name + "";
        const detail = top[index] || { img: "", title: "" };

        return (
          <div key={profile.id} className="flex items-center gap-2 group relative">
            <div className="text-xl font-bold text-primary-01 min-w-[24px]">
              {index >= 5 ? index + 1 : <img className="w-6 min-w-6" src={detail?.img} alt={profile.title} />}
            </div>
            <div className="flex items-center gap-4 ml-2">
              <div className="w-10 h-10 rounded-full bg-pastel-pink/50 p-1 shadow">
                <img className="w-8 h-8 rounded-full object-cover" src={createImage(profile.avatar, 100)} />
              </div>
              <div>
                <div className="flex flex-col gap-2">
                  <div className="text-xl font-bold">{fullname}</div>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2 ">
                  <span>{item.total} Cá</span>/<span className="text-green-600"> </span> với <span>{item.count} lần đặt</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ListUserPoint;
