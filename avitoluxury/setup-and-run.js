/**
 * Setup and Run Script for A V I T O   S C E N T S Perfume E-commerce Website
 * 
 * This script automates the process of:
 * 1. Creating the .env.local file if it doesn't exist
 * 2. Installing dependencies if needed
 * 3. Seeding the database if requested
 * 4. Starting the development server
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}====================================================${colors.reset}`);
console.log(`${colors.cyan}  A V I T O   S C E N T S Perfume E-commerce Setup & Run Tool  ${colors.reset}`);
console.log(`${colors.cyan}====================================================${colors.reset}\n`);

// Step 1: Check if .env.local exists, create if not
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log(`${colors.yellow}No .env.local file found. Creating template...${colors.reset}`);
  
  try {
    execSync('node create-env-local.js', { stdio: 'inherit' });
    console.log(`${colors.green}✓ .env.local template created${colors.reset}`);
    console.log(`${colors.yellow}⚠ Please edit .env.local with your actual MongoDB connection string and other credentials before proceeding.${colors.reset}\n`);
    
    rl.question(`${colors.blue}Would you like to open the .env.local file to edit now? (y/n): ${colors.reset}`, (answer) => {
      if (answer.toLowerCase() === 'y') {
        try {
          // Try to open with default editor based on OS
          switch (process.platform) {
            case 'win32':
              execSync(`notepad ${envPath}`);
              break;
            case 'darwin':
              execSync(`open ${envPath}`);
              break;
            default:
              execSync(`xdg-open ${envPath}`);
              break;
          }
        } catch (error) {
          console.log(`${colors.red}Could not open editor. Please edit ${envPath} manually.${colors.reset}`);
        }
      }
      
      // Continue with the rest of the setup
      checkNodeModules();
    });
  } catch (error) {
    console.error(`${colors.red}Error creating .env.local file:${colors.reset}`, error);
    process.exit(1);
  }
} else {
  console.log(`${colors.green}✓ .env.local file exists${colors.reset}`);
  checkNodeModules();
}

// Step 2: Check if node_modules exists, install if not
function checkNodeModules() {
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    console.log(`${colors.yellow}Installing dependencies...${colors.reset}`);
    
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log(`${colors.green}✓ Dependencies installed${colors.reset}`);
      checkSeedDatabase();
    } catch (error) {
      console.error(`${colors.red}Error installing dependencies:${colors.reset}`, error);
      process.exit(1);
    }
  } else {
    console.log(`${colors.green}✓ Dependencies already installed${colors.reset}`);
    checkSeedDatabase();
  }
}

// Step 3: Ask if user wants to seed the database
function checkSeedDatabase() {
  rl.question(`${colors.blue}Would you like to seed the database with initial data? (y/n): ${colors.reset}`, (answer) => {
    if (answer.toLowerCase() === 'y') {
      console.log(`${colors.yellow}Seeding database...${colors.reset}`);
      
      try {
        execSync('npm run seed', { stdio: 'inherit' });
        console.log(`${colors.green}✓ Database seeded successfully${colors.reset}`);
        startDevelopmentServer();
      } catch (error) {
        console.error(`${colors.red}Error seeding database:${colors.reset}`, error);
        rl.question(`${colors.blue}Would you like to continue and start the development server? (y/n): ${colors.reset}`, (answer) => {
          if (answer.toLowerCase() === 'y') {
            startDevelopmentServer();
          } else {
            process.exit(1);
          }
        });
      }
    } else {
      console.log(`${colors.yellow}Skipping database seeding${colors.reset}`);
      startDevelopmentServer();
    }
  });
}

// Step 4: Start development server
function startDevelopmentServer() {
  console.log(`${colors.yellow}Starting development server...${colors.reset}`);
  
  try {
    console.log(`${colors.green}✓ Development server starting${colors.reset}`);
    console.log(`${colors.green}✓ Open http://localhost:3000 in your browser${colors.reset}`);
    console.log(`${colors.cyan}====================================================${colors.reset}`);
    console.log(`${colors.cyan}  Default login credentials:                        ${colors.reset}`);
    console.log(`${colors.cyan}  Admin: admin@example.com / admin123               ${colors.reset}`);
    console.log(`${colors.cyan}  User:  user@example.com  / user123                ${colors.reset}`);
    console.log(`${colors.cyan}====================================================${colors.reset}\n`);
    
    // Close readline interface before starting server
    rl.close();
    
    // Start the server
    execSync('npm run dev', { stdio: 'inherit' });
  } catch (error) {
    console.error(`${colors.red}Error starting development server:${colors.reset}`, error);
    process.exit(1);
  }
} 