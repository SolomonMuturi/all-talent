'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AddCourseDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailHint, setThumbnailHint] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [duration, setDuration] = useState('');
  const [instructor, setInstructor] = useState('');
  const [prerequisites, setPrerequisites] = useState('');
  const [objectives, setObjectives] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [syllabus, setSyllabus] = useState('');
  const [resources, setResources] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title || !type) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please provide both course name and type.",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type,
          description,
          thumbnail_url: thumbnailUrl,
          thumbnail_hint: thumbnailHint,
          price: price ? parseFloat(price) : 0,
          notes,
          tags,
          duration: duration ? parseInt(duration) : 0,
          instructor,
          prerequisites,
          objectives,
          outcomes,
          syllabus,
          resources,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create course");
      }
      toast({
        title: "Course Created",
        description: "The new course has been successfully added.",
      });
      setOpen(false);
      setTitle('');
      setType('');
      setDescription('');
      setThumbnailUrl('');
      setThumbnailHint('');
      setPrice('');
      setNotes('');
      setTags('');
      setDuration('');
      setInstructor('');
      setPrerequisites('');
      setObjectives('');
      setOutcomes('');
      setSyllabus('');
      setResources('');
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to create course.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Course</DialogTitle>
          <DialogDescription>
            Enter all details for the new course.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Name</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} className="col-span-3" disabled={loading} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">Type</Label>
            <Select value={type} onValueChange={setType} disabled={loading}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self-paced">Self Paced Learning</SelectItem>
                <SelectItem value="instructor-led">Instructor-led</SelectItem>
                <SelectItem value="blended">Blended Learning</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="col-span-3 min-h-[100px]" disabled={loading} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="thumbnailUrl" className="text-right">Thumbnail URL</Label>
            <Input id="thumbnailUrl" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} className="col-span-3" disabled={loading} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="thumbnailHint" className="text-right">Thumbnail Hint</Label>
            <Input id="thumbnailHint" value={thumbnailHint} onChange={e => setThumbnailHint(e.target.value)} className="col-span-3" disabled={loading} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">Price</Label>
            <Input id="price" type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="col-span-3" disabled={loading} />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right">Notes</Label>
            <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} className="col-span-3 min-h-[60px]" disabled={loading} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tags" className="text-right">Tags</Label>
            <Input id="tags" value={tags} onChange={e => setTags(e.target.value)} className="col-span-3" disabled={loading} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">Duration (minutes)</Label>
            <Input id="duration" type="number" min="0" value={duration} onChange={e => setDuration(e.target.value)} className="col-span-3" disabled={loading} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="instructor" className="text-right">Instructor</Label>
            <Input id="instructor" value={instructor} onChange={e => setInstructor(e.target.value)} className="col-span-3" disabled={loading} />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="prerequisites" className="text-right">Prerequisites</Label>
            <Textarea id="prerequisites" value={prerequisites} onChange={e => setPrerequisites(e.target.value)} className="col-span-3 min-h-[40px]" disabled={loading} />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="objectives" className="text-right">Objectives</Label>
            <Textarea id="objectives" value={objectives} onChange={e => setObjectives(e.target.value)} className="col-span-3 min-h-[40px]" disabled={loading} />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="outcomes" className="text-right">Outcomes</Label>
            <Textarea id="outcomes" value={outcomes} onChange={e => setOutcomes(e.target.value)} className="col-span-3 min-h-[40px]" disabled={loading} />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="syllabus" className="text-right">Syllabus</Label>
            <Textarea id="syllabus" value={syllabus} onChange={e => setSyllabus(e.target.value)} className="col-span-3 min-h-[60px]" disabled={loading} />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="resources" className="text-right">Resources</Label>
            <Textarea id="resources" value={resources} onChange={e => setResources(e.target.value)} className="col-span-3 min-h-[40px]" disabled={loading} />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
