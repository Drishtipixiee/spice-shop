const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Add auto-scroller script for Recommended for You (mobile-bs-scroll)
const scrollerScript = `
  <script>
    // Auto-scroll for Recommended for You
    setInterval(() => {
      const bs = document.querySelector('.mobile-bs-scroll');
      if (bs && window.innerWidth <= 768) {
        if (bs.scrollLeft + bs.clientWidth >= bs.scrollWidth - 10) {
          bs.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          bs.scrollBy({ left: 160, behavior: 'smooth' });
        }
      }
    }, 2500);
  </script>
</body>`;

content = content.replace('</body>', scrollerScript);

fs.writeFileSync('index.html', content);
console.log('Auto-scroller added.');
