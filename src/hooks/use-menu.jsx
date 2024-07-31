import dayjs from "dayjs";
import useSWR from "swr";

const useMenu = () => {
  const todayFormatted = dayjs().format("YYYY-MM-DD");
  const { data, mutate, isLoading } = useSWR(
    `/items/menus?fields=*&sort=-date_created&filter[date_created][_gte]=${todayFormatted}T00:00:00.000Z`
  );
  return { data, mutate, isLoading };
};

export default useMenu;
