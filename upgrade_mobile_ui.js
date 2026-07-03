const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// SVG Icons
const mapPinSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`;
const userSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-user-round"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/></svg>`;
const searchSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
const milkSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-glass-water"><path d="M15.2 22H8.8a2 2 0 0 1-2-1.79L5 3h14l-1.81 17.21A2 2 0 0 1 15.2 22Z"/><path d="M6 12a5 5 0 0 1 6 0 5 5 0 0 0 6 0"/></svg>`;
const spiceSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flame"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
const comboSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gift"><polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" x2="12" y1="22" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`;
const sweetSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cookie"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>`;

const newCSS = `
      .mobile-app-header {
        display: block !important;
        padding: 16px 20px 12px 20px;
        background: #ffffff;
        position: sticky;
        top: 0;
        z-index: 100;
        border-bottom: 1px solid rgba(0,0,0,0.04);
      }
      .mobile-header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .mobile-header-loc-title {
        font-size: 11px;
        font-weight: 700;
        color: #e8600a;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 2px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .mobile-header-loc-val {
        font-size: 16px;
        font-weight: 800;
        color: #111827;
        letter-spacing: -0.2px;
      }
      .mobile-header-user {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: #f9fafb;
        border: 1px solid #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #374151;
        cursor: pointer;
      }
      .mobile-search-bar {
        display: flex;
        background: #f3f4f6;
        border-radius: 12px;
        padding: 12px 16px;
        align-items: center;
        gap: 12px;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        cursor: text;
      }
      .mobile-search-bar input {
        border: none;
        background: transparent;
        flex: 1;
        outline: none;
        font-size: 15px;
        font-weight: 500;
        color: #111827;
      }
      .mobile-search-bar input::placeholder {
        color: #6b7280;
        font-weight: 400;
      }
      
      .mobile-categories {
        display: flex !important;
        gap: 12px;
        padding: 24px 20px 8px;
        overflow-x: auto;
        -ms-overflow-style: none;  
        scrollbar-width: none;  
      }
      .mobile-categories::-webkit-scrollbar { display: none; }
      .mobile-cat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        min-width: 76px;
        cursor: pointer;
      }
      .mobile-cat-img {
        width: 68px;
        height: 68px;
        border-radius: 20px;
        background: #fff;
        border: 1px solid #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #e8600a;
        box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        transition: all 0.2s ease;
      }
      .mobile-cat-img:active {
        transform: scale(0.95);
        background: #fff9f3;
        border-color: #ffedd5;
      }
      .mobile-cat-name {
        font-size: 13px;
        font-weight: 600;
        color: #4b5563;
        letter-spacing: -0.1px;
      }
      
      .mobile-best-sellers {
        display: block !important;
        padding: 24px 0 24px;
      }
      .mobile-bs-header {
        padding: 0 20px;
        margin-bottom: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .mobile-bs-title {
        font-size: 18px;
        font-weight: 800;
        color: #111827;
        letter-spacing: -0.3px;
      }
      .mobile-bs-link {
        font-size: 13px;
        font-weight: 600;
        color: #e8600a;
        text-decoration: none;
      }
      
      .mobile-carousel {
        display: flex;
        gap: 16px;
        padding: 0 20px 10px;
        overflow-x: auto;
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .mobile-carousel::-webkit-scrollbar { display: none; }
      
      .m-product-card {
        min-width: 150px;
        max-width: 150px;
        background: #fff;
        border-radius: 16px;
        border: 1px solid #f3f4f6;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        display: flex;
        flex-direction: column;
      }
      .m-product-img {
        width: 100%;
        height: 120px;
        object-fit: contain;
        background: #f9fafb;
        padding: 12px;
      }
      .m-product-info {
        padding: 12px;
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .m-product-name {
        font-size: 13px;
        font-weight: 600;
        color: #111827;
        line-height: 1.3;
        margin-bottom: 6px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .m-product-price {
        font-size: 15px;
        font-weight: 800;
        color: #111827;
        margin-top: auto;
      }
      .m-product-add {
        margin-top: 8px;
        width: 100%;
        padding: 8px 0;
        background: #e8600a;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
      }
`;

const newHTML = `
  <div class="mobile-app-header app-tab-section tab-home active-tab">
    <div class="mobile-header-top">
      <div>
        <div class="mobile-header-loc-title">${mapPinSVG} Delivering to</div>
        <div class="mobile-header-loc-val">Thane & Mulund</div>
      </div>
      <div class="mobile-header-user">
        ${userSVG}
      </div>
    </div>
    <div class="mobile-search-bar" onclick="switchAppTab('categories')">
      ${searchSVG}
      <input type="text" placeholder="Search for pure A2 Ghee, Spices..." readonly>
    </div>
  </div>
  
  <div class="mobile-categories app-tab-section tab-home active-tab">
    <div class="mobile-cat-item" onclick="switchAppTab('categories'); setTimeout(()=>filterByCategory('dairy'),100);">
      <div class="mobile-cat-img">${milkSVG}</div>
      <div class="mobile-cat-name">Dairy</div>
    </div>
    <div class="mobile-cat-item" onclick="switchAppTab('categories'); setTimeout(()=>filterByCategory('spices'),100);">
      <div class="mobile-cat-img">${spiceSVG}</div>
      <div class="mobile-cat-name">Spices</div>
    </div>
    <div class="mobile-cat-item" onclick="switchAppTab('categories'); setTimeout(()=>filterByCategory('combos'),100);">
      <div class="mobile-cat-img">${comboSVG}</div>
      <div class="mobile-cat-name">Combos</div>
    </div>
    <div class="mobile-cat-item" onclick="switchAppTab('categories'); setTimeout(()=>filterByCategory('cakes'),100);">
      <div class="mobile-cat-img">${sweetSVG}</div>
      <div class="mobile-cat-name">Sweets</div>
    </div>
  </div>
  
  <div class="mobile-best-sellers app-tab-section tab-home active-tab">
    <div class="mobile-bs-header">
      <h3 class="mobile-bs-title">Recommended for You</h3>
      <a href="#" class="mobile-bs-link" onclick="switchAppTab('categories'); return false;">See All</a>
    </div>
    <div class="mobile-carousel">
      <div class="m-product-card" onclick="switchAppTab('categories')">
        <img src="images/products/Ghee-Front.jpg" class="m-product-img" alt="A2 Ghee">
        <div class="m-product-info">
          <div class="m-product-name">Farm Fresh A2 Gir Cow Ghee</div>
          <div class="m-product-price">₹1,150</div>
          <button class="m-product-add">ADD</button>
        </div>
      </div>
      <div class="m-product-card" onclick="switchAppTab('categories')">
        <img src="images/products/Turmeric-Front.jpg" class="m-product-img" alt="Turmeric">
        <div class="m-product-info">
          <div class="m-product-name">Erode Turmeric Powder</div>
          <div class="m-product-price">₹160</div>
          <button class="m-product-add">ADD</button>
        </div>
      </div>
      <div class="m-product-card" onclick="switchAppTab('categories')">
        <img src="images/products/Paneer-Front.jpg" class="m-product-img" alt="Paneer">
        <div class="m-product-info">
          <div class="m-product-name">Malai Paneer (Fresh Daily)</div>
          <div class="m-product-price">₹140</div>
          <button class="m-product-add">ADD</button>
        </div>
      </div>
    </div>
  </div>
`;

// Extract out old blocks and replace
const cssRegex = /\.mobile-app-header\s*\{[\s\S]*?\}\s*\.mobile-app-header,\s*\.mobile-categories,\s*\.mobile-best-sellers\s*\{\s*display:\s*none;\s*\}/;
content = content.replace(cssRegex, newCSS + '\n    }\n    .mobile-app-header, .mobile-categories, .mobile-best-sellers { display: none; }\n      .mobile-categories.app-tab-section.active-tab { display: flex !important; }');

const htmlRegex = /<div class="mobile-app-header app-tab-section tab-home active-tab">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
content = content.replace(htmlRegex, newHTML);

fs.writeFileSync('index.html', content);
console.log('Premium upgrade complete.');
