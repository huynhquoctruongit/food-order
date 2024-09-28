import AnimateText, { AnimateLineText, AnimateView } from "@/components/widget/animate-text";
import { cn } from "@/lib/utils";

const Partners = () => {
  const partners = [
    { title: "TÁM BỐN" },
    { title: "YOUPASS" },
    { title: "VUTHIEN" },
    { title: "KYLONG TECH" },
    { title: "FARMILY MART" },
    { title: "STANDARD" },
    { title: "FPT TELECOM" },
  ];
  return (
    <div className="py-20">
      <div className="root-wrapper mx-auto">
        <div className="border rounded-md border-primary-01 grid grid-cols-4">
          <div className="p-4 border-b border-primary-01 flex justify-center items-center">
            <div>
              <div className="text-left alata text-gray-600">Được tin dùng bởi</div>
              <div className="flex items-end gap-1 alata">
                <span className="text-4xl font-semibold text-primary-01">NHÂN VIÊN</span>
                <span className=" text-gray-600">của</span>
              </div>
            </div>
          </div>
          {partners.map((item, index) => {
            const isSecondLine = index > 2;
            return (
              <div
                key={item.title}
                className={cn("p-5 h-40 flex items-center justify-center text-3xl font-bold text-primary-01", {
                  "border-l border-b border-primary-01 ": !isSecondLine,
                  "border-l border-primary-01": isSecondLine && index !== 3,
                })}
              >
                {item.title}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Partners;
