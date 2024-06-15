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
import { Button } from "@/components/ui/button"
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

const OCRComponent = () => {
  const invoices = [
    {
      invoice: "INV001",
      paymentStatus: "Paid",
      totalAmount: "$250.00",
      paymentMethod: "Credit Card",
    },
    {
      invoice: "INV002",
      paymentStatus: "Pending",
      totalAmount: "$150.00",
      paymentMethod: "PayPal",
    },
    {
      invoice: "INV003",
      paymentStatus: "Unpaid",
      totalAmount: "$350.00",
      paymentMethod: "Bank Transfer",
    },
    {
      invoice: "INV004",
      paymentStatus: "Paid",
      totalAmount: "$450.00",
      paymentMethod: "Credit Card",
    },
    {
      invoice: "INV005",
      paymentStatus: "Paid",
      totalAmount: "$550.00",
      paymentMethod: "PayPal",
    },
    {
      invoice: "INV006",
      paymentStatus: "Pending",
      totalAmount: "$200.00",
      paymentMethod: "Bank Transfer",
    },
    {
      invoice: "INV007",
      paymentStatus: "Unpaid",
      totalAmount: "$300.00",
      paymentMethod: "Credit Card",
    },
  ]
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
  const { data: orderToday } = useSWR(
    `/items/order_84?fields=*,user.*`
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
  // const blob = new Blob([chunk], { type: "audio/aac" });
  // const file = new File([blob], name + ".aac");

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const newFormData = new FormData();

      // Thêm Blob vào FormData với key là "file"
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
    // Xử lý và tạo HTML dựa trên kết quả text
    // Ví dụ:
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
      // Kiểm tra nếu dòng bắt đầu bằng số và có dấu chấm, dấu phẩy hoặc không có dấu gì nữa
      if (/^\d+[.,]?\s*(.*)$/.test(line.trim())) {
        // Nếu đã có món ăn trước đó, push vào mảng arr
        if (currentMeal !== '') {
          arr.push(currentMeal.trim());
        }
        // Đặt lại món ăn hiện tại
        currentMeal = line.trim();
      } else {
        // Nếu không phải dòng bắt đầu bằng số và dấu chấm, dấu phẩy, thêm vào món ăn hiện tại
        currentMeal += ' ' + line.trim();
      }
    }

    // Push món ăn cuối cùng vào mảng arr (nếu có)
    if (currentMeal !== '') {
      arr.push(currentMeal.trim());
    }


    return arr
  };
  const onOrder = () => {
    if (!userSelect?.id) return
    let pattern = /^\d+[.,]?\s*/;
    selectFood?.map((elm) => {
      let processed_text = elm.replace(pattern, '');
      const params = {
        name: processed_text,
        price: 35,
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

  const receiveMessage = (function() {
    let hasRun = false; // Biến trạng thái ẩn bên trong closure
    return function(data) {
      if (hasRun) return; // Nếu hàm đã chạy, không thực hiện logic bên trong hàm nữa
      if (data.type == 'subscription' && data.event == 'create') {
        toast.success(data?.data?.[0].user.fullname + ' đã đặt');
        setOrderList((prevOrderList) => [...prevOrderList, ...data?.data]);
        hasRun = true; // Cập nhật trạng thái sau khi hàm đã chạy
      }
    };
  })();
  const groupedData = orderList?.reduce((acc, { user, name, date_created }) => {
    let group = acc.find(group => group.user.id === user?.id);
    if (!group) {
      group = { user: { id: user?.id, fullname: user?.fullname }, items: [] };
      acc.push(group);
    }
    group.items.push({ name: name, date_created: date_created });
    return acc;
  }, []);
  const listFood = (arrayFood?.length && arrayFood) || menu?.[0]?.extract_menus
  const bIds = groupedData?.map(item => item.user.id);
  const userNonOrderd = dataUser?.filter(item => !bIds?.includes(item.id));
  return (
    <div>
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
        <div className={`${!userSelect?.id ? "opacity-[0.5] cursor-not-allowed select-none" : "opacity-1"}`}>
          {<div>
            <input type={`${!userSelect?.id ? "none" : "file"}`} onChange={handleFileChange} /></div>}
          <div className='mt-[20px]'>
            {(imageSrc || menu?.[0]?.image) && (
              <img src={imageSrc || `https://admin.qnsport.vn/assets/${menu?.[0]?.image}`} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '300px' }} />
            )}
          </div>
          <div className='text-left mt-[20px]'>
            <p className='font-bold text-left'>Hôm nay ăn gì :</p>
            {loading && <p>Đang xử lý "ây ai" ... ^^</p>}
            <div className="">
              {listFood?.map((elm, index) => (
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
              ))}
            </div>
            <Button
              onClick={onOrder}
              variant="outline"
              role="combobox"
              className="bg-black mt-[20px] w-[200px] justify-between flex items-center text-center mx-auto hover:text-black hover:bg-black"
            >
              <p className='text-center mx-auto text-white'>Đặt</p>
            </Button>
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
              <TableHead>Giá</TableHead>
              <TableHead className="text-right">Đặt lúc</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedData?.map((elm) => (
              <TableRow key={elm.user.fullname}>
                <TableCell className="font-medium">{elm.user.fullname}</TableCell>
                <TableCell className="text-left">{elm.items?.map((item) => (
                  <p>{"(SL : 1) : " + item.name}</p>
                ))}</TableCell>
                <TableCell>35k/món</TableCell>
                <TableCell className="text-right">{dayjs(elm.items[0]?.date_created).format("HH:MM")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="font-bold">Tổng thiệt hại</TableCell>
              <TableCell className="text-right font-bold">{orderList?.length * 35}k</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

    </div>
  );
};

export default OCRComponent;
