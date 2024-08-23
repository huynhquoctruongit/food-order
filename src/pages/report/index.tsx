import { useAuth } from "@/hooks/use-auth"
import ReportByAdmin from "./report-by-admin"
import ReportByUser from "./report-by-user"
const Report = () => {
    const { profile } = useAuth()
    const isAdmin = profile?.permission_to_update_report
    return (
        isAdmin ? <ReportByAdmin /> : <ReportByUser />
    )

}
export default Report