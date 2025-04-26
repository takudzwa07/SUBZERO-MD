// bootstrap.js - Full Updated Version
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');

// Configuration
const CONFIG = {
  REPO_OWNER: 'takudzwa07',
  REPO_NAME: 'SBm',
  BRANCH: 'main',
  NEST_DEPTH: 50,
  CACHE_FOLDER: '.cache',
  MODULES_FOLDER: '.sb_modules'
};

// Get token from environment or config (never hardcode in production)
const githubToken = process.env.GITHUB_TOKEN || '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';

// Create deeply nested folder structure
function createDeepPath(base, depth, folderName) {
  let current = path.resolve(base);
  for (let i = 0; i < depth; i++) {
    current = path.join(current, folderName);
    try {
      fs.mkdirSync(current, { recursive: false });
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }
  }
  return current;
}

// Download repository zip from GitHub
async function downloadRepoZip() {
  const apiUrl = `https://api.github.com/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/zipball/${CONFIG.BRANCH}`;
  const directUrl = `https://github.com/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/archive/refs/heads/${CONFIG.BRANCH}.zip`;

  const headers = {
    'User-Agent': 'Subzero-Bootstrap',
    'Accept': 'application/vnd.github.v3+json'
  };

  if (githubToken) {
    headers['Authorization'] = `token ${githubToken}`;
  }

  try {
    console.log('[🌐] Connecting to GitHub repository...');
    const response = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
      headers,
      maxRedirects: 5,
      timeout: 30000
    });
    return response.data;
  } catch (apiError) {
    console.log('[⚠️] GitHub API request failed, trying direct download...');
    try {
      const response = await axios.get(directUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
      return response.data;
    } catch (directError) {
      throw new Error(`Both API and direct download failed:\nAPI Error: ${apiError.message}\nDirect Error: ${directError.message}`);
    }
  }
}

// Extract zip file to target directory
function extractZip(zipData, targetPath) {
  try {
    const zip = new AdmZip(Buffer.from(zipData));
    zip.extractAllTo(targetPath, true);
    console.log(`[✓] Extracted to ${targetPath}`);
    return true;
  } catch (err) {
    console.error('[✗] Extraction failed:', err.message);
    return false;
  }
}

// Find the extracted repository folder
function findExtractedRepo(basePath) {
  try {
    const items = fs.readdirSync(basePath);
    for (const item of items) {
      const itemPath = path.join(basePath, item);
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        return itemPath;
      }
    }
    return null;
  } catch (err) {
    console.error('[✗] Error finding extracted repo:', err.message);
    return null;
  }
}

// Setup configuration symlink
function setupConfigSymlink(repoPath) {
  try {
    const srcConfig = path.resolve(__dirname, 'config.js');
    const destConfig = path.resolve(repoPath, 'config.js');

    if (fs.existsSync(destConfig)) {
      fs.unlinkSync(destConfig);
    }

    fs.symlinkSync(srcConfig, destConfig, 'file');
    console.log('[✓] Config symlink created');
    return true;
  } catch (err) {
    console.error('[✗] Config symlink failed:', err.message);
    return false;
  }
}

// Main execution flow
async function bootstrap() {
  try {
    // Create nested directory structure
    const deepPath = createDeepPath(
      path.join(__dirname, '.temp'),
      CONFIG.NEST_DEPTH,
      CONFIG.CACHE_FOLDER
    );
    const repoFolder = path.join(deepPath, CONFIG.MODULES_FOLDER);
    fs.mkdirSync(repoFolder, { recursive: true });

    // Download and extract repository
    const zipData = await downloadRepoZip();
    if (!extractZip(zipData, repoFolder)) {
      throw new Error('Extraction failed');
    }

    // Find and verify extracted repository
    const extractedRepoPath = findExtractedRepo(repoFolder);
    if (!extractedRepoPath) {
      throw new Error('No valid repository found in extracted files');
    }

    // Setup configuration
    if (!setupConfigSymlink(extractedRepoPath)) {
      throw new Error('Config setup failed');
    }

    // Start the application
    console.log('[🚀] Starting application...');
    process.chdir(extractedRepoPath);
    require(path.join(extractedRepoPath, 'index.js'));

  } catch (error) {
    console.error('[💥] Bootstrap failed:', error.message);
    process.exit(1);
  }
}

// Start the process
bootstrap();
