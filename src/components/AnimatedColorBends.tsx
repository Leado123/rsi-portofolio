import { motion } from "motion/react";
import React from "react";
import ColorBends from "./ColorBends.jsx";

interface AnimatedColorBendsProps {
  colors: string[];
  rotation?: number;
  speed?: number;
  scale?: number;
  frequency?: number;
  warpStrength?: number;
  mouseInfluence?: number;
  parallax?: number;
  noise?: number;
  transparent?: boolean;
}

export const AnimatedColorBends: React.FC<AnimatedColorBendsProps> = (props) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1.5,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      style={{ willChange: "opacity" }}
      className="w-full h-dvw"
    >
      <ColorBends {...props} />
    </motion.div>
  );
};

