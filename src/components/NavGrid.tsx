import { motion } from "motion/react";
import React from "react";

export const NavGrid = () => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      className="grid w-full grid-cols-3 gap-4 "
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        onClick={() => window.open('https://git.leowen.me', '_blank')}
        className="cursor-pointer flex w-full flex-col border p-2 rounded-md bg-white/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/70 hover:border-blue-400"
      >
        <div className="w-full flex items-center gap-2">
          <a className="font-bold" href="https://git.leowen.me" onClick={(e) => e.stopPropagation()}>My Gitea</a>
          <img className="h-8 w-auto object-contain" src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Gitea_Logo.svg/960px-Gitea_Logo.svg.png?20240428233230" alt="Gitea Logo" />
        </div>
        <p className="text-right">
          Where I store my bioinformatic Jupyter notebooks, past projects, etc.
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        onClick={() => window.open('https://Leado123.github.io', '_blank')}
        className="cursor-pointer flex w-full flex-col border p-2 rounded-md bg-white/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/70 hover:border-blue-400"
      >
        <div className="w-full flex items-center gap-2">
          <a className="font-bold" href="https://Leado123.github.io" onClick={(e) => e.stopPropagation()}>Sharesyllabus.me</a>
          <img className="h-8 w-auto object-contain" src="https://leado123.github.io/logo_borderless.png" alt="Sharesyllabus Logo" />
        </div>
        <p className="text-right">
          An alternative to Rate My Professor that uses syllabi. Used to be hosted at sharesyllabus.me, now archived.
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        onClick={() => window.open('https://git.leowen.me/liyaowhen/youtubecollector-git', '_blank')}
        className="cursor-pointer flex w-full flex-col border p-2 rounded-md bg-white/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/70 hover:border-blue-400"
      >
        <div className="w-full flex items-center gap-2">
          <a className="font-bold" href="https://git.leowen.me/liyaowhen/youtubecollector-git" onClick={(e) => e.stopPropagation()}>Youtube Music Downloader</a>
          <img className="h-8 w-auto object-contain" src="https://gitlab.com/uploads/-/system/project/avatar/59940538/logo.png?width=48" alt="Youtube Downloader Logo" />
        </div>
        <p className="text-right">
          A GTK based application that downloads music from youtube sources through interaction with yt-dl
        </p>
      </motion.div>
    </motion.div>
  );
};
