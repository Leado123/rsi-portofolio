import { motion } from "motion/react";
import React from "react";

export const PageFadeIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      style={{ willChange: "opacity" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

