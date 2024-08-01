import dayjs from "dayjs";
import useSWR from "swr";

const useOrder = () => {
  const todayFormatted = dayjs().format("YYYY-MM-DD");
  const { data, mutate, isLoading } = useSWR(
    `/items/order_84?fields=*,user.*&filter[date_created][_gte]=${todayFormatted}T00:00:00.000Z`
  );
  const orders = data?.data?.data || [];
  return { data, orders, mutate, isLoading };
};

export default useOrder;
