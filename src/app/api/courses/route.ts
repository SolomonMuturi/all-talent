import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const courses = await query(`
      SELECT 
        id,
        title,
        description,
        thumbnail_url,
        thumbnail_hint,
        price,
        type,
        notes,
        tags,
        duration,
        instructor,
        prerequisites,
        objectives,
        outcomes,
        syllabus,
        resources,
        gallery,
        attachments,
        created_at,
        updated_at
      FROM courses
      ORDER BY created_at DESC
      LIMIT 100
    `);

    return NextResponse.json(
      Array.isArray(courses) ? courses : [],
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fetch courses error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Add POST if you want to support course creation
