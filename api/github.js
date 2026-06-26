const fs = require('fs');
const path = require('path');

const REPO = "Drishtipixiee/spice-shop";
const BRANCH = "main";

// Memory cache: { fileName: { data: <any>, ts: <timestamp> } }
const memoryCache = {};
const CACHE_TTL_MS = 30000; // 30s cache

// Helper to fetch file from GitHub using authenticated API (with token)
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

// Helper to fetch raw file from GitHub public repo (no token needed)
async function fetchRawFromGitHub(filePath) {
  try {
    const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${filePath}?t=${Date.now()}`;
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      return JSON.parse(text);
    }
  } catch (e) {
    console.error('Raw GitHub fetch failed:', e);
  }
  return null;
}

// Helper to commit to GitHub
async function commitToGitHub(filePath, content, message, sha) {
  const token = process.env.GITHUB_TOKEN || process.env.token || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  if (!token) {
    console.error("No GITHUB_TOKEN set in Vercel env vars - orders won't persist across restarts");
    return false;
  }
  
  const payload = {
    message: message,
    content: Buffer.from(content).toString('base64'),
    branch: BRANCH
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
  
  if (!res.ok) {
    const errText = await res.text();
    console.error("GitHub commit failed:", res.status, errText);
  }
  return res.ok;
}

// Read data file - priority: memory cache → local file → GitHub raw (public)
async function readData(fileName) {
  // 1. Memory cache (fastest, valid for CACHE_TTL_MS)
  const cached = memoryCache[fileName];
  if (cached && (Date.now() - cached.ts < CACHE_TTL_MS)) {
    return JSON.parse(JSON.stringify(cached.data));
  }

  // 2. Local file (bundled with repo, always has latest committed data)
  try {
    const localPath = path.join(process.cwd(), 'data', fileName);
    if (fs.existsSync(localPath)) {
      const data = fs.readFileSync(localPath, 'utf8');
      const parsed = JSON.parse(data);
      memoryCache[fileName] = { data: parsed, ts: Date.now() };
      return JSON.parse(JSON.stringify(parsed));
    }
  } catch (e) {
    console.error("Local read failed:", e);
  }

  // 3. GitHub raw (public, no token needed — reads latest committed data)
  const rawData = await fetchRawFromGitHub(`data/${fileName}`);
  if (rawData !== null) {
    memoryCache[fileName] = { data: rawData, ts: Date.now() };
    return JSON.parse(JSON.stringify(rawData));
  }

  return fileName === 'orders.json' ? [] : {};
}

// Save data file to GitHub (persists to repo) and update memory cache
async function saveData(fileName, dataObj, message) {
  // 1. Update memory cache instantly so the admin UI sees changes immediately
  memoryCache[fileName] = { data: JSON.parse(JSON.stringify(dataObj)), ts: Date.now() };

  // 2. Commit to GitHub so orders/products persist across serverless restarts
  const filePath = `data/${fileName}`;
  const contentStr = JSON.stringify(dataObj, null, 2);
  
  try {
    const existing = await fetchFromGitHub(filePath);
    const ok = await commitToGitHub(filePath, contentStr, message, existing ? existing.sha : null);
    if (ok) {
      console.log(`✅ Saved ${fileName} to GitHub`);
    } else {
      console.warn(`⚠️ GitHub save FAILED for ${fileName}. Set GITHUB_TOKEN in Vercel project settings.`);
    }
  } catch (e) {
    console.error("GitHub sync error:", e);
  }
}

module.exports = { readData, saveData };
