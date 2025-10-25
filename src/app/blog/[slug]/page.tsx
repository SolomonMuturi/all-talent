import { notFound } from 'next/navigation';
import { blogPosts } from '@/lib/blog';
import { BlogPostDetails } from '@/components/blog/blog-post-details';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find(p => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  return <BlogPostDetails post={post} />;
}
