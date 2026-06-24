import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Fetch a single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    
    const [post] = await query('SELECT * FROM blog_posts WHERE id = ? OR slug = ?', [id, id]);
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const formattedPost = {
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : [],
      author: {
        name: post.author_name || 'Unknown',
        avatarUrl: post.author_avatar || '',
      },
    };

    return NextResponse.json({
      success: true,
      data: formattedPost
    });
  } catch (error: any) {
    console.error('GET blog post error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update a blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
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
    } = body;

    // Check if post exists
    const [existing] = await query('SELECT id FROM blog_posts WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const authorName = author || 'Admin';
    const tagsJson = tags ? JSON.stringify(tags.split(',').map((t: string) => t.trim())) : '[]';

    await query(
      `UPDATE blog_posts SET
        title = ?, slug = ?, excerpt = ?, content = ?,
        image_url = ?, image_hint = ?, author_name = ?,
        category = ?, tags = ?, status = ?, updated_at = NOW()
      WHERE id = ?`,
      [
        title, slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        excerpt || '', content, imageUrl || '', imageHint || '',
        authorName, category || '', tagsJson, status || 'draft', id
      ]
    );

    const [updatedPost] = await query('SELECT * FROM blog_posts WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      data: updatedPost,
      message: 'Blog post updated successfully'
    });
  } catch (error: any) {
    console.error('PUT blog post error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // Check if post exists
    const [existing] = await query('SELECT id FROM blog_posts WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    await query('DELETE FROM blog_posts WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error: any) {
    console.error('DELETE blog post error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}