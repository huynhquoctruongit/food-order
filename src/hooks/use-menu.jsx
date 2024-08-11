import dayjs from "dayjs";
import useSWR from "swr";

const useMenu = () => {
  const today = dayjs().startOf("day").toISOString();
  const { data, mutate, isLoading } = useSWR(`/items/menu?fields=*&sort=-date_created&filter[date_created][_gte]=${today}`);
  return { data, mutate, isLoading };
};

export default useMenu;
