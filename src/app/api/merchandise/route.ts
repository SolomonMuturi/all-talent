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

    // Ensure table exists (for dev environments)
    await query(`
      CREATE TABLE IF NOT EXISTS merchandise (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        sizes TEXT,
        stock INT DEFAULT 0,
        lowStockThreshold INT DEFAULT 5,
        sales INT DEFAULT 0,
        image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    const id = `PRD${Date.now()}${Math.floor(Math.random() * 1000)}`;
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
    // Add more detailed error logging for debugging
    console.error('POST /api/merchandise error:', error, error?.stack);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
