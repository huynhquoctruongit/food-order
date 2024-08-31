import { useAuth } from "@/hooks/use-auth";
import { useMediaQuery } from "usehooks-ts";
import useSWR from "swr";

const ChartPrice = () => {
  const { profile } = useAuth();
  const isMd = useMediaQuery("(min-width: 768px)");
  const payload = {
    filter: {
      company: { _eq: profile.company },
      status: { _eq: "published" },
      user_created: { _eq: profile.id },
      date_created: { _gte: "$NOW(-5 week)" },
    },
    groupBy: ["week(date_created)"],
    aggregate: { sum: ["price", "delivery_fee"] },
  };
  const { data: report } = useSWR(["/items/order", payload]);
  const gap = 50;
  const height = isMd ? 48 : 32;
  const week = [...(report?.data || [])];
  const again = Array.from({ length: 5 - week.length }, (_, i) => ({
    sum: { price: 0, delivery_fee: 0 },
    date_created_week: null,
  }));

  const listPrice = Array.from({ length: 7 }, (_, i) => gap * i).reverse();

  return (
    <div className="text-left">
      {week.length > 0 && (
        <div className="rounded-md w-full p-3 md:p-6 flex border border-primary-01/40 ring-[6px] bg-white ring-primary-01/5 ring-offset-0">
          <div>
            <div className="">
              {listPrice.map((price, index) => (
                <div key={price + "price" + index} className="h-10 flex items-end border-dashed border-b">
                  {price}
                </div>
              ))}
            </div>
            <div className="flex items-center ">
              <div className="w-12 md:w-20 relative"></div>
              <div className="items-center gap-4 md:gap-10 flex">
                {[...again, ...week].map((item, index) => {
                  const value = parseInt(item.sum.price) + (parseInt(item.sum.delivery_fee) || 0);
                  const label = item.date_created_week === null ? null : `T.${item.date_created_week}`;
                  return (
                    <div height={{ height: height }} className=" relative w-10 cursor-pointer" key={label + "prices" + index}>
                      <div className="font-bold text-gray-400 pt-2 text-center text-sm">{label}</div>
                      <div
                        className="absolute bottom-full left-0 w-10 hover:bg-primary-01 bg-pastel-pink duration-200 rounded-t-sm"
                        style={{ height: Math.ceil((value * height) / gap) }}
                      >
                        {value > 0 && (
                          <div className="absolute bottom-full left-0 w-10 text-xs text-center rounded-t-sm mb-2">{value}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {week.length === 0 && (
        <div className="text-center text-gray-400 border border-primary-01/40 ring-[6px] bg-white ring-primary-01/5 ring-offset-0 min-h-[300px] md:min-w-[350px]">
          Không có dữ liệu
        </div>
      )}
    </div>
  );
};

export default ChartPrice;
