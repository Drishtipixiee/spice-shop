const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Fix CSS media query block structure and add Tinder Swipe / Carousel Marquee styling
const targetCSS = `      /* THIS IS THE CRITICAL FIX FOR THE BUG! */
      .mobile-categories.app-tab-section.active-tab { display: flex !important; }
    
    .mobile-app-header, .mobile-categories, .mobile-best-sellers { display: none; }`;

const replacementCSS = `      /* THIS IS THE CRITICAL FIX FOR THE BUG! */
      .mobile-categories.app-tab-section.active-tab { display: flex !important; }

      /* Restore mobile grid */
      #product-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 14px !important;
      }
      .products-section { padding-bottom: 80px !important; }

      /* Mobile Tinder Swipe UI compact adjustments */
      .product-loop-section {
        height: 540px !important;
        padding-top: 15px !important;
      }
      .product-loop-label {
        font-size: 20px !important;
        margin-bottom: 15px !important;
      }
      #swipe-container {
        width: 290px !important;
        height: 380px !important;
      }
      .swipe-card img {
        height: 240px !important;
        padding: 12px !important;
        object-fit: contain !important;
      }
      .swipe-card-body {
        padding: 12px !important;
      }
      .swipe-card-name {
        font-size: 18px !important;
        margin-bottom: 4px !important;
      }
      .swipe-card-price {
        font-size: 22px !important;
      }
      .swipe-stamp {
        font-size: 28px !important;
        top: 24px !important;
        padding: 6px 14px !important;
      }
      .swipe-actions {
        margin-top: 15px !important;
        gap: 24px !important;
      }
      .swipe-btn {
        width: 58px !important;
        height: 58px !important;
        font-size: 24px !important;
      }

      /* Infinite marquee loop for Recommended for You (mobile-carousel) */
      .mobile-best-sellers {
        overflow: hidden !important;
        width: 100vw !important;
        padding: 20px 0 !important;
      }
      .mobile-carousel {
        display: flex !important;
        gap: 16px !important;
        animation: loop-scroll-bs 20s linear infinite !important;
        width: max-content !important;
        padding: 8px 0 !important;
      }
      .mobile-carousel:hover {
        animation-play-state: paused !important;
      }
      .m-product-card {
        flex-shrink: 0 !important;
        width: 150px !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.06) !important;
        border: 1px solid rgba(0,0,0,0.05) !important;
      }
    }
    
    @keyframes loop-scroll-bs {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    
    .mobile-app-header, .mobile-categories, .mobile-best-sellers { display: none; }`;

content = content.replace(targetCSS, replacementCSS);

// 2. Change "See All" link next to "Recommended for You" to "View All →"
content = content.replace(
  `<a href="#" class="mobile-bs-link" onclick="switchAppTab('categories'); return false;">See All</a>`,
  `<a href="#" class="mobile-bs-link" onclick="switchAppTab('categories'); return false;">View All →</a>`
);

// 3. Inject JS function to populate Recommended for You and start loop
const initCarouselJS = `
    function initRecommendedCarousel() {
      const carousel = document.querySelector('.mobile-carousel');
      if (!carousel || !PRODUCTS.length) return;
      
      // Select bestsellers/new products or slice first 6 products
      const list = PRODUCTS.filter(p => p.is_bestseller || p.is_new);
      const items = list.length ? list : PRODUCTS.slice(0, 6);
      
      // Duplicate to ensure seamless marquee looping
      const doubleItems = [...items, ...items, ...items];
      carousel.innerHTML = doubleItems.map(p => {
        const img = p.image_url || 'https://via.placeholder.com/150x110';
        return \`
          <div class="m-product-card" onclick="showProductDetails('\${p.id}')">
            <img src="\${img}" class="m-product-img" alt="\${p.name}">
            <div class="m-product-info">
              <div class="m-product-name">\${p.name}</div>
              <div class="m-product-price">₹\${p.price}</div>
              <button class="m-product-add" onclick="event.stopPropagation(); toggleCart('\${p.id}')">ADD</button>
            </div>
          </div>
        \`;
      }).join('');
    }
`;

// Append JS function definition before initProductLoop definition
content = content.replace(
  'function initProductLoop() {',
  initCarouselJS + '\n    function initProductLoop() {'
);

// Call initRecommendedCarousel() inside initApp()
content = content.replace(
  'initProductLoop();',
  'initProductLoop();\n      initRecommendedCarousel();'
);

fs.writeFileSync('index.html', content);
console.log('Script changes complete.');
