import { useMouse } from "@uidotdev/usehooks";
import { useMotionValue, motion } from "framer-motion";
import { useEffect } from "react";

const Background = () => {
  const [mouse, ref] = useMouse();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    x.set(mouse.elementX);
    y.set(mouse.elementY);
  }, [mouse]);

  return (
    <div className="fixed z-[-1] top-0 left-0 w-screen h-screen " ref={ref}>
      <div className="h-screen bg-white relative overflow-hidden">
        <div className="bg-muted-foreground/20 absolute inset-0 z-[0]"></div>
        <motion.div
          style={{ top: y, left: x }}
          className="bg-gradient-radial absolute from-muted-foreground/80 z-[0] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full from-0% to-transparent to-90% blur-md"
        ></motion.div>
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" className="relative z-10">
          <defs>
            <pattern id="dotted-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="black"></circle>
            </pattern>
            <mask id="dots-mask">
              <rect width="100%" height="100%" fill="white"></rect>
              <rect width="100%" height="100%" fill="url(#dotted-pattern)"></rect>
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="hsl(var(--background))" mask="url(#dots-mask)"></rect>
        </svg>
      </div>
    </div>
  );
};

export default Background;
