export type Course = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  thumbnailHint: string;
  modules: CourseModule[];
  accessLog: CourseAccessLog[];
  price?: number;
  enrolledStudentIds: number[];
};

export type CourseModule = {
  id: string;
  title: string;
  contentType: 'video' | 'document' | 'quiz';
  contentUrl: string;
  duration: number; // in minutes
  description: string;
};

export type CourseAccessLog = {
    studentId: number;
    timestamp: string;
}

export const courses: Course[] = [
  {
    id: 'financial-literacy-101',
    title: 'Financial Literacy for Athletes',
    description: 'Learn to manage your finances, from budgeting to investing, to secure your future off the field.',
    thumbnailUrl: 'https://picsum.photos/seed/course1/600/400',
    thumbnailHint: 'finance money',
    price: 1500,
    enrolledStudentIds: [1, 2, 6, 3],
    modules: [
        { id: 'fl-m1', title: 'Introduction to Budgeting', contentType: 'video', contentUrl: '/videos/placeholder.mp4', duration: 15, description: 'Learn the basics of creating and sticking to a personal budget.' },
        { id: 'fl-m2', title: 'Understanding Investments', contentType: 'video', contentUrl: '/videos/placeholder.mp4', duration: 25, description: 'An overview of different investment types like stocks, bonds, and real estate.' },
        { id: 'fl-m3', title: 'Taxes for Athletes', contentType: 'document', contentUrl: '/docs/placeholder.pdf', duration: 20, description: 'A guide to understanding your tax obligations as a professional athlete.' },
        { id: 'fl-m4', title: 'Budgeting Quiz', contentType: 'quiz', contentUrl: '#', duration: 10, description: 'Test your knowledge on the core concepts of budgeting.' },
    ],
    accessLog: [
        { studentId: 1, timestamp: '2024-07-28 10:15:00' },
        { studentId: 2, timestamp: '2024-07-28 09:30:00' },
        { studentId: 6, timestamp: '2024-07-27 18:00:00' },
    ]
  },
  {
    id: 'nutrition-for-performance',
    title: 'Nutrition for Peak Performance',
    description: 'Understand the fuel your body needs. Covers meal planning, hydration, and supplements for elite athletes.',
    thumbnailUrl: 'https://picsum.photos/seed/course2/600/400',
    thumbnailHint: 'healthy food',
    price: 0,
    enrolledStudentIds: [3, 4, 5],
    modules: [
        { id: 'np-m1', title: 'Macronutrients Explained', contentType: 'video', contentUrl: '/videos/placeholder.mp4', duration: 18, description: 'A deep dive into proteins, carbs, and fats and their role in performance.' },
        { id: 'np-m2', title: 'Hydration Strategies', contentType: 'video', contentUrl: '/videos/placeholder.mp4', duration: 12, description: 'Learn when and what to drink to stay optimally hydrated.' },
        { id: 'np-m3', title: 'Game Day Nutrition', contentType: 'document', contentUrl: '/docs/placeholder.pdf', duration: 15, description: 'A sample meal plan for pre-game, in-game, and post-game nutrition.' },
    ],
    accessLog: [
        { studentId: 3, timestamp: '2024-07-25 11:00:00' },
        { studentId: 4, timestamp: '2024-07-24 15:45:00' },
    ]
  },
  {
    id: 'media-training-basics',
    title: 'Media Training & Public Speaking',
    description: 'Master the art of the interview. Learn how to handle press conferences and build your personal brand.',
    thumbnailUrl: 'https://picsum.photos/seed/course3/600/400',
    thumbnailHint: 'interview microphone',
    price: 1000,
    enrolledStudentIds: [1, 4],
    modules: [
        { id: 'mt-m1', title: 'Handling Difficult Questions', contentType: 'video', contentUrl: '/videos/placeholder.mp4', duration: 20, description: 'Techniques for staying on message and handling tricky questions from journalists.' },
        { id: 'mt-m2', title: 'Building Your Personal Brand', contentType: 'video', contentUrl: '/videos/placeholder.mp4', duration: 22, description: 'How to use social media and public appearances to build a positive brand.' },
    ],
    accessLog: [
         { studentId: 1, timestamp: '2024-07-20 14:00:00' }
    ]
  },
  {
    id: 'sports-psychology-fundamentals',
    title: 'Mindset of a Champion',
    description: 'Develop mental toughness, focus, and resilience with fundamental concepts from sports psychology.',
    thumbnailUrl: 'https://picsum.photos/seed/course4/600/400',
    thumbnailHint: 'brain thinking',
    price: 0,
    enrolledStudentIds: [],
    modules: [],
    accessLog: []
  },
  {
    id: 'tactical-analysis-attacking',
    title: 'Tactical Analysis: Attacking Principles',
    description: 'A deep dive into modern attacking tactics, formations, and player roles.',
    thumbnailUrl: 'https://picsum.photos/seed/course5/600/400',
    thumbnailHint: 'football tactics',
    price: 2000,
    enrolledStudentIds: [],
    modules: [],
    accessLog: []
  },
  {
    id: 'injury-prevention-strategies',
    title: 'Injury Prevention & Recovery',
    description: 'Learn essential strategies for preventing common sports injuries and best practices for effective recovery.',
    thumbnailUrl: 'https://picsum.photos/seed/course6/600/400',
    thumbnailHint: 'athlete stretching',
    price: 0,
    enrolledStudentIds: [],
    modules: [],
    accessLog: []
  },
];
