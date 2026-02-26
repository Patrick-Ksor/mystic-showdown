/**
 * Procedural battle music — no audio files needed.
 * Generates a looping ambient battle track using Web Audio API.
 *
 * Architecture: module-level singleton so music survives Vue component
 * lifecycle transitions (Gauntlet advances between rounds without stopping).
 */
import { watchEffect } from "vue";
import { useSoundEffects } from "@/composables/useSoundEffects";

// ─── Shared isMuted ref from the sound effects singleton ─────
const { isMuted } = useSoundEffects();

// ─── Module-level state ──────────────────────────────────────
let musicCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let bassOsc1: OscillatorNode | null = null;
let bassOsc2: OscillatorNode | null = null;
let bassGain: GainNode | null = null;
let scheduleTimer: ReturnType<typeof setTimeout> | null = null;
let stopMuteWatch: (() => void) | null = null;
let running = false;
let melodyStep = 0;
let nextNoteTime = 0;

// ─── Melody pattern (A-minor pentatonic arpeggio, 8 steps) ───
const MELODY_NOTES = [220, 261, 329, 392, 261, 440, 329, 220];
const NOTE_INTERVAL = 0.38; // seconds between note onsets
const NOTE_DURATION = 0.26; // seconds each note rings
const LOOKAHEAD = 0.12; // schedule this far ahead (seconds)
const SCHEDULE_TICK = 50; // check every 50 ms

// ─── AudioContext lifecycle ───────────────────────────────────
function getMusicCtx(): AudioContext {
  if (!musicCtx) {
    musicCtx = new AudioContext();
  }
  if (musicCtx.state === "suspended") {
    void musicCtx.resume();
  }
  return musicCtx;
}

// ─── Bass drone ───────────────────────────────────────────────
function startBassDrone(ctx: AudioContext, master: GainNode): void {
  // Low-pass filter to tame square-wave harshness
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 220;
  filter.Q.value = 0.5;
  filter.connect(master);

  bassGain = ctx.createGain();
  bassGain.gain.value = 0.07;
  bassGain.connect(filter);

  bassOsc1 = ctx.createOscillator();
  bassOsc1.type = "square";
  bassOsc1.frequency.value = 55; // A1
  bassOsc1.connect(bassGain);
  bassOsc1.start();

  bassOsc2 = ctx.createOscillator();
  bassOsc2.type = "square";
  bassOsc2.frequency.value = 110.4; // A2, slightly detuned for thickness
  const g2 = ctx.createGain();
  g2.gain.value = 0.7; // softer second harmonic
  g2.connect(bassGain);
  bassOsc2.connect(g2);
  bassOsc2.start();
}

function stopBassDrone(): void {
  try {
    bassOsc1?.stop();
  } catch {
    /* already stopped */
  }
  try {
    bassOsc2?.stop();
  } catch {
    /* already stopped */
  }
  bassOsc1 = null;
  bassOsc2 = null;
  bassGain = null;
}

// ─── Melody note scheduler ────────────────────────────────────
function scheduleMelodyNote(ctx: AudioContext, master: GainNode): void {
  const freq = MELODY_NOTES[melodyStep % MELODY_NOTES.length];
  melodyStep++;

  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, nextNoteTime);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0, nextNoteTime);
  env.gain.linearRampToValueAtTime(0.28, nextNoteTime + 0.03); // attack
  env.gain.exponentialRampToValueAtTime(0.14, nextNoteTime + 0.12); // decay/sustain
  env.gain.setValueAtTime(0.14, nextNoteTime + NOTE_DURATION - 0.04);
  env.gain.linearRampToValueAtTime(0, nextNoteTime + NOTE_DURATION); // release

  osc.connect(env);
  env.connect(master);
  osc.start(nextNoteTime);
  osc.stop(nextNoteTime + NOTE_DURATION + 0.01);

  nextNoteTime += NOTE_INTERVAL;
}

function scheduleLoop(): void {
  if (!running || !masterGain || !musicCtx) return;

  const ctx = musicCtx;
  const master = masterGain;

  while (nextNoteTime < ctx.currentTime + LOOKAHEAD) {
    scheduleMelodyNote(ctx, master);
  }

  scheduleTimer = setTimeout(scheduleLoop, SCHEDULE_TICK);
}

// ─── Public API ───────────────────────────────────────────────

export function startBattleMusic(): void {
  if (running) return; // already playing

  const ctx = getMusicCtx();

  masterGain = ctx.createGain();
  masterGain.gain.value = isMuted.value ? 0 : 0.4;
  masterGain.connect(ctx.destination);

  startBassDrone(ctx, masterGain);

  // Kick off melody a tiny bit after now so we don't clip
  nextNoteTime = ctx.currentTime + 0.1;
  melodyStep = 0;
  running = true;
  scheduleLoop();

  // Reactively mirror mute state
  stopMuteWatch = watchEffect(() => {
    if (!masterGain || !musicCtx) return;
    const target = isMuted.value ? 0 : 0.4;
    masterGain.gain.setTargetAtTime(target, musicCtx.currentTime, 0.08);
  });
}

export function stopBattleMusic(): void {
  if (!running) return;

  running = false;

  if (scheduleTimer !== null) {
    clearTimeout(scheduleTimer);
    scheduleTimer = null;
  }

  if (stopMuteWatch) {
    stopMuteWatch();
    stopMuteWatch = null;
  }

  // Fade master out gracefully
  if (masterGain && musicCtx) {
    masterGain.gain.setTargetAtTime(0, musicCtx.currentTime, 0.3);
  }

  // Tear down oscillators after fade completes
  setTimeout(() => {
    stopBassDrone();
    masterGain?.disconnect();
    masterGain = null;
  }, 1500);
}
