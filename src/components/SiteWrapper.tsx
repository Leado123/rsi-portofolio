import { motion } from "motion/react";
import React from "react";

export const SiteWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};
