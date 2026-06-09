// ============================================
// AUDIO — Background Voiceover Controller
// 
// PRIMARY: Plays the pre-rendered voiceover.mp3 (en-US-AndrewNeural)
// which is a consistent, high-quality young adult male voice (20-28 yrs)
// that sounds identical on every device — mobile, tablet, desktop.
//
// FALLBACK: If the MP3 fails to load or play, uses Web Speech Synthesis
// with forced male voice selection + pitch tuning. This is a last resort.
// ============================================

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let useSynthFallback = false;
let synthUtterance = null;
let isPlaying = false;
let isSuspendedByScroll = false;
let speechVoices = [];

// Pre-cache speech voices for fallback path
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

  // The audio src is now /voiceover.mp3 — a real, pre-rendered file.
  // Do NOT force useSynthFallback. Let the browser try to load it normally.

  // If the MP3 fails to load, switch to speech synthesis fallback
  audio.addEventListener('error', () => {
    console.warn('voiceover.mp3 failed to load. Switching to Speech Synthesis fallback.');
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

  // Set up playback trigger (fires once on first user interaction)
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
    start: 'top bottom',
    end: 'bottom 20%',
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
      if (visionBottom <= window.innerHeight * 0.2) {
        isSuspendedByScroll = true;
        return;
      }
    }

    if (useSynthFallback) {
      speakIntro();
    } else {
      // Always try the MP3 first — it contains the consistent male voice
      window.isAudioPlaying = true;
      audio.play().catch((err) => {
        window.isAudioPlaying = false;
        console.warn('MP3 autoplay blocked or failed, trying Speech Synthesis fallback.', err);
        useSynthFallback = true;
        speakIntro();
      });
    }
  }

  // ============================================
  // SPEECH SYNTHESIS FALLBACK
  // Only used if voiceover.mp3 fails to load/play.
  // Forces a male English voice on ALL devices.
  // ============================================
  function speakIntro() {
    window.speechSynthesis.cancel();
    window.isAudioPlaying = true;

    const text = "Hi, I am Ganesh. A technology enthusiast, entrepreneur, and AI innovator. Welcome to my digital space. Let's build something extraordinary together.";
    synthUtterance = new SpeechSynthesisUtterance(text);
    
    // Get voices — prefer cached, fallback to live query
    const rawVoices = speechVoices.length > 0 ? speechVoices : window.speechSynthesis.getVoices();
    
    // Filter to English voices only
    const englishVoices = rawVoices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
    
    // Prefer locally installed voices (Safari remote voices can fail silently)
    const localEnglish = englishVoices.filter(v => v.localService === true);
    const voices = localEnglish.length > 0 ? localEnglish : (englishVoices.length > 0 ? englishVoices : rawVoices);
    
    // ---- FORCED MALE VOICE SELECTION ----
    // These lists ensure the same male voice is picked regardless of device/browser
    const maleKeywords = [
      'david', 'mark', 'george', 'alex', 'daniel', 'fred', 'oliver', 'aaron', 'arthur', 
      'gordon', 'rishi', 'ravi', 'james', 'william', 'jack', 'harry', 'charlie', 
      'thomas', 'matt', 'robert', 'peter', 'guy', 'male', 'voice 1', 'voice 3',
      'voice1', 'voice3', 'microsoft david', 'google uk english male', 'andrew'
    ];
    const femaleKeywords = [
      'samantha', 'susan', 'zira', 'hazel', 'karen', 'moira', 'tessa', 'veena', 
      'sangeeta', 'heera', 'victoria', 'stephanie', 'fiona', 'female', 'girl', 
      'woman', 'lady', 'voice 2', 'voice 4', 'voice2', 'voice4', 'google us english', 
      'microsoft zira'
    ];

    const scoredVoices = voices.map(v => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      let score = 0;

      if (lang.startsWith('en')) score += 100;
      else score -= 200;

      for (const kw of maleKeywords) {
        if (name.includes(kw)) { score += 150; break; }
      }
      for (const kw of femaleKeywords) {
        if (name.includes(kw)) { score -= 300; break; }
      }
      if (v.localService) score += 20;

      return { voice: v, score };
    });

    scoredVoices.sort((a, b) => b.score - a.score);

    let voice = null;
    let isMaleVoice = false;
    
    if (scoredVoices.length > 0 && scoredVoices[0].score >= 200) {
      voice = scoredVoices[0].voice;
      isMaleVoice = true;
    } else if (scoredVoices.length > 0) {
      voice = scoredVoices[0].voice;
      isMaleVoice = false;
    }

    if (voice) {
      synthUtterance.voice = voice;
      console.log(`Fallback voice: ${voice.name} (${voice.lang}), male=${isMaleVoice}`);
    }
    
    // Pitch tuning: make it sound like a confident 20-28 year old male
    if (isMaleVoice) {
      const name = voice.name.toLowerCase();
      if (name.includes('david')) {
        synthUtterance.pitch = 1.15; // David sounds older, shift up
      } else if (name.includes('daniel')) {
        synthUtterance.pitch = 1.1;
      } else {
        synthUtterance.pitch = 1.0; // Most male voices are naturally in range
      }
    } else {
      // Female or unknown voice — pitch-shift down to sound male
      synthUtterance.pitch = 0.82;
    }
    
    synthUtterance.rate = 1.15; // Professional, balanced pacing

    synthUtterance.onend = () => {
      window.isAudioPlaying = false;
      if (isPlaying && !isSuspendedByScroll) {
        scrollBackToHero();
      }
    };

    window.speechSynthesis.speak(synthUtterance);
  }

  function scrollBackToHero() {
    gsap.to(window, {
      scrollTo: { y: 0, autoKill: true },
      duration: 4,
      ease: 'power2.inOut',
    });
  }
}
