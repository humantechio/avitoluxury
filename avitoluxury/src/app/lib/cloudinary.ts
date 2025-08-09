// Import cloudinary only on the server side
let cloudinary: any;

// Check if we're on the server side
if (typeof window === 'undefined') {
  // Only import on server
  const { v2 } = require('cloudinary');
  cloudinary = v2;
  
  // Configure Cloudinary on server with hardcoded values for simplicity
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  
  console.log('Cloudinary configured with hardcoded values');
}

/**
 * Uploads an image to Cloudinary (server-side only)
 * 
 * @param file The image file to upload (can be a file path or base64 data)
 * @param folder Optional folder to organize images
 * @returns The upload result with URLs and other metadata
 */
export const uploadImage = async (
  file: string,
  folder: string = 'product_images'
) => {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Image upload can only be performed on the server');
    }
    
    console.log('Uploading image to Cloudinary...');
    
    const result = await cloudinary.uploader.upload(file, {
      folder: folder
    });
    
    console.log('Cloudinary upload successful:', result.public_id);
    return result;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

/**
 * Uploads a video to Cloudinary (server-side only)
 * 
 * @param file The video file to upload (can be a file path or base64 data)
 * @param folder Optional folder to organize videos
 * @returns The upload result with URLs and other metadata
 */
export const uploadVideo = async (
  file: string,
  folder: string = 'product_videos'
) => {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Video upload can only be performed on the server');
    }
    
    console.log('Uploading video to Cloudinary...');
    
    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      resource_type: 'video'
    });
    
    console.log('Cloudinary upload successful:', result.public_id);
    return result;
  } catch (error) {
    console.error('Error uploading video to Cloudinary:', error);
    throw error;
  }
};

/**
 * Deletes a file from Cloudinary (server-side only)
 * 
 * @param publicId The public ID of the file to delete
 * @param resourceType The type of resource (image or video)
 * @returns The result of the deletion operation
 */
export const deleteFile = async (
  publicId: string,
  resourceType: 'image' | 'video' = 'image'
) => {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('File deletion can only be performed on the server');
    }
    
    console.log(`Deleting ${resourceType} from Cloudinary:`, publicId);
    
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    
    console.log('Cloudinary deletion result:', result);
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

/**
 * Optimizes a Cloudinary image URL for display
 * 
 * @param url The original Cloudinary URL
 * @param width The desired width of the image
 * @param height The desired height of the image
 * @param crop The crop mode to use
 * @returns The optimized URL with transformation parameters
 */
export const getOptimizedUrl = (
  url: string,
  width: number = 800,
  height: number = 600,
  crop: string = 'fill'
) => {
  if (!url || !url.includes('res.cloudinary.com')) {
    return url;
  }
  
  try {
    // Parse the URL to extract components
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return url;
    
    // Insert transformation parameters
    urlParts.splice(uploadIndex + 1, 0, `c_${crop},w_${width},h_${height},q_auto,f_auto`);
    
    return urlParts.join('/');
  } catch (error) {
    console.error('Error optimizing Cloudinary URL:', error);
    return url;
  }
}; 