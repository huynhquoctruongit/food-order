import { useAuth } from "@/hooks/use-auth";

import useSWR from "swr";

const LabelInfo = () => {
  const { profile } = useAuth();
  const payload = {
    filter: { company: { _eq: profile.company }, status: { _eq: "published" }, user_created: { _eq: profile.id } },
    aggregate: { sum: ["price", "delivery_fee"], count: ["id"] },
  };
  const { data: report } = useSWR(["/items/order", payload]);
  const { data: historyRes } = useSWR(["/items/order?limit=5"]);
  const list = report?.data || [];
  const total = list.reduce((total, item) => total + parseInt(item.sum.price) + (parseInt(item.sum.delivery_fee) || 0), 0);
  const totalOlder = list.reduce((total, item) => total + parseInt(item.count.id), 0);
  const history = historyRes?.data || [];

  return (
    <div className="w-full flex-1 relative text-left">
      <div className="flex flex-col gap-6 md:absolute top-0 left-0 w-full h-full">
        <div className="gap-6 grid md:grid-cols-2">
          <div className="border-primary-01/40 border rounded-lg h-fit ring-[6px] bg-white ring-primary-01/5 ring-offset-0">
            <div className="p-6">
              <div className="text-lg text-black font-black uppercase">Tổng tiền</div>
              <div className="text-4xl text-primary-01 mt-4 font-bold ">{total} cá</div>
            </div>
          </div>
          <div className="border-primary-01/40 border rounded-lg h-fit ring-[6px] bg-white ring-primary-01/5 ring-offset-0">
            <div className="p-6">
              <div className="text-lg text-black font-black uppercase">Tổng món</div>
              <div className="text-4xl text-primary-01 mt-4 font-bold">{totalOlder} Món</div>
            </div>
          </div>
        </div>
        <div className="relative w-full flex-1">
          <div className="border-primary-01/40 border rounded-lg col-span-2 text-left ring-[6px] bg-white ring-primary-01/5 ring-offset-0">
            <div className="p-6">
              <div className="text-lg text-black font-black">LỊCH SỬ 5 MÓN</div>
              <div className="flex flex-col gap-0.5 mt-1 text-left">
                {history.map((item) => (
                  <div key={item.id}> - {item.name}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelInfo;
