import Loading, { LoadingPage } from "@/components/widget/loading";
import useQuestion from "../helper/use-question";
import { AnimatePresence, motion } from "framer-motion";
import { cn, enumFood } from "@/lib/utils";
import { useState } from "react";
import { createImage } from "@/lib/helper";
import useImage from "@/modules/order/helper/use-image";
import UserProfile from "@/components/widget/user";
import { Button } from "@/components/ui/button-hero";
import { ChevronsRightIcon } from "lucide-react";

const Relax = () => {
  const { isLoading, getNextQuestion } = useQuestion();
  const question = getNextQuestion();
  if (isLoading) return <LoadingPage />;
  return (
    <motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="root-wrapper text-left relative mt-10"
      >
        <div className="absolute top-1/3 left-0 bg-pastel-pink/20  blur-xl w-72 h-72 rounded-full"></div>
        <div className="absolute top-2/3 left-1/2 bg-secondary-01/5  blur-2xl w-64 h-64 rounded-full"></div>
        <div className="flex items-stretch gap-10 mt-10 relative z-10">
          <div className="w-4/6 ">
            <Question question={question} key={question.id} />
          </div>
          <div className="w-2/6 border border-primary-01 rounded-xl p-6  bg-white">
            <div className="text-primary-01">Cẩn thận với các người chơi này</div>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="rounded-full border-dashed border-pastel-pink border px-2 py-1 text-primary-01">232 điểm</div>
                <UserProfile
                  profile={{
                    id: "qqweqew",
                    first_name: " Nhất",
                    last_name: "Nguyễn  ",
                    avatar: "1eb2299c-f72a-42e8-8cb7-3910f3e83618",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
export default Relax;

const Question = ({ question }) => {
  const {   createAnswer } = useQuestion();
  const [active, setActive] = useState(null);
  const onClick = (option) => {
    if (active) return;
    setActive(option);
  };
  const { data } = useImage("juice");
  const enumJuice = data.map((item) => item.directus_files_id);

  return (
    <div className="border h-full min-h-[500px] border-primary-01 rounded-xl p-6 bg-white ring-[6px] ring-primary-01/5 ring-offset-0">
      <div className="flex gap-10 items-start">
        <div className="text-primary-01 w-2/3">{question.content}</div>
        <div className="w-1/3">
          <img src={createImage(question.image, 500)} alt="" className="w-40 h-full object-contain" />
        </div>
      </div>
      <div className="flex flex-col gap-6 mt-10 flex-wrap">
        {question.options.map((option, index) => {
          const itemActive = enumJuice[index % enumJuice.length];
          return (
            <div key={option.id} className="flex gap-x-4 items-center gap-y-1 cursor-pointer ">
              <div className="min-w-16 w-16 h-16">
                <img src={createImage(option.image || itemActive, 500)} alt="" className=" w-16 h-16 object-contain" />
              </div>

              <div>
                <div
                  onClick={() => onClick(option)}
                  className={cn(
                    "text-sm rounded-full w-fit whitespace-nowrap  hover:shadow-lg hover:shadow-primary-01/10 duration-200  px-3 py-0.5 border-dashed border-pastel-pink border ",
                    { "bg-secondary-01 text-white border-secondary-01": active && active?.id === option.id && option.is_correct },
                    { "bg-primary-01 text-white border-primary-01": active && active?.id === option.id && !option.is_correct },
                  )}
                >
                  {option.label} {active && active?.id === option.id && (option.is_correct ? "👍" : "👎")}
                </div>
                <AnimatePresence>
                  {active && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      transition={{ duration: 0.3, type: "ease" }}
                      className={cn("text-xs mt-1 ml-2", {
                        "text-green-700": option.is_correct,
                        "text-gray-500": !option.is_correct,
                      })}
                    >
                      {option.explanation}{" "}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end mt-10">
        <Button className="flex items-center gap-2">
          Câu tiếp đê <ChevronsRightIcon className="w-4" />
        </Button>
      </div>
    </div>
  );
};
