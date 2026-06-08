// ============================================
// HERO — Text Reveals & Entrance Animations
// ============================================

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initHero() {
  // Timeline for hero entrance
  const tl = gsap.timeline({
    defaults: { ease: 'expo.out' },
    delay: 0.5,
  });

  // Animate each word sliding up
  const wordInners = document.querySelectorAll('.hero-title .word-inner');
  tl.to(wordInners, {
    y: 0,
    duration: 1.2,
    stagger: 0.1,
  });

  // Subtitle fade in
  tl.to('#hero-subtitle', {
    opacity: 1,
    y: 0,
    duration: 0.8,
  }, '-=0.5');

  // Buttons fade in
  tl.to('#hero-buttons', {
    opacity: 1,
    y: 0,
    duration: 0.8,
  }, '-=0.4');

  // Hero tag
  tl.fromTo('.hero-tag', {
    opacity: 0,
    x: -20,
  }, {
    opacity: 1,
    x: 0,
    duration: 0.6,
  }, '-=0.6');

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
