import { cn } from "@/lib/utils";
import Marquee from "react-fast-marquee";

const Testimonials = () => {
  return (
    <div className="py-20">
      <div className="root-wrapper mx-auto ">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 4].map((item) => {
            const isFast = item % 2 === 0;
            return <ColTestimonial direction={isFast ? "up" : "down"} time={isFast ? 100 : 50} />;
          })}
        </div>
      </div>
    </div>
  );
};
const testimonials = [
  {
    avatar: "/foods/mon-1.png",
    name: "Nguyễn Ngọc Nhất",
    title: "Senior developer",
    description:
      "Tôi đã sử dụng dịch vụ của công ty trong 3 năm qua và rất hài lòng với chất lượng sản phẩm cũng như dịch vụ của công ty.",
  },
  {
    avatar: "/foods/mon-1.png",
    name: "Bé Linh",
    title: "Senior developer",
    description: "Giúp đặt đồ ăn trở nên vui vẽ thú vị hơn",
  },
  {
    avatar: "/foods/mon-1.png",
    name: "Bé Linh",
    title: "Senior developer",
    description: "Giúp đặt đồ ăn trở nên vui vẽ thú vị hơn",
  },
  {
    avatar: "/foods/mon-1.png",
    name: "Bé Linh",
    title: "Senior developer",
    description: "Giúp đặt đồ ăn trở nên vui vẽ thú vị hơn",
  },
];

const ColTestimonial = ({ item, direction, time }) => {
  return (
    <div className="flex flex-col gap-4" style={{ width: "fit-content" }} direction="up">
      {testimonials.map((item, index) => {
        return (
          <div
            key={index + "testimonial"}
            className={cn("p-5 justify-start bg-white text-primary-01 border-primary-01 border border-dashed rounded-md")}
          >
            <div className="flex items-center gap-2 justify-start">
              <div className=" min-w-[3.75rem] w-[3.75rem] aspect-square">
                <img c src={item.avatar} alt="" className="w-full h-full border border-primary-01 rounded-full" />
              </div>
              <div>
                <div className="text-md uppercase text-left">{item.name}</div>
                <div className="text-sm text-gray-600 text-left">{item.title}</div>
              </div>
            </div>
            <div className="text-sm text-gray-700 text-left mt-2"> {item.description}</div>
          </div>
        );
      })}
    </div>
  );
};

export default Testimonials;
