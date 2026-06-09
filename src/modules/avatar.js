// ============================================
// AVATAR — Full-Screen Fixed Background
// Apple-style scroll-synced frame animation
//
// FIXES:
// - High-DPI Retina scaling for razor-sharp frames
// - Frame interpolation (lerp) for 60fps stutter-free scroll
// - Page-load auto-scroll to Vision section
// ============================================

import { frames } from './loader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

let canvas, ctx;
let currentFrame = -1;
let targetFrame = 0;
let isPlayingVideo = true;
let lastFrameTime = 0;
const targetFPS = 18; // Slower, calmer avatar movement (18 FPS)
const frameInterval = 1000 / targetFPS;
let rafId = null;

export function initAvatar() {
  canvas = document.getElementById('avatar-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  // Size canvas to viewport (DPR aware for sharp Retina renders)
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);

  // Draw first frame immediately
  renderFrame(0);

  // Setup scroll-driven styling and fades
  setupScrollAnimation();

  // Start the render loop (continuous video playback at 30 FPS)
  startRenderLoop();

  // Smoothly scroll down to the vision section after hero text finishes revealing (3 seconds)
  setTimeout(autoScrollToVision, 3000);
}

function sizeCanvas() {
  // High-DPI Retina scaling for sharp frame display (capped at 2 for performance)
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const isMobile = window.innerWidth <= 768;
  // Increase canvas resolution dimensions slightly on mobile to match CSS overflow sizing
  const overflowScale = isMobile ? 1.04 : 1.0;
  canvas.width = window.innerWidth * overflowScale * dpr;
  canvas.height = window.innerHeight * overflowScale * dpr;

  // Redraw current frame at new size
  if (currentFrame >= 0) {
    renderFrame(currentFrame);
  }
}

function renderFrame(index) {
  const frame = frames[index];
  if (!frame || !frame.complete || !frame.naturalWidth || !ctx) return;

  const cw = canvas.width;
  const ch = canvas.height;

  ctx.clearRect(0, 0, cw, ch);

  const imgW = frame.naturalWidth;
  const imgH = frame.naturalHeight;
  const imgRatio = imgW / imgH;
  const canvasRatio = cw / ch;

  let drawW, drawH, drawX, drawY;

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    // Mobile: contain-fit inside viewport, centering both horizontally and vertically.
    // Scale up by 3.0x to increase its screen presence (height and width) on mobile backgrounds.
    const mobileScale = 3.0;
    if (canvasRatio > imgRatio) {
      drawH = ch * mobileScale;
      drawW = ch * imgRatio * mobileScale;
    } else {
      drawW = cw * mobileScale;
      drawH = (cw / imgRatio) * mobileScale;
    }
    drawX = (cw - drawW) / 2;
    drawY = (ch - drawH) / 2;
  } else {
    // Desktop/Laptop: cover-fit, aligned to top
    if (canvasRatio > imgRatio) {
      // Canvas is wider than image (widescreen desktop) -> fit width, crop bottom
      drawW = cw;
      drawH = cw / imgRatio;
      drawX = 0;
      drawY = 0; // align to top
    } else {
      // Canvas is taller than image (mobile portrait) -> fit height, crop sides
      drawH = ch;
      drawW = ch * imgRatio;
      drawX = (cw - drawW) / 2; // center horizontally
      drawY = 0;
    }
  }

  // Ensure high quality image scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(frame, drawX, drawY, drawW, drawH);
  currentFrame = index;
}

// Smooth render loop — updates frames like a real video
function startRenderLoop() {
  lastFrameTime = performance.now();

  function loop(now) {
    rafId = requestAnimationFrame(loop);

    const activeFPS = window.isAudioPlaying ? 26 : 14; // Speak-gesturing speed vs calm resting speed
    const activeInterval = 1000 / activeFPS;

    const elapsed = now - lastFrameTime;
    if (elapsed >= activeInterval) {
      lastFrameTime = now - (elapsed % activeInterval);

      if (isPlayingVideo) {
        // Advance target frame
        targetFrame++;

        if (window.isAudioPlaying) {
          // Loop the active speaking/gesturing sequence (frames 110 to 154)
          if (targetFrame >= frames.length || targetFrame < 110) {
            targetFrame = 110;
          }
        } else {
          // Loop the calm closed-mouth breathing sequence (frames 110 to 122)
          if (targetFrame >= 123 || targetFrame < 110) {
            targetFrame = 110;
          }
        }
      }
    }

    if (targetFrame !== currentFrame) {
      renderFrame(targetFrame);
    }
  }

  rafId = requestAnimationFrame((now) => {
    lastFrameTime = now;
    loop(now);
  });
}

function autoScrollToVision() {
  // If the user has already scrolled past 50px, respect their control and don't auto-scroll
  if (window.scrollY > 50) return;

  // Smoothly scroll down to the #vision section.
  // autoKill: true allows user interaction to instantly cancel the auto-scroll.
  gsap.to(window, {
    scrollTo: { y: '#vision', autoKill: true },
    duration: 5.5,
    ease: 'power2.inOut',
  });
}

function setupScrollAnimation() {
  // Fade out hero content as scrolling starts
  gsap.to('.hero-content', {
    opacity: 0,
    y: -80,
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '80% top',
      scrub: true,
    },
  });

  gsap.to('.scroll-indicator', {
    opacity: 0,
    scrollTrigger: {
      trigger: '#hero',
      start: '20% top',
      end: '40% top',
      scrub: true,
    },
  });

  // Fade avatar canvas as opaque content sections slide over
  // Also pause background video playback when the canvas is hidden (performance optimization)
  gsap.to('#avatar-canvas', {
    opacity: 0,
    scrollTrigger: {
      trigger: '#services',
      start: 'top 80%',
      end: 'top 20%',
      scrub: true,
      onToggle: (self) => {
        isPlayingVideo = !self.isActive;
      },
    },
  });
}
