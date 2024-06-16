import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import dayjs from 'dayjs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import useSWR from "swr";
import AxiosAPI from "@/libs/api/axios-client.ts"
import { io } from "socket.io-client";
import { Checkbox } from "@/components/ui/checkbox"
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
import { staticToken, createDirectus, realtime } from '@directus/sdk';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Link } from "react-router-dom"

const OCRComponent = () => {

  const url = "https://admin.qnsport.vn/websocket";
  const access_token = '6rYHvFJ2LRtR3Qg7DrhJK-_MTQGsBYnr';
  const connection = createDirectus(url)
    .with(staticToken(access_token))
    .with(realtime());
  connection.connect()

  const { data } = useSWR(
    "/items/user_84",
  )
  const today = new Date();
  const todayFormatted = dayjs().format('YYYY-MM-DD');
  const tomorrowFormatted = dayjs().add(1, 'day').format('YYYY-MM-DD');
  // &filter[date_created][_between]=${todayFormatted},${tomorrowFormatted}
  const { data: orderToday, mutate: mutateOrder } = useSWR(
    `/items/order_84?fields=*,user.*&filter[date_created][_gte]=${"2024-06-16T00:00:00.000Z"}`
  )
  const { data: menuToday } = useSWR(
    `/items/menus?fields=*&sort=-date_created`
  )
  const dataUser = data?.data?.data
  const menu = menuToday?.data?.data
  const [imageSrc, setImageSrc] = useState('');
  const [arrayFood, setArrayFood] = useState([]);
  const [open, setOpen] = React.useState(false)
  const [user, setUser] = React.useState("")
  const [userSelect, setSelectUser] = useState({})
  const [selectFood, setFoodSelect] = useState([])
  const [orderList, setOrderList] = useState([])
  const [loading, setLoading] = useState(false)
  const [orderNote, setOrderNote] = useState("")
  const [isPopup, setPopup] = useState("")
  let pattern = /^\d+[.,]?\s*/;

  useEffect(() => {
    const userLocal = localStorage.getItem("user")
    if (userLocal) {
      setSelectUser(JSON.parse(userLocal))
      setUser(JSON.parse(userLocal)?.fullname)
    }
  }, [])

  useEffect(() => {
    const orderMembers = orderToday?.data?.data
    setOrderList(orderMembers)
  }, [orderToday])

  const onSelectFood = (elm) => {
    if (selectFood.includes(elm)) {
      setFoodSelect(selectFood.filter(item => item !== elm));
    } else {
      setFoodSelect([...selectFood, elm]);
    }
  };

  const handleFileChange = async (event) => {
    if (userSelect?.fullname !== "Hồng Phạm") {
      toast.error("Chị Hồng đó phải hông ta :3");
    } else {
      const file = event.target.files[0];
      if (file) {
        const newFormData = new FormData();

        newFormData.append("file", file);
        const imageUpload = await AxiosAPI.post("/files", newFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            "Authorization": "Bearer " + access_token
          }
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageSrc(reader.result);
          recognizeText(reader.result, imageUpload);
        };
        setLoading(true)
        reader.readAsDataURL(file);
      }
    }

  };

  const recognizeText = (imageBase64, imageUpload) => {
    Tesseract.recognize(
      imageBase64,
      'vie+eng', // Chỉ định mã ngôn ngữ là 'vie+eng' cho tiếng Việt và tiếng Anh
    ).then(({ data: { text } }) => {
      processText(text, imageUpload);
      setLoading(false)
    }).catch((error) => {
      console.error(error);
    });
  };

  const processText = (text, imageUpload) => {
    const startIndex = text.toLowerCase().indexOf('có');
    if (startIndex !== -1) {
      text = text.substring(startIndex + 2);
    }
    const arr = generateText(text);
    setArrayFood(arr);
    const params = { extract_menus: arr, image: imageUpload.data.data.id }
    // connection.sendMessage({
    //   type: 'items',
    //   collection: 'menus',
    //   action: 'create',
    //   data: params
    // });
    AxiosAPI.post("/items/menus", params)
  }
  const generateText = (text) => {
    text = text.replaceAll("#", "")
    text = text.replaceAll("14", "4")
    text = text.replaceAll(",", ".")
    text = text.replaceAll("CƠM CHAY", "(CƠM CHAY) - ")
    text = text.replaceAll("Cơm chay", "(CƠM CHAY) - ")
    text = text.replaceAll("cơm chay", "(CƠM CHAY) - ")

    let lines = text.split('\n');
    let arr = [];
    let currentMeal = '';
    let filteredArr = lines.filter(item => item !== "" && item !== "." && !/^\d+$/.test(item));
    for (let line of filteredArr) {
      if (/^\d+[.,]?\s*(.*)$/.test(line.trim())) {
        if (currentMeal !== '') {
          arr.push(currentMeal.trim());
        }
        currentMeal = line.trim();
      } else {
        currentMeal += ' ' + line.trim();
      }
    }

    if (currentMeal !== '') {
      arr.push(currentMeal.trim());
    }


    return arr
  };
  const onOrder = () => {
    setPopup(!isPopup)
    if (!userSelect?.id) return
    selectFood?.map((elm) => {
      let processed_text = elm.replace(pattern, '');
      const params = {
        name: processed_text,
        price: 35,
        note: orderNote,
        user: userSelect.id
      }
      connection.sendMessage({
        type: 'items',
        collection: 'order_84',
        action: 'create',
        data: params
      });
    })
  }
  const deleteFood = (item) => {
    connection.sendMessage({
      type: 'items',
      collection: 'order_84',
      action: 'delete',
      id: item.id
    });
    subscribe('delete');
  }
  useEffect(() => {
    const cleanup = connection.onWebSocket('message', function (data) {
      if (data.type == 'auth' && data.status == 'ok') {
        subscribe('create');
      }
    });
    connection.connect();
    return cleanup;
  }, []);

  async function subscribe(event) {
    const { subscription } = await connection.subscribe('order_84', {
      event, query: {
        sort: '-date_created',
        fields: ['*', 'user.*'],
      },
    });

    for await (const message of subscription) {
      receiveMessage(message);
    }
  }

  const receiveMessage = (function () {
    return function (data) {
      if (data.type == 'subscription' && (data.event == 'create' || data.event == 'delete')) {
        mutateOrder()
        if (data.event === "delete") {
          const filterDelete = orderList?.filter((elm) => elm.id !== data?.data[0])
          setOrderList(filterDelete)
        } else {
          toast.success(data?.data?.[0].user.fullname + ' đã đặt');
          setFoodSelect([])
          setOrderList((prevOrderList) => [...prevOrderList, ...data?.data]);
        }

      }
    };
  })();

  const groupedData = orderList?.reduce((acc, { user, name, note, id, date_created }) => {
    let group = acc.find(group => group.user.id === user?.id);
    if (!group) {
      group = { user: { id: user?.id, fullname: user?.fullname }, items: [] };
      acc.push(group);
    }
    group.items.push({ name: name, note: note, id: id, date_created: date_created });
    return acc;
  }, []);

  const listFood = (arrayFood?.length && arrayFood) || menu?.[0]?.extract_menus
  const bIds = groupedData?.map(item => item.user.id);
  const userNonOrderd = dataUser?.filter(item => !bIds?.includes(item.id));
  return (
    <div className='py-20'>
      <h1 className="font-bold mb-[20px]">Đặt cơm</h1>
      <div className="root-wrapper">
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 5000 }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={`w-[200px] justify-between ${!userSelect?.id && "border-[1px] border-[red]"}`}
            >
              <p className={`${!userSelect?.id && "text-[red]"}`}>{user
                ? dataUser?.find((elm) => elm?.fullname === user)?.fullname
                : "Select user..."}</p>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0 bg-white">
            <Command>
              <CommandInput placeholder="Search name..." />
              <CommandList>
                <CommandEmpty>No user found.</CommandEmpty>
                <CommandGroup>
                  {dataUser?.map((elm) => (
                    <CommandItem
                      key={elm.fullname}
                      value={elm.fullname}
                      onSelect={(currentValue) => {
                        setUser(currentValue === user ? "" : currentValue)
                        setSelectUser(elm)
                        localStorage.setItem("user", JSON.stringify(elm))
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${user === elm.fullname ? "opacity-100" : "opacity-0"}`}
                      />
                      {elm.fullname}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="flex gap-20 mt-[100px] ">
          <div className={`${!userSelect?.id ? "opacity-[0.4] cursor-not-allowed select-none" : "opacity-1"}`}>
            <div className={`${userSelect?.fullname !== "Hồng Phạm" && "opacity-[0.2] cursor-not-allowed"}`}><Input id="picture" type="file" onChange={handleFileChange} /> </div>
            <div className='flex gap-[20px]'>
              <div className='mt-[20px]'>
                {(imageSrc || menu?.[0]?.image) && (
                  <img className='w-[500px]' src={imageSrc || `https://admin.qnsport.vn/assets/${menu?.[0]?.image}`} alt="Uploaded" />
                )}
              </div>
              <div className='text-left mt-[20px]'>
                <p className='font-bold text-left'>Hôm nay ăn gì :</p>
                {loading && <p>Đang xử lý "ây ai" ... ^^</p>}
                <div className="">
                  {listFood?.map((elm, index) => {
                    return (
                      <div className="items-top flex space-x-2 py-[20px]">
                        <Checkbox onCheckedChange={() => onSelectFood(elm)} id={index} />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={index}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {elm}
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <Dialog open={selectFood?.length > 0 ? isPopup : false} onOpenChange={() => setPopup(!isPopup)}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={`${selectFood?.length > 0 ? "opacity-1" : "opacity-[0.6] cursor-not-allowed"} bg-black mt-[20px] w-[200px] text-center mx-auto hover:text-black hover:bg-black`}
                    >
                      <p className='text-center mx-auto text-white'>Đặt đơn</p>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                      <DialogTitle>Chốt đơn</DialogTitle>
                      <DialogDescription>
                        Có thêm bớt cơm gì đồ note dô để tui làm cho nè :3
                        <div className='mt-[20px]'>{selectFood?.map((elm) => {
                          let processed_text = elm.replace(pattern, '')
                          return (
                            <p>- {processed_text}</p>
                          )
                        })}</div>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="items-center gap-4">
                        <Textarea defaultValue={orderNote} onInput={(e) => setOrderNote(e.target.value)} placeholder="Note dô đây nhen" />
                      </div>
                    </div>
                    <DialogFooter>
                      {/* <Button type="submit">Save changes</Button> */}
                      <Button
                        onClick={onOrder}
                        variant="outline"
                        role="combobox"
                        className="bg-black mt-[20px] w-[200px] justify-between flex items-center text-center mx-auto hover:text-black hover:bg-black"
                      >
                        <p className='text-center mx-auto text-white'>Bút xa gà chết</p>
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

              </div>
            </div>
          </div>
          <Table className={`${!userSelect?.id ? "opacity-[0.5] cursor-not-allowed select-none" : "opacity-1"}`}>
            <TableCaption className="text-left">
              <p>Các đồng chí đã đặt : {groupedData?.map((orderd) => {
                return <span className="font-bold">{orderd.user.fullname}, </span>
              })}</p>
              <p>Các đồng chí mãi làm chưa đặt : {userNonOrderd?.map((orderd) => {
                return <span className="font-bold">{orderd.fullname}, </span>
              })}</p>
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
              {groupedData?.map((elm) => (
                <TableRow key={elm.user.fullname}>
                  <TableCell className="font-medium">{elm.user.fullname}</TableCell>
                  <TableCell className="text-left">{elm.items?.map((item) => (
                    <div className='flex items-center'><p>{"(SL : 1) : " + item.name}</p>
                      <span className='ml-[12px] text-red-500 cursor-pointer' onClick={() => deleteFood(item)}>X</span></div>
                  ))}</TableCell>
                  <TableCell className="text-left">{elm.items?.[0].note}</TableCell>
                  <TableCell className="text-left">35k/món</TableCell>
                  <TableCell className="text-right">{dayjs(elm.items[0]?.date_created).format("HH:MM")}</TableCell>
                  <TableCell className="text-right">{elm.items?.length * 35}k</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="font-bold text-left">Tổng thiệt hại</TableCell>
                <TableCell colSpan={3} className="text-right font-bold">{orderList?.length * 35}k</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default OCRComponent;
