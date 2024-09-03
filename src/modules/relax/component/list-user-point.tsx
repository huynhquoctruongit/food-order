import UserProfile from "@/components/widget/user";
import { useSubscribe } from "@/hooks/use-connection";
import { useRef } from "react";
import useSWR from "swr";

const ListUserPoint = () => {
  const { data, mutate } = useSWR("/items/statictis_user?fields=*,user.*&sort=-point&limit=10");
  const listAnswer = data?.data || [];

  const callback = useRef(null);
  callback.current = (data) => {
    const payload = data?.data[0];
    if (!payload) return;
    const newData = [...listAnswer];
    const index = newData.findIndex((item) => item.id === payload.id);
    if (index === -1 && payload) newData.push(payload);
    if (index !== -1) newData[index] = payload;
    mutate({ data: newData.sort((a, b) => b.point - a.point) }, { revalidate: false });
  };
  useSubscribe("update", "statictis_user", ["*,user.*"], {}, callback);
  return (
    <div className="flex flex-col gap-4">
      {listAnswer.map((item) => {
        const profile = item?.user || {};
        return (
          <div key={item.id} className="flex items-center gap-2">
            <div className="rounded-full border-dashed border-pastel-pink border px-2 py-1 text-primary-01">
              {item.point} điểm
            </div>
            <UserProfile
              profile={{
                id: profile.id,
                first_name: profile.first_name,
                last_name: profile.last_name,
                avatar: profile.avatar,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ListUserPoint;
