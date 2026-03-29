'use client';

import { useState, useEffect } from "react";
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
import { 
  PlusCircle, 
  Loader2, 
  Upload, 
  X, 
  Trash2,
  GripVertical,
  Video,
  FileText,
  HelpCircle,
  Clock,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

// Module type definition
interface Module {
  id: string;
  title: string;
  contentType: 'video' | 'document' | 'quiz';
  duration: number;
  content: string;
  order: number;
}

export function AddCourseDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Basic Information
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailHint, setThumbnailHint] = useState('');
  const [price, setPrice] = useState('');
  const [instructor, setInstructor] = useState('');
  const [duration, setDuration] = useState('');
  
  // Additional Details
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [prerequisites, setPrerequisites] = useState('');
  const [objectives, setObjectives] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [syllabus, setSyllabus] = useState('');
  const [resources, setResources] = useState('');
  
  // Modules
  const [modules, setModules] = useState<Module[]>([
    {
      id: '1',
      title: '',
      contentType: 'video',
      duration: 0,
      content: '',
      order: 0
    }
  ]);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload JPEG, PNG, or WEBP images only.",
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Maximum file size is 5MB.",
      });
      return;
    }
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (data.success) {
        setThumbnailUrl(data.url);
        toast({
          title: "Image Uploaded",
          description: "Course thumbnail has been uploaded successfully.",
        });
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload image.",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Module management functions
  const addModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      title: '',
      contentType: 'video',
      duration: 0,
      content: '',
      order: modules.length
    };
    setModules([...modules, newModule]);
  };

  const removeModule = (id: string) => {
    if (modules.length === 1) {
      toast({
        variant: "destructive",
        title: "Cannot Remove",
        description: "Course must have at least one module.",
      });
      return;
    }
    setModules(modules.filter(m => m.id !== id));
  };

  const updateModule = (id: string, field: keyof Module, value: any) => {
    setModules(modules.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const moveModule = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === modules.length - 1) return;
    
    const newModules = [...modules];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newModules[index], newModules[newIndex]] = [newModules[newIndex], newModules[index]];
    
    // Update order
    newModules.forEach((m, idx) => { m.order = idx; });
    setModules(newModules);
  };

  // Reset form
  const resetForm = () => {
    setTitle('');
    setType('');
    setDescription('');
    setThumbnailUrl('');
    setThumbnailHint('');
    setPrice('');
    setInstructor('');
    setDuration('');
    setNotes('');
    setTags('');
    setPrerequisites('');
    setObjectives('');
    setOutcomes('');
    setSyllabus('');
    setResources('');
    setModules([{
      id: '1',
      title: '',
      contentType: 'video',
      duration: 0,
      content: '',
      order: 0
    }]);
    setActiveTab('basic');
  };

  // Validate form
  const validateForm = () => {
    if (!title.trim()) {
      toast({ variant: "destructive", title: "Missing Field", description: "Please enter course title." });
      return false;
    }
    if (!type) {
      toast({ variant: "destructive", title: "Missing Field", description: "Please select course type." });
      return false;
    }
    if (!description.trim()) {
      toast({ variant: "destructive", title: "Missing Field", description: "Please enter course description." });
      return false;
    }
    if (!instructor.trim()) {
      toast({ variant: "destructive", title: "Missing Field", description: "Please enter instructor name." });
      return false;
    }
    
    // Validate modules
    for (let i = 0; i < modules.length; i++) {
      if (!modules[i].title.trim()) {
        toast({ 
          variant: "destructive", 
          title: "Missing Module Info", 
          description: `Module ${i + 1} is missing a title.` 
        });
        return false;
      }
      if (modules[i].duration <= 0) {
        toast({ 
          variant: "destructive", 
          title: "Invalid Duration", 
          description: `Module "${modules[i].title}" needs a valid duration.` 
        });
        return false;
      }
    }
    
    return true;
  };

  // Create course
  const handleCreate = async () => {
    if (!validateForm()) return;
    
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
          instructor,
          duration: duration ? parseInt(duration) : modules.reduce((sum, m) => sum + m.duration, 0),
          notes,
          tags: tags.split(',').map(t => t.trim()),
          prerequisites,
          objectives,
          outcomes,
          syllabus,
          resources,
          modules: modules.map(m => ({
            title: m.title,
            contentType: m.contentType,
            duration: m.duration,
            content: m.content,
            order: m.order
          }))
        }),
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create course");
      }
      
      toast({
        title: "Course Created!",
        description: `"${title}" has been successfully added to the training hub.`,
      });
      
      resetForm();
      setOpen(false);
      
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to create course. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'quiz': return <HelpCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm();
      setOpen(newOpen);
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Course
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">Create New Course</DialogTitle>
          <DialogDescription>
            Fill in all the details below to add a new course to the training hub.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
          </TabsList>
          
          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right font-medium">Course Title *</Label>
              <Input 
                id="title" 
                placeholder="e.g., Advanced Football Tactics" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="col-span-3" 
                disabled={loading} 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right font-medium">Course Type *</Label>
              <Select value={type} onValueChange={setType} disabled={loading}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select course type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self-paced">Self Paced Learning</SelectItem>
                  <SelectItem value="instructor-led">Instructor-led</SelectItem>
                  <SelectItem value="blended">Blended Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right font-medium">Description *</Label>
              <Textarea 
                id="description" 
                placeholder="Provide a detailed description of the course..." 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="col-span-3 min-h-[100px]" 
                disabled={loading} 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="instructor" className="text-right font-medium">Instructor *</Label>
              <Input 
                id="instructor" 
                placeholder="e.g., Coach John Doe" 
                value={instructor} 
                onChange={e => setInstructor(e.target.value)} 
                className="col-span-3" 
                disabled={loading} 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right font-medium">Price (KES)</Label>
              <Input 
                id="price" 
                type="number" 
                min="0" 
                step="0.01" 
                placeholder="0 for free" 
                value={price} 
                onChange={e => setPrice(e.target.value)} 
                className="col-span-3" 
                disabled={loading} 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right font-medium">Total Duration (min)</Label>
              <Input 
                id="duration" 
                type="number" 
                min="0" 
                placeholder="Auto-calculated from modules" 
                value={duration} 
                onChange={e => setDuration(e.target.value)} 
                className="col-span-3" 
                disabled={loading} 
              />
              <div className="col-span-3 col-start-2 text-xs text-muted-foreground">
                Leave empty to auto-calculate from module durations
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="thumbnailUpload" className="text-right font-medium">Thumbnail</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex gap-2">
                  <Input 
                    id="thumbnailUrl" 
                    placeholder="Or enter image URL" 
                    value={thumbnailUrl} 
                    onChange={e => setThumbnailUrl(e.target.value)} 
                    className="flex-1" 
                    disabled={loading} 
                  />
                  <Input 
                    id="thumbnailUpload" 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => document.getElementById('thumbnailUpload')?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </Button>
                </div>
                {thumbnailUrl && (
                  <div className="relative w-32 h-20 rounded overflow-hidden">
                    <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setThumbnailUrl('')}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="thumbnailHint" className="text-right font-medium">Thumbnail Hint</Label>
              <Input 
                id="thumbnailHint" 
                placeholder="e.g., professional football training" 
                value={thumbnailHint} 
                onChange={e => setThumbnailHint(e.target.value)} 
                className="col-span-3" 
                disabled={loading} 
              />
            </div>
          </TabsContent>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="objectives" className="text-right font-medium">Learning Objectives</Label>
              <Textarea 
                id="objectives" 
                placeholder="What students will learn (one per line)..." 
                value={objectives} 
                onChange={e => setObjectives(e.target.value)} 
                className="col-span-3 min-h-[80px]" 
                disabled={loading} 
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="outcomes" className="text-right font-medium">Learning Outcomes</Label>
              <Textarea 
                id="outcomes" 
                placeholder="Expected outcomes after completing the course..." 
                value={outcomes} 
                onChange={e => setOutcomes(e.target.value)} 
                className="col-span-3 min-h-[80px]" 
                disabled={loading} 
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="prerequisites" className="text-right font-medium">Prerequisites</Label>
              <Textarea 
                id="prerequisites" 
                placeholder="Required knowledge or skills..." 
                value={prerequisites} 
                onChange={e => setPrerequisites(e.target.value)} 
                className="col-span-3 min-h-[60px]" 
                disabled={loading} 
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="syllabus" className="text-right font-medium">Syllabus</Label>
              <Textarea 
                id="syllabus" 
                placeholder="Course syllabus or outline..." 
                value={syllabus} 
                onChange={e => setSyllabus(e.target.value)} 
                className="col-span-3 min-h-[100px]" 
                disabled={loading} 
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="resources" className="text-right font-medium">Resources</Label>
              <Textarea 
                id="resources" 
                placeholder="Additional resources (links, books, etc.)..." 
                value={resources} 
                onChange={e => setResources(e.target.value)} 
                className="col-span-3 min-h-[60px]" 
                disabled={loading} 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right font-medium">Tags</Label>
              <Input 
                id="tags" 
                placeholder="e.g., football, tactics, beginners (comma-separated)" 
                value={tags} 
                onChange={e => setTags(e.target.value)} 
                className="col-span-3" 
                disabled={loading} 
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right font-medium">Additional Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Any additional information about the course..." 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                className="col-span-3 min-h-[60px]" 
                disabled={loading} 
              />
            </div>
          </TabsContent>
          
          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-4 py-4">
            <div className="space-y-4">
              {modules.map((module, index) => (
                <Card key={module.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveModule(index, 'up')}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <span className="text-sm font-medium">{index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveModule(index, 'down')}
                          disabled={index === modules.length - 1}
                        >
                          ↓
                        </Button>
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Module Title"
                            value={module.title}
                            onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                            disabled={loading}
                          />
                          <Select
                            value={module.contentType}
                            onValueChange={(value: any) => updateModule(module.id, 'contentType', value)}
                            disabled={loading}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">
                                <div className="flex items-center gap-2">
                                  <Video className="h-4 w-4" />
                                  Video
                                </div>
                              </SelectItem>
                              <SelectItem value="document">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  Document
                                </div>
                              </SelectItem>
                              <SelectItem value="quiz">
                                <div className="flex items-center gap-2">
                                  <HelpCircle className="h-4 w-4" />
                                  Quiz
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              min="0"
                              placeholder="Duration (minutes)"
                              value={module.duration || ''}
                              onChange={(e) => updateModule(module.id, 'duration', parseInt(e.target.value) || 0)}
                              disabled={loading}
                            />
                          </div>
                          <Badge variant="outline" className="justify-center">
                            {getContentTypeIcon(module.contentType)}
                            <span className="ml-1 capitalize">{module.contentType}</span>
                          </Badge>
                        </div>
                        
                        <Textarea
                          placeholder={`${module.contentType === 'video' ? 'Video URL or embed code' : module.contentType === 'document' ? 'Document content or link' : 'Quiz questions and answers'}...`}
                          value={module.content}
                          onChange={(e) => updateModule(module.id, 'content', e.target.value)}
                          className="min-h-[80px]"
                          disabled={loading}
                        />
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeModule(module.id)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addModule}
                className="w-full"
                disabled={loading}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {loading ? 'Creating Course...' : 'Create Course'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}