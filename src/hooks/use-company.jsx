import useSWR from "swr";
import { useAuth } from "./use-auth";
import { useParams } from "react-router-dom";

const useCompanyManager = () => {
  const { profile } = useAuth();
  const payload = {
    filter: {
      admin: profile.id,
    },
    limit: 1,
  };
  const { data, error, isLoading } = useSWR(["/items/company", payload]);
  const company = data?.data?.[0];
  return { company, isLoading, error };
};

export const useCompany = () => {
  const { companyId } = useParams();
  const { data, error, isLoading } = useSWR("/items/company/" + companyId);
  const company = data?.data;
  return { company, isLoading, error };
};

export const useUserInCompany = () => {
  const { companyId } = useParams();
  const { data, error, isLoading } = useSWR("/users?filter[company][_eq]=" + companyId);
  const users = data?.data || [];

  return { users, isLoading, error };
};

export default useCompanyManager;
