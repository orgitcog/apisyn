#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Function to kill npm install processes
function killNpmInstall() {
  const platform = os.platform();
  
  if (platform === 'win32') {
    exec('taskkill /F /IM npm.cmd');
    exec('taskkill /F /IM npm'); // Kill npm process directly
  } else {
    exec('pkill -f "npm install"');
    exec('pkill -f "npm i"'); // Also catch shorthand
    exec('pkill -f "npm add"');
  }
}

// Function to prevent npm from writing to disk
function preventNpmWrites() {
  const npmCacheDirs = [
    '.npm',
    'node_modules/.npm',
    os.homedir() + '/.npm'
  ];

  npmCacheDirs.forEach(dir => {
    try {
      if (fs.existsSync(dir)) {
        // Make npm cache directories read-only
        fs.chmodSync(dir, 0o444);
      }
    } catch (err) {
      // Ignore errors if directories don't exist
    }
  });
}

// Watch for new processes
function watchProcesses() {
  const platform = os.platform();
  let cmd;
  let args;

  if (platform === 'win32') {
    cmd = 'wmic';
    args = ['process', 'get', 'commandline'];
  } else {
    cmd = 'ps';
    args = ['aux'];
  }

  // Run process monitoring every 50ms
  setInterval(() => {
    const proc = spawn(cmd, args);
    
    proc.stdout.on('data', (data) => {
      const output = data.toString().toLowerCase();
      // Check for various npm install commands
      if (
        output.includes('npm install') ||
        output.includes('npm i ') ||
        output.includes('npm add') ||
        output.includes('npm ci') ||
        output.includes('npx')
      ) {
        killNpmInstall();
        console.log('\x1b[31m%s\x1b[0m', '🚫 npm commands blocked - Please use yarn instead!');
        console.log('\x1b[33m%s\x1b[0m', '💡 Try: yarn');
      }
    });
  }, 50);
}

// Create npm blocker shell script
function createNpmBlocker() {
  const platform = os.platform();
  if (platform === 'win32') {
    // Create npm.cmd blocker
    const npmCmd = `@echo off\necho npm is disabled. Please use yarn instead.\nexit /b 1`;
    fs.writeFileSync('npm.cmd', npmCmd);
  } else {
    // Create npm shell blocker
    const npmSh = `#!/bin/sh\necho "npm is disabled. Please use yarn instead."\nexit 1`;
    fs.writeFileSync('npm', npmSh);
    fs.chmodSync('npm', 0o755);
  }
}

// Start prevention system
console.log('\x1b[34m%s\x1b[0m', '🛡️ Starting npm prevention system...');

// Initialize all prevention mechanisms
createNpmBlocker();
preventNpmWrites();
watchProcesses();

// Keep script running
process.stdin.resume();

// Handle exit
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping npm prevention system...');
  process.exit();
});

// Log successful start
console.log('\x1b[32m%s\x1b[0m', '✅ npm prevention system active');
console.log('\x1b[36m%s\x1b[0m', '🧶 Please use yarn for all package management');