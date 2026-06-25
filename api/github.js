const fs = require('fs');
const path = require('path');

const REPO = "Drishtipixiee/spice-shop";
const memoryCache = {}; // Cache data across hot lambda invocations

// Helper to fetch file from GitHub
async function fetchFromGitHub(filePath) {
  const token = process.env.GITHUB_TOKEN || process.env.token || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  if (!token) return null;
  
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}`, {
    headers: {
      "Authorization": `token ${token}`,
      "Accept": "application/vnd.github.v3+json"
    }
  });
  
  if (res.ok) {
    const data = await res.json();
    return {
      content: Buffer.from(data.content, 'base64').toString('utf8'),
      sha: data.sha
    };
  }
  return null;
}

// Helper to commit to GitHub
async function commitToGitHub(filePath, content, message, sha) {
  const token = process.env.GITHUB_TOKEN || process.env.token || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  if (!token) {
    console.error("No GitHub token found, skipping commit");
    return false;
  }
  
  const payload = {
    message: message,
    content: Buffer.from(content).toString('base64'),
    branch: "main"
  };
  
  if (sha) payload.sha = sha;
  
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}`, {
    method: "PUT",
    headers: {
      "Authorization": `token ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  
  return res.ok;
}

// Read data file (local fast read, fallback to github)
async function readData(fileName) {
  if (memoryCache[fileName]) {
    return JSON.parse(JSON.stringify(memoryCache[fileName])); // Return deep copy
  }

  try {
    const localPath = path.join(process.cwd(), 'data', fileName);
    if (fs.existsSync(localPath)) {
      const data = fs.readFileSync(localPath, 'utf8');
      const parsed = JSON.parse(data);
      memoryCache[fileName] = parsed; // Cache it
      return parsed;
    }
  } catch (e) {
    console.error("Local read failed:", e);
  }
  return null;
}

// Save data file to GitHub and update local memory cache
async function saveData(fileName, dataObj, message) {
  // 1. Update memory cache instantly so the admin UI sees changes immediately
  memoryCache[fileName] = JSON.parse(JSON.stringify(dataObj));

  // 2. Commit to GitHub to trigger Vercel deploy for the storefront
  const filePath = `data/${fileName}`;
  const contentStr = JSON.stringify(dataObj, null, 2);
  
  try {
    const existing = await fetchFromGitHub(filePath);
    await commitToGitHub(filePath, contentStr, message, existing ? existing.sha : null);
  } catch (e) {
    console.error("GitHub sync failed:", e);
  }
}

module.exports = { readData, saveData };
