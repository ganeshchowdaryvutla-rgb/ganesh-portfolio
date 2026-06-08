// ============================================
// PROJECTS — Glass Cards with Hover Effects
// ============================================

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initProjects() {
  const cards = document.querySelectorAll('.project-card');
  const grid = document.querySelector('.projects-grid');

  if (!grid || cards.length === 0) return;

  let isMobile = window.innerWidth <= 768;
  let R = isMobile ? 60 : 150; // Dynamic radius of 3D orbital sphere (shrunk on mobile to prevent clipping)

  // Dynamic layout offsets to center all cards in the grid container
  let cardOffsets = [];
  function calculateOffsets() {
    isMobile = window.innerWidth <= 768;
    R = isMobile ? 60 : 150;

    // Temporarily clear transforms to measure true layout offsets accurately
    gsap.set(cards, { clearProps: "transform" });

    const gridCenterX = grid.offsetWidth / 2;
    const gridCenterY = grid.offsetHeight / 2;
    cardOffsets = Array.from(cards).map(card => {
      const cardCenterX = card.offsetLeft + card.offsetWidth / 2;
      const cardCenterY = card.offsetTop + card.offsetHeight / 2;
      return {
        x: gridCenterX - cardCenterX,
        y: gridCenterY - cardCenterY
      };
    });
  }

  // Calculate offsets initially and attach resize listener
  calculateOffsets();
  window.addEventListener('resize', calculateOffsets);

  const orbit = { angle: 0, progress: 0 };

  // Timeline drives orbit spin and split cleanly, playing on every trigger enter
  const tl = gsap.timeline({
    paused: true,
    onStart: () => {
      calculateOffsets();
      orbit.angle = 0;
      orbit.progress = 0;
    },
    onUpdate: () => {
      cards.forEach((card, index) => {
        const baseAngle = (index * 2 * Math.PI) / cards.length;
        const currentAngle = orbit.angle + baseAngle;

        // 3D Sphere orbital coordinates
        const orbitX = Math.cos(currentAngle) * R;
        const orbitY = Math.sin(currentAngle) * R * 0.6; // Increased vertical amplitude for pronounced sphere path
        const orbitZ = Math.sin(currentAngle) * R;

        const progress = orbit.progress;
        const offset = cardOffsets[index] || { x: 0, y: 0 };

        // Interpolate between centered sphere orbit (offset + orbit) and original grid positions (0)
        const targetX = (offset.x + orbitX) * (1 - progress);
        const targetY = (offset.y + orbitY) * (1 - progress);

        // Calculate tumbling rotations during orbit, fading to 0 as cards split
        const rotateY = (currentAngle * 180 / Math.PI) * (1 - progress);
        const rotateX = (Math.sin(currentAngle) * 25) * (1 - progress);
        
        // Scale down during orbit on mobile to prevent clipping screen edges
        const mobileScaleMultiplier = isMobile ? (0.65 * (1 - progress) + 1.0 * progress) : 1.0;
        const scale = ((0.8 + (orbitZ / R) * 0.2) * (1 - progress) + 1.0 * progress) * mobileScaleMultiplier;

        // Dynamic 3D depth z-indexing to keep all cards visible during orbit overlaps
        const zIndex = progress > 0.95 ? 1 : Math.round(orbitZ + R);

        gsap.set(card, {
          x: targetX,
          y: targetY,
          rotateY: rotateY,
          rotateX: rotateX,
          scale: scale,
          z: orbitZ * (1 - progress),
          zIndex: zIndex,
          transformPerspective: 1000,
        });
      });
    }
  });

  // 1. Staggered fade in at the center cluster
  tl.fromTo(cards, {
    opacity: 0,
  }, {
    opacity: 1,
    duration: 0.5,
    ease: 'power2.out',
    stagger: 0.1,
  });

  // 2. Spin cards around the 3D sphere orbit
  tl.to(orbit, {
    angle: Math.PI * 2.5, // 450 degrees of orbital revolution
    duration: 1.8,
    ease: 'power2.inOut',
  }, '-=0.3');

  // 3. Split/fan cards out side-by-side into grid columns
  tl.to(orbit, {
    progress: 1,
    duration: 1.4,
    ease: 'power3.out',
  }, '-=0.4');

  // 4. Staggered laser scanline sweeps as cards land
  cards.forEach((card, index) => {
    const scanline = card.querySelector('.project-scanline');
    if (scanline) {
      tl.fromTo(scanline, {
        y: 0,
        opacity: 0,
      }, {
        y: 280,
        opacity: 0.8,
        duration: 1.2,
        ease: 'power2.inOut',
      }, `-=${1.2 - index * 0.15}`);
    }
  });

  // 3D tilt effect on hover (desktop only)
  if (window.innerWidth > 768) {
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.setProperty('--rx', `${rotateY}deg`);
        card.style.setProperty('--ry', `${rotateX}deg`);
        card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  // Create standalone ScrollTrigger to trigger playback on every enter (scroll down or scroll back up)
  ScrollTrigger.create({
    trigger: '#projects',
    start: 'top 75%',
    onEnter: () => tl.play(0),
    onEnterBack: () => tl.play(0),
  });

  // Section header animations
  gsap.fromTo('#projects .section-label', { opacity: 0, x: -30 }, {
    opacity: 1, x: 0, duration: 0.8, ease: 'expo.out',
    scrollTrigger: { trigger: '#projects', start: 'top 70%' },
  });
  gsap.fromTo('#projects .section-title', { opacity: 0, y: 30 }, {
    opacity: 1, y: 0, duration: 0.8, ease: 'expo.out',
    scrollTrigger: { trigger: '#projects', start: 'top 70%' }, delay: 0.1,
  });
  gsap.fromTo('#projects .section-description', { opacity: 0, y: 20 }, {
    opacity: 1, y: 0, duration: 0.8, ease: 'expo.out',
    scrollTrigger: { trigger: '#projects', start: 'top 70%' }, delay: 0.2,
  });
}
