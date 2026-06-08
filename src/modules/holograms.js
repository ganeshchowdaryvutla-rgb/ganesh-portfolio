// ============================================
// HOLOGRAMS — 3D Tilt Service Cards
// ============================================

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initHolograms() {
  const cards = document.querySelectorAll('.hologram-card');

  // Scroll-triggered entrance
  cards.forEach((card, index) => {
    gsap.fromTo(card, {
      opacity: 0,
      y: 60,
      rotateX: 10,
    }, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.8,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      delay: index * 0.1,
    });
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

        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

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

  // Section header animations
  gsap.fromTo('#services .section-label', { opacity: 0, x: -30 }, {
    opacity: 1, x: 0, duration: 0.8, ease: 'expo.out',
    scrollTrigger: { trigger: '#services', start: 'top 70%' },
  });
  gsap.fromTo('#services .section-title', { opacity: 0, y: 30 }, {
    opacity: 1, y: 0, duration: 0.8, ease: 'expo.out',
    scrollTrigger: { trigger: '#services', start: 'top 70%' }, delay: 0.1,
  });
  gsap.fromTo('#services .section-description', { opacity: 0, y: 20 }, {
    opacity: 1, y: 0, duration: 0.8, ease: 'expo.out',
    scrollTrigger: { trigger: '#services', start: 'top 70%' }, delay: 0.2,
  });
}
