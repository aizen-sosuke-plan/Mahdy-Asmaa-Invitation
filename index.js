/**
 * MAHDY & ASMAA WEDDING INVITATION & GAZETTE
 * Core JavaScript: Petals Canvas Engine, Page Transitions, 3D Envelope, Music & Calendar.
 */

'use strict';

// A browser refresh starts the invitation again instead of restoring details.
if (performance.getEntriesByType('navigation')[0]?.type === 'reload') {
  const restartUrl = new URL(window.location.href);
  restartUrl.hash = '';
  if (restartUrl.searchParams.get('page') === 'details') {
    restartUrl.searchParams.delete('page');
  }
  if (restartUrl.href !== window.location.href) {
    history.replaceState(null, '', restartUrl.href);
  }
  history.scrollRestoration = 'manual';
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

/* ==========================================================================
   1. WEDDING CONFIGURATION & PERSONALIZATION
   ========================================================================== */
const WEDDING = {
  couple: 'Mahdy & Asmaa',
  groom: 'Mahdy',
  bride: 'Asmaa',
  guestName: 'family & friends',
  hallName: 'Our Wedding Venue',
  city: 'Zagazig, Egypt',
  dateIso: '2026-12-31',
  dateFormatted: 'Thursday, 31 December 2026',
  mapsUrl: 'https://maps.app.goo.gl/P3dqcBVZpwsaj3HJ8?g_st=ic',
};

const $ = (id) => document.getElementById(id);
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = motionPreference.matches;

// Personalize guest name from URL ?guest=Name
const urlParams = new URLSearchParams(window.location.search);
const guestParam = urlParams.get('guest');
const guestDisplayName = (guestParam && guestParam.trim() ? guestParam.trim() : WEDDING.guestName).slice(0, 100);

// Initialize text in DOM
if ($('guest-name')) $('guest-name').textContent = guestDisplayName;
if ($('venue-title')) $('venue-title').textContent = WEDDING.hallName;
if ($('venue-city')) $('venue-city').textContent = WEDDING.city;
if ($('maps-link')) $('maps-link').href = WEDDING.mapsUrl;


/* ==========================================================================
   2. FALLING FLOWER PETALS CANVAS ENGINE (FLOWER FALL LIKE SNOW)
   ========================================================================== */
class FlowerFallingCanvas {
  constructor(canvasId) {
    this.canvas = $(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;
    this.petals = [];
    this.isRunning = false;
    this.animationId = null;
    this.gold = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim();

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      this.gold = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim();
      if (!this.isRunning) this.draw();
    });

    // Responsive petal count (fewer on mobile for 60fps performance)
    this.maxPetals = window.innerWidth < 768 ? 24 : 45;

    // Palette of delicate wedding petals: blush, rose, cream, ivory
    this.petalColors = [
      { fill: 'rgba(235, 178, 182, 0.75)', stroke: 'rgba(215, 150, 155, 0.5)' }, // soft blush
      { fill: 'rgba(242, 206, 200, 0.8)', stroke: 'rgba(224, 180, 172, 0.5)' },  // warm peach blush
      { fill: 'rgba(255, 252, 245, 0.85)', stroke: 'rgba(225, 218, 200, 0.6)' }, // ivory cream
      { fill: 'rgba(220, 158, 162, 0.7)', stroke: 'rgba(195, 130, 135, 0.5)' },  // romantic rose
      { fill: 'rgba(248, 225, 218, 0.8)', stroke: 'rgba(230, 195, 185, 0.5)' }   // champagne blossom
    ];

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });

    // Populate initial petals spread across screen
    for (let i = 0; i < this.maxPetals; i++) {
      this.petals.push(this.createPetal(true));
    }

    // Pause on hidden tab to save battery
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else if (!reducedMotion) {
        this.start();
      }
    });

    if (!reducedMotion) {
      this.start();
    } else {
      // Draw a subtle single static frame for reduced motion users
      this.draw();
    }
  }

  resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
    if (reducedMotion) this.draw();
  }

  createPetal(isInitial = false) {
    const size = 9 + Math.random() * 14;
    const colorTheme = this.petalColors[Math.floor(Math.random() * this.petalColors.length)];
    const isBlossom = Math.random() > 0.72; // Some are full 5-petal florets

    return {
      x: Math.random() * this.width,
      // Initial petals are scattered across screen; recycled petals spawn above top
      y: isInitial ? Math.random() * this.height : -30 - Math.random() * 30,
      size,
      isBlossom,
      // Snow-like gentle descent speed
      speedY: 0.7 + Math.random() * 1.3,
      // Lateral swaying (air flutter)
      swayAngle: Math.random() * Math.PI * 2,
      swaySpeed: 0.015 + Math.random() * 0.02,
      swayRadius: 20 + Math.random() * 30,
      // 2D Rotation
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.025,
      // 3D Flip (tumbling like real flower petals caught in breeze)
      flipAngle: Math.random() * Math.PI * 2,
      flipSpeed: 0.018 + Math.random() * 0.025,
      // Color & Opacity
      fill: colorTheme.fill,
      stroke: colorTheme.stroke,
    };
  }

  update() {
    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];

      // Vertical descent like soft snowfall
      p.y += p.speedY;

      // Gentle lateral sway using sine wave
      p.swayAngle += p.swaySpeed;
      p.x += Math.sin(p.swayAngle) * (p.swayRadius * 0.04) + 0.35; // gentle breeze to the right

      // Rotations
      p.rotation += p.rotationSpeed;
      p.flipAngle += p.flipSpeed;

      // Wrap around screen when falling out of viewport
      if (p.y > this.height + 30) {
        this.petals[i] = this.createPetal(false);
      }
      if (p.x > this.width + 40) {
        p.x = -30;
      } else if (p.x < -40) {
        p.x = this.width + 30;
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      const flipScale = Math.cos(p.flipAngle);

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.scale(flipScale, 1);

      if (p.isBlossom) {
        // Draw 5-petal flower blossom
        const petalCount = 5;
        this.ctx.fillStyle = p.fill;
        for (let b = 0; b < petalCount; b++) {
          this.ctx.save();
          this.ctx.rotate((b * 2 * Math.PI) / petalCount);
          this.ctx.beginPath();
          this.ctx.ellipse(0, -p.size * 0.5, p.size * 0.32, p.size * 0.48, 0, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        }
        // Gold flower center pistil
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size * 0.2, 0, Math.PI * 2);
        this.ctx.fillStyle = this.gold;
        this.ctx.fill();
      } else {
        // Draw elegant organic curved rose / cherry blossom petal
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size);
        this.ctx.bezierCurveTo(p.size * 0.75, -p.size * 0.7, p.size * 0.85, p.size * 0.35, 0, p.size);
        this.ctx.bezierCurveTo(-p.size * 0.85, p.size * 0.35, -p.size * 0.75, -p.size * 0.7, 0, -p.size);
        this.ctx.closePath();
        this.ctx.fillStyle = p.fill;
        this.ctx.fill();
        this.ctx.strokeStyle = p.stroke;
        this.ctx.lineWidth = 0.5;
        this.ctx.stroke();

        // Subtle petal vein highlight
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size * 0.7);
        this.ctx.quadraticCurveTo(p.size * 0.08, 0, 0, p.size * 0.75);
        this.ctx.strokeStyle = p.stroke;
        this.ctx.lineWidth = 0.4;
        this.ctx.stroke();
      }

      this.ctx.restore();
    }
  }

  loop() {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.loop());
  }

  start() {
    if (!this.ctx || this.isRunning || reducedMotion || document.hidden) return;
    this.isRunning = true;
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

// Instantiate falling flower petals
const flowerCanvas = new FlowerFallingCanvas('flower-canvas');

motionPreference.addEventListener('change', (event) => {
  reducedMotion = event.matches;
  if (reducedMotion) {
    flowerCanvas.stop();
    stopAutoScroll();
    if (flowerCanvas.ctx) flowerCanvas.draw();
  } else {
    flowerCanvas.start();
  }
});


/* ==========================================================================
   3. AUDIO ENGINE (W-song.mp3 WITH SYNTHESIZER FALLBACK)
   ========================================================================== */
let audioContext, masterGain, musicTimer;
let musicActive = false;
let musicBusy = false;
const activeOscillators = new Set();

let bgAudio = null;
try {
  bgAudio = new Audio('W-song.mp3');
  bgAudio.loop = true;
  bgAudio.volume = 0.65;
} catch (e) {
  bgAudio = null;
}

const chords = [
  [146.83, 220, 293.66, 369.99],
  [110, 164.81, 220, 277.18],
  [123.47, 185, 246.94, 293.66],
  [92.5, 138.59, 185, 220],
  [98, 146.83, 196, 246.94],
  [146.83, 220, 293.66, 369.99],
  [98, 146.83, 196, 246.94],
  [110, 164.81, 220, 277.18],
];
const melody = [587.33, 554.37, 493.88, 440, 392, 369.99, 392, 440];
const beat = 0.55;
const phraseDuration = chords.length * 4 * beat;

function playNote(frequency, start, duration, volume) {
  if (!audioContext || audioContext.state !== 'running') return;

  const voice = audioContext.createGain();
  voice.gain.setValueAtTime(0, start);
  voice.gain.linearRampToValueAtTime(volume, start + 0.04);
  voice.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  voice.connect(masterGain);

  [1, 2, 3].forEach((harmonic, i) => {
    const oscillator = audioContext.createOscillator();
    const partial = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency * harmonic;
    partial.gain.value = [1, 0.15, 0.035][i];
    oscillator.connect(partial);
    partial.connect(voice);
    activeOscillators.add(oscillator);

    oscillator.start(start);
    oscillator.stop(start + duration + 0.04);
    oscillator.onended = () => {
      activeOscillators.delete(oscillator);
      oscillator.disconnect();
      partial.disconnect();
    };
  });

  window.setTimeout(() => {
    try { voice.disconnect(); } catch {}
  }, Math.max(0, (start - audioContext.currentTime + duration + 0.1) * 1000));
}

function schedulePhrase(start) {
  chords.forEach((chord, bar) => {
    const t = start + bar * 4 * beat;
    playNote(chord[0] / 2, t, 3.4, 0.24);
    [0, 1, 2, 3, 2, 1, 2, 3].forEach((note, step) =>
      playNote(chord[note] * 2, t + (step * beat) / 2, 2.2, 0.13)
    );
    playNote(melody[bar], t, 3.1, 0.11);
    playNote(melody[(bar + 1) % melody.length], t + 2 * beat, 2.5, 0.09);
  });
}

function updateMusicUI() {
  const toggleBtns = document.querySelectorAll('.music-toggle-btn');
  toggleBtns.forEach((btn) => {
    btn.setAttribute('aria-pressed', String(musicActive));
    btn.setAttribute('aria-label', musicActive ? 'Pause background music' : 'Play background music');
    const label = btn.querySelector('.music-label-text');
    if (label) label.textContent = musicActive ? 'Music on' : 'Music off';
  });
}

async function startMusic() {
  if (musicActive || musicBusy) return;
  musicBusy = true;

  // Try playing custom wedding audio track (W-song.mp3)
  if (bgAudio) {
    try {
      await bgAudio.play();
      musicActive = true;
      musicBusy = false;
      if ($('music-note')) {
        $('music-note').textContent = 'A little music, a little magic. You can pause it above.';
      }
      updateMusicUI();
      return;
    } catch (e) {
      // Audio playback failed (e.g. file missing or autoplay restrictions), fall through to synthesizer
    }
  }

  try {
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) throw new Error('Audio unavailable');

    if (!audioContext) {
      audioContext = new AudioEngine();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0;
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2200;
      masterGain.connect(filter);
      filter.connect(audioContext.destination);
    }

    await audioContext.resume();
    if (audioContext.state !== 'running') throw new Error('Audio suspended');

    masterGain.gain.cancelScheduledValues(audioContext.currentTime);
    masterGain.gain.setTargetAtTime(0.18, audioContext.currentTime, 0.18);
    musicActive = true;

    let nextPhrase = audioContext.currentTime + 0.08;
    schedulePhrase(nextPhrase);
    nextPhrase += phraseDuration;

    musicTimer = window.setInterval(() => {
      if (nextPhrase < audioContext.currentTime + 1) {
        nextPhrase = Math.max(nextPhrase, audioContext.currentTime + 0.05);
        schedulePhrase(nextPhrase);
        nextPhrase += phraseDuration;
      }
    }, 300);

    if ($('music-note')) {
      $('music-note').textContent = 'A little music, a little magic. You can pause it above.';
    }
  } catch (err) {
    musicActive = false;
    if ($('music-note')) {
      $('music-note').textContent = "Music couldn't start. Tap the music button to try again.";
    }
  } finally {
    musicBusy = false;
    updateMusicUI();
  }
}

function pauseMusic() {
  if (bgAudio) {
    try { bgAudio.pause(); } catch {}
  }

  window.clearInterval(musicTimer);
  activeOscillators.forEach((oscillator) => {
    try { oscillator.stop(); } catch {}
  });
  activeOscillators.clear();

  if (audioContext && masterGain) {
    masterGain.gain.cancelScheduledValues(audioContext.currentTime);
    masterGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.07);
  }
  musicActive = false;
  if ($('music-note')) {
    $('music-note').textContent = 'Music paused. You can turn it on above.';
  }
  updateMusicUI();
}

function toggleMusic() {
  if (musicActive) {
    pauseMusic();
  } else {
    startMusic();
  }
}

// Bind music buttons
document.querySelectorAll('.music-toggle-btn').forEach((btn) => {
  btn.addEventListener('click', toggleMusic);
});


/* ==========================================================================
   4. TWO-PAGE TRANSITION, ENVELOPE & AUTO-SCROLL CONTROLLER
   ========================================================================== */
let invitationOpened = false;
let isTransitioning = false;

const pageInvitation = $('page-invitation');
const pageDetails = $('page-details');
const envelope = $('envelope');
const openButton = $('open-invitation');

/* --- Auto-Scroll Engine --- */
let autoScrollActive = false;
let autoScrollId = null;
let userInteracting = false;
let userResumeTimer = null;
let lastScrollTimestamp = 0;

// Temporarily suspend auto-scroll when user touches screen, scrolls with mouse/trackpad, or uses keys
function onUserScrollInteraction() {
  if (!autoScrollActive) return;
  userInteracting = true;

  if (userResumeTimer) {
    clearTimeout(userResumeTimer);
  }

  // Resume auto-scrolling smoothly after 2.8s of no user intervention
  userResumeTimer = window.setTimeout(() => {
    userInteracting = false;
    lastScrollTimestamp = performance.now();
  }, 2800);
}

['wheel', 'touchstart', 'touchmove', 'pointerdown', 'mousedown'].forEach((evt) => {
  window.addEventListener(evt, onUserScrollInteraction, { passive: true });
});

window.addEventListener('keydown', (e) => {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space'].includes(e.code)) {
    onUserScrollInteraction();
  }
}, { passive: true });

function startAutoScroll() {
  if (reducedMotion) return;
  stopAutoScroll();
  autoScrollActive = true;
  userInteracting = false;

  // Ensure scroll is at the very top of details page
  window.scrollTo(0, 0);

  // Quick initial pause (250ms) so reader notices the opening heading before scrolling begins
  window.setTimeout(() => {
    if (!autoScrollActive) return;

    lastScrollTimestamp = performance.now();
    const scrollSpeed = 115; // Faster scroll speed (~115px/sec)

    function scrollStep(timestamp) {
      if (!autoScrollActive) return;

      // When the user wants to scroll by themselves, let them have 100% free control
      if (userInteracting) {
        lastScrollTimestamp = timestamp;
        autoScrollId = requestAnimationFrame(scrollStep);
        return;
      }

      const elapsed = Math.min((timestamp - lastScrollTimestamp) / 1000, 0.1);
      lastScrollTimestamp = timestamp;

      const maxScroll = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      ) - window.innerHeight;

      if (window.scrollY < maxScroll - 2) {
        window.scrollBy(0, scrollSpeed * elapsed);
        autoScrollId = requestAnimationFrame(scrollStep);
      } else {
        stopAutoScroll();
      }
    }

    autoScrollId = requestAnimationFrame(scrollStep);
  }, 250);
}

function stopAutoScroll() {
  autoScrollActive = false;
  userInteracting = false;
  if (userResumeTimer) {
    clearTimeout(userResumeTimer);
    userResumeTimer = null;
  }
  if (autoScrollId) {
    cancelAnimationFrame(autoScrollId);
    autoScrollId = null;
  }
}

/**
 * Switch from Page 1 (Invitation Cover) to Page 2 (Details) with smooth animation
 */
function transitionToDetails() {
  if (isTransitioning) return;
  isTransitioning = true;

  // 1. Exit Page 1
  pageInvitation.classList.add('is-exiting');

  // Update URL hash
  if (window.location.hash !== '#details') {
    history.replaceState(null, '', '#details');
  }

  // 2. Prepare Page 2
  pageDetails.classList.remove('is-hidden');
  pageDetails.classList.add('is-entering');

  // Reset scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });

  // 3. Complete transition after CSS animation finishes
  const transitionDuration = reducedMotion ? 20 : 650;
  window.setTimeout(() => {
    pageInvitation.classList.add('is-hidden');
    pageInvitation.classList.remove('is-exiting');

    pageDetails.classList.remove('is-entering');
    isTransitioning = false;

    // Focus heading for accessibility
    const detailsTitle = $('details-title');
    if (detailsTitle) detailsTitle.focus?.({ preventScroll: true });

    // REQUIREMENT: Custom audio plays ONLY after the opening transition completely finishes
    startMusic();

    // REQUIREMENT: Automatically and smoothly start scrolling down through content without user intervention
    startAutoScroll();
  }, transitionDuration);
}

/**
 * Handle opening the 3D envelope and progressing to the details page
 */
function handleOpenInvitation() {
  if (isTransitioning) return;

  // NOTE: Audio playback must NOT start here; it starts strictly after the transition finishes!

  if (!invitationOpened) {
    invitationOpened = true;

    // Trigger 3D envelope fold open
    envelope.classList.add('is-open');
    envelope.setAttribute('aria-expanded', 'true');
    openButton.setAttribute('aria-expanded', 'true');
    openButton.disabled = true;
    envelope.disabled = true;

    const label = $('open-label');
    if (label) label.textContent = 'Opening your invitation…';

    // Allow user to witness the 3D envelope opening animation, then transition
    const delay = reducedMotion ? 50 : 850;
    window.setTimeout(() => {
      openButton.disabled = false;
      envelope.disabled = false;
      if (label) label.textContent = 'View wedding details';
      transitionToDetails();
    }, delay);
  } else {
    transitionToDetails();
  }
}

// Bind envelope and open button
if (openButton) openButton.addEventListener('click', handleOpenInvitation);
if (envelope) envelope.addEventListener('click', handleOpenInvitation);

// Support direct link to details via #details if page loaded with it
if (window.location.hash === '#details' || window.location.hash === '#invitation' || urlParams.get('page') === 'details') {
  pageInvitation.classList.add('is-hidden');
  pageDetails.classList.remove('is-hidden');
  invitationOpened = true;
  if (envelope) envelope.classList.add('is-open');
  startMusic();
  startAutoScroll();
}


/* ==========================================================================
   5. DECEMBER 2026 CALENDAR GENERATOR
   ========================================================================== */
function buildDecember2026Calendar() {
  const year = 2026;
  const month = 11; // 0-indexed: 11 = December
  // Offset for Monday as first column (0 = Mon, 6 = Sun)
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((offset + totalDays) / 7) * 7;
  let html = '';

  for (let i = 0; i < totalCells; i++) {
    if (i % 7 === 0) html += '<tr>';
    const date = new Date(year, month, i - offset + 1);
    const outside = date.getMonth() !== month;
    const isWeddingDay = !outside && date.getDate() === 31;
    const isoString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    html += `<td${outside ? ' class="outside"' : ''}>`;
    html += `<time datetime="${isoString}"${
      isWeddingDay
        ? ' class="wedding-day" aria-label="31 December 2026, our wedding day"'
        : ''
    }>${date.getDate()}</time>`;
    html += '</td>';

    if (i % 7 === 6) html += '</tr>';
  }
  return html;
}

const calendarTbody = $('calendar-days');
if (calendarTbody) {
  calendarTbody.innerHTML = buildDecember2026Calendar();
}


/* ==========================================================================
   6. ADD TO CALENDAR (.ICS EXPORT)
   ========================================================================== */
function escapeCalendarText(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function generateIcsFile() {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');

  const location = (WEDDING.hallName ? WEDDING.hallName + ', ' : '') + WEDDING.city;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mahdy and Asmaa//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:mahdy-asmaa-20261231@wedding-invitation',
    'DTSTAMP:' + stamp,
    'DTSTART;VALUE=DATE:20261231',
    'DTEND;VALUE=DATE:20270101',
    "SUMMARY:Mahdy & Asmaa's Wedding",
    'LOCATION:' + escapeCalendarText(location),
    'DESCRIPTION:' + escapeCalendarText('Celebrate the wedding of Mahdy & Asmaa. Venue: ' + WEDDING.mapsUrl),
    'URL:' + WEDDING.mapsUrl,
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ];

  // Standard iCalendar line folding (max 75 bytes)
  return lines
    .map((line) => {
      const encoder = new TextEncoder();
      let folded = '';
      let part = '';
      let size = 0;
      for (const char of line) {
        const length = encoder.encode(char).length;
        if (size + length > 75) {
          folded += part + '\r\n';
          part = ' ';
          size = 1;
        }
        part += char;
        size += length;
      }
      return folded + part;
    })
    .join('\r\n');
}

const saveDateBtn = $('save-date');
if (saveDateBtn) {
  saveDateBtn.addEventListener('click', () => {
    const icsContent = generateIcsFile();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mahdy-and-asmaa-wedding.ics';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);

    const statusEl = $('calendar-status');
    if (statusEl) {
      statusEl.textContent = 'Your calendar invitation has been downloaded.';
    }
  });
}
