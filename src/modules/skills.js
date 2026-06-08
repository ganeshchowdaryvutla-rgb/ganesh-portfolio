// ============================================
// SKILLS — 3D Rotating Sphere / Tag Cloud
// ============================================

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const SKILLS = [
  'Flutter', 'Python', 'HTML', 'CSS', 'JavaScript',
  'Web Development', 'n8n', 'C', 'Vibe Coding', 'Front-End Development'
];

let animationId;
let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let rotationX = 0, rotationY = 0;
let autoRotateSpeed = 0.003;
let canvas, ctx;
let spherePoints = [];

export function initSkills() {
  canvas = document.getElementById('skills-canvas');
  if (!canvas) return;

  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  calculateSpherePoints();
  setupInteraction();

  ScrollTrigger.create({
    trigger: '#skills',
    start: 'top 80%',
    onEnter: () => startAnimation(),
    onLeave: () => stopAnimation(),
    onEnterBack: () => startAnimation(),
    onLeaveBack: () => stopAnimation(),
  });

  gsap.fromTo('.skills-info', {
    opacity: 0, x: -40,
  }, {
    opacity: 1, x: 0, duration: 1, ease: 'expo.out',
    scrollTrigger: { trigger: '#skills', start: 'top 70%' },
  });
}

function resizeCanvas() {
  const container = canvas.parentElement;
  const size = Math.min(container.clientWidth, 500);
  canvas.width = size * window.devicePixelRatio;
  canvas.height = size * window.devicePixelRatio;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

function calculateSpherePoints() {
  spherePoints = SKILLS.map((skill, i) => {
    const phi = Math.acos(-1 + (2 * i) / SKILLS.length);
    const theta = Math.sqrt(SKILLS.length * Math.PI) * phi;
    return {
      text: skill,
      x: Math.cos(theta) * Math.sin(phi),
      y: Math.sin(theta) * Math.sin(phi),
      z: Math.cos(phi),
    };
  });
}

function setupInteraction() {
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
  });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    rotationY += (e.clientX - dragStartX) * 0.005;
    rotationX += (e.clientY - dragStartY) * 0.005;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
  });
  canvas.addEventListener('touchstart', (e) => {
    isDragging = true;
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;
  });
  canvas.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    rotationY += (e.touches[0].clientX - dragStartX) * 0.005;
    rotationX += (e.touches[0].clientY - dragStartY) * 0.005;
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;
  }, { passive: false });
  canvas.addEventListener('touchend', () => { isDragging = false; });
}

function startAnimation() {
  if (animationId) return;
  animate();
}

function stopAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

function animate() {
  animationId = requestAnimationFrame(animate);

  const width = canvas.width / window.devicePixelRatio;
  const height = canvas.height / window.devicePixelRatio;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;

  if (!isDragging) rotationY += autoRotateSpeed;

  ctx.clearRect(0, 0, width, height);

  const projected = spherePoints.map((point) => {
    let x = point.x * Math.cos(rotationY) - point.z * Math.sin(rotationY);
    let z = point.x * Math.sin(rotationY) + point.z * Math.cos(rotationY);
    let y = point.y;
    const tempY = y * Math.cos(rotationX) - z * Math.sin(rotationX);
    const tempZ = y * Math.sin(rotationX) + z * Math.cos(rotationX);
    y = tempY; z = tempZ;

    const scale = 1 / (1 + z * 0.3);
    return {
      text: point.text,
      x: centerX + x * radius * scale,
      y: centerY + y * radius * scale,
      z, alpha: 0.3 + (z + 1) * 0.35,
      fontSize: 10 + (z + 1) * 4,
    };
  });

  projected.sort((a, b) => a.z - b.z);

  projected.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = p.alpha * 0.15;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#FF6B00';
    ctx.fillStyle = '#FF6B00';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.fontSize * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.font = `${Math.round(p.fontSize)}px 'Inter', sans-serif`;
    ctx.fillStyle = p.z > 0 ? '#FFFFFF' : '#888888';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.text, p.x, p.y);
    ctx.restore();
  });
}
