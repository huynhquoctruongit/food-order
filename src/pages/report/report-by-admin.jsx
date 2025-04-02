import { useEffect, useRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useSWR from "swr";
import dayjs from "dayjs";
import AxiosAPI from "@/lib/api/axios-client";
import { useState } from "react";
import isoWeek from "dayjs/plugin/isoWeek";
import { formattedAmount, totalWater } from "../helpers/index";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isNumber, totalRice } from "../helpers/index";
import { CircleCheckBig, Circle, Pin, CheckCheck, Bookmark, CalendarSearch, Banknote, Wallet, Bitcoin } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { fullName } from "@/lib/helper";

const ReportByAdmin = () => {
  dayjs.extend(isoWeek);
  let urlParams = new URLSearchParams(window.location.search);
  const weekUrl = urlParams.get("week");
  const [dataReport, setDataReport] = useState();
  const [currentSelect, setCurrentSelect] = useState();
  const dateCurrent = currentSelect?.[0] + "T05:00:00.000Z";
  const { profile } = useAuth();
  const { data: orderToday, mutate: mutateOrder } = useSWR(
    currentSelect?.[0] &&
      profile?.company &&
      `/items/order?fields=*,user_created.*&filter[status]=published&filter[company]=${profile.company}&filter[date_created][_between]=${currentSelect?.[0]},${currentSelect?.[4]}T24:00:00.000Z&filter[price][_neq]=0&sort=id`,
  );
  const { data: reciptData, mutate: mutateRecipt } = useSWR(
    currentSelect?.[0] &&
      profile?.company &&
      `/items/recipt?fields=*&filter[company]=${profile.company}&filter[date_start][_eq]=${dateCurrent}&filter[amount][_neq]=0`,
  );
  const orderMembers = orderToday?.data;
  const reciptList = reciptData?.data;
  const groupedData = orderMembers?.reduce(
    (acc, { user_created, paid_user, name, price, date_order, date_created, id, confirm_paid, is_paid }) => {
      let group = acc.find((group) => group.user.id === (paid_user || user_created?.id));
      if (!group) {
        group = { user: { id: user_created?.id, fullname: fullName(user_created) }, items: [] };
        acc.push(group);
      }
      group.items.push({
        name: name,
        date_created: date_created,
        date_order: date_order,
        paid_user: paid_user,
        id: id,
        price: price,
        confirm_paid: confirm_paid,
        is_paid: is_paid,
      });
      return acc;
    },
    [],
  );
  const isAdmin = profile?.permission_to_update_order;
  const onUpdateOrder = (e, item, ortherList, date, type) => {
    var priceInput = e.target.value;
    if (e.key === "Enter" || e.keyCode === 13) {
      priceInput = eval(priceInput);
    }
    const price = priceInput;
    const params = {
      order_id: ortherList?.id,
      note: "Nước",
      name: type,
      paid_user: item.user.id,
      price: price,
      date_created: date + "T12:00:00+07:00",
      date_order: date + "T12:00:00+07:00",
    };
    setDataReport({
      [item.user.id + "-" + date]: params,
    });
  };

  const debounceTimeout = useRef();
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      onSave();
    }, 1000);
    return () => {
      clearTimeout(debounceTimeout.current);
    };
  }, [dataReport]);

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
              date_order: value.date_order,
            };
            const paramsRecipt = {
              paid_user: value.paid_user,
              amount: value.price || 0,
              company: profile.company,
              date_start: value.date_created,
            };
            if (value.name == "recipt") {
              if (value.order_id) await AxiosAPI.patch("/items/recipt/" + value.order_id, paramsRecipt);
              else if (value.price) await AxiosAPI.post("/items/recipt", paramsRecipt);
              mutateRecipt();
            } else {
              if (value.order_id) await AxiosAPI.patch("/items/order/" + value.order_id, params);
              else if (value.price) await AxiosAPI.post("/items/order", params);
              mutateOrder();
            }
          }
        }),
      );
    }
  };

  const onPay = async (item, type) => {
    console.log(item, "item");
    if (!item || !isAdmin) return;
    item?.map((elm) => {
      const isPay = elm.confirm_paid ? true : false;
      const params = {
        confirm_paid: type === "all" ? true : !isPay,
      };
      AxiosAPI.patch("/items/order/" + elm.id, params).then((res) => {
        if (res) mutateOrder();
      });
    });
  };

  const getMount = (orderUser, type) => {
    var total = 0;
    orderUser?.items?.map((elm) => {
      if (elm.confirm_paid) return;
      total = total + elm.price * 1;
    });

    type == "total-left" &&
      reciptList?.map((elm) => {
        if (orderUser.user.id == elm?.paid_user) {
          total = total - elm?.amount * 1;
        }
      });
    return parseFloat(Math.ceil(total?.toFixed(1)));
  };

  const getDatesForWeek = (week) => {
    const startOfWeek = dayjs().isoWeek(week).startOf("isoWeek");
    return Array.from({ length: 5 }, (_, i) => startOfWeek.add(i, "day").format("YYYY-MM-DD"));
  };
  const current = dayjs().isoWeek();
  const weekList = {
    week_old_9: getDatesForWeek(current - 23),
    week_old_8: getDatesForWeek(current - 10),
    week_old_7: getDatesForWeek(current - 9),
    week_old_6: getDatesForWeek(current - 8),
    week_old_5: getDatesForWeek(current - 7),
    week_old_4: getDatesForWeek(current - 6),
    week_old_3: getDatesForWeek(current - 5),
    week_old_2: getDatesForWeek(current - 4),
    week_old_1: getDatesForWeek(current - 3),
    week_before_last: getDatesForWeek(current - 2),
    last_week: getDatesForWeek(current - 1),
    this_week: getDatesForWeek(current),
  };

  const selectWeek = (e) => {
    window.history.replaceState({}, "", `?week=${e.target.value}`);
    setCurrentSelect(weekList[e.target.value]);
  };
  useEffect(() => {
    setCurrentSelect(weekList[weekUrl]);
  }, [weekUrl]);

  var totalNumber = groupedData?.reduce(
    (total, { items }) => total + items.reduce((sum, { date_created, price, name }) => sum + (price ? price * 1 : 0), 0),
    0,
  );

  const reciptNumber = reciptList ? reciptList?.reduce((acc, { amount }) => acc + parseFloat(amount), 0) : 0;

  return (
    <div className="pt-10 pb-[100px] max-w-[1200px] mx-auto">
      <div className="bg-cover relative bg-white text-gray-600 min-h-[calc(100vh-64px)]">
        <div className="">
          <div className="flex justify-between gap-5 mb-6">
            <div className="border border-dashed border-primary-01/20 bg-cover bg-white p-4 w-full h-full relative rounded-md shadow-sm">
              <div className="absolute top-[-15px] left-[20px] z-10">
                <CalendarSearch strokeWidth={1.5} size={30} color="#f6a094" />
              </div>
              <div className="flex justify-between items-center my-[20px]">
                <h1 className="text-primary-01 text-lg font-bold">BÁO CÁO</h1>
              </div>
              <div className="flex justify-start mb-10">
                <select
                  defaultValue={weekUrl}
                  onChange={(e) => selectWeek(e)}
                  className="rounded-md p-[10px] border border-dashed border-gray-600 text-gray-600 pr-3 border-primary-01/20 focus:outline-none"
                >
                  <option disabled selected>
                    Chọn tuần
                  </option>
                  {Object.keys(weekList).map(function (key, index) {
                    const title =
                      `Ngày ${dayjs(weekList[key][0]).format("DD/MM")}` + " đến " + `${dayjs(weekList[key][4]).format("DD/MM")}`;
                    return <option value={key}>{` (${title})`}</option>;
                  })}
                </select>
              </div>
            </div>
            <div className="border border-dashed border-primary-01/20 bg-cover bg-white p-4 w-full relative rounded-md shadow-sm">
              <div className="absolute top-[-15px] left-[20px]">
                <Bookmark size={30} strokeWidth={1.5} color="#f6a094" />
              </div>

              <div className="flex flex-col gap-4 justify-center h-full xl:pl-10">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-01/20 w-5 h-5 rounded-full"></div>
                  <p className="text-primary-01 text-lg font-bold">Người dùng thanh toán </p>
                </div>
                <div className="flex items-center gap-3">
                  <CircleCheckBig color="#ed4b33" strokeWidth={0.9} size={20} />
                  <p className="text-primary-01 text-lg font-bold">Xác nhận thanh toán </p>
                </div>
                <div className="flex items-center gap-3">
                  <Circle color="#ed4b33" strokeWidth={0.9} size={20} />
                  <p className="text-primary-01 text-lg font-bold"> Người dùng chưa thanh toán </p>
                </div>
              </div>
            </div>
            <div className="border border-dashed border-primary-01/20 bg-cover bg-white p-4 w-full relative rounded-md shadow-sm">
              <div className="absolute top-[-15px] left-[20px]">
                <Wallet size={30} color="#f6a094" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col gap-4 justify-center h-full xl:pl-10">
                <p className="text-primary-01 text-lg font-bold flex justify-between gap-2">
                  Tổng tiền cơm: <span className="font-bold text-black">{totalRice(groupedData)} cá</span>
                </p>
                <p className="text-primary-01 text-lg font-bold flex justify-between gap-2">
                  Tổng tiền nước: <span className="font-bold text-black">{totalWater(groupedData)} cá</span>
                </p>
                <p className="text-primary-01 text-lg font-bold flex justify-between gap-2">
                  Đã chuyển: <span className="font-bold text-black">{Math.ceil(reciptNumber)} cá</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        {groupedData && (
          <TableComponents
            groupedData={groupedData}
            currentSelect={currentSelect}
            reciptList={reciptList}
            dataReport={dataReport}
            isAdmin={isAdmin}
            getMount={getMount}
            onPay={onPay}
          />
        )}
        {!groupedData && <Skeleton />}
      </div>
    </div>
  );
};
export default ReportByAdmin;

const TableComponents = ({ groupedData, currentSelect, reciptList, dataReport, isAdmin, getMount, onPay }) => {
  return (
    <Table className="bg-cover w-full">
      <TableHeader className="sticky top-0 z-50 shadow-sm border-l border-l-pastel-pink border-r border-r-primary-01/20">
        <TableRow className="rounded-md border-t border-primary-01/20 border-b border-dashed">
          <TableHead className="bg-white rounded-md w-[150px] px-0 font-bold border-r border-dashed border-primary-01/20 text-center">
            Sen
          </TableHead>
          {currentSelect?.map((elm, index) => {
            return (
              <TableHead className="bg-white font-bold px-0 items-center mx-auto border-r border-dashed border-primary-01/20">
                <p className="text-center p-[10px]">
                  Thứ {index + 2} ({dayjs(elm).format("DD/MM")})
                </p>
              </TableHead>
            );
          })}
          <TableHead className="bg-white text-right font-bold">Tổng</TableHead>
          <TableHead className="bg-white rounded-md font-bold px-0 items-center mx-auto border-x border-dashed border-x-pastel-pink">
            <p className="text-center p-[10px]">Đã chuyển</p>
          </TableHead>
          <TableHead className="bg-white text-right font-bold min-w-24">Còn lại</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="border-l border-l-pastel-pink border-r border-primary-01/20">
        {groupedData?.map((userItem, index) => {
          const date = dayjs(currentSelect[0] + "T12:00:00+07:00").format("YYYY-MM-DD");
          const valueInput = userItem.user.id + "-" + date;
          const recipt = reciptList?.find(
            (elm) => elm?.paid_user === userItem?.user?.id && dayjs(elm.date_start).format("YYYY-MM-DD") == currentSelect?.[0],
          );
          const valueRecipt = (dataReport?.[valueInput]?.name === "recipt" && dataReport?.[valueInput]?.price) || undefined;
          return (
            <TableRow className={`${index % 2 == 0 ? "bg-primary-01/5" : "bg-white"}`} key={userItem.user.id + date + "group"}>
              <TableCell className="font-medium text-left p-2 flex items-center">
                <div className="p-[6px] text-[13px] line-clamp-2">{fullName(userItem.user)}</div>
              </TableCell>
              {currentSelect?.map((elm, index) => {
                const ortherList = userItem?.items?.find(
                  (ortherItem) => ortherItem.name === "orther-food" && dayjs(ortherItem.date_order).format("YYYY-MM-DD") == elm,
                );
                const riceList = userItem?.items?.filter(
                  (riceItem) => riceItem.name !== "orther-food" && dayjs(riceItem.date_created).format("YYYY-MM-DD") == elm,
                );
                const match = ortherList && dayjs(ortherList.date_order).format("YYYY-MM-DD") == elm;
                const date = dayjs(elm + "T12:00:00+07:00").format("YYYY-MM-DD");
                const valueInput = userItem.user.id + "-" + date;
                const valueWater = (dataReport?.[valueInput]?.name !== "recipt" && dataReport?.[valueInput]?.price) || undefined;
                const finalPrice = riceList.reduce((acc, item) => acc + item.price * 1, 0);
                const confirmPaid = userItem.items?.find((data) => data.is_paid);
                return (
                  <TableCell
                    key={userItem.user.id + date + index + "-elm-wrapper"}
                    className="text-left p-2 border border-primary-01/20 border-dashed"
                  >
                    <div className="grid grid-cols-2">
                      <Tooltip>
                        <TooltipTrigger className="text-center">
                          {(riceList?.length && (
                            <div className="flex items-center gap-1">
                              <div
                                key={userItem.user.id + date + index + "-elm-input1"}
                                disabled
                                className={`w-fit flex items-center gap-1 min-w-16 rounded-md p-2.5 text-center select-none font-regular text-black ${
                                  confirmPaid && ""
                                }`}
                              >
                                {finalPrice} <span className="text-sm text-gray-400">cá</span>
                              </div>
                              <div onClick={() => onPay(riceList, "item")} className="ml-4">
                                {riceList?.[0].confirm_paid ? (
                                  <CircleCheckBig color="#ed4b33" strokeWidth={0.9} size={20} />
                                ) : (
                                  isAdmin && <Circle color="#ed4b33" strokeWidth={0.9} size={20} />
                                )}
                              </div>
                            </div>
                          )) ||
                            ""}
                        </TooltipTrigger>
                        <TooltipContent className="bg-white">
                          {riceList?.length && (
                            <div className="flex flex-col gap-2">
                              {riceList?.map((item) => (
                                <div className="flex gap-2 items-center">
                                  <img className="w-5 h-5" src="/food9.png"></img>
                                  <p>
                                    {item.name} - <span className="font-semibold">{item.price}k</span>
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                );
              })}
              <TableCell className="text-right p-2 font-semibold border-l border-primary-01/20">
                {getMount(userItem, "total")}
              </TableCell>
              <TableCell className="text-left p-2 border-l border-primary-01/20">
                <input
                  disabled={!isAdmin}
                  className={`rounded-md p-[6px] w-[100%] text-center bg-transparent text-gray-600 font-semibold ${
                    isAdmin && "border-[1px] bordeprimary-01/20"
                  }`}
                  defaultValue={formattedAmount(recipt?.amount) || ""}
                  value={valueRecipt}
                  onChange={(e) => onUpdateOrder(e, userItem, recipt, currentSelect[0], "recipt")}
                ></input>
              </TableCell>
              <TableCell className="text-right relative group font-bold border-l border-primary-01/20">
                <div
                  onClick={() => onPay(userItem.items, "all")}
                  className="absolute bg-white w-full h-full p-2 group-hover:opacity-100 opacity-0 top-0 left-0 z-10 flex items-center justify-center cursor-pointer"
                >
                  <CheckCheck color="#04b93a" />
                </div>
                {getMount(userItem, "total-left")}k
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      {/* <TableFooter>
      <TableRow className="hover:bg-pastel-pink">
        <TableCell className="font-bold text-left">Tổng</TableCell>
        {currentSelect?.map((elm, index) => {
          const totalPrice = groupedData?.reduce(
            (total, { items }) =>
              total +
              items?.reduce(
                (sum, { date_created, price, name }) =>
                  sum + (date_created?.startsWith(elm) && price && name !== "orther-food" ? price * 1 : 0),
                0,
              ),
            0,
          );
          const totalOther = groupedData?.reduce(
            (total, { items }) =>
              total +
              items?.reduce(
                (sum, { date_created, price, name }) =>
                  sum + (date_created?.startsWith(elm) && price && name === "orther-food" ? price * 1 : 0),
                0,
              ),
            0,
          );
          return (
            <TableCell className="text-left p-2">
              <input className="w-[50%] text-center bg-transparent font-semibold" disabled value={totalPrice}></input>
              <input className="w-[50%] text-center bg-transparent font-semibold" disabled value={totalOther}></input>
            </TableCell>
          );
        })}
        <TableCell className="text-right p-2 font-semibold">{totalNumber}</TableCell>
        <TableCell className="p-2 text-center font-semibold">{Math.ceil(reciptNumber)}</TableCell>
        <TableCell className="text-right p-2 font-semibold">{totalLeftNumber}k</TableCell>
      </TableRow>
    </TableFooter> */}
    </Table>
  );
};

const Skeleton = () => {
  return (
    <div className="animate-pulse">
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">
              <div className="h-4 bg-gray-50 rounded"></div>
            </TableHead>
            <TableHead>
              <div className="h-4 bg-gray-50 rounded"></div>
            </TableHead>
            <TableHead>
              <div className="h-4 bg-gray-50 rounded"></div>
            </TableHead>
            <TableHead>
              <div className="h-4 bg-gray-50 rounded"></div>
            </TableHead>
            <TableHead>
              <div className="h-4 bg-gray-50 rounded"></div>
            </TableHead>
            <TableHead>
              <div className="h-4 bg-gray-50 rounded"></div>
            </TableHead>
            <TableHead>
              <div className="h-4 bg-gray-50 rounded"></div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(10)
            .fill()
            .map((_, i) => (
              <TableRow key={i + "skeleton"}>
                <TableCell>
                  <div className="h-8 bg-gray-50 rounded"></div>
                </TableCell>
                <TableCell>
                  <div className="h-8 bg-gray-50 rounded"></div>
                </TableCell>
                <TableCell>
                  <div className="h-8 bg-gray-50 rounded"></div>
                </TableCell>
                <TableCell>
                  <div className="h-8 bg-gray-50 rounded"></div>
                </TableCell>
                <TableCell>
                  <div className="h-8 bg-gray-50 rounded"></div>
                </TableCell>
                <TableCell>
                  <div className="h-8 bg-gray-50 rounded"></div>
                </TableCell>
                <TableCell>
                  <div className="h-8 bg-gray-50 rounded"></div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};
