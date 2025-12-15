import { motion } from "motion/react";
import React from "react";

export const AnimatedTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        delay: 0.2,
      }}
      style={{ willChange: "transform, opacity" }}
      className="flex flex-col items-center justify-center w-full"
    >
      {children}
    </motion.div>
  );
};
