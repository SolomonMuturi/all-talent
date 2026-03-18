'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog';
import { teamMembers } from '@/lib/data';
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
import { ArrowUpRight } from 'lucide-react';

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const author = teamMembers.find(member => member.id === post.authorId);

  return (
    <Card className="flex flex-col">
      <CardHeader className="p-0">
        <Link href={`/blog/${post.slug}`} className="block">
            <div className="relative aspect-video">
            <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="rounded-t-lg object-cover"
                data-ai-hint={post.imageHint}
            />
            </div>
        </Link>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="text-xl font-headline mb-2">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </CardTitle>
        <CardDescription>{post.excerpt}</CardDescription>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-3">
            {author && (
                <>
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={author.avatarUrl} alt={author.name} />
                        <AvatarFallback>{author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium">{author.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
  );
}
