import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, uploadVideo, deleteFile } from '@/app/lib/cloudinary';

// Maximum file size (5MB for images, 50MB for videos)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; 
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'perfume_products';
    const resourceType = formData.get('resourceType') as string || 'image';
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }
    
    // Check file size
    const maxSize = resourceType === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB` 
      }, { status: 400 });
    }
    
    // Convert File to base64 for Cloudinary
    const buffer = await file.arrayBuffer();
    const base64String = Buffer.from(buffer).toString('base64');
    const base64File = `data:${file.type};base64,${base64String}`;
    
    // Upload to Cloudinary
    let result;
    if (resourceType === 'video') {
      result = await uploadVideo(base64File, folder);
    } else {
      result = await uploadImage(base64File, folder);
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      public_id: result.public_id,
      url: result.secure_url || result.url,
      format: result.format
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to upload file',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the public ID from the query parameters
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');
    const resourceType = searchParams.get('resourceType') || 'image';
    
    if (!publicId) {
      return NextResponse.json({ success: false, error: 'No public ID provided' }, { status: 400 });
    }
    
    // Delete the file from Cloudinary
    const result = await deleteFile(publicId, resourceType as 'image' | 'video');
    
    return NextResponse.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete file',
        details: error.toString()
      },
      { status: 500 }
    );
  }
} 