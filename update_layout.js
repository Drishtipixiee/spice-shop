const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Add CSS for tabs inside the mobile media query
const cssTarget = '@media(max-width:768px) {';
if (content.includes(cssTarget) && !content.includes('.app-tab-section')) {
  content = content.replace(
    cssTarget,
    cssTarget + '\n      .app-tab-section { display: none !important; }\n      .app-tab-section.active-tab { display: block !important; }\n      .trust-inner.app-tab-section.active-tab { display: flex !important; }\n'
  );
}

// 2. Add JS function
const jsTarget = 'function checkPincode() {';
if (content.includes(jsTarget) && !content.includes('function switchAppTab')) {
  const jsToAdd = `
    // ─── TAB SWITCHING (MOBILE SPA LAYOUT) ───
    function switchAppTab(tabName) {
      if (window.innerWidth > 768) {
        if (tabName === 'home') window.scrollTo({top:0, behavior:'smooth'});
        else if (tabName === 'categories') document.getElementById('products').scrollIntoView({behavior:'smooth'});
        else if (tabName === 'track') document.getElementById('track').scrollIntoView({behavior:'smooth'});
        return;
      }
      
      document.querySelectorAll('.app-tab-section').forEach(el => {
        el.classList.remove('active-tab');
      });
      document.querySelectorAll('.tab-' + tabName).forEach(el => {
        el.classList.add('active-tab');
      });
      
      document.querySelectorAll('.mobile-bottom-nav .nav-item').forEach(el => {
        el.classList.remove('active');
      });
      const activeBtn = document.querySelector('.mobile-bottom-nav .nav-item[onclick*="' + tabName + '"]');
      if (activeBtn) activeBtn.classList.add('active');
      
      window.scrollTo(0, 0);
    }
    
    `;
  content = content.replace(jsTarget, jsToAdd + jsTarget);
}

// 3. Add classes to sections
content = content.replace('<section class="hero">', '<section class="hero app-tab-section tab-home active-tab">');
content = content.replace('<div class="trust-strip">', '<div class="trust-strip app-tab-section tab-home active-tab">');
content = content.replace('<div class="product-loop-section" id="product-loop-section"', '<div class="product-loop-section app-tab-section tab-home active-tab" id="product-loop-section"');
content = content.replace('<div class="ai-strip">', '<div class="ai-strip app-tab-section tab-home active-tab">');
content = content.replace('<section class="products-section" id="products">', '<section class="products-section app-tab-section tab-categories" id="products">');
content = content.replace('<section class="pincode-section" id="pincode">', '<section class="pincode-section app-tab-section tab-home active-tab" id="pincode">');
content = content.replace('<section class="stats-section">', '<section class="stats-section app-tab-section tab-home active-tab">');
content = content.replace('<section class="testi-section">', '<section class="testi-section app-tab-section tab-home active-tab">');
content = content.replace('<section class="track-section" id="track">', '<section class="track-section app-tab-section tab-track" id="track">');

// 4. Update the mobile-bottom-nav
const oldNav = `<a href="#" class="active" onclick="window.scrollTo(0,0)">`;
if (content.includes(oldNav)) {
  content = content.replace(
    /<div class="mobile-bottom-nav">[\s\S]*?<\/div>/,
    `<div class="mobile-bottom-nav">
    <a href="#" class="nav-item active" onclick="switchAppTab('home'); return false;">
      <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
      Home
    </a>
    <a href="#" class="nav-item" onclick="switchAppTab('categories'); return false;">
      <svg viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-4v7h2.5v8H21V2h-5z"/></svg>
      Categories
    </a>
    <a href="#" class="nav-item" onclick="switchAppTab('track'); return false;">
      <svg viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
      Track
    </a>
    <a href="javascript:void(0)" class="nav-item" onclick="toggleDrawer()">
      <svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
      Cart
    </a>
  </div>`
  );
}

fs.writeFileSync('index.html', content);
console.log('Update complete.');
