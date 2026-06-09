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
function updateVoices() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    speechVoices = window.speechSynthesis.getVoices();
  }
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  updateVoices();
  window.speechSynthesis.onvoiceschanged = updateVoices;
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
    const rawVoices = speechVoices.length > 0 ? speechVoices : window.speechSynthesis.getVoices();
    
    // Filter to English voices
    const englishVoices = rawVoices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
    
    // Critical Safari Fix: Only use locally downloaded voices to prevent silent failures
    const localEnglish = englishVoices.filter(v => v.localService === true);
    const voices = localEnglish.length > 0 ? localEnglish : (englishVoices.length > 0 ? englishVoices : rawVoices);
    
    // Score all available voices to select the best English male voice
    const maleNames = [
      'david', 'mark', 'george', 'alex', 'daniel', 'fred', 'oliver', 'aaron', 'arthur', 
      'gordon', 'rishi', 'ravi', 'james', 'william', 'jack', 'harry', 'charlie', 
      'thomas', 'matt', 'robert', 'peter', 'guy', 'boy', 'man', 'male', 'voice 1', 
      'voice 3', 'voice1', 'voice3', 'natural', 'microsoft david', 'google uk english male'
    ];

    const femaleNames = [
      'samantha', 'susan', 'zira', 'hazel', 'karen', 'moira', 'tessa', 'veena', 
      'sangeeta', 'heera', 'victoria', 'stephanie', 'fiona', 'female', 'girl', 
      'woman', 'lady', 'voice 2', 'voice 4', 'voice2', 'voice4', 'google us english', 
      'microsoft zira'
    ];

    const scoredVoices = voices.map(v => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      let score = 0;

      // Primary check: Language must be English for English text
      if (lang.startsWith('en')) {
        score += 100;
      } else {
        score -= 200; // heavy penalty for non-English languages
      }

      // Check for male keywords
      for (const maleName of maleNames) {
        if (name.includes(maleName)) {
          score += 150;
          break;
        }
      }

      // Check for female keywords
      for (const femaleName of femaleNames) {
        if (name.includes(femaleName)) {
          score -= 300;
          break;
        }
      }

      // Prefer local/high-quality voices if available
      if (v.localService) {
        score += 20;
      }

      return { voice: v, score };
    });

    // Sort descending by score
    scoredVoices.sort((a, b) => b.score - a.score);

    let voice = null;
    let isMaleVoice = false;
    
    if (scoredVoices[0] && scoredVoices[0].score >= 200) {
      voice = scoredVoices[0].voice;
      isMaleVoice = true;
      console.log(`Selected male voice: ${voice.name} (${voice.lang}) with score ${scoredVoices[0].score}`);
    } else if (scoredVoices[0]) {
      voice = scoredVoices[0].voice;
      isMaleVoice = false;
      console.log(`Selected fallback voice: ${voice.name} (${voice.lang}) with score ${scoredVoices[0].score}`);
    } else {
      console.warn('Could not find any English speech voice.');
    }

    if (voice) {
      synthUtterance.voice = voice;
    }
    
    // Pitch shift fallback: if no male voice is found, lower the pitch to 0.7 to synthesize a male voice from a female voice
    synthUtterance.pitch = isMaleVoice ? 0.95 : 0.7;
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

}
