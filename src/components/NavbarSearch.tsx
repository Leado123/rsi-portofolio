import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  imageUrl: string | null;
}

interface NavbarSearchProps {
  posts: Post[];
}

export const NavbarSearch: React.FC<NavbarSearchProps> = ({ posts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Filter posts based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query)
    );
    setFilteredPosts(filtered);
  }, [searchQuery, posts]);

  // GSAP FLIP animation
  useEffect(() => {
    if (typeof window === 'undefined' || !isOpen || !buttonRef.current || !modalRef.current || !backdropRef.current) return;

    import('gsap').then((gsapModule) => {
      const gsap = gsapModule.default;
      const button = buttonRef.current!;
      const modal = modalRef.current!;
      const backdrop = backdropRef.current!;

      // Get initial positions
      const buttonRect = button.getBoundingClientRect();
      const modalRect = modal.getBoundingClientRect();

      // Calculate center positions
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight * 0.2; // 20% from top
      
      const buttonCenterX = buttonRect.left + buttonRect.width / 2;
      const buttonCenterY = buttonRect.top + buttonRect.height / 2;

      // Calculate the offset needed to center the modal
      const offsetX = buttonCenterX - centerX;
      const offsetY = buttonCenterY - centerY;

      // Set initial state (FLIP: First)
      // Use xPercent: -50 to center horizontally, then offset from button position
      gsap.set(modal, {
        x: offsetX,
        y: offsetY,
        xPercent: -50,
        scaleX: buttonRect.width / modalRect.width,
        scaleY: buttonRect.height / modalRect.height,
        opacity: 0,
        transformOrigin: "center center",
      });

      gsap.set(backdrop, { opacity: 0 });
      gsap.set(button, { opacity: 1 }); // Ensure button is visible initially
      if (inputRef.current) {
        gsap.set(inputRef.current, { opacity: 0 });
      }

      // Animate to final state (FLIP: Last)
      const tl = gsap.timeline();

      tl.to(button, {
        opacity: 0,
        scale: 0.8,
        duration: 0.2,
        ease: "power2.out",
      })
        .to(backdrop, {
          opacity: 1,
          duration: 0.2,
          ease: "power2.out",
        }, "-=0.1")
        .to(
          modal,
          {
            x: 0,
            y: 0,
            xPercent: -50,
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            duration: 0.4,
            ease: "power3.out",
          },
          "-=0.2"
        )
        .to(
          inputRef.current,
          {
            opacity: 1,
            duration: 0.2,
          },
          "-=0.2"
        );

      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    });
  }, [isOpen]);

  // Close animation
  const handleClose = useCallback(() => {
    if (typeof window === 'undefined' || !buttonRef.current || !modalRef.current || !backdropRef.current) return;

    import('gsap').then((gsapModule) => {
      const gsap = gsapModule.default;
      const button = buttonRef.current!;
      const modal = modalRef.current!;
      const backdrop = backdropRef.current!;

      const buttonRect = button.getBoundingClientRect();
      const modalRect = modal.getBoundingClientRect();

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight * 0.2;
      
      const buttonCenterX = buttonRect.left + buttonRect.width / 2;
      const buttonCenterY = buttonRect.top + buttonRect.height / 2;

      const offsetX = buttonCenterX - centerX;
      const offsetY = buttonCenterY - centerY;

      const tl = gsap.timeline({
        onComplete: () => {
          setIsOpen(false);
          setSearchQuery("");
          // Reset button opacity
          gsap.set(button, { opacity: 1, scale: 1 });
        },
      });

      tl.to(inputRef.current, {
        opacity: 0,
        duration: 0.1,
      })
        .to(
          modal,
          {
            x: offsetX,
            y: offsetY,
            xPercent: -50,
            scaleX: buttonRect.width / modalRect.width,
            scaleY: buttonRect.height / modalRect.height,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
          },
          "-=0.05"
        )
        .to(
          backdrop,
          {
            opacity: 0,
            duration: 0.2,
          },
          "-=0.2"
        )
        .to(
          button,
          {
            opacity: 1,
            scale: 1,
            duration: 0.2,
          },
          "-=0.1"
        );
    });
  }, []);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (
        modalRef.current &&
        backdropRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        backdropRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleClose]);

  const handlePostClick = (post: Post) => {
    handleClose();
    setTimeout(() => {
      window.location.href = `/posts/${encodeURIComponent(post.slug)}`;
    }, 300);
  };

  return (
    <>
      {/* Static Search Button in Navbar */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(true)}
        className="relative w-1/3 p-2 rounded-lg bg-white/80 backdrop-blur-md border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 min-w-[200px] justify-center pointer-events-auto z-10 cursor-pointer"
        style={{ pointerEvents: 'auto' }}
      >
        <svg
          className="w-4 h-4 text-gray-500"
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
        <span className="text-sm text-gray-600">Search posts...</span>
      </button>

      {/* Spotlight Modal - Portal to body */}
      {typeof document !== "undefined" &&
        isOpen &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              ref={backdropRef}
              className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-md"
              onClick={handleClose}
            />

            {/* Spotlight Modal Container */}
            <div
              ref={modalRef}
              className="fixed z-[10000] w-full max-w-2xl px-4 pointer-events-none"
              style={{
                top: "20%",
                left: "50%",
              }}
            >
              {/* Search Input */}
              <div className="relative mb-3 pointer-events-auto">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full px-6 py-4 pr-12 rounded-2xl bg-white/95 backdrop-blur-xl border border-gray-200/60 shadow-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  style={{ opacity: 0 }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
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
                </div>
              </div>

              {/* Results Container */}
              {searchQuery.trim() && (
                <div
                  ref={resultsRef}
                  className="pointer-events-auto max-h-[60vh] overflow-y-auto rounded-2xl bg-white/95 backdrop-blur-xl border border-gray-200/60 shadow-2xl"
                >
                  {filteredPosts.length > 0 ? (
                    <div className="p-2">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-200/60">
                        {filteredPosts.length} result{filteredPosts.length !== 1 ? "s" : ""} found
                      </div>
                      {filteredPosts.map((post, index) => (
                        <div
                          key={post.id}
                          onClick={() => handlePostClick(post)}
                          className="p-4 hover:bg-gray-50/80 cursor-pointer transition-colors border-b border-gray-100/60 last:border-b-0"
                          style={{
                            animation: `fadeInUp 0.2s ease-out ${index * 0.03}s both`,
                          }}
                        >
                          <div className="flex gap-4">
                            {post.imageUrl && (
                              <img
                                src={post.imageUrl}
                                alt={post.title}
                                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3
                                className="font-semibold text-gray-900 mb-1 line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: post.title }}
                              />
                              <p
                                className="text-sm text-gray-600 line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: post.excerpt }}
                              />
                              <span className="text-xs text-gray-400 mt-2 block">
                                {post.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <p>No posts found matching "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <style>{`
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </>,
          document.body
        )}
    </>
  );
};
