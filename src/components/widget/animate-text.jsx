import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTimeout } from "usehooks-ts";
const variantParents = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const variantChildrent = {
  initial: {
    y: 300,
  },
  animate: {
    y: 0,
    transition: {
      ease: [0.6, 0.01, -0.05, 0.95],
      duration: 1,
    },
  },
};

const Item = ({ children, delay = 0 }) => {
  return (
    <motion.div variants={variantChildrent} className="" transition={{ delay: delay }}>
      {children === " " ? <>&nbsp;</> : children}
    </motion.div>
  );
};

const AnimateText = ({ children = "", className, delay = 0, ...props }) => {
  const [load, setLoad] = useState(false);
  const texts = children.split("");

  useTimeout(
    () => {
      setLoad(true);
    },
    !load ? delay * 1000 : null,
  );

  if (!load)
    return (
      <div className={cn("flex overflow-hidden opacity-0", className)}>
        {texts.map((item, index) => (
          <Item key={item + index} delay={index * 0.1}>
            {item}
          </Item>
        ))}
      </div>
    );
  return (
    <motion.div
      variants={variantParents}
      viewport={{ once: true }}
      initial={"initial"}
      animate="animate"
      className={cn("flex overflow-hidden", className)}
      {...props}
    >
      {texts.map((item, index) => (
        <Item key={item + index}>{item}</Item>
      ))}
    </motion.div>
  );
};

export const AnimateLineText = ({ children, className = "", delay = 0, ...props }) => {
  const [load, setLoad] = useState(false);
  const texts = children.split(" ");

  useTimeout(
    () => {
      setLoad(true);
    },
    !load ? delay * 1000 : null,
  );
  if (!load) return <div className={cn("opacity-0", className)}>{children}</div>;
  return (
    <div className="overflow-hidden ">
      <motion.div
        variants={variantParents}
        initial={"initial"}
        whileInView="animate"
        viewport={{ once: true }}
        className={cn("flex gap-4", className)}
        {...props}
      >
        {texts.map((item, index) => (
          <Item key={item + index}>{item}</Item>
        ))}
      </motion.div>
    </div>
  );
};

const variantView = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      // ease: [0.6, 0.01, -0.05, 0.95],
      duration: 1,
    },
  },
};

export const AnimateView = ({ className, children, delay = 0 }) => {
  const [load, setLoad] = useState(false);
  useTimeout(
    () => {
      setLoad(true);
    },
    !load ? delay * 1000 : null,
  );
  if (!load) return <div className={cn("opacity-0", className)}>{children}</div>;
  return (
    <motion.div
      variants={variantView}
      initial={"initial"}
      whileInView={"animate"}
      viewport={{ once: true }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};

export default AnimateText;
