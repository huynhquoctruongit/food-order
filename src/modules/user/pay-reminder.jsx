import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CircleCheckBig, Circle } from "lucide-react"
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button-hero.jsx";

const PayReminder = ({ orderLastWeek }) => {
  console.log(orderLastWeek,'orderLastWeek')
  const list = orderLastWeek?.data?.data
  const totalPrice = list?.reduce((sum, item) => sum + item.price, 0);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (list?.length) {
      setShow(true);
    }
  }, [list]);

  return (
    <Dialog open={show}>
      <DialogContent className="sm:max-w-[425px] bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-primary">
            Hmmm... Có vẻ bạn quên thanh toán đủ cho chị Hồng
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 text-[13px] text-left">
          Kiểm tra món và giá tiền bên dưới và quét mã MoMo để tiến hành thanh toán
        </div>
        <div className="">
          {list?.map((item, index) => (
            <div
              key={item.label}
              onClick={() => setShow(false)}
              className="group cursor-pointer"
            >
              <div className="text-left text-sm mt-2 text-[#ed4b33]">- {item.name} ({item.price} cá)</div>
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-600 py-4 text-center">
          <img
            className="h-40 w-40 mx-auto my-2 rounded-md"
            src="/momo-qr.png"
            alt=""
          />
          0964353011
        </div>
        <Button onClick={()=>setShow(false)} variant="default" size="default">
        Xác nhận đã thanh toán ({totalPrice}k)
      </Button>
      </DialogContent>
    </Dialog>
  );
};
export default PayReminder;
