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
