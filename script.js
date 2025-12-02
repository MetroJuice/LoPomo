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
const focusAudio = new Audio('https://stream.zeno.fm/0r0xa792kwzuv');
// "Another audio" for break - Using a track from Free Music Archive as nature/ambient wasn't available via stable hotlink.
// Users can replace this URL with any direct MP3/Stream URL.
const breakAudio = new Audio('https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3');

// Configure Audio
focusAudio.loop = true;
focusAudio.crossOrigin = "anonymous";
breakAudio.loop = true;
breakAudio.crossOrigin = "anonymous";

let currentAudio = focusAudio;

// DOM Elements
const timerDisplay = document.getElementById('timer-display');
const progressCircle = document.getElementById('progress-circle');
const toggleBtn = document.getElementById('toggle-btn');
const toggleIcon = document.getElementById('toggle-icon');
const skipBtn = document.getElementById('skip-btn');
const statusText = document.getElementById('status-text');
const sessionText = document.getElementById('session-text');
const settingsBtn = document.getElementById('settings-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const fullscreenIcon = document.getElementById('fullscreen-icon');

// Settings Elements
const settingsOverlay = document.getElementById('settings-overlay');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const focusInput = document.getElementById('focus-time-input');
const shortBreakInput = document.getElementById('short-break-input');
const longBreakInput = document.getElementById('long-break-input');
const volumeSlider = document.getElementById('volume-slider');

// Initialization
function init() {
    // Set initial volume
    currentAudio.volume = 0.5;
    updateDisplay();
    setupEventListeners();
}

function setupEventListeners() {
    toggleBtn.addEventListener('click', toggleTimer);
    skipBtn.addEventListener('click', skipSession);
    fullscreenBtn.addEventListener('click', toggleFullscreen);

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
        focusAudio.volume = vol;
        breakAudio.volume = vol;
    });
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

    // Play Current Audio
    currentAudio.play().catch(e => console.log('Audio playback failed (interaction needed):', e));

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
    clearInterval(state.timerId);

    // Pause Audio
    currentAudio.pause();
}

function stopAudio() {
    focusAudio.pause();
    focusAudio.currentTime = 0; // Optional: reset to start? Or just pause.
    breakAudio.pause();
    breakAudio.currentTime = 0;
}

function switchAudioSource(newMode) {
    // Store current volume to ensure consistency
    const currentVol = volumeSlider.value;

    // Stop current
    currentAudio.pause();

    // Switch
    if (newMode === 'focus') {
        currentAudio = focusAudio;
    } else {
        currentAudio = breakAudio;
    }

    currentAudio.volume = currentVol;
}

function completeSession() {
    pauseTimer(); // Stop timer interval

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
        // Requirement: "Stop timer without auto-starting" implies manual start for Focus?
        // User only said "When transitioning to break... auto start".
        // Standard Pomodoro is manual start for focus usually.
        shouldAutoStart = false;
    }

    // Switch Logic
    switchMode(nextMode);

    if (shouldAutoStart) {
        startTimer();
    }
}

function skipSession() {
    pauseTimer();
    completeSession();
}

function switchMode(newMode) {
    state.mode = newMode;
    state.totalTime = MODES[newMode].time;
    state.timeLeft = state.totalTime;

    // Handle Audio Switching
    switchAudioSource(newMode);

    updateDisplay();
}

function updateDisplay() {
    const minutes = Math.floor(state.timeLeft / 60);
    const seconds = state.timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const progress = state.timeLeft / state.totalTime;
    const offset = CIRCUMFERENCE - (progress * CIRCUMFERENCE);
    progressCircle.style.strokeDashoffset = offset;

    statusText.textContent = MODES[state.mode].label;

    if (state.mode === 'focus') {
       sessionText.textContent = `Session ${state.sessionCount} of ${state.totalSessions}`;
    } else {
       sessionText.textContent = 'Take a break';
    }
}

// Start
init();
