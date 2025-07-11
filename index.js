// ---------- SOUND PLAYBACK ----------

// Preload sounds
const soundFiles = {
    "w": "sounds/tom-1.mp3",
    "a": "sounds/tom-2.mp3",
    "s": "sounds/tom-3.mp3",
    "d": "sounds/tom-4.mp3",
    "j": "sounds/snare.mp3",
    "k": "sounds/crash.mp3",
    "l": "sounds/kick-bass.mp3",
    "h": "sounds/hihat.mp3",
    "c": "sounds/clap.mp3"
};

const audioElements = {};
Object.entries(soundFiles).forEach(([key, src]) => {
    const audio = new Audio(src);
    audio.load();
    audioElements[key] = audio;
});

let volume = 1.0;
let isMuted = false;

function playSound(key) {
    if (!audioElements[key]) return;
    const audio = new Audio(audioElements[key].src);
    audio.volume = isMuted ? 0 : volume;
    audio.play();
}

// ---------- INTERACTION ----------
const drumButtons = document.querySelectorAll(".drum");

function animateButton(key) {
    const btn = document.getElementById(key);
    if (!btn) return;
    btn.classList.add("pressed");
    setTimeout(() => btn.classList.remove("pressed"), 150);
}

let isRecording = false;
let recordSequence = [];
let startTime = 0;

function handleInteraction(e) {
    e.preventDefault();
    const key = this.id;
    playSound(key);
    animateButton(key);
    if (isRecording) recordSequence.push({ key, time: Date.now() - startTime });
}

drumButtons.forEach(btn => {
    btn.addEventListener("click", handleInteraction);
    btn.addEventListener("touchstart", handleInteraction, { passive: false });
});

document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    playSound(key);
    animateButton(key);
    if (isRecording) recordSequence.push({ key, time: Date.now() - startTime });
});

// ---------- THEME TOGGLE ----------
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    if (document.body.classList.contains("light-mode")) {
        themeToggle.textContent = "🌙 Dark Mode";
        themeToggle.classList.replace("btn-outline-light", "btn-outline-dark");
    } else {
        themeToggle.textContent = "☀️ Light Mode";
        themeToggle.classList.replace("btn-outline-dark", "btn-outline-light");
    }
});

// ---------- RECORD ----------
const recordBtn = document.getElementById("record-btn");
const playBtn = document.getElementById("play-btn");
const pauseBtn = document.getElementById("pause-btn");
const clearBtn = document.getElementById("clear-btn");
const recordIndicator = document.getElementById("record-indicator");

recordBtn.addEventListener("click", () => {
    isRecording = !isRecording;
    if (isRecording) {
        recordSequence = [];
        startTime = Date.now();
        recordBtn.textContent = "⏹️ Stop";
        recordIndicator.classList.remove("d-none");
        playBtn.disabled = true;
        pauseBtn.classList.add("d-none");
    } else {
        recordBtn.textContent = "🔴 Record";
        recordIndicator.classList.add("d-none");
        playBtn.disabled = recordSequence.length === 0;
    }
});

// ---------- PLAYBACK, PAUSE, RESUME ----------
let playbackTimeouts = [];
let isPaused = false;
let playbackStartTime = 0;
let elapsedTime = 0;
let currentNoteIndex = 0;

playBtn.addEventListener("click", startPlayback);
pauseBtn.addEventListener("click", () => isPaused ? resumePlayback() : pausePlayback());

function startPlayback() {
    if (recordSequence.length === 0) return;

    isPaused = false;
    elapsedTime = 0;
    currentNoteIndex = 0;
    playbackStartTime = Date.now();
    pauseBtn.textContent = "⏸️ Pause";

    playBtn.classList.add("d-none");
    pauseBtn.classList.remove("d-none");
    recordBtn.disabled = true;
    clearBtn.disabled = true;

    playNextNote();
}

function playNextNote() {
    if (currentNoteIndex >= recordSequence.length || isPaused) return;

    const note = recordSequence[currentNoteIndex];
    const delay = note.time - elapsedTime;

    playbackTimeouts.push(setTimeout(() => {
        playSound(note.key);
        animateButton(note.key);

        elapsedTime = note.time;
        currentNoteIndex++;

        if (currentNoteIndex < recordSequence.length) {
            playNextNote();
        } else {
            resetPlaybackButtons();
        }

    }, delay));
}

function pausePlayback() {
    isPaused = true;
    pauseBtn.textContent = "▶️ Resume";
    const timeSinceStart = Date.now() - playbackStartTime;
    elapsedTime += timeSinceStart;
    clearAllTimeouts();
}

function resumePlayback() {
    isPaused = false;
    playbackStartTime = Date.now();
    pauseBtn.textContent = "⏸️ Pause";
    playNextNote();
}

function clearAllTimeouts() {
    playbackTimeouts.forEach(clearTimeout);
    playbackTimeouts = [];
}

function resetPlaybackButtons() {
    playBtn.classList.remove("d-none");
    pauseBtn.classList.add("d-none");
    pauseBtn.textContent = "⏸️ Pause";
    playBtn.disabled = false;
    recordBtn.disabled = false;
    clearBtn.disabled = false;
    elapsedTime = 0;
    currentNoteIndex = 0;
    clearAllTimeouts();
}

// ---------- CLEAR ----------
clearBtn.addEventListener("click", () => {
    recordSequence = [];
    playBtn.disabled = true;
    resetPlaybackButtons();
});

// ---------- VOLUME ----------
const volumeSlider = document.getElementById("volume-slider");
const muteBtn = document.getElementById("mute-btn");

volumeSlider.addEventListener("input", () => {
    volume = volumeSlider.value / 100;
    isMuted = false;
    muteBtn.textContent = "🔇 Mute";
});

muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    muteBtn.textContent = isMuted ? "🔊 Unmute" : "🔇 Mute";
});
