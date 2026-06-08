// ============================================
// GANESH PORTFOLIO — Main Entry Point
// Apple/Tesla-Style Full-Screen Avatar Scroll
// ============================================

import './styles/index.css';
import { initLoader } from './modules/loader.js';
import { initAvatar } from './modules/avatar.js';
import { initAudio } from './modules/audio.js';
import { initParticles } from './modules/particles.js';
import { initNavigation } from './modules/navigation.js';
import { initHero } from './modules/hero.js';
import { initHolograms } from './modules/holograms.js';
import { initSkills } from './modules/skills.js';
import { initProjects } from './modules/projects.js';
import { initContact } from './modules/contact.js';
import { initCursor } from './modules/cursor.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugin once
gsap.registerPlugin(ScrollTrigger);

// Global user interaction tracker to handle autoplay restrictions across loader screens
window.hasUserInteracted = false;
window.triggerAudioPlayback = null;

function setInteracted() {
  if (window.hasUserInteracted) return;
  window.hasUserInteracted = true;
  if (typeof window.triggerAudioPlayback === 'function') {
    window.triggerAudioPlayback();
  }
}

document.addEventListener('click', setInteracted);
document.addEventListener('keydown', setInteracted);
document.addEventListener('touchend', setInteracted);

async function init() {
  // Custom cursor (desktop only)
  if (window.innerWidth > 768) {
    initCursor();
  }

  // Load avatar frames with premium loading screen
  const avatarReady = initLoader();

  // Start particles in background
  initParticles();

  // Wait for all frames to load
  await avatarReady;

  // Initialize all sections
  initAvatar();
  initAudio();
  initNavigation();
  initHero();
  initHolograms();
  initSkills();
  initProjects();
  initContact();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
