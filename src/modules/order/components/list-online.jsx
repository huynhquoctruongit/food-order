import { useUserInCompany } from "@/hooks/use-company";
import useConnection, { useSubscribe } from "@/hooks/use-connection";
import AxiosClient from "@/lib/api/axios-client";
import { enumFood } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import useSWR from "swr";
import { motion } from "framer-motion";

const ListOnline = () => {
  const callback = useRef();
  const { companyId } = useParams();
  const { data, mutate } = useSWR([
    "/items/activity_user",
    {
      fields: "*,user_created.*",
      filter: {
        company: companyId,
        name: "online",
      },
    },
  ]);
  const users = (data?.data || []).map((el) => el.user_created);
  useEffect(() => {
    AxiosClient.post("/items/activity_user", {
      name: "online",
      company: parseInt(companyId),
    }).then(() => mutate());
  }, []);
  callback.current = (data) => {
    console.log("data", data);
  };

  useSubscribe("delete", "activity_user", ["*,user_created.*"], { company: companyId, name: "online" }, callback);
  if (users.length === 0) return;
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
        {users.map((el, index) => {
          return (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="border flex items-center gap-1 border-dashed border-primary-01 pl-1 pr-2 py-1 rounded-full hover:border-pastel-pink cursor-pointer"
              key={el.id + el.fullname + index}
            >
              <motion.div whileHover={{ scale: 1.1 }} className="w-6 h-6 rounded-full bg-pastel-pink/5">
                <img className="w-6 h-6 rounded-full" src={enumFood[index % enumFood.length]} />
              </motion.div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                className="text-sm text-gray-700"
              >
                {el.first_name + " " + el.last_name}
              </motion.span>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default ListOnline;
