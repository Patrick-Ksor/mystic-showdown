/**
 * Internal Web Audio API synthesis DSL.
 * Provides low-level building blocks used by useSoundEffects.ts.
 * Not part of the public composable API — do not import from components.
 */

// ─── Output ─────────────────────────────────────────────────

/** Creates a GainNode connected to ctx.destination. */
export function out(ctx: AudioContext, volume: number): GainNode {
  const g = ctx.createGain();
  g.gain.value = volume;
  g.connect(ctx.destination);
  return g;
}

// ─── Envelope ───────────────────────────────────────────────

export interface AdsrOpts {
  attack: number; // seconds
  decay: number; // seconds
  sustain: number; // 0–1 fraction of peak
  release: number; // seconds
  peak: number; // volume at attack tip
}

/**
 * Schedules a full ADSR envelope on `param`.
 * `duration` is the time (s) the note is held before release begins.
 * All times are relative to ctx.currentTime + startOffset.
 */
export function adsr(
  param: AudioParam,
  ctx: AudioContext,
  opts: AdsrOpts,
  duration: number,
  startOffset = 0,
): void {
  const t = ctx.currentTime + startOffset;
  param.cancelScheduledValues(t);
  param.setValueAtTime(0, t);
  param.linearRampToValueAtTime(opts.peak, t + opts.attack);
  param.linearRampToValueAtTime(
    opts.peak * opts.sustain,
    t + opts.attack + opts.decay,
  );
  param.setValueAtTime(opts.peak * opts.sustain, t + duration);
  param.exponentialRampToValueAtTime(0.0001, t + duration + opts.release);
}

// ─── Oscillator ─────────────────────────────────────────────

export interface OscOpts {
  type: OscillatorType;
  freq: number;
  detune?: number;
  startOffset?: number;
  stopOffset?: number;
}

/** Creates, connects, starts and schedules stop for an OscillatorNode. */
export function osc(
  ctx: AudioContext,
  opts: OscOpts,
  dest: AudioNode,
): OscillatorNode {
  const o = ctx.createOscillator();
  o.type = opts.type;
  o.frequency.value = opts.freq;
  if (opts.detune !== undefined) o.detune.value = opts.detune;
  o.connect(dest);
  const t = ctx.currentTime + (opts.startOffset ?? 0);
  const stop = opts.stopOffset ?? ctx.currentTime + 1;
  o.start(t);
  o.stop(stop);
  return o;
}

/** Ramps oscillator frequency from `from` → `to` over `duration` seconds. */
export function freqRamp(
  o: OscillatorNode,
  ctx: AudioContext,
  from: number,
  to: number,
  duration: number,
  startOffset = 0,
): void {
  const t = ctx.currentTime + startOffset;
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(to, t + duration);
}

// ─── Chord ──────────────────────────────────────────────────

/** Starts multiple oscillators tuned to `freqs`, all connected to `dest`. */
export function chord(
  ctx: AudioContext,
  freqs: number[],
  type: OscillatorType,
  dest: AudioNode,
  startOffset = 0,
  stopOffset = 0.5,
): OscillatorNode[] {
  const absStop = ctx.currentTime + stopOffset;
  return freqs.map((f) =>
    osc(ctx, { type, freq: f, startOffset, stopOffset: absStop }, dest),
  );
}

// ─── Noise ──────────────────────────────────────────────────

export interface NoiseOpts {
  filterType?: BiquadFilterType;
  filterFreq?: number;
  filterQ?: number;
  startOffset?: number;
}

/** Creates white noise, optionally through a BiquadFilter, connected to `dest`. */
export function whiteNoise(
  ctx: AudioContext,
  duration: number,
  dest: AudioNode,
  opts: NoiseOpts = {},
): AudioBufferSourceNode {
  const bufferSize = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;

  let endpoint: AudioNode = dest;

  if (opts.filterType) {
    const f = ctx.createBiquadFilter();
    f.type = opts.filterType;
    f.frequency.value = opts.filterFreq ?? 1000;
    f.Q.value = opts.filterQ ?? 1;
    f.connect(dest);
    endpoint = f;
  }

  src.connect(endpoint);
  const t = ctx.currentTime + (opts.startOffset ?? 0);
  src.start(t);
  src.stop(t + duration);
  return src;
}

// ─── LFO ────────────────────────────────────────────────────

export interface LfoOpts {
  type?: OscillatorType;
  startOffset?: number;
  stopOffset?: number;
}

/**
 * Wires an OscillatorNode as an LFO onto `param`.
 * The LFO output is scaled to ±depth via a GainNode connected to param.
 */
export function lfo(
  ctx: AudioContext,
  param: AudioParam,
  rate: number,
  depth: number,
  opts: LfoOpts = {},
): OscillatorNode {
  const modGain = ctx.createGain();
  modGain.gain.value = depth;
  modGain.connect(param);

  const o = ctx.createOscillator();
  o.type = opts.type ?? "sine";
  o.frequency.value = rate;
  o.connect(modGain);

  const t0 = ctx.currentTime + (opts.startOffset ?? 0);
  const t1 = opts.stopOffset ?? ctx.currentTime + 2;
  o.start(t0);
  o.stop(t1);
  return o;
}

// ─── Distortion ─────────────────────────────────────────────

/** Creates a WaveShaper with a hard-clip distortion curve. */
export function makeDistortion(
  ctx: AudioContext,
  amount = 200,
): WaveShaperNode {
  const ws = ctx.createWaveShaper();
  const n = 256;
  const curve = new Float32Array(n);
  const k = amount;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x));
  }
  ws.curve = curve;
  ws.oversample = "4x";
  return ws;
}

// ─── Sequencer ──────────────────────────────────────────────

/**
 * Fires each step callback at evenly-spaced intervals (ms).
 * The callback receives its 0-based step index.
 */
export function seq(
  steps: Array<(index: number) => void>,
  intervalMs: number,
  startDelayMs = 0,
): void {
  steps.forEach((fn, i) => {
    setTimeout(() => fn(i), startDelayMs + i * intervalMs);
  });
}
