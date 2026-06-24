'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BlogPost } from '@/lib/blog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, ImageIcon } from 'lucide-react';

const PLACEHOLDER_IMAGE = 'https://placehold.co/1200x800/e5e7eb/6b7280?text=No+Image';

interface BlogPostDetailsProps {
  post: BlogPost;
}

export function BlogPostDetails({ post }: BlogPostDetailsProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = post.imageUrl || PLACEHOLDER_IMAGE;
  const showImage = imageUrl && !imageError;

  return (
    <div className="max-w-4xl mx-auto">
      <article className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {post.author && (
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                  <AvatarFallback>{post.author.name?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <span>{post.author.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </time>
            </div>
            {post.category && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                {post.category}
              </span>
            )}
          </div>
        </div>

        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          {showImage ? (
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              data-ai-hint={post.imageHint}
              priority
              onError={() => setImageError(true)}
              unoptimized={true}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <div className="flex flex-col items-center text-muted-foreground">
                <ImageIcon className="h-16 w-16 mb-4" />
                <span className="text-lg">No Image Available</span>
              </div>
            </div>
          )}
        </div>

        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}