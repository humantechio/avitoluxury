// Script to create an admin user in the database
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not defined');
  process.exit(1);
}

// Define User schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create User model
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdminUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'chineshsoni2@gmail.com';
    const adminPassword = 'chinesh@123';

    // Check if admin user already exists
    console.log('Checking if admin user exists...');
    let adminUser = await User.findOne({ email: adminEmail });

    if (adminUser) {
      console.log('Admin user already exists. Updating password...');
      // Update admin password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      adminUser.password = hashedPassword;
      adminUser.role = 'admin'; // Ensure role is admin
      await adminUser.save();
      
      console.log('Admin user updated successfully');
    } else {
      console.log('Creating new admin user...');
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      const newAdmin = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log('Admin user created successfully');
    }

    // Verify the admin user was created/updated
    const verifyUser = await User.findOne({ email: adminEmail });
    console.log('Admin user in database:', {
      email: verifyUser.email,
      role: verifyUser.role,
      id: verifyUser._id
    });

    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
    process.exit(1);
  }
}

// Run the function
createAdminUser(); 