import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Post {
  id: number;
  title: { rendered: string };
  date: string;
  excerpt: { rendered: string };
  link: string;
  slug: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
  };
}

export const SearchPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const WORDPRESS_API_URL = import.meta.env.PUBLIC_WORDPRESS_API_URL || "https://leowen.me";
      
      try {
        const res = await fetch(`${WORDPRESS_API_URL}/wp-json/wp/v2/posts?_embed`, {
          headers: {
            'Cache-Control': 'public, max-age=300',
          },
        });
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return posts.filter((post) => {
      const title = post.title.rendered?.toLowerCase() || "";
      const excerpt = post.excerpt.rendered?.toLowerCase() || "";
      return title.includes(query) || excerpt.includes(query);
    });
  }, [posts, searchQuery]);

  return (
    <div className="w-full mb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search posts..."
          className="w-full px-4 py-3 pl-10 pr-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </motion.div>

      <AnimatePresence>
        {searchQuery.trim() && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : filteredPosts.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {filteredPosts.map((post) => {
                  const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url?.replace(/^http:\/\//, 'https://');
                  const slug = post.slug || post.link.split('/').filter(Boolean).pop() || '';
                  
                  return (
                    <motion.li
                      key={post.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <a
                        href={`/posts/${encodeURIComponent(slug)}`}
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors no-underline"
                      >
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt={post.title.rendered}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            loading="lazy"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-semibold text-gray-900 mb-1 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                          />
                          <p
                            className="text-sm text-gray-600 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                          />
                        </div>
                      </a>
                    </motion.li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No posts found matching "{searchQuery}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
