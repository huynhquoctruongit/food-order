import React, { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import AxiosAPI from "@/lib/api/axios-client.js";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import dayjs from "dayjs";
import { useToast } from "@/components/ui/use-toast";
import ListOrder from "@/modules/order/components/list-order";
import ListFood from "@/modules/order/components/list-food";
import ListRemaining from "@/modules/order/components/list-remaining";
import ListFinal from "@/modules/order/components/list-final";
import _ from "lodash";
import ModalLogin from "@/modules/auth/screen/login";
import { connection } from "@/lib/directus";
import { getCookie } from "react-use-cookie";
import useConnection from "@/hooks/use-connection";
import { useParams } from "react-router-dom";
// Kích hoạt plugin UTC

const subscribeDelete = _.debounce((cb) => subscribeCore("delete", cb), 100);
const subscribeCreate = _.debounce((cb) => subscribeCore("create", cb), 100);

const subscribeCore = async (event, cb) => {
  const { subscription, unsubscribe } = await connection.subscribe("order", {
    event: event,
    query: {
      sort: "-date_created",
      fields: ["*", "user.*"],
      filter: {
        date_created: { _gte: dayjs().endOf("day").unix() },
      },
    },
  });
  for await (const message of subscription) {
    if (message.event === event) cb(message);
  }
};

const OCRComponent = () => {
  const { toast } = useToast();
  const refOder = useRef(null);

  const { data, mutate: mutateUser } = useSWR("/users");
  const todayFormatted = dayjs().startOf("day").toISOString();
  const { data: orderToday, mutate: mutateOrder } = useSWR(
    `/items/order?fields=*,user.*&filter[date_created][_gte]=${todayFormatted}`,
  );
  const { data: menuToday } = useSWR(`/items/menu?fields=*&sort=-date_created&filter[date_created][_gte]=${todayFormatted}`);
  const dataUser = data?.data;
  refOder.current = orderToday?.data;
  const refFunc = useRef(null);

  const menu = menuToday?.data || [];
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

  const { connection } = useConnection();
  const { companyId, providerId } = useParams();

  // useEffect(() => {
  //   const userLocal = localStorage.getItem("user");
  //   if (userLocal) {
  //     setSelectUser(JSON.parse(userLocal));
  //     setUser(JSON.parse(userLocal)?.fullname);
  //   }
  // }, []);

  useEffect(() => {
    const orderMembers = orderToday?.data?.data;
    const filterOther = orderMembers?.filter((elm) => elm.name !== "orther-food");
    setOrderList(filterOther);
  }, [orderToday]);

  const onSelectFood = (elm) => {
    // if (!valid) {
    //   toast({
    //     variant: "destructive",
    //     title: "Hết giờ rồi",
    //     description: "Hết giờ đặt cơm rồi nha",
    //   });
    //   return;
    // }

    setPopup(true);

    setFoodSelect(elm);
  };

  const onOrder = async (message) => {
    setPopup(!isPopup);
    if (!userSelect?.id) return;

    const price = false == "no-rice" ? selectFood?.side_dish_price : selectFood?.dish_price;
    const params = {
      name: selectFood.name,
      price: price,
      note: message,
      bulk_food_provider: providerId,
      company: companyId,
    };

    connection.sendMessage({
      type: "items",
      collection: "order",
      action: "create",
      data: params,
    });
  };
  const deleteFood = (item) => {
    const now = dayjs();
    const time = now.hour(13).minute(30).second(0).millisecond(0).unix();
    const valid = dayjs().unix() < time;

    if (!valid) {
      toast({
        variant: "destructive",
        title: "Hết giờ rồi",
        description: "Thui ăn xong rồi ai lại hủy nữa :)))",
      });
      return;
    }

    // connection.sendMessage({
    //   type: "items",
    //   collection: "order",
    //   action: "delete",
    //   id: item.id,
    // });
  };
  const createOrderSuccess = (data) => {
    toast({
      variant: "success",
      title: data.user.fullname,
      description: (
        <span className="">
          <img className="w-5 h-5 shadow-button rounded-full inline mr-2" src="/menu2.png" alt="" />
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

    if (userLocal) {
      setSelectUser(JSON.parse(userLocal));
      setUser(JSON.parse(userLocal)?.fullname);
    }
    subscribeCreate((message) => {
      const newData = [...refOder.current, ...message.data];
      refFunc.current.mutate({ data: { data: newData } }, { revalidate: false });
      refFunc.current.create(message.data[0] || {});
    });
    subscribeDelete((message) => {
      const newData = refOder.current.filter((item) => item.id !== message.data[0]);
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
        const res = await AxiosAPI.post("/users", params);
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
    const res = await AxiosAPI.get("/users");
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

  const groupedData = orderList?.reduce((acc, { user, name, note, id, date_created, price }) => {
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
  }, []);

  const listFood = (arrayFood?.length && arrayFood) || menu?.[0]?.detail || [];
  const bIds = groupedData?.map((item) => item.user.id);
  const userNonOrderd = dataUser?.filter((item) => !bIds?.includes(item.id));

  function isTimeBetweenCurrent() {
    const currentTime = dayjs();
    const startTime = dayjs("13:00", "HH:mm");
    const endTime = dayjs("24:00", "HH:mm");
    return currentTime.isAfter(startTime) && currentTime.isBefore(endTime);
  }
 
  const getSelectRice = (e, item) => {
    setOptionRice({
      ...optionRice,
      [item]: e,
    });
  };

  return (
    <div className="py-[20px] text-black pb-10 md:pb-40" id="menu">
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
      <ModalLogin />
      <div className="root-wrapper">
        <div className="flex flex-wrap mt-10">
          <ListFood listFood={listFood} onSelectFood={onSelectFood} />
        </div>
        <div></div>
        <div className="mt-10 md:mt-20">
          <ListOrder groupedData={groupedData} deleteFood={deleteFood} />
          <ListRemaining userNonOrderd={userNonOrderd} />
          <div className="hidden md:block">
            <ListFinal order={refOder.current} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCRComponent;

const ModalChoose = ({ selectFood, isPopup, getSelectRice, orderNote, setPopup, onOrder }) => {
  let pattern = /^\d+[.,]?\s*/;
  const [text, setText] = useState("");
  return (
    <div className="text-left mt-[20px]">
      <Dialog open={isPopup} onOpenChange={() => setPopup(false)}>
        <DialogContent className="sm:max-w-[425px] bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-black">Chốt đơn</DialogTitle>
            <DialogDescription className="text-black">
              Có thêm bớt cơm gì đồ note dô để tui làm cho nè :3
              <div className="mt-[20px]">
                {[selectFood]?.map((elm, index) => {
                  let processed_text = elm.name;
                  return (
                    <div className="mb-[20px]" key={index + "modal hihi"}>
                      <div key={processed_text} className="text-black font-bold mb-[6px]">
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
              <Textarea value={text} autoFocus={false} onInput={(e) => setText(e.target.value)} placeholder="Note dô đây nhen" />
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
              <span className="text-center mx-auto text-white">Bút sa gà chết</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
