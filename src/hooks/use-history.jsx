import useSWR from "swr";

const useHistory = () => {
  const payload = {
    filter: {
      user_created: "$CURRENT_USER",
    },
    limit: 10
    // sort: "date_created",
  };
  const { data, error, isLoading } = useSWR(["/items/order", payload]);
  const history = data?.data || [];
  const lastOrder = history[history.length - 1];

  return { history, isLoading, error, lastOrder };
};

export default useHistory;
