#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting NutriAI Single Server Setup...\n');

// Build frontend
console.log('📦 Building frontend...');
const buildFrontend = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true
});

buildFrontend.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Frontend build failed');
    process.exit(1);
  }
  
  console.log('✅ Frontend build completed\n');
  
  // Build backend
  console.log('🔧 Building backend...');
  const buildBackend = spawn('npm', ['run', 'build'], {
    cwd: path.join(__dirname, 'server'),
    stdio: 'inherit',
    shell: true
  });
  
  buildBackend.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Backend build failed');
      process.exit(1);
    }
    
    console.log('✅ Backend build completed\n');
    
    // Start server
    console.log('🌟 Starting production server...');
    console.log('📍 Server will be available at: http://localhost:3001');
    console.log('📱 Frontend and API served from single port\n');
    
    const startServer = spawn('npm', ['start'], {
      env: {
        ...process.env,
        PORT: process.env.X_ZOHO_CATALYST_LISTEN_PORT || 3001,
      },
      cwd: path.join(__dirname, 'server'),
      stdio: 'inherit',
      shell: true
    });


    startServer.on('close', (code) => {
      console.log(`Server exited with code ${code}`);
    });
  });
});