import { useEffect, useRef } from "react"
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
import AxiosAPI from "@/lib/api/axios-client"
import { useState } from "react"
import isoWeek from 'dayjs/plugin/isoWeek';
import { enumWeek } from "./enum"
import { formattedAmount, totalWater } from "../helpers/index"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { isNumber, totalRice } from "../helpers/index";
import { CircleCheckBig, Circle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const Report = () => {
    dayjs.extend(isoWeek);
    let urlParams = new URLSearchParams(window.location.search);
    const weekUrl = urlParams.get("week")
    const [dataReport, setDataReport] = useState()
    const [currentSelect, setCurrentSelect] = useState()
    const [userSelect, setSelectUser] = useState({})
    const dateCurrent = currentSelect?.[0] + "T05:00:00.000Z"
    const { profile } = useAuth()
    console.log(profile.company, 'profile');
    const { data: orderToday, mutate: mutateOrder } = useSWR(currentSelect?.[0] && profile?.company &&
        `/items/order?fields=*,user_created.*&filter[status]=published&filter[company]=${profile.company}&filter[date_created][_between]=${currentSelect?.[0]},${currentSelect?.[4]}T24:00:00.000Z&filter[price][_neq]=0`
    )
    const { data: reciptData, mutate: mutateRecipt } = useSWR(currentSelect?.[0] && profile?.company &&
        `/items/recipt?fields=*&filter[company]=${profile.company}&filter[date_start][_eq]=${dateCurrent}&filter[amount][_neq]=0`
        // `/items/recipt?fields=*`
    )
    const orderMembers = orderToday?.data
    const reciptList = reciptData?.data?.data
    const groupedData = orderMembers?.reduce((acc, { user_created, name, price, date_created, id, is_paid }) => {
        let group = acc.find(group => (group.user.id == user_created?.id || group.user.fullname === user_created?.first_name));
        if (!group) {
            group = { user: { id: user_created?.id, fullname: user_created?.first_name }, items: [] };
            acc.push(group);
        }
        group.items.push({ name: name, date_created: date_created, id: id, price: price, is_paid: is_paid });
        return acc;
    }, []);
    const admin = userSelect?.fullname === "Hồng Phạm"

    const onUpdateOrder = (e, item, ortherList, date, type) => {
        var priceInput = e.target.value
        if (e.key === 'Enter' || e.keyCode === 13) {
            priceInput = eval(priceInput)
        }
        const price = priceInput
        const params = {
            order_id: ortherList?.id,
            note: "Nước",
            name: type,
            user: item.user.id,
            price: price,
            date_created: date + "T12:00:00+07:00"
        }
        setDataReport({
            [item.user.id + "-" + date]: params
        })
    }
    useEffect(() => {
        const userLocal = localStorage.getItem("user")
        if (userLocal) {
            setSelectUser(JSON.parse(userLocal))
        }
    }, [])
    const debounceTimeout = useRef()
    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            onSave()
        }, 200);
        return () => {
            clearTimeout(debounceTimeout.current);
        }

    }, [dataReport])


    const onSave = () => {
        if (dataReport) {
            Object.fromEntries(
                Object.entries(dataReport).filter(async ([key, value]) => {
                    if (isNumber(value.price || 0)) {
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
                        } else {
                            if (value.order_id) await AxiosAPI.patch("/items/order_84/" + value.order_id, params)
                            else if (value.price) await AxiosAPI.post("/items/order_84", params)
                            mutateOrder()
                        }
                    }

                })
            );
        }

    }
    const onPay = async (date, user, item) => {
        if (!item || !admin) return
        const dataItem = item?.id ? item : item[0]
        const isPay = dataItem.is_paid ? true : false
        const params = {
            is_paid: !isPay
        }
        await AxiosAPI.patch("/items/order_84/" + dataItem.id, params)
        mutateOrder()
    }

    const getMount = (orderUser, type) => {
        var total = 0
        orderUser?.items?.map((elm) => {
            total = total + elm.price * 1
        })
        // type == "total-left" && reciptList?.map((elm) => {
        //     if (orderUser.user.id == elm?.user?.id) {
        //         total = total - elm?.amount * 1
        //     }
        // })
        console.log(total,'total');
        return parseFloat(Math.ceil(total?.toFixed(1)));
    }

    const getDatesForWeek = (week) => {
        const startOfWeek = dayjs().isoWeek(week).startOf('isoWeek');
        return Array.from({ length: 5 }, (_, i) => startOfWeek.add(i, 'day').format('YYYY-MM-DD'));
    };
    const current = dayjs().isoWeek();
    const weekList = {
        week_old_4: getDatesForWeek(current - 6),
        week_old_3: getDatesForWeek(current - 5),
        week_old_2: getDatesForWeek(current - 4),
        week_old_1: getDatesForWeek(current - 3),
        week_before_last: getDatesForWeek(current - 2),
        last_week: getDatesForWeek(current - 1),
        this_week: getDatesForWeek(current),
    }

    const selectWeek = (e) => {
        window.history.replaceState({}, '', `?week=${e.target.value}`);
        setCurrentSelect(weekList[e.target.value])
    }
    useEffect(() => {
        setCurrentSelect(weekList[weekUrl])
    }, [weekUrl])

    var totalNumber = groupedData?.reduce((total, { items }) =>
        total + items.reduce((sum, { date_created, price, name }) =>
            sum + (price ? price * 1 : 0), 0), 0);

    // if (!reciptList) return
    const reciptNumber = reciptList?.reduce((acc, { amount }) => acc + parseFloat(amount), 0);
    const totalLeftNumber = totalNumber - reciptNumber

    return (
        <div className="bg-[url(/background.png)] bg-contain pt-[23px] pb-[100px] bg-white text-gray-600 min-h-[calc(100vh-64px)]">
            <div className="px-[20px] md:px-[40px]">
                <div className="flex justify-between">
                    <div>
                        <div className="flex justify-between items-center my-[20px]">
                            <h1 className="text-[20px] md:text-3xl font-bold text-gray-600 text-center">Báo cáo</h1>
                        </div>
                        <div className="flex justify-start mb-10">
                            <select defaultValue={weekUrl} onChange={(e) => selectWeek(e)} className="rounded-md p-[10px] bg-pastel-pink text-gray-600 border-[1px] border-pastel-pink">
                                <option disabled selected>Chọn tuần</option>
                                {Object.keys(weekList).map(function (key, index) {
                                    const title = `Ngày ${dayjs(weekList[key][0]).format("DD/MM")}` + " đến " + `${dayjs(weekList[key][4]).format("DD/MM")}`
                                    return (
                                        <option value={key}>{enumWeek[key] + ` (${title})`}</option>
                                    )
                                })}

                            </select>
                        </div>
                    </div>
                    <div>
                        <p>Tổng tiền cơm: {totalRice(groupedData)}k</p>
                        <p>Tổng tiền nước: {totalWater(groupedData)}k</p>
                        <p>Đã chuyển: {Math.ceil(reciptNumber)}k</p>
                    </div>
                </div>
                <Table>
                    <TableHeader className="sticky top-0 z-50 shadow-sm border-l-[1px] border-l-pastel-pink border-r-[1px] border-r-pastel-pink">
                        <TableRow className="rounded-md border-t-[1px] border-t-pastel-pink border-b-pastel-pink">
                            <TableHead className="bg-white rounded-md w-[150px] px-0 font-bold border-r-[1px] border-r-pastel-pink text-center">Tên</TableHead>
                            {currentSelect?.map((elm, index) => {
                                return (
                                    <TableHead className="bg-white font-bold px-0 items-center mx-auto border-r-[1px] border-r-pastel-pink">
                                        <p className="text-center p-[10px]">Thứ {index + 2} ({dayjs(elm).format('DD/MM')})</p>
                                        <div className="flex items-center border-t-[1px] border-t-pastel-pink p-[10px]"><p className="w-[50%] text-center">Đồ ăn</p><> | </> <p className="w-[50%] text-center whitespace-nowrap">Đồ uống</p></div>
                                    </TableHead>
                                )
                            })}
                            <TableHead className="bg-white text-right font-bold">Tổng</TableHead>
                            <TableHead className="bg-white rounded-md font-bold px-0 items-center mx-auto border-x-[1px] border-x-pastel-pink">
                                <p className="text-center p-[10px]">Đã chuyển</p>
                            </TableHead>
                            <TableHead className="bg-white text-right font-bold">Còn lại</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="border-l-[1px] border-l-pastel-pink border-r-[1px] border-r-pastel-pink">
                        {groupedData?.map((userItem, index) => {
                            const date = dayjs(currentSelect[0] + "T12:00:00+07:00").format("YYYY-MM-DD")
                            const valueInput = userItem.user.id + "-" + date
                            const recipt = reciptList?.find((elm) => elm?.user?.fullname === userItem?.user?.fullname && dayjs(elm.date_start).format("YYYY-MM-DD") == currentSelect?.[0])
                            const valueRecipt = dataReport?.[valueInput]?.name === "recipt" && dataReport?.[valueInput]?.price || undefined
                            return (
                                <TableRow className={`${index % 2 == 0 ? "bg-pastel-pink/30" : "bg-white"} hover:bg-unset`} key={userItem.user.id + date + "group"}>
                                    <TableCell className="font-medium text-left p-2 flex items-center"><div className="p-[6px] text-[13px] line-clamp-2">{userItem.user.fullname}</div></TableCell>
                                    {currentSelect?.map((elm, index) => {
                                        const ortherList = userItem?.items?.find((ortherItem) => ortherItem.name === "orther-food" && dayjs(ortherItem.date_created).format("YYYY-MM-DD") == elm)
                                        const riceList = userItem?.items?.filter((riceItem) => riceItem.name !== "orther-food" && dayjs(riceItem.date_created).format("YYYY-MM-DD") == elm)
                                        const match = ortherList && dayjs(ortherList.date_created).format("YYYY-MM-DD") == elm
                                        const date = dayjs(elm + "T12:00:00+07:00").format("YYYY-MM-DD")
                                        const valueInput = userItem.user.id + "-" + date
                                        const valueWater = dataReport?.[valueInput]?.name !== "recipt" && dataReport?.[valueInput]?.price || undefined
                                        const finalPrice = riceList.reduce((acc, item) => acc + item.price * 1, 0);
                                        return (
                                            <TableCell key={userItem.user.id + date + index + "-elm-wrapper"} className="text-left p-2">
                                                <div className="grid grid-cols-2">
                                                    <Tooltip>
                                                        <TooltipTrigger className="text-center">
                                                            {riceList?.length &&
                                                                <div className="flex items-center"><input key={userItem.user.id + date + index + "-elm-input1"} disabled className="w-[50%] rounded-md p-[6px] text-center bg-transparent text-gray-600 select-none" value={finalPrice}></input>
                                                                    <div onClick={() => onPay(date, userItem, riceList)}>
                                                                        {riceList?.[0].is_paid ? <CircleCheckBig color="#ed4b33" strokeWidth={0.9} size={20} /> : (admin && <Circle color="#ed4b33" strokeWidth={0.9} size={20} />)}
                                                                    </div></div> || ""}
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-white">
                                                            {riceList?.length && <div className="flex flex-col gap-2">{riceList?.map((item) => (
                                                                <div className="flex gap-2 items-center"><img className="w-5 h-5" src="/food9.png"></img><p>{item.name} - <span className="font-bold">{item.price}k</span></p></div>
                                                            ))}</div>}
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <div className="flex items-center gap-2 justify-center">
                                                        <input id={date} key={userItem.user.id + date + index + "-elm-input2"} disabled={!admin} className={`rounded-md p-[6px] w-[50%] text-center bg-transparent text-gray-600 ${admin && "border-[1px] border-pastel-pink"}`} value={valueWater} defaultValue={match ? (ortherList?.price == 0 ? "" : ortherList?.price) : ""} onKeyUp={(e) => onUpdateOrder(e, userItem, ortherList, date, "orther-food")} onChange={(e) => onUpdateOrder(e, userItem, ortherList, date, "orther-food")}></input>
                                                        <div onClick={() => onPay(date, userItem, ortherList)}>
                                                            {ortherList && (ortherList?.is_paid ? <CircleCheckBig color="#ed4b33" strokeWidth={0.9} size={20} /> : (admin && <Circle color="#ed4b33" strokeWidth={0.9} size={20} />)) || <div className="w-5"></div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        )
                                    })}
                                    <TableCell className="text-right p-2">{getMount(userItem, 'total')}</TableCell>
                                    <TableCell className="text-left p-2">
                                        <input disabled={!admin} className={`rounded-md p-[6px] w-[100%] text-center bg-transparent text-gray-600 ${admin && "border-[1px] border-pastel-pink"}`}
                                            defaultValue={formattedAmount(recipt?.amount) || ""}
                                            value={valueRecipt}
                                            // onKeyUp={(e) => onUpdateOrder(e, userItem, recipt, currentSelect[0], "recipt")}
                                            onChange={(e) => onUpdateOrder(e, userItem, recipt, currentSelect[0], "recipt")}
                                        ></input>
                                    </TableCell>
                                    <TableCell className="text-right font-bold p-2">{getMount(userItem, 'total-left')}k</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="bg-pastel-pink hover:bg-pastel-pink">
                            <TableCell className="font-bold text-left">Tổng</TableCell>
                            {currentSelect?.map((elm, index) => {
                                const totalPrice = groupedData?.reduce((total, { items }) =>
                                    total + items?.reduce((sum, { date_created, price, name }) =>
                                        sum + (date_created.startsWith(elm) && price && name !== "orther-food" ? price * 1 : 0), 0), 0);
                                const totalOther = groupedData?.reduce((total, { items }) =>
                                    total + items?.reduce((sum, { date_created, price, name }) =>
                                        sum + (date_created.startsWith(elm) && price && name === "orther-food" ? price * 1 : 0), 0), 0);
                                return (
                                    <TableCell className="text-left p-2">
                                        <input className="w-[50%] text-center bg-transparent font-bold" disabled value={totalPrice}></input>
                                        <input className="w-[50%] text-center bg-transparent font-bold" disabled value={totalOther}></input>
                                    </TableCell>
                                )
                            })}
                            <TableCell className="text-right p-2 font-bold">{totalNumber}</TableCell>
                            <TableCell className="p-2 text-center font-bold">{Math.ceil(reciptNumber)}</TableCell>
                            <TableCell className="text-right p-2 font-bold">{totalLeftNumber}k</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>

        </div >

    )
}
export default Report
