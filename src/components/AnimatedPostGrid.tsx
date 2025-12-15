import { motion } from "motion/react";
import React from "react";

interface Post {
  id: number;
  title: { rendered: string };
  date: string;
  excerpt: { rendered: string };
  link: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
    'wp:term'?: Array<Array<{
      name: string;
      taxonomy: string;
    }>>;
  };
}

interface AnimatedPostGridProps {
  posts: Post[];
}

export const AnimatedPostGrid: React.FC<AnimatedPostGridProps> = ({ posts }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 1.0,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ willChange: "transform, opacity" }}
    >
      {posts.map((post) => {
        const rawImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
        const image = rawImage ? rawImage.replace(/^http:\/\//, 'https://') : null;
        const postLink = post.link ? post.link.replace(/^http:\/\//, 'https://') : post.link;
        const title = post.title.rendered ? post.title.rendered.replace(/http:\/\//g, 'https://') : post.title.rendered;
        const excerpt = post.excerpt.rendered ? post.excerpt.rendered.replace(/http:\/\//g, 'https://') : post.excerpt.rendered;
        const date = new Date(post.date).toLocaleDateString();
        
        return (
          <motion.article
            key={post.id}
            variants={itemVariants}
            className="border rounded-lg p-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
            whileHover={{ 
              scale: 1.02,
              y: -4,
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20 
            }}
            style={{ willChange: "transform, opacity" }}
          >
            {image && (
              <img 
                src={image} 
                alt={post.title.rendered}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            )}
            <div className="flex flex-col gap-2">
              <span className="text-sm opacity-70">{date}</span>
              <h2 className="text-xl font-bold" dangerouslySetInnerHTML={{ __html: title }} />
              <div className="text-sm opacity-90" dangerouslySetInnerHTML={{ __html: excerpt }} />
              <a 
                href={postLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 text-blue-400 hover:text-blue-300 inline-block"
              >
                Read more &rarr;
              </a>
            </div>
          </motion.article>
        );
      })}
    </motion.div>
  );
};

