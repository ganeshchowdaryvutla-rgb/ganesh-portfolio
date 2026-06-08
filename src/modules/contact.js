// ============================================
// CONTACT — Form Animations & Validation
// ============================================

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initContact() {
  // Contact card entrance
  gsap.fromTo('#contact-card', {
    opacity: 0, y: 60, scale: 0.96,
  }, {
    opacity: 1, y: 0, scale: 1, duration: 1, ease: 'expo.out',
    scrollTrigger: { trigger: '#contact', start: 'top 70%' },
  });

  // Form submission
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('btn-submit');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const projectType = document.getElementById('project-type').value;
      const budget = document.getElementById('budget').value;
      const message = document.getElementById('message').value;

      const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Project Type: ${projectType || 'Not specified'}\n` +
        `Budget: ${budget || 'Not specified'}\n\n` +
        `Message:\n${message}`
      );

      const mailtoUrl = `mailto:ganeshchowdaryvutla@gmail.com?subject=${subject}&body=${body}`;

      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Opening Mail client...';
      submitBtn.style.pointerEvents = 'none';

      createParticleBurst(submitBtn);

      // Trigger the mailto redirection
      window.location.href = mailtoUrl;

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.pointerEvents = '';
        form.reset();
      }, 2000);
    });
  }

  // Input focus animations
  const inputs = document.querySelectorAll('.form-input, .form-textarea, .form-select');
  inputs.forEach((input) => {
    input.addEventListener('focus', () => {
      gsap.to(input, { scale: 1.01, duration: 0.2, ease: 'power2.out' });
    });
    input.addEventListener('blur', () => {
      gsap.to(input, { scale: 1, duration: 0.2, ease: 'power2.out' });
    });
  });
}

function createParticleBurst(element) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      left: ${centerX}px;
      top: ${centerY}px;
      width: 4px;
      height: 4px;
      background: #FF6B00;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(particle);

    const angle = (Math.PI * 2 * i) / 20;
    const distance = 50 + Math.random() * 80;

    gsap.to(particle, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      opacity: 0,
      scale: 0,
      duration: 0.8,
      ease: 'expo.out',
      onComplete: () => particle.remove(),
    });
  }
}
