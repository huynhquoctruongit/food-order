import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "usehooks-ts";

const UserLogin = () => {
  const [user, _] = useLocalStorage("user", null);
  const isAdmin = false;
  const [valueUser, setCreateUser] = useState("");

  if (user === null) return null;
  return (
    <Dialog open={!user ? true : false}>
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
            <span className="text-center mx-auto text-white">Vào đặt thôi</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserLogin;
