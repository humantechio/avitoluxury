/**
 * Script to create a .env.local file for the project
 * This script creates a template .env.local file with placeholders
 * that should be replaced with actual values
 */
const fs = require('fs');
const path = require('path');

const envContent = `# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/perfume-ecommerce?retryWrites=true&w=majority

# JWT Secrets
JWT_SECRET=your-jwt-secret-key-change-this-in-production
ADMIN_JWT_SECRET=your-admin-jwt-secret-key-change-this-in-production

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email service (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password

# Note: Replace the placeholders above with your actual credentials
# Make sure to update the MongoDB connection string with your own database credentials
`;

const envPath = path.join(__dirname, '.env.local');

try {
  // Check if file already exists to prevent accidental overwrite
  if (fs.existsSync(envPath)) {
    console.log('.env.local file already exists. Please modify it manually if needed.');
  } else {
    // Create the file with the template content
    fs.writeFileSync(envPath, envContent);
    console.log('.env.local file created successfully!');
    console.log('Please update it with your actual credentials before running the application.');
  }
} catch (error) {
  console.error('Error creating .env.local file:', error);
} 