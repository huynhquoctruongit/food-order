import UserProfile from "@/components/widget/user";
import { useSubscribe } from "@/hooks/use-connection";
import { useRef } from "react";
import useSWR from "swr";

const ListUserPoint = () => {
  const { data, isLoading, mutate } = useSWR("/items/statictis_user?sort=-point&limit=10");
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
    <div>
      {listAnswer.map((item) => {
        return (
          <div key={item.id} className="flex items-center gap-2">
            <div className="rounded-full border-dashed border-pastel-pink border px-2 py-1 text-primary-01">{item.point} điểm</div>
            <UserProfile
              profile={{
                id: "qqweqew",
                first_name: " Nhất",
                last_name: "Nguyễn  ",
                avatar: "1eb2299c-f72a-42e8-8cb7-3910f3e83618",
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ListUserPoint;
