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
import { CircleCheckBig, Circle, Pin, CheckCheck, Bookmark, CalendarSearch } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { fullName } from "@/lib/helper"

const ReportByAdmin = () => {
    dayjs.extend(isoWeek);
    let urlParams = new URLSearchParams(window.location.search);
    const weekUrl = urlParams.get("week")
    const [dataReport, setDataReport] = useState()
    const [currentSelect, setCurrentSelect] = useState()
    const dateCurrent = currentSelect?.[0] + "T05:00:00.000Z"
    const { profile } = useAuth()
    const { data: orderToday, mutate: mutateOrder } = useSWR(currentSelect?.[0] && profile?.company &&
        `/items/order?fields=*,user_created.*&filter[status]=published&filter[company]=${profile.company}&filter[date_created][_between]=${currentSelect?.[0]},${"2024-09-24"}T24:00:00.000Z&filter[price][_neq]=0&sort=id`
    )
    const { data: reciptData, mutate: mutateRecipt } = useSWR(currentSelect?.[0] && profile?.company &&
        `/items/recipt?fields=*&filter[company]=${profile.company}&filter[date_start][_eq]=${dateCurrent}&filter[amount][_neq]=0`
    )
    const orderMembers = orderToday?.data
    const reciptList = reciptData?.data
    const groupedData = orderMembers?.reduce((acc, { user_created, paid_user, name, price, date_order, date_created, id, confirm_paid, is_paid }) => {
        let group = acc.find(group => (group.user.id === (paid_user || user_created?.id)));
        if (!group) {
            group = { user: { id: user_created?.id, fullname: fullName(user_created) }, items: [] };
            acc.push(group);
        }
        group.items.push({ name: name, date_created: date_created, date_order: date_order, paid_user: paid_user, id: id, price: price, confirm_paid: confirm_paid, is_paid: is_paid });
        return acc;
    }, []);
    const isAdmin = profile?.permission_to_update_order
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
            paid_user: item.user.id,
            price: price,
            date_created: date + "T12:00:00+07:00",
            date_order: date + "T12:00:00+07:00"
        }
        setDataReport({
            [item.user.id + "-" + date]: params
        })
    }

    const debounceTimeout = useRef()
    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            onSave()
        }, 1000);
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
                            paid_user: value.paid_user,
                            price: value.price || 0,
                            company: profile.company,
                            date_order: value.date_order
                        }
                        const paramsRecipt = {
                            paid_user: value.paid_user,
                            amount: value.price || 0,
                            company: profile.company,
                            date_start: value.date_created
                        }
                        if (value.name == "recipt") {
                            if (value.order_id) await AxiosAPI.patch("/items/recipt/" + value.order_id, paramsRecipt)
                            else if (value.price) await AxiosAPI.post("/items/recipt", paramsRecipt)
                            mutateRecipt()
                        } else {
                            if (value.order_id) await AxiosAPI.patch("/items/order/" + value.order_id, params)
                            else if (value.price) await AxiosAPI.post("/items/order", params)
                            mutateOrder()
                        }
                    }

                })
            );
        }

    }

    const onPay = async (item, type) => {
        console.log(item, 'item');
        if (!item || !isAdmin) return
        item?.map((elm) => {
            const isPay = elm.confirm_paid ? true : false
            const params = {
                confirm_paid: type === "all" ? true : !isPay
            }
            AxiosAPI.patch("/items/order/" + elm.id, params).then((res) => {
                if (res) mutateOrder()
            })
        })
    }

    const getMount = (orderUser, type) => {
        var total = 0
        orderUser?.items?.map((elm) => {
            if (elm.confirm_paid) return
            total = total + elm.price * 1
        })

        type == "total-left" && reciptList?.map((elm) => {
            if (orderUser.user.id == elm?.paid_user) {
                total = total - elm?.amount * 1
            }
        })
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

    if (!reciptList) return
    const reciptNumber = reciptList?.reduce((acc, { amount }) => acc + parseFloat(amount), 0);
    const totalLeftNumber = totalNumber - reciptNumber
    console.log(groupedData, 'groupedData');
    return (
        <div className="pt-10 pb-[100px]">
            <div className="bg-[url(/background.png)] bg-cover relative bg-white text-gray-600 min-h-[calc(100vh-64px)]">
                
                <div className="px-[20px] md:px-[40px]">
                    <div className="flex justify-between gap-5 mb-6">
                        <div className="bg-[url(/background-auth.png)] bg-cover bg-white p-4 w-full h-full relative border-dashed border-[2px] border-pastel-pink rounded-md shadow-sm">
                        <div className="absolute top-[-15px] left-[20px] z-10"><CalendarSearch size={30} color="#f6a094" /></div>
                            <div className="flex justify-between items-center my-[20px]">
                                <h1 className="text-primary-01 text-xl font-bold">BÁO CÁO</h1>
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
                        <div className="bg-[url(/background-auth.png)]  bg-cover bg-white p-4 w-full relative border-dashed border-[2px] border-pastel-pink rounded-md shadow-sm">
                            <div className="absolute top-[-15px] left-[20px]"><Bookmark size={30} color="#f6a094" /></div>

                            <div className="flex flex-col gap-4 justify-center h-full xl:pl-10">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#3bdd6b] w-6 h-4 rounded-[4px]"></div>
                                    <p className="text-primary-01 text-xl font-bold">USER BẤM THANH TOÁN </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CircleCheckBig color="#ed4b33" strokeWidth={0.9} size={20} />
                                    <p className="text-primary-01 text-xl font-bold">ADMIN XÁC NHẬN </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Circle color="#ed4b33" strokeWidth={0.9} size={20} />
                                    <p className="text-primary-01 text-xl font-bold">USER CHƯA THANH TOÁN </p>
                                </div>

                            </div>
                        </div>
                        <div className="bg-[url(/background-auth.png)] bg-cover bg-white p-4 w-full relative border-dashed border-[2px] border-pastel-pink rounded-md shadow-sm">
                            <div className="absolute top-[-15px] left-[20px]"><Pin size={30} color="#f6a094" /></div>
                            <div className="flex flex-col gap-4 justify-center h-full xl:pl-10">
                                <p className="text-primary-01 text-xl font-bold">TỔNG TIỀN CƠM: <span className="font-bold text-black">{totalRice(groupedData)} cá</span></p>
                                <p className="text-primary-01 text-xl font-bold">TỔNG TIỀN NƯỚC: <span className="font-bold text-black">{totalWater(groupedData)} cá</span></p>
                                <p className="text-primary-01 text-xl font-bold">ĐÃ CHUYỂN: <span className="font-bold text-black">{Math.ceil(reciptNumber)} cá</span></p>
                            </div>
                        </div>
                    </div>
                    <Table className="bg-[url(/bg-main.png)] bg-cover w-full">
                        <TableHeader className="sticky top-0 z-50 shadow-sm border-l-[2px] border-dashed border-l-pastel-pink border-r-[2px] border-dashed border-r-pastel-pink">
                            <TableRow className="rounded-md border-t-[2px] border-dashed border-t-pastel-pink border-b-pastel-pink">
                                <TableHead className="bg-white rounded-md w-[150px] px-0 font-bold border-r-[2px] border-dashed border-r-pastel-pink text-center">Sen</TableHead>
                                {currentSelect?.map((elm, index) => {
                                    return (
                                        <TableHead className="bg-white font-bold px-0 items-center mx-auto border-r-[2px] border-dashed border-r-pastel-pink">
                                            <p className="text-center p-[10px]">Thứ {index + 2} ({dayjs(elm).format('DD/MM')})</p>
                                            <div className="flex items-center border-t-[2px] border-dashed border-t-pastel-pink p-[10px]"><p className="w-[50%] text-center">Đồ ăn</p><> | </> <p className="w-[50%] text-center whitespace-nowrap">Đồ uống</p></div>
                                        </TableHead>
                                    )
                                })}
                                <TableHead className="bg-white text-right font-bold">Tổng</TableHead>
                                <TableHead className="bg-white rounded-md font-bold px-0 items-center mx-auto border-x-[2px] border-dashed border-x-pastel-pink">
                                    <p className="text-center p-[10px]">Đã chuyển</p>
                                </TableHead>
                                <TableHead className="bg-white text-right font-bold">Còn lại</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="border-l-[2px] border-dashed border-l-pastel-pink border-r-[2px] border-dashed border-r-pastel-pink">
                            {groupedData?.map((userItem, index) => {
                                const date = dayjs(currentSelect[0] + "T12:00:00+07:00").format("YYYY-MM-DD")
                                const valueInput = userItem.user.id + "-" + date
                                const recipt = reciptList?.find((elm) => elm?.paid_user === userItem?.user?.id && dayjs(elm.date_start).format("YYYY-MM-DD") == currentSelect?.[0])
                                const valueRecipt = dataReport?.[valueInput]?.name === "recipt" && dataReport?.[valueInput]?.price || undefined
                                return (
                                    <TableRow className={`${index % 2 == 0 ? "bg-pastel-pink/30" : "bg-white"} hover:bg-unset`} key={userItem.user.id + date + "group"}>
                                        <TableCell className="font-medium text-left p-2 flex items-center"><div className="p-[6px] text-[13px] line-clamp-2">{fullName(userItem.user)}</div></TableCell>
                                        {currentSelect?.map((elm, index) => {
                                            const ortherList = userItem?.items?.find((ortherItem) => ortherItem.name === "orther-food" && dayjs(ortherItem.date_order).format("YYYY-MM-DD") == elm)
                                            const riceList = userItem?.items?.filter((riceItem) => riceItem.name !== "orther-food" && dayjs(riceItem.date_created).format("YYYY-MM-DD") == elm)
                                            const match = ortherList && dayjs(ortherList.date_order).format("YYYY-MM-DD") == elm
                                            const date = dayjs(elm + "T12:00:00+07:00").format("YYYY-MM-DD")
                                            const valueInput = userItem.user.id + "-" + date
                                            const valueWater = dataReport?.[valueInput]?.name !== "recipt" && dataReport?.[valueInput]?.price || undefined
                                            const finalPrice = riceList.reduce((acc, item) => acc + item.price * 1, 0);
                                            const confirmPaid = userItem.items?.find((data) => data.is_paid)
                                            return (
                                                <TableCell key={userItem.user.id + date + index + "-elm-wrapper"} className="text-left p-2">
                                                    <div className="grid grid-cols-2">
                                                        <Tooltip>
                                                            <TooltipTrigger className="text-center">
                                                                {riceList?.length &&
                                                                    <div className="flex items-center gap-1"><input key={userItem.user.id + date + index + "-elm-input1"} disabled className={`w-[50%] rounded-md p-[6px] text-center select-none font-semibold text-black ${confirmPaid && "bg-[#3bdd6b] text-white"}`} value={finalPrice}></input>
                                                                        <div onClick={() => onPay(riceList, 'item')}>
                                                                            {riceList?.[0].confirm_paid ? <CircleCheckBig color="#ed4b33" strokeWidth={0.9} size={20} /> : (isAdmin && <Circle color="#ed4b33" strokeWidth={0.9} size={20} />)}
                                                                        </div></div> || ""}
                                                            </TooltipTrigger>
                                                            <TooltipContent className="bg-white">
                                                                {riceList?.length && <div className="flex flex-col gap-2">{riceList?.map((item) => (
                                                                    <div className="flex gap-2 items-center"><img className="w-5 h-5" src="/food9.png"></img><p>{item.name} - <span className="font-semibold">{item.price}k</span></p></div>
                                                                ))}</div>}
                                                            </TooltipContent>
                                                        </Tooltip>

                                                        <div className="flex items-center gap-2 justify-center">
                                                            <input id={date} key={userItem.user.id + date + index + "-elm-input2"} disabled={!isAdmin} className={`rounded-md p-[6px] w-[50%] text-center bg-transparent text-gray-600 font-semibold ${isAdmin && "border-[1px] border-pastel-pink"}`} value={valueWater} defaultValue={match ? (ortherList?.price == 0 ? "" : ortherList?.price) : ""} onKeyUp={(e) => onUpdateOrder(e, userItem, ortherList, date, "orther-food")} onChange={(e) => onUpdateOrder(e, userItem, ortherList, date, "orther-food")}></input>
                                                            <div className="cursor-pointer" onClick={() => onPay([ortherList], 'item')}>
                                                                {ortherList && (ortherList?.confirm_paid ? <CircleCheckBig color="#ed4b33" strokeWidth={0.9} size={20} /> : (isAdmin && <Circle color="#ed4b33" strokeWidth={0.9} size={20} />)) || <div className="w-5"></div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            )
                                        })}
                                        <TableCell className="text-right p-2 font-semibold">{getMount(userItem, 'total')}</TableCell>
                                        <TableCell className="text-left p-2">
                                            <input disabled={!isAdmin} className={`rounded-md p-[6px] w-[100%] text-center bg-transparent text-gray-600 font-semibold ${isAdmin && "border-[1px] border-pastel-pink"}`}
                                                defaultValue={formattedAmount(recipt?.amount) || ""}
                                                value={valueRecipt}
                                                onChange={(e) => onUpdateOrder(e, userItem, recipt, currentSelect[0], "recipt")}
                                            ></input>
                                        </TableCell>
                                        <TableCell className="text-right relative group font-bold p-2">
                                            <div onClick={() => onPay(userItem.items, "all")} className="absolute bg-white w-full h-full group-hover:opacity-100 opacity-0 top-0 left-0 z-10 flex items-center justify-center cursor-pointer">
                                                <CheckCheck color="#04b93a" />
                                            </div>
                                            {getMount(userItem, 'total-left')}k
                                        </TableCell>
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
                                            sum + (date_created?.startsWith(elm) && price && name !== "orther-food" ? price * 1 : 0), 0), 0);
                                    const totalOther = groupedData?.reduce((total, { items }) =>
                                        total + items?.reduce((sum, { date_created, price, name }) =>
                                            sum + (date_created?.startsWith(elm) && price && name === "orther-food" ? price * 1 : 0), 0), 0);
                                    return (
                                        <TableCell className="text-left p-2">
                                            <input className="w-[50%] text-center bg-transparent font-semibold" disabled value={totalPrice}></input>
                                            <input className="w-[50%] text-center bg-transparent font-semibold" disabled value={totalOther}></input>
                                        </TableCell>
                                    )
                                })}
                                <TableCell className="text-right p-2 font-semibold">{totalNumber}</TableCell>
                                <TableCell className="p-2 text-center font-semibold">{Math.ceil(reciptNumber)}</TableCell>
                                <TableCell className="text-right p-2 font-semibold">{totalLeftNumber}k</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>

            </div >
        </div>

    )
}
export default ReportByAdmin
