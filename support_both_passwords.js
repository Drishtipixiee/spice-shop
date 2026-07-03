const fs = require('fs');

// 1. Update admin/assets/js/api.js to accept owner123
let apiContent = fs.readFileSync('admin/assets/js/api.js', 'utf8');
apiContent = apiContent.replace(
  `if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {`,
  `if (email === ADMIN_EMAIL && (password === ADMIN_PASSWORD || password === 'owner123')) {`
);
fs.writeFileSync('admin/assets/js/api.js', apiContent);
console.log('admin/assets/js/api.js updated.');

// 2. Update api/auth.js to accept owner123
let authContent = fs.readFileSync('api/auth.js', 'utf8');
authContent = authContent.replace(
  `if (email === expectedEmail && password === expectedPassword) {`,
  `if (email === expectedEmail && (password === expectedPassword || password === 'owner123')) {`
);
fs.writeFileSync('api/auth.js', authContent);
console.log('api/auth.js updated.');
