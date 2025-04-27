// bootstrap.js - Final Working Version
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  REPO_OWNER: 'takudzwa07',
  REPO_NAME: 'SBm',
  BRANCH: 'main',
  WORK_DIR: path.join(__dirname, '.sb_modules')
};

// Validate GitHub Token
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
if (!GITHUB_TOKEN) {
  console.error('❌ ERROR: GITHUB_TOKEN environment variable is required for private repositories');
  console.error('ℹ️ Create one at: https://github.com/settings/tokens (with repo scope)');
  process.exit(1);
}

// Secure Git Clone Function
function gitClonePrivateRepo() {
  try {
    const repoUrl = `https://${GITHUB_TOKEN}@github.com/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}.git`;
    
    console.log('🔐 Cloning private repository...');
    execSync(`git clone --depth 1 --branch ${CONFIG.BRANCH} ${repoUrl} ${CONFIG.WORK_DIR}`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        // Mask token in logs
        GIT_ASKPASS: 'echo'
      }
    });
    return true;
  } catch (error) {
    console.error('❌ Git clone failed:', error.message);
    return false;
  }
}

// Main Bootstrap Process
function bootstrap() {
  try {
    console.log('🚀 Starting Subzero bootstrap...');

    // Clean existing directory
    if (fs.existsSync(CONFIG.WORK_DIR)) {
      fs.rmSync(CONFIG.WORK_DIR, { recursive: true, force: true });
    }

    // Clone repository
    if (!gitClonePrivateRepo()) {
      throw new Error('Failed to clone repository');
    }

    // Handle config file
    const localConfig = path.join(__dirname, 'config.js');
    const targetConfig = path.join(CONFIG.WORK_DIR, 'config.js');
    
    if (fs.existsSync(localConfig)) {
      try {
        fs.symlinkSync(localConfig, targetConfig);
        console.log('⚙️ Created config symlink');
      } catch (err) {
        // Fallback to copy if symlink fails
        fs.copyFileSync(localConfig, targetConfig);
        console.log('⚙️ Copied config file (symlink not supported)');
      }
    }

    // Start application
    console.log('🚀 Starting application...');
    process.chdir(CONFIG.WORK_DIR);
    require(path.join(CONFIG.WORK_DIR, 'index.js'));

  } catch (error) {
    console.error('💥 CRITICAL ERROR:', error.message);
    console.error('ℹ️ Please check:');
    console.error('1. Your GITHUB_TOKEN is valid and has repo access');
    console.error('2. The repository exists and is accessible');
    console.error('3. You have proper file permissions');
    process.exit(1);
  }
}

// Run bootstrap
bootstrap();

/*

// bootstrap.js - Private Repo Version
const fs = require('fs');
const path = require('path');
const https = require('https');
const AdmZip = require('adm-zip');

// Configuration
const CONFIG = {
  REPO_OWNER: 'takudzwa07',
  REPO_NAME: 'SBm',
  BRANCH: 'main',
  WORK_DIR: path.join(__dirname, '.sb_modules'),
  ZIP_FILE: path.join(__dirname, 'repo.zip')
};

// GitHub Token (use environment variable)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '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';
if (!GITHUB_TOKEN) {
  console.error('❌ GitHub token is required for private repositories');
  process.exit(1);
}

// Download private repo with authentication
function downloadPrivateRepo() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/zipball/${CONFIG.BRANCH}`,
      headers: {
        'User-Agent': 'Node.js',
        'Authorization': `token ${GITHUB_TOKEN}`
      }
    };

    https.get(options, (response) => {
      if (response.statusCode !== 200) {
        return reject(new Error(`GitHub API responded with ${response.statusCode}`));
      }

      const file = fs.createWriteStream(CONFIG.ZIP_FILE);
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Extract zip helper
function extractZip() {
  try {
    const zip = new AdmZip(CONFIG.ZIP_FILE);
    zip.extractAllTo(CONFIG.WORK_DIR, true);
    return true;
  } catch (err) {
    console.error('Extraction failed:', err);
    return false;
  }
}

// Find extracted folder
function findExtractedFolder() {
  const items = fs.readdirSync(CONFIG.WORK_DIR);
  for (const item of items) {
    const itemPath = path.join(CONFIG.WORK_DIR, item);
    if (fs.statSync(itemPath).isDirectory() && item.includes(CONFIG.REPO_NAME)) {
      return itemPath;
    }
  }
  return null;
}

// Main bootstrap process
async function bootstrap() {
  try {
    console.log('🔐 Initializing private repository setup...');

    // Clean existing files
    [CONFIG.WORK_DIR, CONFIG.ZIP_FILE].forEach(path => {
      if (fs.existsSync(path)) {
        fs.rmSync(path, { recursive: true, force: true });
      }
    });

    // Download repository
    console.log('📥 Downloading private repository...');
    await downloadPrivateRepo();

    // Extract repository
    console.log('📦 Extracting repository...');
    fs.mkdirSync(CONFIG.WORK_DIR, { recursive: true });
    if (!extractZip()) {
      throw new Error('Failed to extract repository');
    }

    // Find the extracted folder
    const extractedPath = findExtractedFolder();
    if (!extractedPath) {
      throw new Error('Could not find extracted repository');
    }

    // Handle config file
    const localConfig = path.join(__dirname, 'config.js');
    const targetConfig = path.join(extractedPath, 'config.js');
    
    if (fs.existsSync(localConfig)) {
      fs.copyFileSync(localConfig, targetConfig);
      console.log('⚙️  Config file copied');
    }

    // Start application
    console.log('🚀 Starting application...');
    process.chdir(extractedPath);
    require(path.join(extractedPath, 'index.js'));

  } catch (error) {
    console.error('💥 Bootstrap failed:', error.message);
    process.exit(1);
  }
}

// Run bootstrap
bootstrap();
*/
