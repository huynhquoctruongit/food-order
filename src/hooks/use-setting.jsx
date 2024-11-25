import useSWR from "swr";

const useSetting = () => {
  const { data, isLoading } = useSWR("/items/setting");
  const setting = data?.data;
  return { setting, isLoading };
};

export default useSetting;
