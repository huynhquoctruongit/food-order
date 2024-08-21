import { Button } from "@/components/ui/button-hero";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useCompany } from "@/hooks/use-company";
import { Settings, TablePropertiesIcon } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import AxiosClient from "@/lib/api/axios-client";
import { useToast } from "@/components/ui/use-toast";

const EditCompany = () => {
  const [openConfig, setOpenConfig] = useState(false);
  const { profile } = useAuth();
  const { company } = useCompany();
  if (profile.id !== company.admin?.id) return;
  return (
    <>
      <div className="bg-pastel-pink/40 ">
        <div className="root-wrapper py-4 flex justify-end gap-4">
          {/* <div className="w-10 h-10 flex items-center justify-center rounded-md bg-white cursor-pointer shadow-sm">
          <TablePropertiesIcon className="stroke-slate-500" />
        </div> */}
          <div
            className="w-10 h-10 flex items-center justify-center rounded-md bg-white cursor-pointer shadow-sm"
            onClick={() => setOpenConfig(true)}
          >
            <Settings className="stroke-slate-500" />
          </div>
        </div>
      </div>
      <ConFig open={openConfig} onOpenChange={setOpenConfig} />
    </>
  );
};

const ConFig = ({ open, onOpenChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { company, mutate } = useCompany();
  const { destructive, success } = useToast();
  const hours = Array.from({ length: 24 }, (_, i) => i);
  console.log(company);

  const [form, setForm] = useState({
    name: company?.name,
    address: company?.address,
    description: company.description,
  });

  const onChangeData = (name) => {
    return (e) => {
      setForm((prev) => ({ ...prev, [name]: e.target.value }));
    };
  };
  const onSubmit = async () => {
    setIsLoading(true);
    await AxiosClient.patch(`/items/company/${company.id}`, form).catch(() => {
      destructive("Có lỗi xảy ra");
    });
    await mutate();
    success("Cập nhật thành công");
    onOpenChange(false);
    setIsLoading(false);
  };
  return (
    <Dialog open={open} className="" onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-[500px] bg-white text-black bg-[url(/background-auth.png)] bg-cover"
      >
        <div className="py-10">
          <div>
            <Label className="text-base font-normal">Tên công ty</Label>
            <Input
              value={form.name}
              onChange={onChangeData("name")}
              type="text"
              placeholder="Vui lòng nhập tên công ty"
              className="w-full mt-2"
            />
          </div>
          <div className="mt-4">
            <Label className="text-base font-normal">Địa chỉ công ty</Label>
            <Input
              value={form.address}
              onChange={onChangeData("address")}
              type="text"
              placeholder="Vui lòng nhập địa chỉ công ty"
              className="w-full mt-2"
            />
          </div>
          <div className="mt-4">
            <Label className="text-base font-normal">Mô tả ngắn nè</Label>
            <Textarea
              value={form.description}
              type="text"
              onChange={onChangeData("description")}
              placeholder="Vui lòng nhập địa chỉ công ty"
              className="w-full mt-2"
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div></div>
          <Button disabled={isLoading} onClick={onSubmit} className="items-center flex gap-4">
            {isLoading ? "Đang cập nhật" : "Cập nhật"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditCompany;
