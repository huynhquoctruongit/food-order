import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { cn } from "@/lib/utils";
import Marquee from "react-fast-marquee";

const Testimonials = () => {
  return (
    <div className="py-20">
      <div className="root-wrapper mx-auto ">
        <div className="grid grid-cols-3 gap-4 [mask-image:linear-gradient(to_top,transparent,white_20%,white_80%,transparent)]">
          {[1, 2, 3].map((item) => {
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
    <InfiniteMovingCards
      direction={direction}
      className="flex flex-col gap-4"
      style={{ width: "fit-content" }}
      items={testimonials}
    ></InfiniteMovingCards>
  );
};

export default Testimonials;
