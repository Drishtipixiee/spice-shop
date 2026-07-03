const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Fix Image URLs
content = content.replace('src="images/products/Ghee-Front.jpg"', 'src="https://image.pollinations.ai/prompt/Farm%20Fresh%20A2%20Gir%20Cow%20Ghee%20Indian%20grocery%20product%20photography?width=400&height=300&nologo=true"');
content = content.replace('src="images/products/Turmeric-Front.jpg"', 'src="https://image.pollinations.ai/prompt/Erode%20Turmeric%20Powder%20Indian%20grocery%20product%20photography?width=400&height=300&nologo=true"');
content = content.replace('src="images/products/Paneer-Front.jpg"', 'src="https://image.pollinations.ai/prompt/Malai%20Paneer%20Indian%20grocery%20product%20photography?width=400&height=300&nologo=true"');

// 2. Hide old sections on mobile
const cssHideOld = `.hero, .trust-strip, .stats-section, .testi-section { display: none !important; }`;
const cssHideNew = `.hero, .trust-strip, .stats-section, .testi-section, .product-loop-section, .ai-strip, .float-ai { display: none !important; }\n      .float-wa { bottom: 85px !important; }`;
content = content.replace(cssHideOld, cssHideNew);

fs.writeFileSync('index.html', content);
console.log('Bugs fixed.');
