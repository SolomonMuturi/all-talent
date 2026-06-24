'use client';

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BlogPost } from '@/lib/blog';

interface EditBlogDialogProps {
  post: BlogPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostUpdated?: () => void;
}

export function EditBlogDialog({ post, open, onOpenChange, onPostUpdated }: EditBlogDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    category: '',
    tags: '',
    status: 'draft',
    imageUrl: '',
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        author: post.author?.name || '',
        category: post.category || '',
        tags: post.tags || '',
        status: post.status || 'draft',
        imageUrl: post.imageUrl || '',
      });
      if (post.imageUrl) {
        setImagePreview(post.imageUrl);
      }
    }
  }, [post]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid File",
          description: "Please upload an image file.",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Please upload an image smaller than 5MB.",
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!post) return;
    if (!formData.title || !formData.content) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please provide both title and content.",
      });
      return;
    }

    setLoading(true);
    try {
      let imageUrl = formData.imageUrl;

      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);
        uploadFormData.append('type', 'blog');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          imageUrl = uploadData.url;
        }
      }

      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const res = await fetch(`/api/blog/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug,
          imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update blog post");
      }

      toast({
        title: "Post Updated",
        description: "The blog post has been successfully updated.",
      });
      
      onOpenChange(false);
      if (onPostUpdated) onPostUpdated();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update blog post.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Blog Post</DialogTitle>
          <DialogDescription>
            Update the blog post details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-title" className="text-right">Title *</Label>
            <Input 
              id="edit-title" 
              name="title"
              value={formData.title} 
              onChange={handleInputChange} 
              className="col-span-3" 
              disabled={loading} 
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="edit-content" className="text-right pt-2">Content *</Label>
            <Textarea 
              id="edit-content" 
              name="content"
              value={formData.content} 
              onChange={handleInputChange} 
              className="col-span-3 min-h-[200px]" 
              disabled={loading} 
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="edit-excerpt" className="text-right pt-2">Excerpt</Label>
            <Textarea 
              id="edit-excerpt" 
              name="excerpt"
              value={formData.excerpt} 
              onChange={handleInputChange} 
              className="col-span-3 min-h-[60px]" 
              disabled={loading} 
            />
          </div>

          {/* Image Upload */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Featured Image</Label>
            <div className="col-span-3">
              {imagePreview ? (
                <div className="relative w-full max-w-xs">
                  <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary">
                    <Image
                      src={imagePreview}
                      alt="Blog post image preview"
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={removeImage}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="edit-image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/75 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, WEBP (Max 5MB)
                      </p>
                    </div>
                    <Input
                      id="edit-image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={loading}
                      ref={fileInputRef}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-author" className="text-right">Author</Label>
            <Input 
              id="edit-author" 
              name="author"
              value={formData.author} 
              onChange={handleInputChange} 
              className="col-span-3" 
              disabled={loading} 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-category" className="text-right">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))} 
              disabled={loading}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="News">News</SelectItem>
                <SelectItem value="Events">Events</SelectItem>
                <SelectItem value="Academy">Academy</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Tournament">Tournament</SelectItem>
                <SelectItem value="Community">Community</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-tags" className="text-right">Tags</Label>
            <Input 
              id="edit-tags" 
              name="tags"
              value={formData.tags} 
              onChange={handleInputChange} 
              className="col-span-3" 
              disabled={loading} 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-status" className="text-right">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))} 
              disabled={loading}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}