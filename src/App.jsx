import React, { useState, useEffect, useRef } from "react";
import Tesseract from "tesseract.js";
import useSWR from "swr";
import AxiosAPI from "@/libs/api/axios-client.ts";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { staticToken, createDirectus, realtime } from "@directus/sdk";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"; // Import plugin UTC để xử lý múi giờ UTC
import { useToast } from "@/components/ui/use-toast";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ListFood from "./modules/order/list-food";
import ListOrder from "./modules/order/list-order";
import ListRemaining from "./modules/order/list-remaining";
import _ from "lodash";
import ListFinal from "./modules/order/list-final";
dayjs.extend(customParseFormat);
dayjs.extend(utc); // Kích hoạt plugin UTC

const url = "https://admin.qnsport.vn/websocket";
const access_token = "6rYHvFJ2LRtR3Qg7DrhJK-_MTQGsBYnr";

const connection = createDirectus(url)
  .with(staticToken(access_token))
  .with(realtime());
connection.connect();

const subscribeDelete = _.debounce((cb) => subscribeCore("delete", cb), 100);
const subscribeCreate = _.debounce((cb) => subscribeCore("create", cb), 100);

const subscribeCore = async (event, cb) => {
  const { subscription, unsubscribe } = await connection.subscribe("order_84", {
    event: event,
    query: {
      sort: "-date_created",
      fields: ["*", "user.*"],
    },
  });
  for await (const message of subscription) {
    if (message.event === event) cb(message);
  }
};

const OCRComponent = () => {
  const { toast } = useToast();
  const refOder = useRef(null);

  const { data, mutate: mutateUser } = useSWR("/items/user_84");
  const now = dayjs().add(7, "hour");
  const utcTime = now.utc().format();

  const todayFormatted = dayjs().format("YYYY-MM-DD");
  // &filter[date_created][_gte]=${todayFormatted}T00:00:00.000Z
  const { data: orderToday, mutate: mutateOrder } = useSWR(
    `/items/order_84?fields=*,user.*&filter[date_created][_gte]=${todayFormatted}T00:00:00.000Z`
  );
  const { data: menuToday } = useSWR(
    `/items/menus?fields=*&sort=-date_created&filter[date_created][_gte]=${todayFormatted}T00:00:00.000Z`
  );
  const dataUser = data?.data?.data;
  refOder.current = orderToday?.data?.data;
  const refFunc = useRef(null);

  const menu = menuToday?.data?.data;
  const [imageSrc, setImageSrc] = useState("");
  const [arrayFood, setArrayFood] = useState([]);
  const [user, setUser] = React.useState("");
  const [userSelect, setSelectUser] = useState({});
  const [selectFood, setFoodSelect] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [isPopup, setPopup] = useState("");
  const [valueUser, setCreateUser] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordAdmin, setPassWord] = useState("");
  const [isTimeout, setIsTimeout] = useState(false);
  const [optionRice, setOptionRice] = useState({});
  const [loaded, setLoaded] = useState(false);

  let pattern = /^\d+[.,]?\s*/;

  // useEffect(() => {
  //   const userLocal = localStorage.getItem("user");
  //   if (userLocal) {
  //     setSelectUser(JSON.parse(userLocal));
  //     setUser(JSON.parse(userLocal)?.fullname);
  //   }
  // }, []);

  useEffect(() => {
    const orderMembers = orderToday?.data?.data;
    const filterOther = orderMembers?.filter(
      (elm) => elm.name !== "orther-food"
    );
    setOrderList(filterOther);
  }, [orderToday]);

  const onSelectFood = (elm) => {
    const now = dayjs();
    // const time = now.hour(13).minute(30).second(0).millisecond(0).unix();
    // const valid = dayjs().unix() < time;
    // console.log(valid);

    setPopup(true);
    setFoodSelect([elm]);
  };

  const onOrder = (message) => {
    setPopup(!isPopup);
    if (!userSelect?.id) return;
    selectFood?.map((elm) => {
      const price = optionRice[elm] == "no-rice" ? 25 : 35;
      let processed_text = elm.replace(pattern, "");
      const params = {
        name: processed_text,
        price: price,
        note: message,
        user: userSelect.id,
        date_created: utcTime,
      };
      connection.sendMessage({
        type: "items",
        collection: "order_84",
        action: "create",
        data: params,
      });
    });
  };
  const deleteFood = (item) => {
    connection.sendMessage({
      type: "items",
      collection: "order_84",
      action: "delete",
      id: item.id,
    });
  };
  const createOrderSuccess = (data) => {
    toast({
      variant: "success",
      title: data.user.fullname,
      description: (
        <span className="">
          <img
            className="w-5 h-5 shadow-button rounded-full inline mr-2"
            src="/menu2.png"
            alt=""
          />
          Đã đặt cơm <span className="font-bold"> {data.name} </span>
        </span>
      ),
    });
  };
  const deleteOrderSuccess = (data) => {
    toast({
      variant: "success",
      title: "... Đã xóa",
      description: " Đã xóa món " + data,
    });
  };

  refFunc.current = {
    create: createOrderSuccess,
    delete: deleteOrderSuccess,
    mutate: mutateOrder,
  };
  useEffect(() => {
    const userLocal = localStorage.getItem("user");
    setLoaded(true);
    if (userLocal) {
      setSelectUser(JSON.parse(userLocal));
      setUser(JSON.parse(userLocal)?.fullname);
    }
    subscribeCreate((message) => {
      const newData = [...refOder.current, ...message.data];
      refFunc.current.mutate(
        { data: { data: newData } },
        { revalidate: false }
      );
      refFunc.current.create(message.data[0] || {});
    });
    subscribeDelete((message) => {
      const newData = refOder.current.filter(
        (item) => item.id !== message.data[0]
      );
      const data = refOder.current.find((item) => item.id === message.data[0]);
      mutateOrder({ data: { data: newData } }, { revalidate: false });
      deleteOrderSuccess(data?.name);
    });
  }, []);

  const onCreateUser = async () => {
    if (isAdmin) {
      goAdmin();
      mutateUser();
    } else {
      if (valueUser) {
        const params = {
          fullname: valueUser,
        };
        const res = await AxiosAPI.post("/items/user_84", params);
        if (res) {
          const userGet = res.data?.data;
          localStorage.setItem("user", JSON.stringify(userGet));
          setSelectUser(userGet);
          setUser(userGet?.fullname);
          mutateUser();
        }
      }
    }
  };

  const goAdmin = async () => {
    const res = await AxiosAPI.get("/items/user_84");
    const userGet = res.data?.data;
    const adminUser = userGet?.find((elm) => elm.fullname === "Hồng Phạm");
    if (adminUser?.password == passwordAdmin) {
      localStorage.setItem("user", JSON.stringify(adminUser));
      setSelectUser(adminUser);
      setUser(adminUser?.fullname);
    } else {
      toast({
        variant: "destructive",
        title: "Sai gòi !!!",
        description: "Thử nhớ lại coi, sai gòi kìa !",
      });
    }
  };
  useEffect(() => {
    setPassWord("");
  }, [isAdmin]);

  const groupedData = orderList?.reduce(
    (acc, { user, name, note, id, date_created, price }) => {
      let group = acc.find((group) => group.user.id === user?.id);
      if (!group) {
        group = { user: { id: user?.id, fullname: user?.fullname }, items: [] };
        acc.push(group);
      }
      group.items.push({
        name: name,
        note: note,
        id: id,
        date_created: date_created,
        price: price,
      });
      return acc;
    },
    []
  );

  const listFood = (arrayFood?.length && arrayFood) || menu?.[0]?.extract_menus;
  const bIds = groupedData?.map((item) => item.user.id);
  const userNonOrderd = dataUser?.filter((item) => !bIds?.includes(item.id));

  const processItems = (items) => {
    if (!items) return;
    const result = [];

    items.forEach((item) => {
      const existingItem = result.find((r) => r.name === item.name);
      if (existingItem) {
        var countNoRice = 0;
        const match = items?.filter((elm) => elm.name == existingItem.name);
        match?.map((elm) => {
          if (elm.price == 25) {
            countNoRice++;
            existingItem["no_rice"] = countNoRice;
          }
        });
        existingItem.count++;
        if (item.note) {
          existingItem.notes.push(item.note);
        }
      } else {
        result.push({
          name: item.name,
          count: 1,
          notes: item.note ? [item.note] : [],
          price: item.price,
          no_rice: item.price == 25 ? 1 : 0,
        });
      }
    });

    return result;
  };
  function isTimeBetweenCurrent() {
    const currentTime = dayjs();
    const startTime = dayjs("13:00", "HH:mm");
    const endTime = dayjs("24:00", "HH:mm");
    return currentTime.isAfter(startTime) && currentTime.isBefore(endTime);
  }
  // useEffect(() => {
  //   setIsTimeout(isTimeBetweenCurrent());
  //   const interval = setInterval(() => {
  //     setIsTimeout(isTimeBetweenCurrent());
  //   }, 10000);
  //   return () => clearInterval(interval);
  // }, []);
  const getSelectRice = (e, item) => {
    setOptionRice({
      ...optionRice,
      [item]: e,
    });
  };
  return (
    <div className="py-[20px] text-black pb-40" id="menu">
      <ModalChoose
        {...{
          selectFood,
          isTimeout,
          isPopup,
          getSelectRice,
          setOrderNote,
          orderNote,
          loading,
          onOrder,
          setPopup,
        }}
      />
      <Dialog open={!user && loaded != false ? true : false}>
        <DialogContent className="sm:max-w-[425px] bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-black">
              Cho tui biết ai đang đặt vậy?
            </DialogTitle>
            {/* <DialogDescription className="text-black">
              Không hiện lần sau nữa đâu nè
              <div className="mt-[20px]">
                {selectFood?.map((elm) => {
                  let processed_text = elm.replace(pattern, "");
                  return (
                    <div key={processed_text} className="text-black">
                      - {processed_text}
                    </div>
                  );
                })}
              </div>
            </DialogDescription> */}
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <div>{isAdmin ? "Mật khẩu" : "Họ tên"}</div>
            {isAdmin ? (
              <div className="items-center gap-4">
                <Input
                  value={passwordAdmin}
                  onInput={(e) => setPassWord(e.target.value)}
                  placeholder="Nhập mật khẩu"
                />
              </div>
            ) : (
              <div className="items-center gap-4">
                <Input
                  value={valueUser}
                  onInput={(e) => setCreateUser(e.target.value)}
                  placeholder="Nhập họ tên nhen"
                />
              </div>
            )}
          </div>

          <div className="items-top flex space-x-2 pb-[20px]">
            <Checkbox
              onCheckedChange={() => setIsAdmin(!isAdmin)}
              className="checked-order"
              id="admin"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="admin"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Admin ?
              </label>
            </div>
          </div>
          <DialogFooter>
            {/* <Button type="submit">Save changes</Button> */}
            <Button
              onClick={onCreateUser}
              variant="outline"
              role="combobox"
              className="bg-black mt-[20px] w-[200px] justify-between flex items-center text-center mx-auto hover:text-black hover:bg-black"
            >
              <span className="text-center mx-auto text-white">
                Vào đặt thôi
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="root-wrapper">
        <div className="flex flex-wrap mt-10">
          <ListFood listFood={listFood} onSelectFood={onSelectFood} />
        </div>
        <div>
          {/* <div>
            <Input
              className="text-black w-[180px]"
              id="picture"
              type="file"
              onChange={handleFileChange}
            />{" "}
          </div> */}
          {/* <div className="flex gap-[20px]">
            <div className="mt-[20px]">
              {(imageSrc || menu?.[0]?.image) && (
                <img
                  className="w-[200px] text-black"
                  src={
                    imageSrc ||
                    `https://admin.qnsport.vn/assets/${menu?.[0]?.image}`
                  }
                  alt="Uploaded"
                />
              )}
            </div>
          </div> */}
        </div>
        <div className="mt-20">
          {/* <div
            className={
              isTimeout
                ? "bg-[#00000088] cursor-not-allowed select-none z-[1] absolute h-full w-full text-white text-[100px] font-bold flex justify-center items-center text-left"
                : "absolute opacity-0"
            }
          >
            <span className="text-red-500">D</span>ON.
            <span className="text-red-500">D</span>A.
            <span className="text-red-500">D</span>AT
          </div> */}
          <div className="hidden md:block">
            <ListOrder groupedData={groupedData} deleteFood={deleteFood} />
          </div>
          <ListRemaining userNonOrderd={userNonOrderd} />
          <ListFinal order={refOder.current} />
          {/* <div className={isTimeout && "p-[20px]"}>
            <Table
              className={`border-[1px] border-[#d9d8d8] md:mt-0 mt-[30px] pb-[20px] ${
                !userSelect?.id
                  ? "opacity-[0.5] cursor-not-allowed select-none"
                  : "opacity-1"
              }`}
            >
              <TableCaption className="text-left">
                <p>
                  Các đồng chí đã đặt:{" "}
                  {groupedData?.map((orderd) => {
                    return (
                      <span key={orderd.user.fullname} className="font-bold">
                        {orderd.user.fullname},{" "}
                      </span>
                    );
                  })}
                </p>
                <p className="mt-[20px]">
                  Các đồng chí mải làm chưa đặt:{" "}
                  {userNonOrderd?.map((orderd) => {
                    return (
                      <span key={orderd.fullname} className="font-bold">
                        {orderd.fullname},{" "}
                      </span>
                    );
                  })}
                </p>
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Đồng chí</TableHead>
                  <TableHead>Món</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead className="text-right">Đặt lúc</TableHead>
                  <TableHead className="text-right">Tổng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedData?.map((elm) => {
                  const dateFormat = dayjs(elm?.items?.[0]?.date_created);
                  return (
                    <TableRow
                      className={`${
                        userSelect?.fullname == elm.user.fullname &&
                        "bg-slate-200"
                      } hover:bg-slate-100`}
                      key={elm.user.fullname}
                    >
                      <TableCell className="p-2 font-medium whitespace-nowrap">
                        {elm.user.fullname}
                      </TableCell>
                      <TableCell className="p-2 text-left min-w-[200px]">
                        {elm.items?.map((item) => (
                          <div key={elm.name} className="flex items-center">
                            <p>
                              {"(SL: 1) : " + item.name}
                              {item.price == 25 && (
                                <span className="text-red-600 ml-[12px]">
                                  (Không cơm)
                                </span>
                              )}
                            </p>
                            {userSelect?.fullname == elm.user.fullname && (
                              <span
                                className="ml-[12px] text-white bg-red-500 text-[12px] font-bold py-[] px-[12px] cursor-pointer"
                                onClick={() => deleteFood(item)}
                              >
                                Huỷ
                              </span>
                            )}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell className="p-2 text-left">
                        {elm.items?.[0].note}
                      </TableCell>
                      <TableCell className="p-2 text-left">35k/món</TableCell>
                      <TableCell className="p-2 text-right">
                        {dateFormat?.subtract(7, "hour").format("HH:mm")}
                      </TableCell>
                      <TableCell className="p-2 text-right h-full">
                        {elm.items?.map((elm) => (
                          <p>{elm.price}k</p>
                        ))}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className={isTimeout && "p-[20px]"}>
            <div className="text-left border-[1px] border-[#d1d0d0] p-[20px]">
              <p className="font-bold">
                Hoá đơn:{" "}
                <span className="font-normal">{orderList?.length} phần</span>
              </p>
              <div>
                {finalList?.map((elm, index) => {
                  return (
                    <div className={`${index % 2 && "bg-slate-200"} p-[10px]`}>
                      <div className="">
                        <span className="font-bold">SL: {elm.count}</span> -{" "}
                        {elm.name}
                        {elm.no_rice > 0 && (
                          <span className="text-red-600 ml-[12px]">
                            ({elm.no_rice} Phần không cơm)
                          </span>
                        )}
                      </div>
                      <div className="ml-[12px]">
                        {elm.notes?.map((item, indexItem) => (
                          <p>
                            ✎ Món {indexItem + 1}: {item}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default OCRComponent;

const ModalChoose = ({
  selectFood,
  isPopup,
  getSelectRice,
  orderNote,
  setPopup,
  onOrder,
}) => {
  let pattern = /^\d+[.,]?\s*/;
  const [text, setText] = useState("");
  return (
    <div className="text-left mt-[20px]">
      {/* {loading && <p className="text-red-600">Đang xử lý AI ...</p>}
      <p className="text-[14px]">
        {listFood?.length > 0
          ? "Chọn món bên dưới:"
          : "Chưa có đồ ăn, vui lòng đợi 1 xíu nhen"}
      </p> */}

      <Dialog open={isPopup} onOpenChange={() => setPopup(false)}>
        <DialogContent className="sm:max-w-[425px] bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-black">Chốt đơn</DialogTitle>
            <DialogDescription className="text-black">
              Có thêm bớt cơm gì đồ note dô để tui làm cho nè :3
              <div className="mt-[20px]">
                {selectFood?.map((elm, index) => {
                  let processed_text = elm.replace(pattern, "");
                  return (
                    <div className="mb-[20px]" key={index + "modal hihi"}>
                      <div
                        key={processed_text}
                        className="text-black font-bold mb-[6px]"
                      >
                        - {processed_text}
                      </div>
                      <RadioGroup
                        onValueChange={(e) => getSelectRice(e, elm)}
                        className="flex gap-[12px]"
                        defaultValue="full-rice"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="full-rice" id="full-rice" />
                          <Label htmlFor="full-rice">Có cơm</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no-rice" id="no-rice" />
                          <Label htmlFor="no-rice">Không lấy cơm</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  );
                })}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="items-center gap-4">
              <Textarea
                value={text}
                autoFocus={false}
                onInput={(e) => setText(e.target.value)}
                placeholder="Note dô đây nhen"
              />
            </div>
          </div>
          <DialogFooter>
            {/* <Button type="submit">Save changes</Button> */}
            <Button
              onClick={() => {
                onOrder(text), setText("");
              }}
              variant="outline"
              role="combobox"
              className="bg-black mt-[20px] w-[200px] justify-between flex items-center text-center mx-auto hover:text-black hover:bg-black"
            >
              <span className="text-center mx-auto text-white">
                Bút sa gà chết
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
