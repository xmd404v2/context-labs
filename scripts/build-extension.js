// Simple build script for the Chrome extension

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distDir = path.join(__dirname, '../dist');
const publicDir = path.join(__dirname, '../public');
const extensionDir = path.join(publicDir, 'extension');
const contentScriptsDir = path.join(__dirname, '../content-scripts');
const backgroundDir = path.join(__dirname, '../background');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Build the content script with esbuild
console.log('Building content script...');
try {
  execSync(`npx esbuild ${path.join(contentScriptsDir, 'index.ts')} --bundle --outfile=${path.join(distDir, 'content.js')} --platform=browser`);
  console.log('Content script built successfully.');
} catch (error) {
  console.error('Error building content script:', error.message);
  process.exit(1);
}

// Build the background script with esbuild
console.log('Building background script...');
try {
  execSync(`npx esbuild ${path.join(backgroundDir, 'index.ts')} --bundle --outfile=${path.join(distDir, 'background.js')} --platform=browser`);
  console.log('Background script built successfully.');
} catch (error) {
  console.error('Error building background script:', error.message);
  process.exit(1);
}

// Copy extension files to dist directory
console.log('Copying extension files...');
try {
  // Copy manifest
  fs.copyFileSync(
    path.join(extensionDir, 'manifest.json'),
    path.join(distDir, 'manifest.json')
  );
  
  // Copy CSS
  fs.copyFileSync(
    path.join(extensionDir, 'content.css'),
    path.join(distDir, 'content.css')
  );
  
  // Create a simple icon if it doesn't exist
  const iconPath = path.join(extensionDir, 'icon.png');
  if (!fs.existsSync(iconPath)) {
    console.log('Creating a placeholder icon...');
    
    // Base64 encoded 1x1 pixel transparent PNG
    const base64Icon = 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAUISURBVGhD7ZlraFxFFMfPzL3ZbB5mkzRpUtuKVWktVkRri1j8oCiCIqgfFcQHivhFwSqIYsWiKFoVqh+siA/EB1K/+EAfWGupSkVtWyW1QaJ5bZJNdrN53Hu9v7P3bjfZvbuT7G5SqP3DYXbuzM6c/5kzZ2YWKaVwIUPn/16QWBQgaBYFCJpFAYJmUYCgWRQgaBYFCJpFAYJmUYCgWRQgaBYFCJpFAYJmQYBv9p/Bg6MTuPvDvTnX+0fj+P6PEdxy1/1o23Afqmrx0qFh3PLQs9ja0YMdRwbSdd/uG8RTX+/Hnc+/joZv/sUdXZ159/W7kDly8jS++s1X+M6mJoxE4xhPJCEJUSqVwkg0gUhZFC+/+jJ2P9SG2lpA6LQnQCKhYyxhYMPajXjr5qYZbQRd0DfYj11/jeDFPUfR2TeC1oYa9A/3onvfIdx702rUcbu89f2NgVEcGRjBh1Mb8dj2JjRqXl6/P7KK0Bc/9eKud3cDySQQSvAHdM5yGjEY4hFVMpV0dAjhMAxD4VTcwGtvv49j0/HXpYxHo1j/aAeMWBIQhCnDYGOCOG+MqfL2QVlZGZ55sR0J3cj2MQvZAnDnz/SMoqM/iiEeeYMHnSaCN0JZXZ7tExsYY5i7IXpHxnF8OIoxzlZtFRGc51kNIxRHlRcx2dZ5uACbCK7S2GCCZyQVtmmFjdFSyFaHM7HKnGFLcQsZ4rriGVMeAlcvzeLkQ/YMMN3I+QSObZ6VMEwxzC12ZIJteaUgc9M1lKBkGnRSZVB0ER52+XJLBwVZbCFONMcVVhYxdMYO0VBuXUxwC8nChNDcQk6wjTEh5NlgFiHoNTrrlZXnA7tAZLOQ0mUhnmBlhmkbWpfEFtLIZqImBGV7KT50chkIVGPt6nr09PSgo2MXampqcdO1tbi9uQ7ba8ucQcYeZsuyZsD2QxLF+7d0y7kGM9AKbR4tRDVhiGdcOj3EG1MTx49j365OtLW14fS//eju7sbmzZsxODiIHTt2YPXq1ejo6IAxMoSXnm5HebTSamcP044L+SPKQh4ucJCzFa+wsiC4L5EJvlGlVPbHnBM2Gg2srGLYWJvA2pWVXCawtLISV1x5FZqamnDo0CEYhlHw+JcrgKMO5XDGLTx0JVJ+wksmk4hULkEyMY7mkIkbqwmunq7iQYtw+bGREfT29uLYsePo/LUfE7ztOX2KKHdZaX5kCcBFKHuAuXdyGCH7YO+8PD8YxvKVq7D/tBfGRBw3LzXN0XfHF5FIBFdffR1aWlrw6IMP4K8/f8Ov330EXQo5feTCVQvZ2MYNVlYqNwPptnnKCqFp83Uor2nA4VENG5cyLFspUFkFLK8BakNCi7KddZoHNi3LoQ7ND5cANmuluGhx2Cd5KyTleMJkEJqGkNT433U91q1bh1tvvRkmbyF0dOMdIzLXIdLMCJnLRv4CthZWfbL8hb3ORMZ1M/e8gQg3N0QiGPPUYdcIwddhIPYfkOgDxgcAfRygOJDybM/yE9wzjNQsR/cMXc/egbIEICU0TQPH+YRbI6WxOkwQ5nVOmLPmGnXm2m24vE6+Dk2DSEfN81kPnBgbg1QFgYsQdA+QCEFy5tI9gD7p2c2xncIZMOWSOYHFbMM0DS/GpUzEKZYHlsz5jgULwINSUi5VWZjw6mMgbJrnj/O80PNnYFZI2rMV0lPcpvB/8WX+vgK4Q/zfBSD4H8J7FmvtV9rzAAAAAElFTkSuQmCC';
    const iconBuffer = Buffer.from(base64Icon, 'base64');
    fs.writeFileSync(path.join(distDir, 'icon.png'), iconBuffer);
  } else {
    fs.copyFileSync(iconPath, path.join(distDir, 'icon.png'));
  }
  
  console.log('Extension files copied successfully.');
} catch (error) {
  console.error('Error copying extension files:', error.message);
  process.exit(1);
}

console.log('Extension build complete! Files available in the dist/ directory.');
console.log('To use the extension in Chrome:');
console.log('1. Go to chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked" and select the dist/ directory'); 