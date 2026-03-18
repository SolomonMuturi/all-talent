import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Fetch all products
export async function GET(request: NextRequest) {
  try {
    const products = await query('SELECT * FROM merchandise ORDER BY created_at DESC');
    return NextResponse.json({
      success: true,
      data: { products }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Add a new product
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const price = Number(formData.get('price'));
    const category = formData.get('category') as string;
    const description = formData.get('description') as string | null;
    const sizes = formData.get('sizes') as string | null;
    // Handle image upload if needed (not implemented here)

    if (!name || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a very short unique id (e.g. 6 random alphanumeric chars)
    const id = Math.random().toString(36).slice(2, 8).toUpperCase();

    await query(
      `INSERT INTO merchandise (id, name, price, category, description, sizes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        id,
        name,
        price,
        category,
        description || null,
        sizes || null
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Product added successfully',
      data: { id }
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/merchandise error:', error, error?.stack);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
