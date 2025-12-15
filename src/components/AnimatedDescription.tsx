import { motion } from "motion/react";
import React from "react";

export const AnimatedDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.p
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        delay: 0.7,
      }}
      style={{ willChange: "transform, opacity" }}
      className="text-center w-1/3 mx-auto"
    >
      {children}
    </motion.p>
  );
};

