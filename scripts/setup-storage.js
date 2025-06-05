/**
 * EdAiVi Studio - Storage Setup Script
 * 
 * This script initializes the storage system for the application:
 * - Creates necessary directories for file storage
 * - Sets up permissions
 * - Creates sample files if needed
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Promisify fs functions
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);
const copyFile = promisify(fs.copyFile);

// Storage configuration
const STORAGE_ROOT = process.env.STORAGE_ROOT || path.join(__dirname, '..', 'storage');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Storage directories
const directories = [
  // User content
  'users',
  'users/avatars',
  'users/uploads',
  
  // Projects
  'projects',
  'projects/audio',
  'projects/video',
  'projects/3d',
  
  // Generated content
  'generated',
  'generated/audio',
  'generated/video',
  'generated/images',
  'generated/3d',
  
  // Temporary files
  'temp',
  
  // Public assets
  'public',
  'public/models',
  'public/examples',
  'public/templates'
];

// Sample files to create
const sampleFiles = [
  {
    path: 'public/models/text-gen-basic.jpg',
    content: createSampleImage(200, 200, 'TextGen Basic')
  },
  {
    path: 'public/models/image-gen-basic.jpg',
    content: createSampleImage(200, 200, 'ImageGen Basic')
  },
  {
    path: 'public/models/tts-basic.jpg',
    content: createSampleImage(200, 200, 'TTS Basic')
  },
  {
    path: 'public/examples/story-gen.jpg',
    content: createSampleImage(400, 300, 'Story Generation')
  },
  {
    path: 'public/examples/landscape-gen.jpg',
    content: createSampleImage(400, 300, 'Landscape Generation')
  },
  {
    path: 'public/examples/narration-gen.jpg',
    content: createSampleImage(400, 300, 'Narration Generation')
  }
];

// Setup storage
async function setupStorage() {
  try {
    console.log('🔧 Setting up storage system...');
    
    // Create storage root if it doesn't exist
    await createDirectoryIfNotExists(STORAGE_ROOT);
    
    // Create storage directories
    for (const dir of directories) {
      const dirPath = path.join(STORAGE_ROOT, dir);
      await createDirectoryIfNotExists(dirPath);
    }
    
    // Create public directory if it doesn't exist
    await createDirectoryIfNotExists(PUBLIC_DIR);
    
    // Create sample files
    for (const file of sampleFiles) {
      const filePath = path.join(STORAGE_ROOT, file.path);
      await createFileIfNotExists(filePath, file.content);
    }
    
    // Create symbolic link from public/storage to storage/public
    const publicStoragePath = path.join(PUBLIC_DIR, 'storage');
    const storagePublicPath = path.join(STORAGE_ROOT, 'public');
    
    try {
      await access(publicStoragePath);
      console.log('🔗 Symbolic link already exists');
    } catch (error) {
      try {
        if (process.platform === 'win32') {
          // On Windows, use junction instead of symbolic link
          await promisify(fs.symlink)(storagePublicPath, publicStoragePath, 'junction');
        } else {
          await promisify(fs.symlink)(storagePublicPath, publicStoragePath);
        }
        console.log('🔗 Created symbolic link from public/storage to storage/public');
      } catch (linkError) {
        console.warn('⚠️ Could not create symbolic link. You may need to run this script with administrator privileges.');
        console.warn('⚠️ Alternatively, you can manually copy files from storage/public to public/storage.');
        
        // Create the directory instead
        await createDirectoryIfNotExists(publicStoragePath);
        
        // Copy files from storage/public to public/storage
        const files = await promisify(fs.readdir)(storagePublicPath);
        for (const file of files) {
          const sourcePath = path.join(storagePublicPath, file);
          const destPath = path.join(publicStoragePath, file);
          await copyFile(sourcePath, destPath);
        }
        console.log('📋 Copied files from storage/public to public/storage');
      }
    }
    
    console.log('✅ Storage system setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Storage setup error:', error);
    process.exit(1);
  }
}

// Create directory if it doesn't exist
async function createDirectoryIfNotExists(dirPath) {
  try {
    await access(dirPath);
    console.log(`📁 Directory already exists: ${dirPath}`);
  } catch (error) {
    await mkdir(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

// Create file if it doesn't exist
async function createFileIfNotExists(filePath, content) {
  try {
    await access(filePath);
    console.log(`📄 File already exists: ${filePath}`);
  } catch (error) {
    // Create directory if it doesn't exist
    const dirPath = path.dirname(filePath);
    await createDirectoryIfNotExists(dirPath);
    
    // Create file
    await writeFile(filePath, content);
    console.log(`📄 Created file: ${filePath}`);
  }
}

// Create a simple sample image (as a data URL)
function createSampleImage(width, height, text) {
  // This is a very simple placeholder. In a real application,
  // you would use a library like Canvas or Sharp to generate actual images.
  // For this example, we'll just create a simple SVG.
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial" font-size="16" text-anchor="middle" dominant-baseline="middle" fill="#333333">${text}</text>
    </svg>
  `;
  
  return svg;
}

// Run setup
setupStorage();
