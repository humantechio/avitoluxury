const fs = require('fs');
const path = require('path');

// Function to read .env.local file and set environment variables
function loadEnvVars() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  try {
    if (fs.existsSync(envPath)) {
      console.log('Loading environment variables from .env.local');
      const envFile = fs.readFileSync(envPath, 'utf8');
      
      // Parse each line
      envFile.split('\n').forEach(line => {
        // Skip empty lines and comments
        if (!line || line.startsWith('#')) return;
        
        // Split by first equal sign
        const equalIndex = line.indexOf('=');
        if (equalIndex > 0) {
          const key = line.substring(0, equalIndex).trim();
          const value = line.substring(equalIndex + 1).trim();
          
          // Set environment variable
          if (key && value) {
            process.env[key] = value;
            console.log(`Set env var: ${key}`);
          }
        }
      });
      
      console.log('Environment variables loaded successfully');
    } else {
      console.log('.env.local file not found');
    }
  } catch (error) {
    console.error('Error loading .env.local file:', error);
  }
}

// Execute immediately
loadEnvVars();

module.exports = loadEnvVars; 