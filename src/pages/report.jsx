import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import useSWR from "swr";
import dayjs from 'dayjs';

const Report = () => {
    const { data: orderToday } = useSWR(
        `/items/order_84?fields=*,user.*`
    )
    const orderMembers = orderToday?.data?.data
    const groupedData = orderMembers?.reduce((acc, { user, name, date_created }) => {
        let group = acc.find(group => group.user.id === user?.id);
        if (!group) {
            group = { user: { id: user?.id, fullname: user?.fullname }, items: [] };
            acc.push(group);
        }
        group.items.push({ name: name, date_created: date_created });
        return acc;
    }, []);
    return (
        <div className="root-wrapper py-20">
            <h1 className="font-bold mb-[20px]">Báo cáo</h1>
            <Table>
                {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px] font-bold">Tên</TableHead>
                        <TableHead className="font-bold">Đă ăn</TableHead>
                        <TableHead className="font-bold">Đơn giá</TableHead>
                        <TableHead className="font-bold">Ngày đặt</TableHead>
                        <TableHead className="text-right font-bold">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groupedData?.map((userItem) => (
                        <TableRow key={userItem.userItem}>
                            <TableCell className="font-medium text-left">{userItem.user.fullname}</TableCell>
                            <TableCell className="text-left">{userItem.items.map((elm) => (
                                <p>- {elm.name}</p>
                            ))}</TableCell>
                            <TableCell className="text-left">35k/món</TableCell>
                            <TableCell className="text-left">{userItem.items.map((elm) => (
                                <p>{dayjs(elm.date_created).format("HH:MM - DD/MM/YYYY")}</p>
                            ))}</TableCell>
                            <TableCell className="text-right">{userItem.items?.length}món / {userItem.items?.length * 35}k</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow className="bg-[#F5F5F7]">
                        <TableCell className="font-bold text-left" colSpan={3}>Tổng thiệt hại</TableCell>
                        <TableCell className="text-right font-bold" colSpan={2}>{orderMembers?.length * 35}k</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>

    )
}
export default Report
