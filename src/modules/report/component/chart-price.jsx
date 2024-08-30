import { useAuth } from "@/hooks/use-auth";
import AxiosClient from "@/lib/api/axios-client";
import { useEffect } from "react";
import useSWR from "swr";

const ChartPrice = () => {
  const { profile } = useAuth();
  const payload = {
    filter: { company: { _eq: profile.company }, status: { _eq: "published" }, user_created: { _eq: profile.id } },
    groupBy: ["week(date_created)"],
    aggregate: { sum: ["price", "delivery_fee"] },
  };
  const { data: report } = useSWR(["/items/order", payload]);
  const gap = 100;
  const week = [...(report?.data || [])];

  if (report?.data.length)
    week.unshift(
      { sum: { price: 0, delivery_fee: 0 }, date_created_week: null },
      { sum: { price: 0, delivery_fee: 0 }, date_created_week: null },
    );

  const listPrice = Array.from({ length: 7 }, (_, i) => gap * i).reverse();

  return (
    <div className="mb-20 text-left">
      <div className="rounded-md w-fit p-6 flex border border-primary-01">
        <div>
          <div className="">
            {listPrice.map((price) => (
              <div key={price} className="h-10 flex items-end border-dashed border-b">
                {price}
              </div>
            ))}
          </div>
          <div className="flex items-center ">
            <div className="w-20 h-10 relative"></div>
            <div className="items-center gap-10 flex">
              {week.map((item, index) => {
                const value = parseInt(item.sum.price) + (parseInt(item.sum.delivery_fee) || 0);
                const label = item.date_created_week === null ? null : `T.${item.date_created_week}`;
                return (
                  <div className="h-10 relative w-10 cursor-pointer" key={label}>
                    <div className="font-bold text-gray-400 pt-2 text-center">{label}</div>
                    <div
                      className="absolute bottom-full left-0 w-10 hover:bg-primary-01 bg-pastel-pink duration-200 rounded-t-sm"
                      style={{ height: Math.ceil((value * 40) / gap) }}
                    >
                      {value > 0 && (
                        <div className="absolute bottom-full left-0 w-10 text-sm text-center rounded-t-sm">{value}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartPrice;
