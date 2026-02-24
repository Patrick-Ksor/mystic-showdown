/**
 * Web Audio API synthesizer — generates all game sounds procedurally.
 * No audio files needed!
 */
import { ref } from "vue";

let audioCtx: AudioContext | null = null;
const isMuted = ref(false);

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

function masterGain(ctx: AudioContext, volume = 0.35): GainNode {
  const g = ctx.createGain();
  g.gain.value = isMuted.value ? 0 : volume;
  g.connect(ctx.destination);
  return g;
}

// ─── Primitive helpers ──────────────────────────────────────

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "square",
  volume = 0.3,
  detune = 0,
) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = masterGain(ctx, volume);

  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;

  // Envelope: quick attack, sustain, decay
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(
    isMuted.value ? 0 : volume,
    ctx.currentTime + 0.01,
  );
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playNoise(duration: number, volume = 0.15) {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Bandpass for more interesting noise
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1000;
  filter.Q.value = 0.5;

  const gain = masterGain(ctx, volume);
  gain.gain.setValueAtTime(isMuted.value ? 0 : volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  source.connect(filter);
  filter.connect(gain);
  source.start(ctx.currentTime);
  source.stop(ctx.currentTime + duration);
}

// ─── Sound Effects ──────────────────────────────────────────

/** Quick "boop" for UI selections */
function playSelect() {
  playTone(660, 0.08, "square", 0.2);
  setTimeout(() => playTone(880, 0.08, "square", 0.15), 40);
}

/** Confirming button press */
function playConfirm() {
  playTone(523, 0.1, "square", 0.2);
  setTimeout(() => playTone(659, 0.08, "square", 0.2), 60);
  setTimeout(() => playTone(784, 0.12, "square", 0.25), 130);
}

/** Attack launch — whoosh sound when initiating an attack */
function playAttackLaunch() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = masterGain(ctx, 0.2);

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(
    isMuted.value ? 0 : 0.2,
    ctx.currentTime + 0.02,
  );
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

  osc.connect(gain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);

  playNoise(0.1, 0.12);
}

/** Generic attack hit — punchy noise burst */
function playAttackHit() {
  playNoise(0.15, 0.25);
  playTone(180, 0.12, "sawtooth", 0.3);
  setTimeout(() => playTone(100, 0.15, "sawtooth", 0.2), 50);
}

/** Attack miss — a light whoosh that fades to nothing */
function playMiss() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = masterGain(ctx, 0.15);

  osc.type = "sine";
  osc.frequency.setValueAtTime(500, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(
    isMuted.value ? 0 : 0.15,
    ctx.currentTime + 0.02,
  );
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

  osc.connect(gain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);

  playNoise(0.12, 0.08);
}

/** Critical hit — sharper, louder, with a high ping */
function playCriticalHit() {
  playNoise(0.2, 0.35);
  playTone(150, 0.15, "sawtooth", 0.35);
  setTimeout(() => {
    playTone(1200, 0.12, "sine", 0.25);
    playTone(1500, 0.08, "sine", 0.2);
  }, 80);
  setTimeout(() => playTone(80, 0.2, "sawtooth", 0.25), 50);
}

/** Guard/shield activation — rising shimmer */
function playGuard() {
  playTone(400, 0.15, "triangle", 0.2);
  setTimeout(() => playTone(600, 0.15, "triangle", 0.2), 80);
  setTimeout(() => playTone(800, 0.1, "triangle", 0.15), 160);
}

/** Battle start whoosh — rising sweep */
function playBattleStart() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = masterGain(ctx, 0.25);

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(100, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.4);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(
    isMuted.value ? 0 : 0.25,
    ctx.currentTime + 0.05,
  );
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

  osc.connect(gain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.5);

  // Accent chime
  setTimeout(() => {
    playTone(523, 0.15, "square", 0.15);
    playTone(784, 0.15, "square", 0.1);
  }, 350);
}

/** Victory fanfare — triumphant ascending notes */
function playVictory() {
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.25, "square", 0.2), i * 120);
  });
  // Bright shimmer at the end
  setTimeout(() => {
    playTone(1047, 0.4, "sine", 0.15);
    playTone(1319, 0.4, "sine", 0.1);
  }, notes.length * 120);
}

/** Defeat — descending chromatic sadness */
function playDefeat() {
  const notes = [440, 415, 392, 349]; // A4, Ab4, G4, F4
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, "triangle", 0.2), i * 180);
  });
  // Low rumble
  setTimeout(() => playTone(80, 0.5, "sawtooth", 0.15), 600);
}

/** Monster faint — descending wobble */
function playFaint() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = masterGain(ctx, 0.2);

  osc.type = "sine";
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.6);

  gain.gain.setValueAtTime(isMuted.value ? 0 : 0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

  osc.connect(gain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.7);
}

/** Escape/run — quick descending notes */
function playRun() {
  const notes = [800, 600, 400, 250];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.08, "square", 0.15), i * 50);
  });
}

/** XP gain tick sound */
function playXPTick() {
  playTone(1200, 0.04, "sine", 0.1);
}

/** Level up — bright ascending arpeggio */
function playLevelUp() {
  const notes = [523, 659, 784, 1047, 1319]; // C5 E5 G5 C6 E6
  notes.forEach((freq, i) => {
    setTimeout(() => {
      playTone(freq, 0.2, "square", 0.18);
      playTone(freq * 1.5, 0.15, "sine", 0.08); // harmony
    }, i * 100);
  });
}

/** Enemy turn approaching — ominous low pulse */
function playEnemyTurn() {
  playTone(120, 0.25, "sawtooth", 0.15);
  setTimeout(() => playTone(100, 0.2, "sawtooth", 0.12), 150);
}

/** Element-specific attack sound accents */
function playElementAccent(element: string) {
  switch (element) {
    case "fire":
      playNoise(0.2, 0.2);
      playTone(300, 0.15, "sawtooth", 0.2);
      break;
    case "water":
      playTone(400, 0.2, "sine", 0.2);
      setTimeout(() => playTone(500, 0.15, "sine", 0.15), 60);
      setTimeout(() => playTone(350, 0.12, "sine", 0.1), 120);
      break;
    case "electric":
      playTone(2000, 0.05, "square", 0.2);
      setTimeout(() => playTone(1500, 0.05, "square", 0.2), 30);
      setTimeout(() => playNoise(0.08, 0.15), 60);
      break;
    case "earth":
      playTone(80, 0.3, "sawtooth", 0.25);
      playNoise(0.15, 0.15);
      break;
    case "ice":
      playTone(1800, 0.1, "sine", 0.15);
      setTimeout(() => playTone(2200, 0.08, "sine", 0.12), 50);
      setTimeout(() => playTone(1400, 0.12, "sine", 0.1), 100);
      break;
    case "shadow":
      playTone(150, 0.3, "sawtooth", 0.2, -30);
      playTone(153, 0.3, "sawtooth", 0.2, 30); // detune for eerie effect
      break;
    case "wind":
      // Airy swoosh with ascending whistle
      playNoise(0.25, 0.18);
      playTone(800, 0.15, "sine", 0.12);
      setTimeout(() => playTone(1200, 0.1, "sine", 0.1), 60);
      break;
    case "nature":
      // Organic rustling with earthy tone
      playNoise(0.18, 0.12);
      playTone(260, 0.2, "triangle", 0.18);
      setTimeout(() => playTone(330, 0.15, "triangle", 0.12), 80);
      break;
    case "psychic":
      // Eerie warbling pulse
      playTone(600, 0.25, "sine", 0.2, 20);
      playTone(603, 0.25, "sine", 0.2, -20);
      setTimeout(() => playTone(900, 0.12, "sine", 0.12), 100);
      break;
    case "metal":
      // Metallic clang with ring-out
      playTone(1600, 0.08, "square", 0.2);
      playNoise(0.06, 0.2);
      setTimeout(() => playTone(2400, 0.15, "sine", 0.12), 40);
      break;
    case "light":
      // Bright shimmer cascade
      playTone(1400, 0.1, "sine", 0.18);
      setTimeout(() => playTone(1800, 0.08, "sine", 0.15), 40);
      setTimeout(() => playTone(2200, 0.1, "sine", 0.12), 80);
      break;
    case "toxic":
      // Bubbly corrosive hiss
      playNoise(0.2, 0.18);
      playTone(200, 0.2, "sawtooth", 0.15);
      setTimeout(() => playTone(250, 0.1, "sawtooth", 0.1), 70);
      setTimeout(() => playTone(180, 0.12, "sawtooth", 0.08), 140);
      break;
    default:
      // Fallback generic accent
      playNoise(0.15, 0.15);
      playTone(400, 0.12, "sawtooth", 0.18);
      break;
  }
}

// ─── Mute control ───────────────────────────────────────────

function toggleMute() {
  isMuted.value = !isMuted.value;
}

// ─── Public API ─────────────────────────────────────────────

export function useSoundEffects() {
  return {
    isMuted,
    toggleMute,
    playSelect,
    playConfirm,
    playAttackLaunch,
    playAttackHit,
    playMiss,
    playCriticalHit,
    playGuard,
    playBattleStart,
    playVictory,
    playDefeat,
    playFaint,
    playRun,
    playXPTick,
    playLevelUp,
    playEnemyTurn,
    playElementAccent,
  };
}
