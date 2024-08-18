import { useParams } from "react-router-dom";
import useSWR from "swr";

const useHistory = () => {
  const payload = {
    filter: {
      user_created: "$CURRENT_USER",
    },
    limit: 10,
  };
  const { data, error, isLoading } = useSWR(["/items/order", payload]);
  const history = data?.data || [];
  const lastOrder = history[history.length - 1];
  return { history, isLoading, error, lastOrder };
};

export const useOdersIsNotPaid = () => {
  const { companyId } = useParams();
  const payload = {
    filter: {
      user_created: "$CURRENT_USER",
      is_paid: false,
      company: companyId,
      status: "published",
    },
  };
  const { data, error, isLoading, mutate } = useSWR(["/items/order", payload]);
  const orders = data?.data || [];

  return { orders, isLoading, error, mutate };
};

export default useHistory;
