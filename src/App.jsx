import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import useSWR from "swr";
import AxiosAPI from "@/libs/api/axios-client.ts"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
import { Label } from "@/components/ui/label"
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
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // Import plugin UTC để xử lý múi giờ UTC
import { useToast } from "@/components/ui/use-toast"
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
dayjs.extend(utc); // Kích hoạt plugin UTC


const OCRComponent = () => {
  const { toast } = useToast()
  const url = "https://admin.qnsport.vn/websocket";
  const access_token = '6rYHvFJ2LRtR3Qg7DrhJK-_MTQGsBYnr';
  const connection = createDirectus(url)
    .with(staticToken(access_token))
    .with(realtime());
  connection.connect()

  const { data, mutate: mutateUser } = useSWR(
    "/items/user_84",
  )
  const now = dayjs().add(7, 'hour');
  const utcTime = now.utc().format();

  const todayFormatted = dayjs().format('YYYY-MM-DD');
  // &filter[date_created][_gte]=${todayFormatted}T00:00:00.000Z
  const { data: orderToday, mutate: mutateOrder } = useSWR(
    `/items/order_84?fields=*,user.*&filter[date_created][_gte]=${todayFormatted}T00:00:00.000Z`)
  const { data: menuToday } = useSWR(
    `/items/menus?fields=*&sort=-date_created&filter[date_created][_gte]=${todayFormatted}T00:00:00.000Z`
  )
  const dataUser = data?.data?.data
  const menu = menuToday?.data?.data
  const [imageSrc, setImageSrc] = useState('');
  const [arrayFood, setArrayFood] = useState([]);
  const [user, setUser] = React.useState("")
  const [userSelect, setSelectUser] = useState({})
  const [selectFood, setFoodSelect] = useState([])
  const [orderList, setOrderList] = useState([])
  const [loading, setLoading] = useState(false)
  const [orderNote, setOrderNote] = useState("")
  const [isPopup, setPopup] = useState("")
  const [valueUser, setCreateUser] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [passwordAdmin, setPassWord] = useState("")
  const [isTimeout, setIsTimeout] = useState(false);
  const [optionRice, setOptionRice] = useState({})

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
    const filterOther = orderMembers?.filter((elm) => elm.name !== "orther-food")
    setOrderList(filterOther)
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
      toast({
        variant: "destructive",
        title: "Không có quyền !",
        description: "Có phải chị Hồng đó không ta :)))",
      })
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
    const params = { extract_menus: arr, image: imageUpload.data.data.id, date_created: utcTime }
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
      const price = optionRice[elm] == "no-rice" ? 25 : 35
      let processed_text = elm.replace(pattern, '');
      const params = {
        name: processed_text,
        price: price,
        note: orderNote,
        user: userSelect.id,
        date_created: utcTime
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
          toast({
            variant: "success",
            title: data?.data?.[0].user.fullname,
            description: "✌ Đã đặt",
          })
          setFoodSelect([])
          const fullName = data?.data?.[0]?.user?.fullname
          const userLocal = localStorage.getItem("user")
          if (fullName == JSON.parse(userLocal).fullname) {
            setTimeout(() => {
              location.reload()
            }, 1500);
          }
          setOrderList((prevOrderList) => [...prevOrderList, ...data?.data]);
        }

      }
    };
  })();
  const onCreateUser = async () => {
    if (isAdmin) {
      goAdmin()
      mutateUser()
    } else {
      if (valueUser) {
        const params = {
          fullname: valueUser
        }
        const res = await AxiosAPI.post("/items/user_84", params)
        if (res) {
          const userGet = res.data?.data
          localStorage.setItem("user", JSON.stringify(userGet))
          setSelectUser(userGet)
          setUser(userGet?.fullname)
          mutateUser()
        }
      }
    }
  }
  const logOut = () => {
    localStorage.removeItem("user")
    setSelectUser({})
    setUser("")
  }
  const goAdmin = async () => {
    const res = await AxiosAPI.get("/items/user_84")
    const userGet = res.data?.data
    const adminUser = userGet?.find((elm) => elm.fullname === "Hồng Phạm")
    if (adminUser?.password == passwordAdmin) {
      localStorage.setItem("user", JSON.stringify(adminUser))
      setSelectUser(adminUser)
      setUser(adminUser?.fullname)
    } else {
      toast({
        variant: "destructive",
        title: "Sai gòi !!!",
        description: "Thử nhớ lại coi, sai gòi kìa !",
      })
    }
  }
  useEffect(() => {
    setPassWord("")
  }, [isAdmin])

  const groupedData = orderList?.reduce((acc, { user, name, note, id, date_created, price }) => {
    let group = acc.find(group => group.user.id === user?.id);
    if (!group) {
      group = { user: { id: user?.id, fullname: user?.fullname }, items: [] };
      acc.push(group);
    }
    group.items.push({ name: name, note: note, id: id, date_created: date_created, price: price });
    return acc;
  }, []);

  const listFood = (arrayFood?.length && arrayFood) || menu?.[0]?.extract_menus
  const bIds = groupedData?.map(item => item.user.id);
  const userNonOrderd = dataUser?.filter(item => !bIds?.includes(item.id));

  const processItems = (items) => {
    if (!items) return
    const result = [];
   
    items.forEach(item => {
      const existingItem = result.find(r => r.name === item.name);
      if (existingItem) {
        var countNoRice = 0
        const match = items?.filter((elm) => elm.name == existingItem.name)
        match?.map((elm) => {
          if (elm.price == 25) {
            countNoRice++
            existingItem["no_rice"] = (countNoRice);
          }
        })
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
          no_rice: item.price == 25 ? 1 : 0
        });
      }
    });

    return result;
  };
  const finalList = orderList && processItems(orderList)
  function isTimeBetweenCurrent() {
    const currentTime = dayjs();
    const startTime = dayjs('13:00', 'HH:mm');
    const endTime = dayjs('24:00', 'HH:mm');
    return currentTime.isAfter(startTime) && currentTime.isBefore(endTime);
  }
  useEffect(() => {
    setIsTimeout(isTimeBetweenCurrent());
    const interval = setInterval(() => {
      setIsTimeout(isTimeBetweenCurrent());
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  const getSelectRice = (e, item) => {
    setOptionRice({
      ...optionRice,
      [item]: e
    })
  }
  return (
    <div className='py-[20px] bg-white text-black min-h-[calc(100vh-64px)]'>
      <Dialog open={!user ? true : false}>
        <DialogContent className="sm:max-w-[425px] bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-black">Cho tui biết ai đang đặt vậy?</DialogTitle>
            <DialogDescription className="text-black">
              Không hiện lần sau nữa đâu nè
              <div className='mt-[20px]'>{selectFood?.map((elm) => {
                let processed_text = elm.replace(pattern, '')
                return (
                  <p key={processed_text} className="text-black">- {processed_text}</p>
                )
              })}</div>

            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <p>{isAdmin ? "Mật khẩu" : "Họ tên"}</p>
            {isAdmin ? <div className="items-center gap-4">
              <Input value={passwordAdmin} onInput={(e) => setPassWord(e.target.value)} placeholder="Nhập mật khẩu" />
            </div> : <div className="items-center gap-4">
              <Input value={valueUser} onInput={(e) => setCreateUser(e.target.value)} placeholder="Nhập họ tên nhen" />
            </div>}
          </div>

          <div className="items-top flex space-x-2 pb-[20px]">
            <Checkbox onCheckedChange={() => setIsAdmin(!isAdmin)} className="checked-order" id="admin" />
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
              <p className='text-center mx-auto text-white'>Vào đặt thôii</p>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="root-wrapper">
        <div className='flex items-center justify-between'>
          <h1 className="font-bold mb-[20px]">Đặt cơm</h1>
          <p className='border-[1px] border-[#d1d0d0] p-[5px]'><span className='font-bold'>{user}</span></p>
        </div>
        <div className={`bg-gray-200 rounded-[12px] p-[20px] ${!userSelect?.id ? "opacity-[0.4] cursor-not-allowed select-none" : "opacity-1"}`}>
          <div className={`${userSelect?.fullname !== "Hồng Phạm" && "opacity-[0.2] cursor-not-allowed"}`}><Input className="text-black w-[180px]" id="picture" type="file" onChange={handleFileChange} /> </div>
          <div className='flex gap-[20px]'>
            <div className='mt-[20px]'>
              {(imageSrc || menu?.[0]?.image) && (
                <img className='w-[200px] text-black' src={imageSrc || `https://admin.qnsport.vn/assets/${menu?.[0]?.image}`} alt="Uploaded" />
              )}
            </div>
            <div className='text-left mt-[20px]'>
              {loading && <p className='text-red-600'>Đang xử lý AI ...</p>}
              <p className='text-[14px]'>{listFood?.length > 0 ? "Chọn món bên dưới :" : "Chưa có đồ ăn, vui lòng đợi 1 xíu nhen"}</p>
              <div className="flex flex-wrap">
                {listFood?.map((elm, index) => {
                  return (
                    <div key={index + "-elm"} className="items-top flex space-x-2 py-[20px] mr-[30px]">
                      <Checkbox className="checked-order" onCheckedChange={() => onSelectFood(elm)} id={index} />
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
              <Dialog open={selectFood?.length > 0 && !isTimeout ? isPopup : false} onOpenChange={() => setPopup(!isPopup)}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={`${selectFood?.length > 0 && !isTimeout ? "opacity-1" : "opacity-[0.6] cursor-not-allowed"} bg-black mt-[20px] w-[200px] text-center mx-auto hover:text-black hover:bg-black`}
                  >
                    <p className='text-center mx-auto text-white'>Đặt đơn</p>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white text-black">
                  <DialogHeader>
                    <DialogTitle className="text-black">Chốt đơn</DialogTitle>
                    <DialogDescription className="text-black">
                      Có thêm bớt cơm gì đồ note dô để tui làm cho nè :3
                      <div className='mt-[20px]'>{selectFood?.map((elm) => {
                        let processed_text = elm.replace(pattern, '')
                        return (
                          <div className='mb-[20px]'>
                            <p key={processed_text} className="text-black font-bold mb-[6px]">- {processed_text}</p>
                            <RadioGroup onValueChange={(e) => getSelectRice(e, elm)} className="flex gap-[12px]" defaultValue="full-rice">
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
        <div className="md:flex gap-[30px] mt-[40px] relative">
          <div className={isTimeout ? "bg-[#00000088] cursor-not-allowed select-none z-[1] absolute h-full w-full text-white text-[30px] font-bold flex justify-center items-center" : "absolute opacity-0"}>Đơn đã đặt</div>
          <div className='p-[20px]'>
            <Table className={`border-[1px] border-[#d9d8d8] md:mt-0 mt-[30px] pb-[20px] ${!userSelect?.id ? "opacity-[0.5] cursor-not-allowed select-none" : "opacity-1"}`}>
              <TableCaption className="text-left">
                <p>Các đồng chí đã đặt : {groupedData?.map((orderd) => {
                  return <span key={orderd.user.fullname} className="font-bold">{orderd.user.fullname}, </span>
                })}</p>
                <p className='mt-[20px]'>Các đồng chí mãi làm chưa đặt : {userNonOrderd?.map((orderd) => {
                  return <span key={orderd.fullname} className="font-bold">{orderd.fullname}, </span>
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
                {groupedData?.map((elm) => {
                  const dateFormat = dayjs(elm?.items?.[0]?.date_created)
                  return (
                    <TableRow className={`${userSelect?.fullname == elm.user.fullname && "bg-slate-200"} hover:bg-slate-100`} key={elm.user.fullname} >
                      <TableCell className="p-2 font-medium whitespace-nowrap">{elm.user.fullname}</TableCell>
                      <TableCell className="p-2 text-left min-w-[200px]">{elm.items?.map((item) => (
                        <div key={elm.name} className='flex items-center'><p>{"(SL : 1) : " + item.name}{item.price == 25 && <span className='text-red-600 ml-[12px]'>(Không cơm)</span>}</p>
                          {userSelect?.fullname == elm.user.fullname && <span className='ml-[12px] text-white bg-red-500 text-[12px] font-bold py-[] px-[12px] cursor-pointer' onClick={() => deleteFood(item)}>Huỷ</span>}</div>
                      ))}</TableCell>
                      <TableCell className="p-2 text-left">{elm.items?.[0].note}</TableCell>
                      <TableCell className="p-2 text-left">35k/món</TableCell>
                      <TableCell className="p-2 text-right">{dateFormat?.subtract(7, 'hour').format("HH:mm")}</TableCell>
                      <TableCell className="p-2 text-right h-full">{elm.items?.map((elm) => (
                        <p>{elm.price}k</p>
                      ))}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <div className='text-left border-[1px] border-[#d1d0d0] p-[20px]'>
            <p className='font-bold'>Hoá đơn : <span className='font-normal'>{orderList?.length} phần</span></p>
            <div>
              {finalList?.map((elm, index) => {
                return (
                  <div className={`${index % 2 && "bg-slate-200"} p-[10px]`}>
                    <div className='whitespace-nowrap'><span className='font-bold'>SL: {elm.count}</span> - {elm.name}{elm.no_rice > 0 && <span className='text-red-600 ml-[12px]'>({elm.no_rice} Phần không cơm)</span>}</div>
                    <div className='ml-[12px]'>{elm.notes?.map((item, indexItem) => (
                      <p>✎ Món {indexItem + 1} : {item}</p>
                    ))}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default OCRComponent;
