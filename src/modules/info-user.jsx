import { useAuth } from "@/hooks/use-auth";
import { LogOutIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";

const Profile = () => {
  const { profile, isLogin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => setOpen(false));
  if (!isLogin) return null;
  return (
    <div className="flex items-center justify-between gap-4 relative">
      <div className="flex items-center justify-between">{profile?.fullname}</div>
      <div className="min-w-8 min-h-8 rounded-md shadow-md bg-pastel-pink cursor-pointer" onClick={() => setOpen(!open)}>
        <img src="/food3.png" alt="" className="w-8 h-8  " />
      </div>
      {open && (
        <div
          ref={ref}
          onClick={() => logout()}
          className="absolute top-full mt-2 right-0 bg-white rounded-md p-2 max-w-32 z-20 flex items-center shadow cursor-pointer"
        >
          Đăng xuất <LogOutIcon className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

export default Profile;
