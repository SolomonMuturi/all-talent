import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// GET: Fetch all products
export async function GET(request: NextRequest) {
  try {
    const products = await query('SELECT * FROM merchandise ORDER BY created_at DESC');
    
    // Ensure each product has image field and handle JSON parsing
    const formattedProducts = products.map((p: any) => {
      // Parse sizes safely
      let parsedSizes = [];
      if (p.sizes) {
        try {
          if (typeof p.sizes === 'string') {
            if (p.sizes.startsWith('[')) {
              parsedSizes = JSON.parse(p.sizes);
            } else {
              parsedSizes = p.sizes.split(',').map((s: string) => s.trim()).filter(Boolean);
            }
          } else if (Array.isArray(p.sizes)) {
            parsedSizes = p.sizes;
          }
        } catch {
          parsedSizes = [];
        }
      }

      return {
        ...p,
        image: p.image || p.imageUrl || '',
        imageUrl: p.imageUrl || p.image || '',
        sizes: parsedSizes,
        lowStockThreshold: p.lowStockThreshold || 5,
        sales: p.sales || 0,
        stock: p.stock || 0,
        price: parseFloat(p.price) || 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: { products: formattedProducts }
    });
  } catch (error: any) {
    console.error('GET /api/merchandise error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST: Add a new product with image upload
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const price = Number(formData.get('price'));
    const category = formData.get('category') as string;
    const description = formData.get('description') as string || null;
    const sizes = formData.get('sizes') as string || null;
    const stock = Number(formData.get('stock')) || 0;
    const lowStockThreshold = Number(formData.get('lowStockThreshold')) || 5;
    const sales = Number(formData.get('sales')) || 0;
    const imageFile = formData.get('image') as File | null;

    // Validate required fields
    if (!name || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, price, and category are required' },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json(
        { success: false, error: 'Price cannot be negative' },
        { status: 400 }
      );
    }

    let imageUrl = '';

    // Handle image upload if provided
    if (imageFile && imageFile.size > 0) {
      // Validate file type
      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, error: 'File must be an image' },
          { status: 400 }
        );
      }

      // Validate file size (max 5MB)
      if (imageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'Image size must be less than 5MB' },
          { status: 400 }
        );
      }

      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'merchandise');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const originalName = imageFile.name;
      const extension = originalName.split('.').pop() || 'jpg';
      const safeName = originalName.replace(/[^a-zA-Z0-9.]/g, '_');
      const filename = `merch-${timestamp}-${safeName}`;
      const filePath = path.join(uploadDir, filename);

      // Convert file to buffer and save
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Store the URL path
      imageUrl = `/uploads/merchandise/${filename}`;
    }

    // Generate a unique id
    const id = `MRCH${Date.now().toString(36).toUpperCase()}`;

    // Parse sizes if it's a JSON string
    let sizesJson = null;
    if (sizes) {
      try {
        // If it's already a JSON array string, use it
        if (sizes.startsWith('[')) {
          sizesJson = sizes;
        } else {
          // If it's comma-separated, convert to JSON array
          const sizesArray = sizes.split(',').map((s: string) => s.trim()).filter(Boolean);
          sizesJson = JSON.stringify(sizesArray);
        }
      } catch {
        sizesJson = JSON.stringify([sizes]);
      }
    }

    await query(
      `INSERT INTO merchandise (
        id, name, price, category, description, sizes, 
        stock, lowStockThreshold, sales, image, imageUrl, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id,
        name,
        price,
        category,
        description,
        sizesJson,
        stock,
        lowStockThreshold,
        sales,
        imageUrl,
        imageUrl // Both image and imageUrl fields
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Product added successfully',
      data: { id, imageUrl }
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/merchandise error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing product
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const price = Number(formData.get('price'));
    const category = formData.get('category') as string;
    const description = formData.get('description') as string || null;
    const sizes = formData.get('sizes') as string || null;
    const stock = Number(formData.get('stock')) || 0;
    const lowStockThreshold = Number(formData.get('lowStockThreshold')) || 5;
    const sales = Number(formData.get('sales')) || 0;
    const existingImage = formData.get('existingImage') as string || '';
    const imageFile = formData.get('image') as File | null;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProducts = await query('SELECT * FROM merchandise WHERE id = ?', [id]);
    if (!existingProducts || existingProducts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    let imageUrl = existingImage;

    // Handle new image upload if provided
    if (imageFile && imageFile.size > 0) {
      // Validate file type
      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, error: 'File must be an image' },
          { status: 400 }
        );
      }

      // Validate file size (max 5MB)
      if (imageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'Image size must be less than 5MB' },
          { status: 400 }
        );
      }

      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'merchandise');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const originalName = imageFile.name;
      const extension = originalName.split('.').pop() || 'jpg';
      const safeName = originalName.replace(/[^a-zA-Z0-9.]/g, '_');
      const filename = `merch-${timestamp}-${safeName}`;
      const filePath = path.join(uploadDir, filename);

      // Convert file to buffer and save
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      imageUrl = `/uploads/merchandise/${filename}`;
    }

    // Parse sizes if it's a JSON string
    let sizesJson = null;
    if (sizes) {
      try {
        if (sizes.startsWith('[')) {
          sizesJson = sizes;
        } else {
          const sizesArray = sizes.split(',').map((s: string) => s.trim()).filter(Boolean);
          sizesJson = JSON.stringify(sizesArray);
        }
      } catch {
        sizesJson = JSON.stringify([sizes]);
      }
    }

    await query(
      `UPDATE merchandise SET 
        name = ?, price = ?, category = ?, description = ?, 
        sizes = ?, stock = ?, lowStockThreshold = ?, sales = ?, 
        image = ?, imageUrl = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        name || existingProducts[0].name,
        price || existingProducts[0].price,
        category || existingProducts[0].category,
        description,
        sizesJson,
        stock,
        lowStockThreshold,
        sales,
        imageUrl,
        imageUrl,
        id
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: { id, imageUrl }
    });
  } catch (error: any) {
    console.error('PUT /api/merchandise error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get the product to check if it has an image
    const products = await query('SELECT image FROM merchandise WHERE id = ?', [id]);
    if (!products || products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete the image file if it exists
    if (products[0].image) {
      try {
        const imagePath = path.join(process.cwd(), 'public', products[0].image);
        if (existsSync(imagePath)) {
          await unlink(imagePath);
          console.log(`Deleted image: ${imagePath}`);
        }
      } catch (error) {
        console.error('Error deleting image file:', error);
        // Continue with deletion even if image deletion fails
      }
    }

    await query('DELETE FROM merchandise WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('DELETE /api/merchandise error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}