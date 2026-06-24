'use client';

import { useState, useEffect } from 'react';
import { BlogList } from "@/components/blog/blog-list";
import { AddBlogDialog } from "@/components/blog/add-blog-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BlogPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blog');
      const data = await res.json();
      if (data.success) {
        setPosts(data.data || []);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to fetch blog posts",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch blog posts",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-headline">Blog & News</h1>
            <p className="text-muted-foreground">
              The latest news, announcements, and media activities from the academy.
            </p>
          </div>
          <div className="flex gap-2">
            <Button disabled>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border bg-card p-4 animate-pulse">
              <div className="aspect-video bg-muted rounded-t-lg"></div>
              <div className="h-6 bg-muted rounded mt-4 w-3/4"></div>
              <div className="h-4 bg-muted rounded mt-2 w-1/2"></div>
              <div className="h-10 bg-muted rounded mt-4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-headline">Blog & News</h1>
          <p className="text-muted-foreground">
            The latest news, announcements, and media activities from the academy.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPosts}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Post
          </Button>
        </div>
      </div>

      <BlogList posts={posts} onPostUpdated={fetchPosts} />

      <AddBlogDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onPostAdded={fetchPosts}
      />
    </div>
  );
}