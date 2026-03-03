// State Management
const state = {
    timeLeft: 25 * 60,
    totalTime: 25 * 60,
    isRunning: false,
    mode: 'focus', // focus, shortBreak, longBreak
    sessionCount: 1,
    totalSessions: 4,
    timerId: null
};

// Configuration
const MODES = {
    focus: { time: 25 * 60, label: 'Focus Time' },
    shortBreak: { time: 5 * 60, label: 'Short Break' },
    longBreak: { time: 15 * 60, label: 'Long Break' }
};

const CIRCUMFERENCE = 339.292;

// Audio Configuration
// Using YouTube Live Streams for stable, royalty-compliant Lofi audio
const YOUTUBE_VIDEO_IDS = {
    focus: 'jfKfPfyJRdk', // Lofi Girl (beats to relax/study to)
    break: '4xDzrJKXOOY'  // Synthwave Radio (beats to chill/game to)
};

let youtubePlayer;
let isYoutubeReady = false;

// YouTube API Initialization callback
window.onYouTubeIframeAPIReady = function () {
    youtubePlayer = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: YOUTUBE_VIDEO_IDS.focus,
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady
        }
    });
};

function onPlayerReady(event) {
    isYoutubeReady = true;
    youtubePlayer.setVolume(20); // Default volume 20%
}

// DOM Elements
const timerDisplay = document.getElementById('timer-display');
const progressCircle = document.getElementById('progress-circle');
const toggleBtn = document.getElementById('toggle-btn');
const toggleIcon = document.getElementById('toggle-icon');
const resetBtn = document.getElementById('reset-btn');
const skipBtn = document.getElementById('skip-btn');
const statusText = document.getElementById('status-text');
const sessionText = document.getElementById('session-text');
const settingsBtn = document.getElementById('settings-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const fullscreenIcon = document.getElementById('fullscreen-icon');
const clockToggleBtn = document.getElementById('clock-toggle-btn');
const hugeClockContainer = document.getElementById('huge-clock-container');
const hugeClockDisplay = document.getElementById('huge-clock-display');
const hugeDateDisplay = document.getElementById('huge-date-display');

// Wake Lock
let wakeLock = null;

// Settings Elements
const settingsOverlay = document.getElementById('settings-overlay');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const focusInput = document.getElementById('focus-time-input');
const shortBreakInput = document.getElementById('short-break-input');
const longBreakInput = document.getElementById('long-break-input');
const volumeSlider = document.getElementById('volume-slider');

// Ambient Screensaver Elements
const ambientBackgrounds = document.getElementById('ambient-backgrounds');
const blob1 = document.getElementById('blob-1');
const blob2 = document.getElementById('blob-2');
const mainHeader = document.getElementById('main-header');
const timerControls = document.getElementById('timer-controls');
const mainFooter = document.getElementById('main-footer');

// Screensaver State
let inactivityTimer = null;
let isScreensaverActive = false;
let screensaverMoveInterval = null;
const INACTIVITY_TIMEOUT = 60000; // 1 minute

// Initialization
function init() {
    // Set initial volume
    if (isYoutubeReady && youtubePlayer && typeof youtubePlayer.setVolume === 'function') {
        youtubePlayer.setVolume(20); // Default volume 20%
    }
    updateDisplay();
    setupEventListeners();
}

function setupEventListeners() {
    toggleBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);
    skipBtn.addEventListener('click', skipSession);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    clockToggleBtn.addEventListener('click', toggleClock);

    // Visibility Change for Wake Lock
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Settings Logic
    settingsBtn.addEventListener('click', openSettings);
    closeSettingsBtn.addEventListener('click', closeSettings);
    settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) closeSettings();
    });

    // Inputs
    focusInput.addEventListener('change', updateSettings);
    shortBreakInput.addEventListener('change', updateSettings);
    longBreakInput.addEventListener('change', updateSettings);
    volumeSlider.addEventListener('input', (e) => {
        const vol = e.target.value;
        if (isYoutubeReady && youtubePlayer && typeof youtubePlayer.setVolume === 'function') {
            youtubePlayer.setVolume(vol * 100);
        }
    });

    // Screensaver Triggers (Reset on interaction)
    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
        document.addEventListener(evt, resetInactivityTimer);
    });

    // Initial start of inactivity observer
    resetInactivityTimer();
}

function resetInactivityTimer() {
    // Dismiss screensaver if active
    if (isScreensaverActive) {
        hideScreensaver();
    }

    clearTimeout(inactivityTimer);

    // Only start inactivity timer if not in settings or timer is actually running (optional preference: can show anytime)
    // For now, let's allow it anytime after 1 minute of doing nothing
    inactivityTimer = setTimeout(showScreensaver, INACTIVITY_TIMEOUT);
}

function showScreensaver() {
    isScreensaverActive = true;

    // Show ambient background
    ambientBackgrounds.classList.remove('opacity-0');
    ambientBackgrounds.classList.add('opacity-100');

    // UI elements stay visible per user request

    // Initiate gentle floating animation to prevent burn-in for backgrounds
    // Trigger immediately avoiding CSS transition glitch on first move
    moveScreensaverBackgrounds();
    // Move every 10 seconds allowing CSS to animate between states smoothly
    screensaverMoveInterval = setInterval(moveScreensaverBackgrounds, 10000);
}

function hideScreensaver() {
    isScreensaverActive = false;

    // Hide ambient background
    ambientBackgrounds.classList.remove('opacity-100');
    ambientBackgrounds.classList.add('opacity-0');

    // UI elements naturally stay visible

    clearInterval(screensaverMoveInterval);
}

function moveScreensaverBackgrounds() {
    // Random translation within a safe bounds (larger bounds for background blobs)
    const maxX1 = window.innerWidth * 0.4;
    const maxY1 = window.innerHeight * 0.4;

    const randomX1 = (Math.random() * 2 - 1) * maxX1;
    const randomY1 = (Math.random() * 2 - 1) * maxY1;

    blob1.style.transform = `translate(calc(-50% + ${randomX1}px), calc(-50% + ${randomY1}px)) scale(${1 + Math.random() * 0.5})`;

    const maxX2 = window.innerWidth * 0.5;
    const maxY2 = window.innerHeight * 0.5;

    const randomX2 = (Math.random() * 2 - 1) * maxX2;
    const randomY2 = (Math.random() * 2 - 1) * maxY2;

    blob2.style.transform = `translate(calc(-50% + ${randomX2}px), calc(-50% + ${randomY2}px)) scale(${1 + Math.random() * 0.5})`;
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((e) => {
            console.log(`Error attempting to enable fullscreen mode: ${e.message} (${e.name})`);
        });
        fullscreenIcon.textContent = 'fullscreen_exit';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            fullscreenIcon.textContent = 'fullscreen';
        }
    }
}

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        fullscreenIcon.textContent = 'fullscreen';
    } else {
        fullscreenIcon.textContent = 'fullscreen_exit';
    }
});

let clockInterval = null;
let isClockVisible = false;

function toggleClock() {
    isClockVisible = !isClockVisible;
    if (isClockVisible) {
        hugeClockContainer.classList.remove('hidden');
        hugeClockContainer.classList.add('flex');
        clockToggleBtn.classList.add('text-primary');
        updateClock(); // Initial update immediately
        clockInterval = setInterval(updateClock, 1000);
    } else {
        hugeClockContainer.classList.add('hidden');
        hugeClockContainer.classList.remove('flex');
        clockToggleBtn.classList.remove('text-primary');
        clearInterval(clockInterval);
    }
}

function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    hugeClockDisplay.textContent = timeString;

    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const day = days[now.getDay()];
    hugeDateDisplay.textContent = `${year}年 ${month}月 ${date}日, ${day}曜日`;
}

function openSettings() {
    settingsOverlay.classList.remove('pointer-events-none', 'opacity-0');
    settingsModal.classList.remove('scale-95');
    settingsModal.classList.add('scale-100');
}

function closeSettings() {
    settingsOverlay.classList.add('pointer-events-none', 'opacity-0');
    settingsModal.classList.remove('scale-100');
    settingsModal.classList.add('scale-95');
}

function updateSettings() {
    const focusVal = parseInt(focusInput.value);
    const shortVal = parseInt(shortBreakInput.value);
    const longVal = parseInt(longBreakInput.value);

    if (focusVal > 0) MODES.focus.time = focusVal * 60;
    if (shortVal > 0) MODES.shortBreak.time = shortVal * 60;
    if (longVal > 0) MODES.longBreak.time = longVal * 60;

    if (!state.isRunning) {
        // Only update current time if we are in that mode and stopped
        if (state.mode === 'focus') state.totalTime = MODES.focus.time;
        if (state.mode === 'shortBreak') state.totalTime = MODES.shortBreak.time;
        if (state.mode === 'longBreak') state.totalTime = MODES.longBreak.time;

        state.timeLeft = state.totalTime;
        updateDisplay();
    }
}

function toggleTimer() {
    if (state.isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    state.isRunning = true;
    toggleIcon.textContent = 'pause';
    // Keeping button primary color as requested
    // toggleBtn.classList.replace('bg-primary', 'bg-amber-500');
    // toggleBtn.classList.replace('shadow-primary/30', 'shadow-amber-500/30');

    // Request Wake Lock
    requestWakeLock();

    // Play Current Audio
    if (isYoutubeReady && youtubePlayer && typeof youtubePlayer.playVideo === 'function') {
        youtubePlayer.playVideo();
    }

    // Safety clear to prevent ghost intervals
    if (state.timerId) clearInterval(state.timerId);

    state.timerId = setInterval(() => {
        if (state.timeLeft > 0) {
            state.timeLeft--;
            updateDisplay();
        } else {
            completeSession();
        }
    }, 1000);
}

function pauseTimer() {
    state.isRunning = false;
    toggleIcon.textContent = 'play_arrow';
    // toggleBtn.classList.replace('bg-amber-500', 'bg-primary');
    // toggleBtn.classList.replace('shadow-amber-500/30', 'shadow-primary/30');
    clearInterval(state.timerId);

    // Release Wake Lock
    releaseWakeLock();

    // Pause Audio
    if (isYoutubeReady && youtubePlayer && typeof youtubePlayer.pauseVideo === 'function') {
        youtubePlayer.pauseVideo();
    }
}

function stopAudio() {
    if (isYoutubeReady && youtubePlayer && typeof youtubePlayer.stopVideo === 'function') {
        youtubePlayer.stopVideo();
    }
}

function switchAudioSource(newMode, autoStart = false) {
    if (!isYoutubeReady || !youtubePlayer || typeof youtubePlayer.loadVideoById !== 'function') return;

    // Switch video ID based on mode
    let videoIdToLoad;
    if (newMode === 'focus') {
        videoIdToLoad = YOUTUBE_VIDEO_IDS.focus;
    } else {
        videoIdToLoad = YOUTUBE_VIDEO_IDS.break;
    }

    // Attempt to load and play if timer is running or auto-starting, else cue it
    if (state.isRunning || autoStart) {
        youtubePlayer.loadVideoById({ videoId: videoIdToLoad });
    } else {
        youtubePlayer.cueVideoById({ videoId: videoIdToLoad });
    }
}

function resetTimer() {
    pauseTimer();
    state.timeLeft = state.totalTime;
    updateDisplay();
}

function completeSession() {
    state.isRunning = false;
    clearInterval(state.timerId);
    toggleIcon.textContent = 'play_arrow';

    // Determine next mode
    let nextMode = 'focus';
    let shouldAutoStart = false;

    if (state.mode === 'focus') {
        // Focus -> Break
        if (state.sessionCount % 4 === 0) {
            nextMode = 'longBreak';
        } else {
            nextMode = 'shortBreak';
        }
        // Requirement: Auto-start timer when transitioning to break
        shouldAutoStart = true;
    } else {
        // Break -> Focus
        if (state.mode === 'longBreak') {
            state.sessionCount = 1;
        } else {
            state.sessionCount++;
        }
        nextMode = 'focus';
        // Manual start for Focus
        shouldAutoStart = false;
    }

    // Switch Logic & Audio
    switchMode(nextMode, shouldAutoStart);

    if (shouldAutoStart) {
        startTimer();
    } else {
        stopAudio();
    }
}

function skipSession() {
    completeSession();
}

function switchMode(newMode, autoStart = false) {
    state.mode = newMode;
    state.totalTime = MODES[newMode].time;
    state.timeLeft = state.totalTime;

    // Handle Audio Switching
    switchAudioSource(newMode, autoStart);

    updateDisplay();
}

function updateDisplay() {
    const minutes = Math.floor(state.timeLeft / 60);
    const seconds = state.timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    timerDisplay.textContent = timeString;

    const progress = state.timeLeft / state.totalTime;
    const offset = CIRCUMFERENCE - (progress * CIRCUMFERENCE);
    progressCircle.style.strokeDashoffset = offset;

    const statusLabel = MODES[state.mode].label;
    statusText.textContent = statusLabel;

    if (state.mode === 'focus') {
        sessionText.textContent = `Session ${state.sessionCount} of ${state.totalSessions}`;
    } else {
        sessionText.textContent = 'Take a break';
    }
}

// Duplicate screensaver block removed

// Wake Lock Functions
async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            wakeLock.addEventListener('release', () => {
                // Lock released
            });
        } catch (err) {
            console.error(`${err.name}, ${err.message}`);
        }
    }
}

function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release()
            .then(() => {
                wakeLock = null;
            })
            .catch(err => console.error(err));
    }
}

function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && state.isRunning) {
        requestWakeLock();
    }
}

// Start
init();
