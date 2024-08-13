import { useAuth } from "@/hooks/use-auth";
import { useLocalStorage } from "usehooks-ts";

const Profile = () => {
  const { profile } = useAuth();
  
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center justify-between">{profile?.fullname}</div>
      <div className="min-w-8 min-h-8 rounded-md shadow-md bg-pastel-pink">
        <img src="/food3.png" alt="" className="w-8 h-8  " />
      </div>
    </div>
  );
};

export default Profile;
