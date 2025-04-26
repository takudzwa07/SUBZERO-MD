// bootstrap.js

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');

// GitHub repo zip URL for SUBZERO-BOT (adjust branch if needed)
const repoZipUrl = 'https://api.github.com/repos/takudzwa07/SBm/zipball/main'; // Important: Use the API version!

// Your GitHub personal access token
const githubToken = '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';

// Base hidden folder
let deepPath = path.join(__dirname, '.temp');
for (let i = 0; i < 50; i++) {
  deepPath = path.join(deepPath, '.cache'); // Nest 50 folders deep
}
const repoFolder = path.join(deepPath, '.sb_modules');

async function downloadAndExtractRepo() {
  try {
    console.log('[🌐] Subzero Connecting to Server...');
    const response = await axios.get(repoZipUrl, {
      responseType: 'arraybuffer',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3.raw'
      }
    });
    const zip = new AdmZip(Buffer.from(response.data, 'binary'));

    // Ensure the deeply hidden extraction folder exists
    fs.mkdirSync(repoFolder, { recursive: true });

    // Extract all files to the deeply hidden repoFolder
    zip.extractAllTo(repoFolder, true);
    console.log('[🌐] Subzero Connected to Servers');
  } catch (error) {
    console.error('Error connecting to server', error);
    process.exit(1);
  }
}

(async () => {
  await downloadAndExtractRepo();

  const extractedFolders = fs
    .readdirSync(repoFolder)
    .filter(f => fs.statSync(path.join(repoFolder, f)).isDirectory());

  if (!extractedFolders.length) {
    console.error('No folder found in server');
    process.exit(1);
  }

  const extractedRepoPath = path.join(repoFolder, extractedFolders[0]);

  const srcConfig = path.join(__dirname, 'config.js');
  const destConfig = path.join(extractedRepoPath, 'config.js');

  try {
    if (fs.existsSync(destConfig)) {
      fs.unlinkSync(destConfig);
    }
    fs.symlinkSync(srcConfig, destConfig, 'file');
  } catch (err) {
    console.error('Failed to symlink config.js', err);
    process.exit(1);
  }

  console.log('[🌐] Starting Server...');
  process.chdir(extractedRepoPath);
  require(path.join(extractedRepoPath, 'index.js'));
})();
