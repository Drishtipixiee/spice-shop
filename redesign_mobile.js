const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Remove the "glitchy" dynamic headline
content = content.replace(/applyDynamicHomepage\(\);/g, '// applyDynamicHomepage();');
const settingsReplace = `if (item.key === 'hero') {
            const h = document.getElementById('hero-headline'), s = document.getElementById('hero-subheadline');
            if (h && val.headline) h.textContent = val.headline;
            if (s && val.subheadline) s.textContent = val.subheadline;
          }`;
content = content.replace(settingsReplace, `// ${settingsReplace.replace(/\n/g, '\n// ')}`);

// 2. Hide desktop clutter on mobile
const cssToInsert = `
    @media(max-width:768px) {
      .app-tab-section { display: none !important; }
      .app-tab-section.active-tab { display: block !important; }
      
      /* Hide giant desktop sections on mobile */
      .hero { display: none !important; }
      .trust-strip { display: none !important; }
      .stats-section { display: none !important; }
      .testi-section { display: none !important; }
      
      /* New Mobile App UI */
      .mobile-app-header {
        display: block !important;
        padding: 16px;
        background: #fff;
        position: sticky;
        top: 0;
        z-index: 100;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      }
      .mobile-search-bar {
        display: flex;
        background: #f0f0f0;
        border-radius: 12px;
        padding: 12px 16px;
        align-items: center;
        gap: 10px;
        margin-top: 12px;
      }
      .mobile-search-bar input {
        border: none;
        background: transparent;
        flex: 1;
        outline: none;
        font-size: 15px;
      }
      
      .mobile-categories {
        display: flex !important;
        gap: 16px;
        padding: 20px 16px;
        overflow-x: auto;
        -ms-overflow-style: none;  
        scrollbar-width: none;  
      }
      .mobile-categories::-webkit-scrollbar { 
        display: none; 
      }
      .mobile-cat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        min-width: 72px;
        cursor: pointer;
      }
      .mobile-cat-img {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: #fff9f3;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        box-shadow: 0 4px 12px rgba(232, 96, 10, 0.1);
      }
      .mobile-cat-name {
        font-size: 12px;
        font-weight: 600;
        color: var(--text);
      }
      
      .mobile-best-sellers {
        display: block !important;
        padding: 0 16px 20px;
      }
      
      /* Fix horizontal overflow */
      body { overflow-x: hidden; width: 100vw; max-width: 100vw; }
      .main-wrapper { overflow-x: hidden; }
      .app-tab-section { max-width: 100vw; overflow-x: hidden; }
    }
    
    .mobile-app-header, .mobile-categories, .mobile-best-sellers { display: none; }
`;

content = content.replace('@media(max-width:768px) {\n      .app-tab-section { display: none !important; }', cssToInsert);

// 3. Add Mobile App Header to Tab Home
const mobileHomeHTML = `
  <div class="mobile-app-header app-tab-section tab-home active-tab">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="font-size:12px; font-weight:700; color:var(--saffron); text-transform:uppercase;">Delivering to</div>
        <div style="font-size:15px; font-weight:700;">Thane & Mulund 📍</div>
      </div>
      <div style="width:40px; height:40px; border-radius:50%; background:#fff9f3; display:flex; align-items:center; justify-content:center; font-size:20px;">
        👤
      </div>
    </div>
    <div class="mobile-search-bar" onclick="switchAppTab('categories')">
      <span>🔍</span>
      <input type="text" placeholder="Search for pure A2 Ghee, Spices..." readonly>
    </div>
  </div>
  
  <div class="mobile-categories app-tab-section tab-home active-tab">
    <div class="mobile-cat-item" onclick="switchAppTab('categories'); setTimeout(()=>filterByCategory('dairy'),100);">
      <div class="mobile-cat-img">🥛</div>
      <div class="mobile-cat-name">Dairy</div>
    </div>
    <div class="mobile-cat-item" onclick="switchAppTab('categories'); setTimeout(()=>filterByCategory('spices'),100);">
      <div class="mobile-cat-img">🌶️</div>
      <div class="mobile-cat-name">Spices</div>
    </div>
    <div class="mobile-cat-item" onclick="switchAppTab('categories'); setTimeout(()=>filterByCategory('combos'),100);">
      <div class="mobile-cat-img">🎁</div>
      <div class="mobile-cat-name">Combos</div>
    </div>
    <div class="mobile-cat-item" onclick="switchAppTab('categories'); setTimeout(()=>filterByCategory('cakes'),100);">
      <div class="mobile-cat-img">🧁</div>
      <div class="mobile-cat-name">Sweets</div>
    </div>
  </div>
  
  <div class="mobile-best-sellers app-tab-section tab-home active-tab">
    <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;">🔥 Recommended for You</h3>
    <button class="btn-hero-primary" onclick="switchAppTab('categories')" style="width:100%; text-align:center; padding:12px; border-radius:12px; background:var(--saffron); border:none; box-shadow:0 4px 12px rgba(232,96,10,0.3);">View All Products</button>
  </div>
`;

content = content.replace('<!-- ══ CINEMATIC HERO ═════════════════════════════════════════ -->', '<!-- ══ CINEMATIC HERO ═════════════════════════════════════════ -->\n' + mobileHomeHTML);

fs.writeFileSync('index.html', content);
console.log('Mobile layout updated successfully.');
