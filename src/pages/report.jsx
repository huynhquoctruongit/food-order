import { useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import useSWR from "swr";
import dayjs from 'dayjs';
import AxiosAPI from "@/libs/api/axios-client.ts"
import { useState } from "react"
import isoWeek from 'dayjs/plugin/isoWeek';
import { useToast } from "@/components/ui/use-toast"

const Report = () => {
    const { toast } = useToast()
    dayjs.extend(isoWeek);
    let urlParams = new URLSearchParams(window.location.search);
    const weekUrl = urlParams.get("week")
    const [dataReport, setDataReport] = useState()
    const [currentSelect, setCurrentSelect] = useState()
    const [userSelect, setSelectUser] = useState({})
    const dateCurrent = currentSelect?.[0] + "T05:00:00.000Z"
    const { data: orderToday, mutate: mutateOrder } = useSWR(currentSelect?.[0] &&
        `/items/order_84?fields=*,user.*&filter[date_created][_between]=${currentSelect?.[0]},${currentSelect?.[4]}T05:00:00.000Z`
    )
    const { data: reciptData, mutate: mutateRecipt } = useSWR(currentSelect?.[0] &&
        `/items/recipt_84?fields=*,user.*&filter[date_start][_eq]=${dateCurrent}`
    )
    const orderMembers = orderToday?.data?.data
    const reciptList = reciptData?.data?.data
    const groupedData = orderMembers?.reduce((acc, { user, name, price, date_created, id }) => {
        let group = acc.find(group => group.user.id === user?.id);
        if (!group) {
            group = { user: { id: user?.id, fullname: user?.fullname }, items: [] };
            acc.push(group);
        }
        group.items.push({ name: name, date_created: date_created, orderId: id, price: price });
        return acc;
    }, []);
    const admin = userSelect?.fullname == "Hồng Phạm"

    const onUpdateOrder = (e, item, ortherList, date, type) => {
        const price = e.target.value
        const params = {
            order_id: ortherList?.id || ortherList?.orderId,
            note: "Nước",
            name: type,
            user: item.user.id,
            price: price || 0,
            date_created: date + "T12:00:00+07:00"
        }
        setDataReport({
            ...dataReport,
            [item.user.id + "-" + date]: params
        })
    }
    useEffect(() => {
        const userLocal = localStorage.getItem("user")
        if (userLocal) {
            setSelectUser(JSON.parse(userLocal))
        }
    }, [])
    const onSave = () => {
        if (dataReport) {
            toast({
                title: "Lưu thành công",
                description: "Yeahh yeahh !!!",
            })
            Object.fromEntries(
                Object.entries(dataReport).filter(async ([key, value]) => {
                    const params = {
                        note: value.note,
                        name: value.name,
                        user: value.user,
                        price: value.price || 0,
                        date_created: value.date_created
                    }
                    const paramsRecipt = {
                        user: value.user,
                        amount: value.price || 0,
                        date_start: value.date_created
                    }
                    if (value.name == "recipt") {
                        if (value.order_id) await AxiosAPI.patch("/items/recipt_84/" + value.order_id, paramsRecipt)
                        else if (value.price) await AxiosAPI.post("/items/recipt_84", paramsRecipt)
                        mutateRecipt()
                        toast({
                            title: "Lưu thành công",
                            description: "Yeahh yeahh !!!",
                        })
                    } else {
                        if (value.order_id) await AxiosAPI.patch("/items/order_84/" + value.order_id, params)
                        else if (value.price) await AxiosAPI.post("/items/order_84", params)
                        mutateOrder()
                        toast({
                            title: "Lưu thành công",
                            description: "Yeahh yeahh !!!",
                        })
                    }
                })
            );
        }

    }

    const getMount = (orderUser) => {
        var total = 0
        orderUser?.items?.map((elm) => {
            total = total + parseInt(elm.price)
        })
        reciptList?.map((elm) => {
            if (orderUser.user.id == elm.user.id) {
                total = total - Math.ceil(elm?.amount)
            }
        })
        return total
    }

    const getDatesForWeek = (week) => {
        const startOfWeek = dayjs().isoWeek(week).startOf('isoWeek');
        return Array.from({ length: 5 }, (_, i) => startOfWeek.add(i, 'day').format('YYYY-MM-DD'));
    };
    const current = dayjs().isoWeek();
    const weekList = {
        weekBeforeLast: getDatesForWeek(current - 2),
        lastWeek: getDatesForWeek(current - 1),
        thisWeek: getDatesForWeek(current),
    }

    const selectWeek = (e) => {
        window.history.replaceState({}, '', `?week=${e.target.value}`);
        setCurrentSelect(weekList[e.target.value])
    }
    useEffect(() => {
        setCurrentSelect(weekList[weekUrl])
    }, [weekUrl])

    return (
        <div className="py-[23px] bg-white text-black min-h-[calc(100vh-64px)]">
            <div className="px-[20px] md:px-[100px]">
                <div className="flex justify-start">
                    <select defaultValue={weekUrl} onChange={(e) => selectWeek(e)} className="p-[10px] bg-white text-black border-[1px] border-black">
                        <option disabled selected>Chọn tuần</option>
                        {Object.keys(weekList).map(function (key, index) {
                            const title = weekList[key][0]?.slice(-2) + "-" + weekList[key][4]?.slice(-2)
                            return (
                                <option value={key}>{`[${title}] ` + key}</option>
                            )
                        })}

                    </select>
                </div>
                <div className="flex justify-between items-center my-[20px]">
                    <h1 className="font-bold mb-[20px]">Báo cáo</h1>
                    <div>
                        {admin && <div className="border-[1px] border-black px-[30px] py-[10px] cursor-pointer bg-green-600 text-white" onClick={onSave}>Lưu</div>}
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="border-t-[1px] border-t-black border-b-black">
                            <TableHead className="w-[200px] px-0 font-bold border-r-[1px] border-r-black">Tên</TableHead>
                            {currentSelect?.map((elm, index) => {
                                return (
                                    <TableHead className="font-bold px-0 items-center mx-auto border-r-[1px] border-r-black">
                                        <p className="text-center p-[10px]">Thứ {index + 2} ({dayjs(elm).format('DD/MM')})</p>
                                        <div className="flex items-center border-t-[1px] border-t-black p-[10px]"><p className="w-[50%] text-center">Đồ ăn</p><> | </> <p className="w-[50%] text-center whitespace-nowrap">Đồ uống</p></div>
                                    </TableHead>
                                )
                            })}
                            <TableHead className="font-bold px-0 items-center mx-auto border-r-[1px] border-r-black">
                                <p className="text-center p-[10px]">Đã chuyển</p>
                            </TableHead>
                            <TableHead className="text-right font-bold">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groupedData?.map((userItem) => {
                            const recipt = reciptList?.find((elm) => elm.user.fullname === userItem.user.fullname && dayjs(elm.date_start).format("YYYY-MM-DD") == currentSelect?.[0])
                            return (
                                <TableRow key={userItem.user.fullname}>
                                    <TableCell className="font-medium text-left"><div className="p-[6px]">{userItem.user.fullname}</div></TableCell>
                                    {currentSelect?.map((elm, index) => {
                                        const ortherList = userItem?.items?.find((ortherItem) => ortherItem.name === "orther-food" && dayjs(ortherItem.date_created).format("YYYY-MM-DD") == elm)
                                        const riceList = userItem?.items?.filter((riceItem) => riceItem.name !== "orther-food" && dayjs(riceItem.date_created).format("YYYY-MM-DD") == elm)
                                        const match = ortherList && dayjs(ortherList.date_created).format("YYYY-MM-DD") == elm
                                        return (
                                            <TableCell key={weekUrl + index + "-elm-wrapper"} className="text-left">
                                                <input key={weekUrl + index + "-elm-input1"} disabled className="p-[6px] w-[50%] text-center bg-white text-black select-none" value={riceList?.length ? riceList?.length * 35 : ""}></input>
                                                <input key={weekUrl + index + "-elm-input2"} disabled={!admin} className={`p-[6px] w-[50%] text-center bg-white text-black ${admin && "border-[1px] border-black"}`} defaultValue={match ? ortherList?.price : ""} onChange={(e) => onUpdateOrder(e, userItem, ortherList, dayjs(elm + "T12:00:00+07:00").format("YYYY-MM-DD"), "orther-food")}></input>
                                            </TableCell>
                                        )
                                    })}
                                    <TableCell className="text-left">
                                        <input disabled={!admin} className={`p-[6px] w-[100%] text-center bg-white text-black ${admin && "border-[1px] border-black"}`} defaultValue={recipt?.amount && Math.ceil(recipt?.amount)} onInput={(e) => onUpdateOrder(e, userItem, recipt, currentSelect[0], "recipt")}></input>
                                    </TableCell>
                                    <TableCell className="text-right font-bold">{getMount(userItem)}k</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="bg-black hover:bg-black hover:text-white text-white">
                            <TableCell className="font-bold text-left" colSpan={5}>Còn lại</TableCell>
                            <TableCell className="text-right font-bold" colSpan={5}>{orderMembers?.length * 35}k</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>

        </div>

    )
}
export default Report
