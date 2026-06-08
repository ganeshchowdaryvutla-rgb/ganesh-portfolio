// ============================================
// AUDIO — Background Voiceover Controller
// ============================================

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let useSynthFallback = false;
let synthUtterance = null;
let isPlaying = false;
let isSuspendedByScroll = false;
let speechVoices = [];

// Pre-load speech voices immediately on script load to bypass async fetching delays on page load
if (typeof window !== 'undefined' && window.speechSynthesis) {
  speechVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    speechVoices = window.speechSynthesis.getVoices();
  };
}

window.isAudioPlaying = false;

export function initAudio() {
  const audio = document.getElementById('bg-audio');
  if (!audio) return;

  // Set fallback by default if the source is a placeholder/example URL to prevent async error loading triggers
  if (audio.src && (audio.src.includes('example.com') || audio.src.includes('invalid') || !audio.src)) {
    useSynthFallback = true;
  }

  // Intercept loading error
  audio.addEventListener('error', () => {
    console.warn('Audio URL failed to load. Switching to Web Speech Synthesis fallback.');
    useSynthFallback = true;
    if (isPlaying && !isSuspendedByScroll) {
      speakIntro();
    }
  });

  // Scroll back to top when audio finishes playing naturally
  audio.addEventListener('ended', () => {
    window.isAudioPlaying = false;
    if (isPlaying && !isSuspendedByScroll) {
      scrollBackToHero();
    }
  });

  // Set up playback trigger
  let playbackStarted = false;
  const triggerPlaybackOnce = () => {
    if (playbackStarted) return;
    playbackStarted = true;
    startPlayback();
  };

  // Bind to global interaction helper
  window.triggerAudioPlayback = triggerPlaybackOnce;

  // If user already clicked/interacted during loader screen, start immediately
  if (window.hasUserInteracted) {
    triggerPlaybackOnce();
  }

  // ScrollTrigger to pause voiceover outside of Hero & Vision sections
  ScrollTrigger.create({
    trigger: '#vision',
    start: 'top bottom', // Start monitoring when Vision section enters the viewport
    end: 'bottom 20%', // Pause when scrolling down past the bottom of the Vision section
    onLeave: () => {
      window.isAudioPlaying = false;
      if (isPlaying && !isSuspendedByScroll) {
        isSuspendedByScroll = true;
        if (useSynthFallback) {
          window.speechSynthesis.cancel();
        } else {
          audio.pause();
        }
      }
    },
    onEnterBack: () => {
      if (isPlaying && isSuspendedByScroll) {
        isSuspendedByScroll = false;
        window.isAudioPlaying = true;
        if (useSynthFallback) {
          speakIntro();
        } else {
          audio.play().catch((err) => {
            window.isAudioPlaying = false;
            console.log('Bypassed scroll resume block:', err);
          });
        }
      }
    }
  });

  function startPlayback() {
    isPlaying = true;

    // Only start active audio if we are currently looking at Hero or Vision sections
    const vision = document.getElementById('vision');
    if (vision) {
      const visionBottom = vision.getBoundingClientRect().bottom;
      // If bottom of Vision is scrolled past the top 20% of viewport, suspend it
      if (visionBottom <= window.innerHeight * 0.2) {
        isSuspendedByScroll = true;
        return;
      }
    }

    if (useSynthFallback) {
      speakIntro();
    } else {
      window.isAudioPlaying = true;
      audio.play().catch((err) => {
        window.isAudioPlaying = false;
        console.warn('Autoplay blocked or audio failed, trying fallback speech.', err);
        useSynthFallback = true;
        speakIntro();
      });
    }
  }

  function speakIntro() {
    window.speechSynthesis.cancel();

    // Trigger synchronously without setTimeout to avoid breaking the user-interaction call stack on iOS/Android
    window.isAudioPlaying = true;
    const text = "Hi, I am Ganesh. A technology enthusiast, entrepreneur, and AI innovator. Welcome to my digital space. Let's build something extraordinary together.";
    synthUtterance = new SpeechSynthesisUtterance(text);
    
    // Use cached speechVoices array if available, otherwise call getVoices()
    const voices = speechVoices.length > 0 ? speechVoices : window.speechSynthesis.getVoices();
    
    // Look for a high-quality English male voice
    let voice = voices.find(v => {
      const name = v.name.toLowerCase();
      return (
        name.includes('male') || 
        name.includes('david') || 
        name.includes('mark') || 
        name.includes('george') || 
        name.includes('alex') || 
        name.includes('daniel') || 
        name.includes('fred') ||
        name.includes('oliver') ||
        name.includes('voice 1') || // Siri US/India Male
        name.includes('voice 3')    // Siri US Male
      ) && v.lang.startsWith('en');
    });

    // Fallback if no male voice is found
    if (!voice) {
      voice = voices.find(v => 
        (v.name.includes('Google US English') || v.lang.startsWith('en')) &&
        !v.name.includes('Low')
      );
    }

    if (voice) {
      synthUtterance.voice = voice;
    }
    
    synthUtterance.pitch = 0.95;
    synthUtterance.rate = 1.38; // Even faster, highly responsive conversational speed flow
    
    synthUtterance.onend = () => {
      window.isAudioPlaying = false;
      // If ended naturally (not cancelled by scroll suspension)
      if (isPlaying && !isSuspendedByScroll) {
        scrollBackToHero();
      }
    };

    window.speechSynthesis.speak(synthUtterance);
  }

  function scrollBackToHero() {
    // Smoothly scroll down back to the hero section (top)
    // autoKill: true allows user interaction to instantly cancel this auto-scroll
    gsap.to(window, {
      scrollTo: { y: 0, autoKill: true },
      duration: 4,
      ease: 'power2.inOut',
    });
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}
