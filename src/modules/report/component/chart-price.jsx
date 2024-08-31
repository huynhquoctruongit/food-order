import { useAuth } from "@/hooks/use-auth";
import { useMediaQuery } from "usehooks-ts";
import useSWR from "swr";

const ChartPrice = () => {
  const { profile } = useAuth();
  const isMd = useMediaQuery("(min-width: 768px)");
  const payload = {
    filter: { company: { _eq: profile.company }, status: { _eq: "published" }, user_created: { _eq: profile.id } },
    groupBy: ["week(date_created)"],
    aggregate: { sum: ["price", "delivery_fee"] },
  };
  const { data: report } = useSWR(["/items/order", payload]);
  const gap = 50;
  const height = isMd ? 48 : 32;
  const week = [...(report?.data || [])];

  if (report?.data.length)
    week.unshift(
      { sum: { price: 0, delivery_fee: 0 }, date_created_week: null },
      { sum: { price: 0, delivery_fee: 0 }, date_created_week: null },
    );

  const listPrice = Array.from({ length: 7 }, (_, i) => gap * i).reverse();

  return (
    <div className="text-left">
      <div className="rounded-md w-full p-3 md:p-6 flex border border-primary-01">
        <div>
          <div className="">
            {listPrice.map((price, index) => (
              <div key={price + "price" + index} className="h-10 flex items-end border-dashed border-b">
                {price}
              </div>
            ))}
          </div>
          <div className="flex items-center ">
            <div className="w-12 md:w-20 h-10 relative"></div>
            <div className="items-center gap-4 md:gap-10 flex">
              {week.map((item, index) => {
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
    </div>
  );
};

export default ChartPrice;
