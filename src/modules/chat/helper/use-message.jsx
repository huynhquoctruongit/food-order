import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import useSWR from "swr";

const useMessage = () => {
  const { companyId } = useParams();
  const payload = {
    fields: "*,user_created.*",
    filter: {
      company: companyId,
      date_created: { _gte: dayjs().startOf("day").toISOString() },
    },
  };
  const { data, loading, isLoading, mutate } = useSWR(["/items/message", payload]);
  const setMessages = (message) => {
    console.log(message);
    const newData = { ...data };

    newData.data = [...newData.data, message];
    console.log(newData);

    mutate(newData, { revalidate: false });
  };
  const messages = data?.data || [];
  return { messages, loading, isLoading, setMessages };
};
export default useMessage;
