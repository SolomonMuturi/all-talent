import { BlogList } from "@/components/blog/blog-list";
import { blogPosts } from "@/lib/blog";

export default function BlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Blog & News</h1>
        <p className="text-muted-foreground">
          The latest news, announcements, and media activities from the academy.
        </p>
      </div>
      <BlogList posts={blogPosts} />
    </div>
  );
}
