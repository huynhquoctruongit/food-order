import { useAuth } from "@/hooks/use-auth";
import ReportByUser from "../../modules/report/screen/user";

const Report = () => {
  const { isLoading } = useAuth();
  if (isLoading) return null;
  return <ReportByUser />;
};
export default Report;
