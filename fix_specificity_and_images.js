const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Fix specificity for hiding
const oldHide = '.hero, .trust-strip, .stats-section, .testi-section, .product-loop-section, .ai-strip, .float-ai { display: none !important; }';
const newHide = '.hero.app-tab-section, .trust-strip.app-tab-section, .stats-section.app-tab-section, .testi-section.app-tab-section, .product-loop-section.app-tab-section, .ai-strip.app-tab-section, .float-ai { display: none !important; }';
content = content.replace(oldHide, newHide);

// Fix images back to original
const aiGhee = 'https://image.pollinations.ai/prompt/Farm%20Fresh%20A2%20Gir%20Cow%20Ghee%20Indian%20grocery%20product%20photography?width=400&height=300&nologo=true';
const oldGhee = 'https://t4.ftcdn.net/jpg/13/15/19/43/360_F_1315194377_Ro8c5tjMXYc3oEXUJ6zgyeIENDkdQyJX.jpg';

const aiTurmeric = 'https://image.pollinations.ai/prompt/Erode%20Turmeric%20Powder%20Indian%20grocery%20product%20photography?width=400&height=300&nologo=true';
const oldTurmeric = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRM3UCTqqG6vIXSwZFScLSPp5JPbWuMhEkwCg&s';

const aiPaneer = 'https://image.pollinations.ai/prompt/Malai%20Paneer%20Indian%20grocery%20product%20photography?width=400&height=300&nologo=true';
const oldPaneer = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRL6Uxmew-bK-5-fzBJQhtih7mKysKD0NsOvw&s';

content = content.replace(aiGhee, oldGhee);
content = content.replace(aiTurmeric, oldTurmeric);
content = content.replace(aiPaneer, oldPaneer);

fs.writeFileSync('index.html', content);
console.log('Fixed specificity and images.');
