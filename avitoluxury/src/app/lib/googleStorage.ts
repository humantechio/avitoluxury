import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

// Get bucket information from environment variables
const bucketName = process.env.GOOGLE_STORAGE_BUCKET_NAME || 'ecommerce-app-444531.appspot.com';
const projectId = process.env.GOOGLE_STORAGE_PROJECT_ID || 'ecommerce-app-444531';

// Initialize Google Cloud Storage
const storage = new Storage({ projectId });

/**
 * Uploads a file to Google Cloud Storage
 * 
 * @param fileBuffer The file buffer to upload
 * @param fileName Original file name (used to determine file extension)
 * @param folder Optional folder to organize files
 * @param contentType The content type of the file
 * @returns The upload result with URLs and other metadata
 */
export const uploadFile = async (
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'uploads',
  contentType: string = 'image/jpeg'
) => {
  try {
    // Create a unique file name
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${folder}/${uuidv4()}.${fileExtension}`;
    
    // Get a reference to the bucket
    const bucket = storage.bucket(bucketName);
    
    // Create a file in the bucket
    const fileObject = bucket.file(uniqueFileName);
    
    // Upload the file
    await fileObject.save(fileBuffer, {
      metadata: {
        contentType,
      },
    });
    
    // Make the file publicly accessible
    await fileObject.makePublic();
    
    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${uniqueFileName}`;
    
    return {
      public_id: uniqueFileName,
      url: publicUrl,
      format: fileExtension,
    };
  } catch (error) {
    console.error('Error uploading to Google Cloud Storage:', error);
    throw error;
  }
};

/**
 * Deletes a file from Google Cloud Storage
 * 
 * @param fileId The ID (path) of the file to delete
 * @returns The result of the deletion operation
 */
export const deleteFile = async (fileId: string) => {
  try {
    // Get a reference to the bucket
    const bucket = storage.bucket(bucketName);
    
    // Delete the file
    await bucket.file(fileId).delete();
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting from Google Cloud Storage:', error);
    throw error;
  }
};

export default {
  uploadFile,
  deleteFile
}; 