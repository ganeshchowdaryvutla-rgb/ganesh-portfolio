// ============================================
// TIMELINE — Futuristic Animated Timeline
// ============================================

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initTimeline() {
  const items = document.querySelectorAll('.timeline-item');
  const progressLine = document.getElementById('timeline-progress-line');

  // Animate the progress line as user scrolls through timeline
  if (progressLine) {
    ScrollTrigger.create({
      trigger: '#timeline-container',
      start: 'top 60%',
      end: 'bottom 40%',
      scrub: 0.5,
      onUpdate: (self) => {
        progressLine.style.height = `${self.progress * 100}%`;
      },
    });
  }

  // Stagger reveal each timeline item
  items.forEach((item, index) => {
    gsap.fromTo(item, { opacity: 0, x: -40 }, {
      opacity: 1, x: 0, duration: 0.8, ease: 'expo.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 80%',
        toggleActions: 'play none none none',
        onEnter: () => item.classList.add('active'),
      },
      delay: index * 0.05,
    });
  });

  // Section header
  gsap.fromTo('#timeline .section-label', { opacity: 0, x: -30 }, {
    opacity: 1, x: 0, duration: 0.8, ease: 'expo.out',
    scrollTrigger: { trigger: '#timeline', start: 'top 70%' },
  });
  gsap.fromTo('#timeline .section-title', { opacity: 0, y: 30 }, {
    opacity: 1, y: 0, duration: 0.8, ease: 'expo.out',
    scrollTrigger: { trigger: '#timeline', start: 'top 70%' }, delay: 0.1,
  });
  gsap.fromTo('#timeline .section-description', { opacity: 0, y: 20 }, {
    opacity: 1, y: 0, duration: 0.8, ease: 'expo.out',
    scrollTrigger: { trigger: '#timeline', start: 'top 70%' }, delay: 0.2,
  });

  // Vision quote animation
  gsap.fromTo('#vision-quote', {
    opacity: 0, y: 40, scale: 0.95,
  }, {
    opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'expo.out',
    scrollTrigger: { trigger: '#vision', start: 'top 60%' },
  });

  gsap.fromTo('#vision-line', {
    opacity: 0, scaleX: 0,
  }, {
    opacity: 1, scaleX: 1, duration: 0.8, ease: 'expo.out',
    scrollTrigger: { trigger: '#vision', start: 'top 55%' }, delay: 0.3,
  });
}
