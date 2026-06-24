import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Fetch all blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    
    let sql = 'SELECT * FROM blog_posts WHERE 1=1';
    const params: any[] = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY published_at DESC';
    
    const posts = await query(sql, params);
    
    // Parse JSON fields and add author info
    const formattedPosts = (posts || []).map((post: any) => ({
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : [],
      author: {
        name: post.author_name || 'Unknown',
        avatarUrl: post.author_avatar || '',
      },
    }));

    return NextResponse.json({
      success: true,
      data: formattedPosts
    });
  } catch (error: any) {
    console.error('GET blog error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      imageUrl,
      imageHint,
      author,
      category,
      tags,
      status,
      publishedAt,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const id = `BLOG${Date.now().toString(36).toUpperCase()}`;
    const authorName = author || 'Admin';
    const tagsJson = tags ? JSON.stringify(tags.split(',').map((t: string) => t.trim())) : '[]';

    await query(
      `INSERT INTO blog_posts (
        id, title, slug, excerpt, content, image_url, image_hint,
        author_name, category, tags, status, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, title, slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        excerpt || '', content, imageUrl || '', imageHint || '',
        authorName, category || '', tagsJson, status || 'draft',
        publishedAt || new Date().toISOString()
      ]
    );

    const [newPost] = await query('SELECT * FROM blog_posts WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      data: newPost,
      message: 'Blog post created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST blog error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}