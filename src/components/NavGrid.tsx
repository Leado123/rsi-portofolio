import { motion } from "motion/react";
import React from "react";

export const NavGrid = () => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 15,
      scale: 0.96,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  const cardBaseClasses = "cursor-pointer flex w-full flex-col border border-gray-200/60 p-4 rounded-xl bg-white/80 backdrop-blur-md shadow-sm hover:shadow-lg transition-all duration-200";

  return (
    <motion.div
      className="grid w-full grid-cols-1 md:grid-cols-3 gap-4 mt-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ willChange: "transform" }}
    >
      <motion.div
        variants={itemVariants}
        onClick={() => window.open('https://git.leowen.me', '_blank')}
        className={cardBaseClasses}
        whileHover={{ 
          scale: 1.02,
          y: -2,
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25 
        }}
        style={{ willChange: "transform" }}
      >
        <div className="w-full flex items-center justify-between gap-3 mb-2">
          <a 
            className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors" 
            href="https://git.leowen.me" 
            onClick={(e) => e.stopPropagation()}
          >
            My Gitea
          </a>
          <img 
            className="h-10 w-10 object-contain rounded-lg bg-white p-1" 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Gitea_Logo.svg/960px-Gitea_Logo.svg.png?20240428233230" 
            alt="Gitea Logo"
            loading="lazy"
          />
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Where I store my bioinformatic Jupyter notebooks, past projects, etc.
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        onClick={() => window.open('https://Leado123.github.io', '_blank')}
        className={cardBaseClasses}
        whileHover={{ 
          scale: 1.02,
          y: -2,
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25 
        }}
        style={{ willChange: "transform" }}
      >
        <div className="w-full flex items-center justify-between gap-3 mb-2">
          <a 
            className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors" 
            href="https://Leado123.github.io" 
            onClick={(e) => e.stopPropagation()}
          >
            Sharesyllabus.me
          </a>
          <img 
            className="h-10 w-10 object-contain rounded-lg bg-white p-1" 
            src="https://leado123.github.io/logo_borderless.png" 
            alt="Sharesyllabus Logo"
            loading="lazy"
          />
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          An alternative to Rate My Professor that uses syllabi. Used to be hosted at sharesyllabus.me, now archived.
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        onClick={() => window.open('https://git.leowen.me/liyaowhen/youtubecollector-git', '_blank')}
        className={cardBaseClasses}
        whileHover={{ 
          scale: 1.02,
          y: -2,
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25 
        }}
        style={{ willChange: "transform" }}
      >
        <div className="w-full flex items-center justify-between gap-3 mb-2">
          <a 
            className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors" 
            href="https://git.leowen.me/liyaowhen/youtubecollector-git" 
            onClick={(e) => e.stopPropagation()}
          >
            Youtube Music Downloader
          </a>
          <img 
            className="h-10 w-10 object-contain rounded-lg bg-white p-1" 
            src="https://gitlab.com/uploads/-/system/project/avatar/59940538/logo.png?width=48" 
            alt="Youtube Downloader Logo"
            loading="lazy"
          />
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          A GTK based application that downloads music from youtube sources through interaction with yt-dl
        </p>
      </motion.div>
    </motion.div>
  );
};
