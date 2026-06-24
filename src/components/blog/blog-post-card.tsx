'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { ArrowUpRight, Edit, Trash2, ImageIcon } from 'lucide-react';
import { EditBlogDialog } from './edit-blog-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface BlogPostCardProps {
  post: BlogPost;
  onPostUpdated?: () => void;
}

// Use a placeholder service for fallback images
const PLACEHOLDER_IMAGE = 'https://placehold.co/800x600/e5e7eb/6b7280?text=No+Image';

export function BlogPostCard({ post, onPostUpdated }: BlogPostCardProps) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/blog/${post.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete post");
      }

      toast({
        title: "Post Deleted",
        description: "The blog post has been successfully removed.",
      });
      
      setIsDeleteDialogOpen(false);
      if (onPostUpdated) onPostUpdated();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete post.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Get the image URL with fallback
  const imageUrl = post.imageUrl || PLACEHOLDER_IMAGE;
  const showImage = imageUrl && !imageError;

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="p-0 relative">
          <Link href={`/blog/${post.slug}`} className="block">
            <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
              {showImage ? (
                <Image
                  src={imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  data-ai-hint={post.imageHint}
                  onError={() => setImageError(true)}
                  unoptimized={true}
                  priority={false}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mb-2" />
                    <span className="text-sm">No Image</span>
                  </div>
                </div>
              )}
            </div>
          </Link>
          <div className="absolute top-2 right-2 flex gap-1">
            <Button 
              variant="secondary" 
              size="icon" 
              className="h-8 w-8 bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditDialogOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="icon" 
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 flex-grow">
          <CardTitle className="text-xl font-headline mb-2">
            <Link href={`/blog/${post.slug}`} className="hover:underline">
              {post.title}
            </Link>
          </CardTitle>
          <CardDescription>{post.excerpt}</CardDescription>
        </CardContent>
        <CardFooter className="p-6 pt-0 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {post.author && (
              <>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                  <AvatarFallback>{post.author.name?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{post.author.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </>
            )}
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/blog/${post.slug}`}>
              Read More
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <EditBlogDialog
        post={post}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onPostUpdated={onPostUpdated}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post "{post.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}