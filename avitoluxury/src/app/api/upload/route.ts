import { NextRequest, NextResponse } from 'next/server';

// Maximum file size (5MB for images, 50MB for videos)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; 
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

// Import cloudinary directly in the API route
const cloudinary = require('cloudinary').v2;

// Configure with hardcoded values
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const resourceTypeInput = formData.get('resourceType') as string;
    const folder = formData.get('folder') as string || 'product_images';
    
    console.log(`File received: ${file?.name}, type: ${file?.type}, size: ${file?.size}`);
    console.log(`Resource type: ${resourceTypeInput || 'image'}, Folder: ${folder}`);
    
    if (!file) {
      console.error('No file provided in request');
      return NextResponse.json({ 
        success: false,
        error: 'No file provided' 
      }, { status: 400 });
    }
    
    // Validate file size
    const isVideo = resourceTypeInput === 'video';
    const MAX_SIZE = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    
    if (file.size > MAX_SIZE) {
      console.error(`File too large: ${file.size} bytes`);
      return NextResponse.json({ 
        success: false,
        error: `File too large. Maximum size is ${MAX_SIZE / (1024 * 1024)}MB` 
      }, { status: 400 });
    }
    
    // Convert File to base64 for Cloudinary
    const buffer = await file.arrayBuffer();
    const base64String = Buffer.from(buffer).toString('base64');
    const base64File = `data:${file.type};base64,${base64String}`;
    
    console.log('Starting Cloudinary upload...');
    
    // Upload to Cloudinary directly
    try {
      const result = await cloudinary.uploader.upload(base64File, {
        folder: folder,
        resource_type: isVideo ? 'video' : 'image'
      });
      
      console.log('Upload completed successfully');
      console.log('- Public ID:', result.public_id);
      console.log('- URL:', result.secure_url);
      
      // Return success response
      return NextResponse.json({
        success: true,
        public_id: result.public_id,
        url: result.secure_url || result.url
      });
      
    } catch (uploadError: any) {
      console.error('Cloudinary upload error:', uploadError);
      return NextResponse.json({
        success: false,
        error: 'Cloudinary upload failed',
        details: uploadError.message || 'Unknown upload error'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Upload route error:', error);
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
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');
    const resourceType = searchParams.get('resourceType') || 'image';
    
    if (!publicId) {
      return NextResponse.json({ 
        success: false, 
        error: 'No public ID provided' 
      }, { status: 400 });
    }
    
    console.log(`Deleting file with ID: ${publicId}, resource type: ${resourceType}`);
    
    // Delete the file from Cloudinary directly
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
      
      console.log('Deletion result:', result);
      
      return NextResponse.json({ 
        success: true,
        result
      });
    } catch (deleteError: any) {
      console.error('Cloudinary delete error:', deleteError);
      return NextResponse.json({
        success: false,
        error: 'Cloudinary deletion failed',
        details: deleteError.message || 'Unknown deletion error'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Delete route error:', error);
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