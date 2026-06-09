// ============================================
// LOADER — Premium Loading Screen with Frame Preload
// ============================================

const TOTAL_FRAMES = 155;
const FRAME_PATH = '/frames/ezgif-frame-';

// Store loaded frames globally
export const frames = [];

export function initLoader() {
  return new Promise((resolve) => {
    const loaderScreen = document.getElementById('loader-screen');
    const progressBar = document.getElementById('loader-progress-bar');
    const percentText = document.getElementById('loader-percent');
    const brandLetters = document.querySelectorAll('#loader-brand span');

    // Animate brand letters in
    brandLetters.forEach((letter, i) => {
      setTimeout(() => {
        letter.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        letter.style.opacity = '1';
        letter.style.transform = 'translateY(0)';
      }, i * 100 + 200);
    });

    let loaded = 0;

    function updateProgress() {
      loaded++;
      const percent = Math.round((loaded / TOTAL_FRAMES) * 100);
      progressBar.style.width = `${percent}%`;
      percentText.textContent = `${percent}%`;

      if (loaded >= TOTAL_FRAMES) {
        // Hide progress bar and percent
        setTimeout(() => {
          const progressContainer = progressBar.parentElement;
          if (progressContainer) {
            progressContainer.style.opacity = '0';
            progressContainer.style.transition = 'opacity 0.3s ease';
          }
          percentText.style.opacity = '0';
          percentText.style.transition = 'opacity 0.3s ease';
          
          setTimeout(() => {
            if (progressContainer) progressContainer.style.display = 'none';
            percentText.style.display = 'none';
            
            // Create Enter button
            const enterBtn = document.createElement('button');
            enterBtn.id = 'loader-enter-btn';
            enterBtn.className = 'loader-enter-btn';
            enterBtn.textContent = 'ENTER PORTFOLIO';
            
            loaderScreen.appendChild(enterBtn);
            
            enterBtn.addEventListener('click', () => {
              // Mark user interaction as active
              window.hasUserInteracted = true;
              
              // Trigger audio playback synchronously in this user gesture thread
              if (typeof window.triggerAudioPlayback === 'function') {
                window.triggerAudioPlayback();
              }
              
              loaderScreen.classList.add('hidden');
              resolve();
            });
          }, 300);
        }, 400);
      }
    }

    // Preload all frames
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const num = String(i).padStart(3, '0');
      img.src = `${FRAME_PATH}${num}.jpg`;
      img.onload = updateProgress;
      img.onerror = updateProgress; // Don't block on missing frames
      frames[i - 1] = img;
    }
  });
}
