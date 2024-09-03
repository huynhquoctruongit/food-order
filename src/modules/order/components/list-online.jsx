import { useUserInCompany } from "@/hooks/use-company";
import useConnection, { useSubscribe } from "@/hooks/use-connection";
import AxiosClient from "@/lib/api/axios-client";
import { enumFood } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import useSWR from "swr";
import { motion } from "framer-motion";
import { useMyPresence, useOthers } from "@liveblocks/react/suspense";
import { useAuth } from "@/hooks/use-auth";
import { createImage } from "@/lib/helper";

const ListOnline = () => {
  const others = useOthers();
  const { profile } = useAuth();
  const [persence, updateMyPresence] = useMyPresence();
  const userCount = others.length;

  useEffect(() => {
    const user = {
      name: profile.first_name + " " + profile.last_name,
      avatar: profile.avatar,
      id: profile.id,
    };
    updateMyPresence({ profile: user });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-wrap gap-4 mt-10 fixed bottom-2 left-0 root-wrapper py-2 justify-center z-[1000]"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4 p-4 shadow-lg bg-white w-fit rounded-full flex-wrap"
      >
        {others
          .filter((el) => el.presence?.profile)
          .map((el, index) => {
            const profile = el.presence?.profile;
            return (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border flex items-center gap-1 border-dashed border-primary-01 group relative rounded-full hover:border-pastel-pink cursor-pointer"
                key={profile.id}
              >
                <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 rounded-full bg-pastel-pink/5 ">
                  <img className="w-10 h-10 rounded-full" src={createImage(profile.avatar, 100)} />
                </motion.div>
                <span className="text-sm absolute bottom-full left-full px-2 py-1 group-hover:z-10 pointer-events-none group-hover:pointer-events-auto  duration-300 opacity-0 group-hover:opacity-100 rounded-md bg-primary-01 text-white  whitespace-nowrap ">
                  {profile.name}
                </span>
              </motion.div>
            );
          })}
        {/* <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, }}
          className="border flex items-center gap-1 border-dashed border-primary-01 group relative rounded-full hover:border-pastel-pink cursor-pointer"
        >
          <span className="text-sm absolute bottom-full left-full px-2 py-1 group-hover:z-10 pointer-events-none group-hover:pointer-events-auto  duration-300 opacity-0 group-hover:opacity-100 rounded-md bg-primary-01 text-white  whitespace-nowrap ">
            {userCount}
          </span>
        </motion.div> */}
      </motion.div>
    </motion.div>
  );
};

export default ListOnline;
