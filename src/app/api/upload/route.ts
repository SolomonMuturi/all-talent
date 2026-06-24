import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'general';

    console.log('📤 Upload request:', { 
      fileName: file?.name, 
      fileSize: file?.size, 
      fileType: file?.type,
      uploadType: type 
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Create uploads directory with type subfolder (Windows compatible)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', type);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
      console.log(`📁 Created directory: ${uploadDir}`);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = originalName.split('.').pop() || 'png';
    const safeName = originalName.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `${type}-${timestamp}-${safeName}`;
    const filePath = path.join(uploadDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return the URL path (using forward slashes for web)
    const url = `/uploads/${type}/${filename}`;

    console.log('✅ File uploaded successfully:', {
      filename,
      path: filePath,
      url,
      size: file.size,
      type
    });

    return NextResponse.json({
      success: true,
      url: url,
      filename: filename,
      message: 'File uploaded successfully'
    });
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}