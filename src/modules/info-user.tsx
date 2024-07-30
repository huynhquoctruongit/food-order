import { useLocalStorage } from "usehooks-ts";

const Profile = () => {
  const [user, setUser] = useLocalStorage("user", "");
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center justify-between">
        <p className="border-[1px] border-[#d1d0d0] p-[5px]">
          <span className="font-bold">{user}</span>
        </p>
      </div>
    </div>
  );
};

export default Profile;
