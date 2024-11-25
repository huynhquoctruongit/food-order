import { useAuth } from "@/hooks/use-auth";
import dayjs from "dayjs";
import { useParams, useSearchParams } from "react-router-dom";
import useSWR from "swr";

const useOrder = () => {
  const [query, _] = useSearchParams();
  const { providerId, companyId } = useParams();
  const backday = query.get("backday");
  const { profile } = useAuth();

  const today = dayjs()
    .add(backday ? backday * -1 : 0, "day")
    .startOf("day")
    .toISOString();
  const payload = {
    filter: {
      date_created: {
        _gte: today,
      },
      status: "published",
      bulk_food_provider: providerId,
      company: companyId,
    },
    auth: profile?.id ? "true" : "",
    sort: "date_created",
    fields: "*,user_created.*",
  };
  const { data, mutate, isLoading } = useSWR([`/items/order`, payload]);
  const orders = data?.data || [];

  return { orders, mutate, isLoading };
};

export default useOrder;
