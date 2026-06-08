// ============================================
// CURSOR — Custom Cursor with Glow Effect
// ============================================

let cursor, glow;
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let glowX = 0, glowY = 0;

export function initCursor() {
  cursor = document.getElementById('custom-cursor');
  glow = document.getElementById('cursor-glow');

  if (!cursor || !glow) return;

  // Track mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Hover state for interactive elements
  const hoverElements = document.querySelectorAll('[data-hover]');
  hoverElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovering');
    });
  });

  // Start animation loop
  animateCursor();
}

function animateCursor() {
  requestAnimationFrame(animateCursor);

  // Smooth follow for cursor
  cursorX += (mouseX - cursorX) * 0.15;
  cursorY += (mouseY - cursorY) * 0.15;

  // Even smoother follow for glow
  glowX += (mouseX - glowX) * 0.05;
  glowY += (mouseY - glowY) * 0.05;

  if (cursor) {
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
  }

  if (glow) {
    glow.style.left = `${glowX}px`;
    glow.style.top = `${glowY}px`;
  }
}
