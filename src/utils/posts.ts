export interface Post {
  id: number;
  title: { rendered: string };
  date: string;
  excerpt: { rendered: string };
  link: string;
  slug: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      media_details?: {
        width?: number;
        height?: number;
      };
    }>;
    'wp:term'?: Array<Array<{
      name: string;
      taxonomy: string;
    }>>;
  };
}

export interface ProcessedPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  imageUrl: string | null;
  imageWidth: number;
  imageHeight: number;
  link: string;
  categories: string[];
  tags: string[];
}

export async function fetchPosts(): Promise<Post[]> {
  const WORDPRESS_API_URL = import.meta.env.PUBLIC_WORDPRESS_API_URL || "https://leowen.me";
  
  try {
    const res = await fetch(`${WORDPRESS_API_URL}/wp-json/wp/v2/posts?_embed`, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export function processPosts(posts: Post[]): ProcessedPost[] {
  return posts.map((post: Post) => {
    const rawImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const imageUrl = rawImage ? rawImage.replace(/^http:\/\//, 'https://') : null;

    // Extract categories from wp:term taxonomy
    const categories = post._embedded?.['wp:term']?.flat().filter(term => term.taxonomy === 'category').map(term => term.name) || [];
    // Extract tags from wp:term taxonomy
    const tags = post._embedded?.['wp:term']?.flat().filter(term => term.taxonomy === 'post_tag').map(term => term.name) || [];

    return {
      id: post.id,
      slug: post.slug || post.link.split('/').filter(Boolean).pop() || '',
      title: post.title.rendered ? post.title.rendered.replace(/http:\/\//g, 'https://') : '',
      excerpt: post.excerpt.rendered ? post.excerpt.rendered.replace(/http:\/\//g, 'https://') : '',
      date: new Date(post.date).toLocaleDateString(),
      imageUrl,
      imageWidth: post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.width || 800,
      imageHeight: post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.height || 600,
      link: post.link,
      categories,
      tags,
    };
  });
}


