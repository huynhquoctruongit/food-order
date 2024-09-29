import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

export const InfiniteMovingCards = ({ items, direction = "left", speed = "fast", pauseOnHover = false, className }) => {
  const containerRef = useRef();
  const scrollerRef = useRef();

  useEffect(() => {
    addAnimation();
  }, []);
  const [start, setStart] = useState(false);
  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }
  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "up") {
        containerRef.current.style.setProperty("--animation-direction", "forwards");
      } else {
        containerRef.current.style.setProperty("--animation-direction", "reverse");
      }
    }
  };
  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "70s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "100s");
      }
    }
  };
  return (
    <div
      ref={containerRef}
      className={cn(
        // [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]
        "scroller relative z-20  h-[40rem] overflow-hidden ",
        className,
      )}
    >
      <div
        ref={scrollerRef}
        className={cn(
          " flex min-w-full shrink-0 gap-4 py-4 w-fit flex-col flex-nowrap",
          start && "animate-scroll ",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {items.map((item, idx) => (
          <div
            key={idx + "testimonial"}
            className={cn("p-5 justify-start bg-white text-primary-01 border-primary-01 border border-dashed rounded-md")}
          >
            <div className="flex items-center gap-2 justify-start">
              <div className=" min-w-[3.75rem] w-[3.75rem] aspect-square">
                <img src={item.avatar} alt="" className="w-full h-full border border-primary-01 rounded-full" />
              </div>
              <div>
                <div className="text-md uppercase text-left">{item.name}</div>
                <div className="text-sm text-gray-600 text-left">{item.title}</div>
              </div>
            </div>
            <div className="text-sm text-gray-700 text-left mt-2"> {item.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
