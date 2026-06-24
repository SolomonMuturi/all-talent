'use client';

import { BlogPost } from '@/lib/blog';
import { BlogPostCard } from './blog-post-card';

interface BlogListProps {
  posts: BlogPost[];
  onPostUpdated?: () => void;
}

export function BlogList({ posts, onPostUpdated }: BlogListProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No Blog Posts</h3>
        <p className="text-muted-foreground">There are no blog posts yet. Create your first post!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <BlogPostCard key={post.id} post={post} onPostUpdated={onPostUpdated} />
      ))}
    </div>
  );
}