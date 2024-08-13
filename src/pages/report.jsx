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
import { Button } from "@/components/ui/button-hero.jsx";

const Report = () => {
    const { toast } = useToast()
    dayjs.extend(isoWeek);
    let urlParams = new URLSearchParams(window.location.search);
    const weekUrl = urlParams.get("week")
    const [dataReport, setDataReport] = useState()
    const [currentSelect, setCurrentSelect] = useState()
    const [userSelect, setSelectUser] = useState({})
    const [valueChange, setChange] = useState("")
    const dateCurrent = currentSelect?.[0] + "T05:00:00.000Z"
    const { data: orderToday, mutate: mutateOrder } = useSWR(currentSelect?.[0] &&
        `/items/order_84?fields=*,user.*&filter[date_created][_between]=${currentSelect?.[0]},${currentSelect?.[4]}T24:00:00.000Z`
    )
    const { data: reciptData, mutate: mutateRecipt } = useSWR(currentSelect?.[0] &&
        `/items/recipt_84?fields=*,user.*&filter[date_start][_eq]=${dateCurrent}`
    )
    const orderMembers = orderToday?.data?.data
    const reciptList = reciptData?.data?.data
    const groupedData = orderMembers?.reduce((acc, { user, name, price, date_created, id }) => {
        let group = acc.find(group => (group.user.id == user?.id || group.user.fullname === user?.fullname));
        if (!group) {
            group = { user: { id: user?.id, fullname: user?.fullname }, items: [] };
            acc.push(group);
        }
        group.items.push({ name: name, date_created: date_created, orderId: id, price: price });
        return acc;
    }, []);
    const admin = userSelect?.fullname == "Hồng Phạm"

    const onUpdateOrder = (e, item, ortherList, date, type) => {
        var priceInput = e.target.value

        if (e.key === 'Enter' || e.keyCode === 13) {
            priceInput = eval(priceInput)
        }
        const price = priceInput
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
            if (orderUser.user.id == elm?.user?.id) {
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
        <div className="bg-[url(/background.png)] bg-contain py-[23px] bg-white text-gray-600 min-h-[calc(100vh-64px)]">
            <div className="px-[20px] md:px-[100px]">
                <div className="flex justify-start">
                    <select defaultValue={weekUrl} onChange={(e) => selectWeek(e)} className="rounded-md p-[10px] bg-white text-gray-600 border-[1px] border-pastel-pink">
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
                    <h1 className="text-[20px] md:text-3xl font-bold text-gray-600 text-center">Báo cáo</h1>
                    <div>
                        {admin && <Button variant="default" size="default" onClick={onSave}>
                            Lưu lại
                        </Button>}
                    </div>
                </div>
                <Table>
                    <TableHeader className="border-l-[1px] border-l-pastel-pink border-r-[1px] border-r-pastel-pink">
                        <TableRow className="rounded-md border-t-[1px] border-t-pastel-pink border-b-pastel-pink">
                            <TableHead className="bg-white rounded-md w-[200px] px-0 font-bold border-r-[1px] border-r-pastel-pink text-center">Tên</TableHead>
                            {currentSelect?.map((elm, index) => {
                                return (
                                    <TableHead className="bg-white font-bold px-0 items-center mx-auto border-r-[1px] border-r-pastel-pink">
                                        <p className="text-center p-[10px]">Thứ {index + 2} ({dayjs(elm).format('DD/MM')})</p>
                                        <div className="flex items-center border-t-[1px] border-t-pastel-pink p-[10px]"><p className="w-[50%] text-center">Đồ ăn</p><> | </> <p className="w-[50%] text-center whitespace-nowrap">Đồ uống</p></div>
                                    </TableHead>
                                )
                            })}
                            <TableHead className="bg-white rounded-md font-bold px-0 items-center mx-auto border-r-[1px] border-r-pastel-pink">
                                <p className="text-center p-[10px]">Đã chuyển</p>
                            </TableHead>
                            <TableHead className="bg-white text-right font-bold">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="border-l-[1px] border-l-pastel-pink border-r-[1px] border-r-pastel-pink">
                        {groupedData?.map((userItem, index) => {
                            const recipt = reciptList?.find((elm) => elm?.user?.fullname === userItem?.user?.fullname && dayjs(elm.date_start).format("YYYY-MM-DD") == currentSelect?.[0])
                            return (
                                <TableRow className={`${index % 2 == 0 ? "bg-pastel-pink/30" : "bg-white"} hover:bg-unset`} key={userItem.user.id + index + "group"}>
                                    <TableCell className="font-medium text-left p-2"><div className="p-[6px]">{userItem.user.fullname}</div></TableCell>
                                    {currentSelect?.map((elm, index) => {
                                        const ortherList = userItem?.items?.find((ortherItem) => ortherItem.name === "orther-food" && dayjs(ortherItem.date_created).format("YYYY-MM-DD") == elm)
                                        const riceList = userItem?.items?.filter((riceItem) => riceItem.name !== "orther-food" && dayjs(riceItem.date_created).format("YYYY-MM-DD") == elm)
                                        const match = ortherList && dayjs(ortherList.date_created).format("YYYY-MM-DD") == elm
                                        const date = dayjs(elm + "T12:00:00+07:00").format("YYYY-MM-DD")
                                        const valueInput = userItem.user.id + "-" + date
                                        const valueWater = dataReport?.[valueInput]?.price
                                        console.log(valueWater, 'valueWater');
                                        return (
                                            <TableCell key={userItem.user.id + date + index + "-elm-wrapper"} className="text-left p-2">
                                                <input key={userItem.user.id + date + index + "-elm-input1"} disabled className="rounded-md p-[6px] w-[50%] text-center bg-transparent text-gray-600 select-none" value={riceList?.length ? riceList?.length * 35 : ""}></input>
                                                <input key={userItem.user.id + date + index + "-elm-input2"} disabled={!admin} className={`rounded-md p-[6px] w-[50%] text-center bg-transparent text-gray-600 ${admin && "border-[1px] border-pastel-pink"}`} value={valueWater} defaultValue={match ? ortherList?.price : ""}  onKeyUp={(e) => onUpdateOrder(e, userItem, ortherList, date, "orther-food")}></input>
                                            </TableCell>
                                        )
                                    })}
                                    <TableCell className="text-left p-2">
                                        <input disabled={!admin} className={`rounded-md p-[6px] w-[100%] text-center bg-transparent text-gray-600 ${admin && "border-[1px] border-pastel-pink"}`} defaultValue={recipt?.amount && Math.ceil(recipt?.amount)} onKeyUp={(e) => onUpdateOrder(e, userItem, recipt, currentSelect[0], "recipt")}></input>
                                    </TableCell>
                                    <TableCell className="text-right font-bold p-2">{getMount(userItem)}k</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="bg-pastel-pink hover:bg-pastel-pink hover:text-white text-white">
                            <TableCell className="font-bold text-left" colSpan={5}>Tổng</TableCell>
                            <TableCell className="text-right font-bold" colSpan={5}>Tự tính dùm cái i</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>

        </div>

    )
}
export default Report
