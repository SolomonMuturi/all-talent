export type Course = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  thumbnailHint: string;
  modules: CourseModule[];
};

export type CourseModule = {
  id: string;
  title: string;
  contentType: 'video' | 'document' | 'quiz';
  contentUrl: string; // URL to video, PDF, etc.
  duration: number; // in minutes
};

export const courses: Course[] = [
  {
    id: 'financial-literacy-101',
    title: 'Financial Literacy for Athletes',
    description: 'Learn to manage your finances, from budgeting to investing, to secure your future off the field.',
    thumbnailUrl: 'https://picsum.photos/seed/course1/600/400',
    thumbnailHint: 'finance money',
    modules: [],
  },
  {
    id: 'nutrition-for-performance',
    title: 'Nutrition for Peak Performance',
    description: 'Understand the fuel your body needs. Covers meal planning, hydration, and supplements for elite athletes.',
    thumbnailUrl: 'https://picsum.photos/seed/course2/600/400',
    thumbnailHint: 'healthy food',
    modules: [],
  },
  {
    id: 'media-training-basics',
    title: 'Media Training & Public Speaking',
    description: 'Master the art of the interview. Learn how to handle press conferences and build your personal brand.',
    thumbnailUrl: 'https://picsum.photos/seed/course3/600/400',
    thumbnailHint: 'interview microphone',
    modules: [],
  },
  {
    id: 'sports-psychology-fundamentals',
    title: 'Mindset of a Champion',
    description: 'Develop mental toughness, focus, and resilience with fundamental concepts from sports psychology.',
    thumbnailUrl: 'https://picsum.photos/seed/course4/600/400',
    thumbnailHint: 'brain thinking',
    modules: [],
  },
  {
    id: 'tactical-analysis-attacking',
    title: 'Tactical Analysis: Attacking Principles',
    description: 'A deep dive into modern attacking tactics, formations, and player roles.',
    thumbnailUrl: 'https://picsum.photos/seed/course5/600/400',
    thumbnailHint: 'football tactics',
    modules: [],
  },
  {
    id: 'injury-prevention-strategies',
    title: 'Injury Prevention & Recovery',
    description: 'Learn essential strategies for preventing common sports injuries and best practices for effective recovery.',
    thumbnailUrl: 'https://picsum.photos/seed/course6/600/400',
    thumbnailHint: 'athlete stretching',
    modules: [],
  },
];
