import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import useSWR from "swr";
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
import { useSubscribe } from "@/hooks/use-connection";
import { useParams } from "react-router-dom";
import { connection } from "@/lib/directus";
import useOrder from "../helper/use-menu";

const OCRComponent = () => {
  const { toast } = useToast();
  const refOder = useRef(null);

  const { data } = useSWR("/users");
  const todayFormatted = dayjs().startOf("day").toISOString();
  const { mutate: mutateOrder } = useOrder();
  const { data: menuToday } = useSWR(`/items/menu?fields=*&sort=-date_created&filter[date_created][_gte]=${todayFormatted}`);
  const dataUser = data?.data;
  const refFunc = useRef(null);

  const menu = menuToday?.data || [];
  const [selectFood, setFoodSelect] = useState([]);
  const [orderNote, setOrderNote] = useState("");
  const [isPopup, setPopup] = useState("");
  const [optionRice, setOptionRice] = useState({});

  const refCallback = useRef(null);
  const deleteCallback = useRef(null);

  const createOrderSuccess = (data) => {
    const fullname = data?.user_created.first_name + " " + data?.user_created.last_name;
    toast({
      variant: "success",
      title: fullname,
      description: (
        <span className="">
          <img className="w-5 h-5 shadow-button rounded-full inline mr-2" src="/menu2.png" alt="" />
          Đã đặt cơm <span className="font-bold"> {fullname} </span>
        </span>
      ),
    });
  };
  const deleteOrderSuccess = (data) => {
    const fullname = data?.user_created.first_name + " " + data?.user_created.last_name;
    console.log(data, fullname);
    toast({
      variant: "success",
      title: fullname + " Đã xóa",
      description: " Đã xóa món " + data.name,
    });
  };
  refCallback.current = (message) => {
    if (message.event !== "create") return;
    mutateOrder(
      (data) => {
        data.data = [...data.data, ...message?.data];
        return data;
      },
      { revalidate: false },
    );
    const data = message.data[0];
    if (!data) return;

    createOrderSuccess(data);
  };

  deleteCallback.current = (message) => {
    if (message.event !== "update") return;
    const data = message.data[0];

    mutateOrder(
      (dataSWR) => {
        const newData = { ...dataSWR };
        newData.data = newData.data.filter((item) => item.id != data.id);
        return newData;
      },
      { revalidate: false },
    );
    deleteOrderSuccess(data);
  };

  useSubscribe("create", "order", ["*,user_created.*"], { bulk_food_provider: { _eq: 1 }, company: { _eq: 1 } }, refCallback);
  useSubscribe("update", "order", ["*,user_created.*"], { bulk_food_provider: { _eq: 1 }, company: { _eq: 1 } }, deleteCallback);

  refFunc.current = {
    create: createOrderSuccess,
    delete: deleteOrderSuccess,
  };
  // const callback = useCallback((message) => {
  //   console.log(message);
  //   const newData = [...refOder.current, ...message.data];
  //   mutate({ data: { data: newData } }, { revalidate: false });
  //   refFunc.current.create(message.data[0] || {});
  // }, []);

  // const filter = { company: { _eq: 1 }, bulk_food_provider: { _eq: 1 } };
  // useSubscribe("create", filter, callback);

  const { companyId, providerId } = useParams();
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

    // if (!valid) {
    //   toast({
    //     variant: "destructive",
    //     title: "Hết giờ rồi",
    //     description: "Thui ăn xong rồi ai lại hủy nữa :)))",
    //   });
    //   return;
    // }

    connection.sendMessage({
      type: "items",
      collection: "order",
      action: "update",
      data: { status: "draft" },
      id: item.id,
    });
  };

  const listFood = menu?.[0]?.detail || [];
  const bIds = [];
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
          isPopup,
          getSelectRice,
          setOrderNote,
          orderNote,
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
          <ListOrder deleteFood={deleteFood} />
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
