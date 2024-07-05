import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import useSWR from "swr";
import AxiosAPI from "@/libs/api/axios-client.ts"
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
// import toast, { Toaster } from 'react-hot-toast';
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
dayjs.extend(utc); // Kích hoạt plugin UTC


const OCRComponent = () => {
  const { toast } = useToast()
  const url = "https://admin.qnsport.vn/websocket";
  const access_token = '6rYHvFJ2LRtR3Qg7DrhJK-_MTQGsBYnr';
  const connection = createDirectus(url)
    .with(staticToken(access_token))
    .with(realtime());
  connection.connect()

  const { data } = useSWR(
    "/items/user_84",
  )
  const now = dayjs().add(7, 'hour');
  const utcTime = now.utc().format();

  const todayFormatted = dayjs().format('YYYY-MM-DD');
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
      let processed_text = elm.replace(pattern, '');
      const params = {
        name: processed_text,
        price: 35,
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
    <div className='py-10 bg-white text-black min-h-[calc(100vh-64px)]'>
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
              <p className='text-center mx-auto text-white'>Lụm</p>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="root-wrapper">
        <div className='flex items-center justify-between'>
          <h1 className="font-bold mb-[20px]">Đặt cơm</h1>
          <p className='border-[1px] border-[#d1d0d0] p-[5px]'><span className='font-bold'>{user}</span> | <span className='text-white cursor-pointer bg-black px-[6px] py-[3px] text-[12px] font-bold' onClick={logOut}>Logout</span></p>
        </div>

        <div className="md:flex gap-20 mt-[70px] ">
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
                {loading && <p className='text-red-600'>Đang xử lý AI ...</p>}
                <div className="">
                  {listFood?.map((elm, index) => {
                    return (
                      <div key={index + "-elm"} className="items-top flex space-x-2 py-[20px]">
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
                  <DialogContent className="sm:max-w-[425px] bg-white text-black">
                    <DialogHeader>
                      <DialogTitle className="text-black">Chốt đơn</DialogTitle>
                      <DialogDescription className="text-black">
                        Có thêm bớt cơm gì đồ note dô để tui làm cho nè :3
                        <div className='mt-[20px]'>{selectFood?.map((elm) => {
                          let processed_text = elm.replace(pattern, '')
                          return (
                            <p key={processed_text} className="text-black">- {processed_text}</p>
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
          <Table className={`border-[1px] border-[#d9d8d8] md:mt-0 mt-[30px] pb-[20px] ${!userSelect?.id ? "opacity-[0.5] cursor-not-allowed select-none" : "opacity-1"}`}>
            <TableCaption className="text-left">
              <p>Các đồng chí đã đặt : {groupedData?.map((orderd) => {
                return <span key={orderd.user.fullname} className="font-bold">{orderd.user.fullname}, </span>
              })}</p>
              <p>Các đồng chí mãi làm chưa đặt : {userNonOrderd?.map((orderd) => {
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
                  <TableRow key={elm.user.fullname} >
                    <TableCell className="font-medium whitespace-nowrap">{elm.user.fullname}</TableCell>
                    <TableCell className="text-left min-w-[200px]">{elm.items?.map((item) => (
                      <div key={elm.name} className='flex items-center'><p>{"(SL : 1) : " + item.name}</p>
                        {userSelect?.fullname == elm.user.fullname && <span className='ml-[12px] text-red-500 cursor-pointer' onClick={() => deleteFood(item)}>X</span>}</div>
                    ))}</TableCell>
                    <TableCell className="text-left">{elm.items?.[0].note}</TableCell>
                    <TableCell className="text-left">35k/món</TableCell>
                    <TableCell className="text-right">{dateFormat?.subtract(7, 'hour').format("HH:MM")}</TableCell>
                    <TableCell className="text-right">{elm.items?.length * 35}k</TableCell>
                  </TableRow>
                )
              })}
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
    </div >
  );
};

export default OCRComponent;
