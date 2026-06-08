// ============================================
// PARTICLES — Three.js Floating Particle System
// ============================================

import * as THREE from 'three';

let scene, camera, renderer;
let particles, mouseX = 0, mouseY = 0;

export function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  // Scene setup
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50;

  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create particles
  const isMobile = window.innerWidth <= 768;
  const particleCount = isMobile ? 200 : 600;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    // Random positions in a large volume
    positions[i3] = (Math.random() - 0.5) * 100;
    positions[i3 + 1] = (Math.random() - 0.5) * 100;
    positions[i3 + 2] = (Math.random() - 0.5) * 60;

    // Random velocities
    velocities[i3] = (Math.random() - 0.5) * 0.02;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;

    // Random sizes
    sizes[i] = Math.random() * 2 + 0.5;

    // Orange-ish color palette
    const colorChoice = Math.random();
    if (colorChoice < 0.6) {
      // Primary orange
      colors[i3] = 1.0;
      colors[i3 + 1] = 0.42 + Math.random() * 0.2;
      colors[i3 + 2] = 0.0;
    } else if (colorChoice < 0.85) {
      // Secondary amber
      colors[i3] = 0.96;
      colors[i3 + 1] = 0.62 + Math.random() * 0.15;
      colors[i3 + 2] = 0.04;
    } else {
      // White highlights
      colors[i3] = 1.0;
      colors[i3 + 1] = 1.0;
      colors[i3 + 2] = 1.0;
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Custom shader material for soft glowing particles
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;

      void main() {
        vColor = color;
        vec3 pos = position;

        // Gentle floating motion
        pos.y += sin(uTime * 0.3 + position.x * 0.1) * 0.5;
        pos.x += cos(uTime * 0.2 + position.y * 0.1) * 0.3;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (50.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;

        // Distance-based alpha
        vAlpha = smoothstep(100.0, 10.0, -mvPosition.z) * 0.6;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        // Soft circular particle
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        if (dist > 0.5) discard;

        float alpha = smoothstep(0.5, 0.1, dist) * vAlpha;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Store velocities for animation
  particles.userData.velocities = velocities;

  // Mouse movement tracking
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Resize handler
  window.addEventListener('resize', onResize);

  // Start animation loop
  animate();
}

function onResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  if (!particles || !renderer || !scene || !camera) return;

  const time = performance.now() * 0.001;

  // Update time uniform
  particles.material.uniforms.uTime.value = time;

  // Subtle mouse-follow rotation
  particles.rotation.x += (mouseY * 0.02 - particles.rotation.x) * 0.02;
  particles.rotation.y += (mouseX * 0.02 - particles.rotation.y) * 0.02;

  // Animate positions
  const positions = particles.geometry.attributes.position.array;
  const velocities = particles.userData.velocities;

  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += velocities[i];
    positions[i + 1] += velocities[i + 1];
    positions[i + 2] += velocities[i + 2];

    // Boundary wrapping
    if (positions[i] > 50) positions[i] = -50;
    if (positions[i] < -50) positions[i] = 50;
    if (positions[i + 1] > 50) positions[i + 1] = -50;
    if (positions[i + 1] < -50) positions[i + 1] = 50;
  }

  particles.geometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
}
