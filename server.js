const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Load environment variables from .env if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    process.env[key] = value;
  });
  console.log('Environment variables loaded from .env');
}

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  console.log(`${req.method} ${pathname}`);

  // Route API requests to api/ directory
  if (pathname.startsWith('/api/')) {
    const apiName = pathname.substring(5); // Remove '/api/'
    const apiPath = path.join(__dirname, 'api', `${apiName}.js`);

    if (fs.existsSync(apiPath)) {
      // Clear require cache for development hot reloading
      delete require.cache[require.resolve(apiPath)];
      const apiHandler = require(apiPath);

      // Read request body for POST/PUT/PATCH
      let bodyData = '';
      req.on('data', chunk => {
        bodyData += chunk;
      });

      req.on('end', async () => {
        req.query = parsedUrl.query;
        req.body = {};
        if (bodyData) {
          try {
            req.body = JSON.parse(bodyData);
          } catch (e) {
            req.body = bodyData;
          }
        }

        // Mock response helper functions for Serverless Vercel compatibility
        res.status = function (code) {
          res.statusCode = code;
          return res;
        };

        res.json = function (data) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };

        res.send = function (data) {
          res.end(data);
          return res;
        };

        try {
          await apiHandler(req, res);
        } catch (err) {
          console.error(`Error in API handler ${apiName}:`, err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: `API endpoint ${apiName} not found` }));
    }
    return;
  }

  // Prevent serving private configuration files
  const forbiddenFiles = ['.env', 'package.json', 'package-lock.json', 'vercel.json', 'server.js', 'README.md', 'task.md', 'schema.sql', 'docker-compose.yml'];
  const requestedFile = path.basename(pathname);
  if (forbiddenFiles.includes(requestedFile) || pathname.includes('/api/')) {
    res.writeHead(403, { 'Content-Type': 'text/html' });
    res.end('<h1>403 Forbidden</h1>', 'utf-8');
    return;
  }

  // Serve static files from root directory
  let safePath = pathname === '/' ? '/index.html' : pathname;
  // If no extension, try adding .html (clean URLs support)
  if (!path.extname(safePath) && !safePath.endsWith('/')) {
    safePath += '.html';
  }
  
  const filePath = path.join(__dirname, safePath);
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        fs.readFile(path.join(__dirname, '404.html'), (err, htmlContent) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(htmlContent || '<h1>404 Not Found</h1>', 'utf-8');
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`🌶️  Rehoboth Open Store — Dev server running at http://localhost:${PORT}/`);
  console.log(`📦 Admin Portal: http://localhost:${PORT}/admin/index.html`);
  console.log(`🔑 Login: admin@spiceshop.in / Admin@1234`);
});
