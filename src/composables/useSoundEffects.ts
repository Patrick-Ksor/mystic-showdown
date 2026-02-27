/**
 * Web Audio API synthesizer — generates all game sounds procedurally.
 * Uses useSoundEngine.ts for reusable synthesis primitives.
 * No audio files needed.
 */
import { ref } from "vue";
import type { ElementType } from "@/types";
import {
  adsr,
  chord,
  freqRamp,
  lfo,
  makeDistortion,
  osc,
  out,
  seq,
  whiteNoise,
  type AdsrOpts,
} from "@/composables/useSoundEngine";

let audioCtx: AudioContext | null = null;
const isMuted = ref(false);

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

/** Returns 0 when muted, else the given volume. */
function v(volume: number): number {
  return isMuted.value ? 0 : volume;
}

// Shared ADSR presets
const SNAPPY: AdsrOpts = {
  attack: 0.008,
  decay: 0.04,
  sustain: 0.0,
  release: 0.0,
  peak: 1,
};
const PLUCK: AdsrOpts = {
  attack: 0.005,
  decay: 0.12,
  sustain: 0.1,
  release: 0.12,
  peak: 1,
};

// ─── UI Sounds ──────────────────────────────────────────────

/** Two-tone boop for hovering/selecting, now a mini chord with vibrato. */
function playSelect() {
  const ctx = getCtx();

  // First boop — root + 4th + octave chord
  const g1 = out(ctx, 1);
  adsr(g1.gain, ctx, { ...PLUCK, peak: v(0.18) }, 0.06);
  chord(ctx, [660, 880, 1320], "square", g1, 0, 0.18);

  // Second boop, slight rising pitch
  const g2 = out(ctx, 1);
  adsr(g2.gain, ctx, { ...PLUCK, peak: v(0.15) }, 0.06, 0.05);
  chord(ctx, [880, 1100, 1760], "square", g2, 0.05, 0.24);
}

/** Confirming a button press — three-note arpeggio with harmonic layer. */
function playConfirm() {
  const ctx = getCtx();
  const notes = [523, 659, 784]; // C5, E5, G5
  const thirds = [659, 831, 988]; // major 3rd above each

  seq(
    notes.map((freq, i) => () => {
      const dur = i === notes.length - 1 ? 0.22 : 0.14;
      const g = out(ctx, 1);
      adsr(g.gain, ctx, { ...PLUCK, peak: v(0.2) }, dur);
      osc(
        ctx,
        { type: "square", freq, stopOffset: ctx.currentTime + dur + 0.06 },
        g,
      );

      const gh = out(ctx, 1);
      adsr(gh.gain, ctx, { ...PLUCK, peak: v(0.08) }, dur);
      osc(
        ctx,
        {
          type: "square",
          freq: thirds[i],
          stopOffset: ctx.currentTime + dur + 0.06,
        },
        gh,
      );
    }),
    65,
  );
}

/** Attack launch — detuned saw sweep at root+5th, vibrato kick, bandpass noise. */
function playAttackLaunch() {
  const ctx = getCtx();

  const gSweep = out(ctx, 1);
  adsr(
    gSweep.gain,
    ctx,
    { attack: 0.02, decay: 0.05, sustain: 0.5, release: 0.12, peak: v(0.2) },
    0.12,
  );

  const rootOsc = osc(
    ctx,
    { type: "sawtooth", freq: 200, stopOffset: ctx.currentTime + 0.22 },
    gSweep,
  );
  const fifthOsc = osc(
    ctx,
    {
      type: "sawtooth",
      freq: 300,
      detune: 4,
      stopOffset: ctx.currentTime + 0.22,
    },
    gSweep,
  );
  freqRamp(rootOsc, ctx, 200, 620, 0.14);
  freqRamp(fifthOsc, ctx, 300, 930, 0.14);
  lfo(ctx, rootOsc.frequency, 8, 18, { stopOffset: ctx.currentTime + 0.22 });

  const gn = out(ctx, 1);
  adsr(
    gn.gain,
    ctx,
    { attack: 0.005, decay: 0.08, sustain: 0, release: 0, peak: v(0.14) },
    0.02,
  );
  whiteNoise(ctx, 0.12, gn, {
    filterType: "bandpass",
    filterFreq: 900,
    filterQ: 1.2,
  });

  void fifthOsc;
}

/**
 * Attack hit sound.
 * Physical: low punch — sub bass + lowpass noise.
 * Special:  shimmer cascade — high sine layers + sparkle noise.
 */
function playAttackHit(isSpecial = false) {
  const ctx = getCtx();

  if (!isSpecial) {
    const gBass = out(ctx, 1);
    adsr(
      gBass.gain,
      ctx,
      { attack: 0.004, decay: 0.12, sustain: 0, release: 0, peak: v(0.32) },
      0.01,
    );
    const bassOsc = osc(
      ctx,
      { type: "sine", freq: 120, stopOffset: ctx.currentTime + 0.18 },
      gBass,
    );
    freqRamp(bassOsc, ctx, 120, 40, 0.15);

    const gMid = out(ctx, 1);
    adsr(
      gMid.gain,
      ctx,
      { attack: 0.003, decay: 0.07, sustain: 0, release: 0, peak: v(0.28) },
      0.01,
    );
    const midOsc = osc(
      ctx,
      { type: "sawtooth", freq: 200, stopOffset: ctx.currentTime + 0.12 },
      gMid,
    );
    freqRamp(midOsc, ctx, 200, 80, 0.1);

    const gn = out(ctx, 1);
    adsr(
      gn.gain,
      ctx,
      { attack: 0.002, decay: 0.1, sustain: 0, release: 0, peak: v(0.3) },
      0.01,
    );
    whiteNoise(ctx, 0.15, gn, {
      filterType: "lowpass",
      filterFreq: 400,
      filterQ: 0.8,
    });
  } else {
    const freqs = [800, 1200, 1600];
    seq(
      freqs.map((freq) => () => {
        const gs = out(ctx, 1);
        adsr(
          gs.gain,
          ctx,
          {
            attack: 0.005,
            decay: 0.1,
            sustain: 0.1,
            release: 0.12,
            peak: v(0.2),
          },
          0.08,
        );
        osc(
          ctx,
          { type: "sine", freq, stopOffset: ctx.currentTime + 0.25 },
          gs,
        );
      }),
      45,
    );
    const gn = out(ctx, 1);
    adsr(
      gn.gain,
      ctx,
      { attack: 0.005, decay: 0.12, sustain: 0, release: 0, peak: v(0.18) },
      0.02,
    );
    whiteNoise(ctx, 0.18, gn, {
      filterType: "highpass",
      filterFreq: 2500,
      filterQ: 1,
    });
  }
}

/** Attack miss — descending sine with vibrato wobble. */
function playMiss() {
  const ctx = getCtx();

  const gm = out(ctx, 1);
  adsr(
    gm.gain,
    ctx,
    { attack: 0.015, decay: 0.05, sustain: 0.5, release: 0.18, peak: v(0.15) },
    0.15,
  );
  const missOsc = osc(
    ctx,
    { type: "sine", freq: 500, stopOffset: ctx.currentTime + 0.38 },
    gm,
  );
  freqRamp(missOsc, ctx, 500, 150, 0.22);
  lfo(ctx, missOsc.frequency, 6, 28, { stopOffset: ctx.currentTime + 0.38 });

  const gn = out(ctx, 1);
  adsr(
    gn.gain,
    ctx,
    { attack: 0.01, decay: 0.1, sustain: 0, release: 0, peak: v(0.07) },
    0.01,
  );
  whiteNoise(ctx, 0.14, gn, {
    filterType: "bandpass",
    filterFreq: 600,
    filterQ: 0.6,
  });
}

/** Critical hit — distorted crunch + bass punch + double high ping. */
function playCriticalHit() {
  const ctx = getCtx();

  const dist = makeDistortion(ctx, 280);
  dist.connect(ctx.destination);
  const gCrunch = ctx.createGain();
  gCrunch.gain.value = 0;
  adsr(
    gCrunch.gain,
    ctx,
    { attack: 0.003, decay: 0.08, sustain: 0, release: 0, peak: v(0.25) },
    0.015,
  );
  gCrunch.connect(dist);
  const crunchOsc = osc(
    ctx,
    { type: "sawtooth", freq: 140, stopOffset: ctx.currentTime + 0.18 },
    gCrunch,
  );
  freqRamp(crunchOsc, ctx, 140, 60, 0.12);

  const gBass = out(ctx, 1);
  adsr(
    gBass.gain,
    ctx,
    { attack: 0.002, decay: 0.15, sustain: 0, release: 0, peak: v(0.3) },
    0.01,
  );
  const bassOsc = osc(
    ctx,
    { type: "sine", freq: 80, stopOffset: ctx.currentTime + 0.22 },
    gBass,
  );
  freqRamp(bassOsc, ctx, 80, 30, 0.18);

  const gn = out(ctx, 1);
  adsr(
    gn.gain,
    ctx,
    { attack: 0.002, decay: 0.1, sustain: 0, release: 0, peak: v(0.35) },
    0.01,
  );
  whiteNoise(ctx, 0.18, gn, {
    filterType: "bandpass",
    filterFreq: 1800,
    filterQ: 0.8,
  });

  setTimeout(() => {
    const gp = out(ctx, 1);
    adsr(
      gp.gain,
      ctx,
      {
        attack: 0.003,
        decay: 0.08,
        sustain: 0.1,
        release: 0.15,
        peak: v(0.22),
      },
      0.08,
    );
    chord(ctx, [1200, 1500], "sine", gp, 0, 0.35);
  }, 80);

  void crunchOsc;
}

/** Guard — C4-E4-G4 triangle chord with fast tremolo. */
function playGuard() {
  const ctx = getCtx();

  const gg = out(ctx, 1);
  adsr(
    gg.gain,
    ctx,
    { attack: 0.015, decay: 0.06, sustain: 0.7, release: 0.22, peak: v(0.2) },
    0.2,
  );
  chord(ctx, [262, 330, 392], "triangle", gg, 0, 0.5);
  lfo(ctx, gg.gain, 9, v(0.06), { stopOffset: ctx.currentTime + 0.55 });
}

/** Battle start — unison detuned saw sweep + kick pattern. */
function playBattleStart() {
  const ctx = getCtx();

  const gSweep = out(ctx, 1);
  adsr(
    gSweep.gain,
    ctx,
    { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.25, peak: v(0.22) },
    0.38,
  );

  const detunes = [-8, 0, 8];
  const sweepOscs = detunes.map((d) => {
    const o = osc(
      ctx,
      {
        type: "sawtooth",
        freq: 100,
        detune: d,
        stopOffset: ctx.currentTime + 0.65,
      },
      gSweep,
    );
    freqRamp(o, ctx, 100, 800, 0.4);
    return o;
  });

  seq(
    [523, 523, 784].map((freq) => () => {
      const gk = out(ctx, 1);
      adsr(gk.gain, ctx, { ...SNAPPY, peak: v(0.18) }, 0.05);
      osc(
        ctx,
        { type: "square", freq, stopOffset: ctx.currentTime + 0.15 },
        gk,
      );
    }),
    110,
    300,
  );

  const gn = out(ctx, 1);
  adsr(
    gn.gain,
    ctx,
    { attack: 0.01, decay: 0.15, sustain: 0, release: 0, peak: v(0.12) },
    0.02,
    0.35,
  );
  whiteNoise(ctx, 0.2, gn, {
    filterType: "bandpass",
    filterFreq: 1200,
    filterQ: 1.5,
    startOffset: 0.35,
  });

  void sweepOscs;
}

/** Victory fanfare — C5-E5-G5-C6 arpeggio with parallel major-3rd harmony. */
function playVictory() {
  const ctx = getCtx();
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  const harmony = [659, 831, 988, 1319]; // E5 Ab5 B5 E6

  seq(
    notes.map((freq, i) => () => {
      const dur = i === notes.length - 1 ? 0.4 : 0.22;
      const gv = out(ctx, 1);
      adsr(gv.gain, ctx, { ...PLUCK, peak: v(0.2) }, dur);
      osc(
        ctx,
        { type: "square", freq, stopOffset: ctx.currentTime + dur + 0.15 },
        gv,
      );

      const gh = out(ctx, 1);
      adsr(gh.gain, ctx, { ...PLUCK, peak: v(0.08) }, dur);
      osc(
        ctx,
        {
          type: "square",
          freq: harmony[i],
          stopOffset: ctx.currentTime + dur + 0.15,
        },
        gh,
      );
    }),
    120,
  );

  setTimeout(
    () => {
      const gs = out(ctx, 1);
      adsr(
        gs.gain,
        ctx,
        { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.4, peak: v(0.12) },
        0.25,
      );
      chord(ctx, [1047, 1319], "sine", gs, 0, 0.75);
    },
    notes.length * 120 + 20,
  );
}

/** Defeat — minor chord descent with slow tremolo rumble. */
function playDefeat() {
  const ctx = getCtx();
  const steps = [
    [440, 523, 659], // Am
    [392, 494, 587], // Gm
    [349, 440, 523], // Fm
    [330, 415, 494], // Em
  ] as const;

  seq(
    steps.map((freqs) => () => {
      const gd = out(ctx, 1);
      adsr(
        gd.gain,
        ctx,
        { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.3, peak: v(0.15) },
        0.22,
      );
      chord(ctx, [...freqs], "triangle", gd, 0, 0.65);
      lfo(ctx, gd.gain, 3, v(0.04), { stopOffset: ctx.currentTime + 0.7 });
    }),
    185,
  );

  setTimeout(() => {
    const gr = out(ctx, 1);
    adsr(
      gr.gain,
      ctx,
      { attack: 0.05, decay: 0.1, sustain: 0.6, release: 0.5, peak: v(0.14) },
      0.3,
    );
    const rumbleOsc = osc(
      ctx,
      { type: "sawtooth", freq: 55, stopOffset: ctx.currentTime + 0.95 },
      gr,
    );
    lfo(ctx, rumbleOsc.frequency, 2.5, 8, {
      stopOffset: ctx.currentTime + 0.95,
    });
  }, 650);
}

/** Monster faint — slow vibrato descent + sub-sine layer. */
function playFaint() {
  const ctx = getCtx();

  const gf = out(ctx, 1);
  adsr(
    gf.gain,
    ctx,
    { attack: 0.01, decay: 0.05, sustain: 0.8, release: 0.35, peak: v(0.2) },
    0.45,
  );
  const faintOsc = osc(
    ctx,
    { type: "sine", freq: 600, stopOffset: ctx.currentTime + 0.85 },
    gf,
  );
  freqRamp(faintOsc, ctx, 600, 80, 0.65);
  lfo(ctx, faintOsc.frequency, 5, 22, { stopOffset: ctx.currentTime + 0.85 });

  const gsub = out(ctx, 1);
  adsr(
    gsub.gain,
    ctx,
    { attack: 0.01, decay: 0.05, sustain: 0.6, release: 0.4, peak: v(0.1) },
    0.4,
  );
  const subOsc = osc(
    ctx,
    { type: "sine", freq: 300, stopOffset: ctx.currentTime + 0.85 },
    gsub,
  );
  freqRamp(subOsc, ctx, 300, 40, 0.65);

  void subOsc;
}

/** Run/escape — smooth portamento sweep + noise tail. */
function playRun() {
  const ctx = getCtx();

  const gr = out(ctx, 1);
  adsr(
    gr.gain,
    ctx,
    { attack: 0.01, decay: 0.05, sustain: 0.5, release: 0.18, peak: v(0.18) },
    0.18,
  );
  const runOsc = osc(
    ctx,
    { type: "square", freq: 800, stopOffset: ctx.currentTime + 0.38 },
    gr,
  );
  freqRamp(runOsc, ctx, 800, 200, 0.28);

  const gn = out(ctx, 1);
  adsr(
    gn.gain,
    ctx,
    { attack: 0.005, decay: 0.12, sustain: 0, release: 0, peak: v(0.1) },
    0.01,
    0.08,
  );
  whiteNoise(ctx, 0.2, gn, {
    filterType: "bandpass",
    filterFreq: 500,
    filterQ: 0.8,
    startOffset: 0.08,
  });
}

/** XP tick — ultra-tight ADSR ping. */
function playXPTick() {
  const ctx = getCtx();
  const gx = out(ctx, 1);
  adsr(
    gx.gain,
    ctx,
    { attack: 0.002, decay: 0.03, sustain: 0, release: 0, peak: v(0.12) },
    0.005,
  );
  osc(
    ctx,
    { type: "sine", freq: 1200, stopOffset: ctx.currentTime + 0.06 },
    gx,
  );
}

/** Level up — ADSR arpeggio with vibrato on the top note. */
function playLevelUp() {
  const ctx = getCtx();
  const notes = [523, 659, 784, 1047, 1319]; // C5 E5 G5 C6 E6
  const harmony = [659, 831, 988, 1319, 1661];

  seq(
    notes.map((freq, i) => () => {
      const dur = i === notes.length - 1 ? 0.35 : 0.16;
      const gl = out(ctx, 1);
      adsr(gl.gain, ctx, { ...PLUCK, peak: v(0.18) }, dur);
      const mainOsc = osc(
        ctx,
        { type: "square", freq, stopOffset: ctx.currentTime + dur + 0.2 },
        gl,
      );

      if (i === notes.length - 1) {
        lfo(ctx, mainOsc.frequency, 6, 30, {
          startOffset: 0.08,
          stopOffset: ctx.currentTime + dur + 0.2,
        });
      }

      const gh = out(ctx, 1);
      adsr(gh.gain, ctx, { ...PLUCK, peak: v(0.07) }, dur);
      osc(
        ctx,
        {
          type: "sine",
          freq: harmony[i],
          stopOffset: ctx.currentTime + dur + 0.2,
        },
        gh,
      );
    }),
    100,
  );
}

/** Enemy turn signal — ominous low double pulse with noise fill. */
function playEnemyTurn() {
  const ctx = getCtx();

  seq(
    [120, 100, 90].map((freq) => () => {
      const ge = out(ctx, 1);
      adsr(
        ge.gain,
        ctx,
        { attack: 0.01, decay: 0.12, sustain: 0, release: 0, peak: v(0.16) },
        0.05,
      );
      osc(
        ctx,
        { type: "sawtooth", freq, stopOffset: ctx.currentTime + 0.22 },
        ge,
      );

      const gn = out(ctx, 1);
      adsr(
        gn.gain,
        ctx,
        { attack: 0.005, decay: 0.1, sustain: 0, release: 0, peak: v(0.07) },
        0.01,
      );
      whiteNoise(ctx, 0.1, gn, {
        filterType: "bandpass",
        filterFreq: 250,
        filterQ: 2,
      });
    }),
    160,
  );
}

// ─── Element Accents ────────────────────────────────────────

/**
 * Signature move charge-up sequence (~1 s).
 * Phase 1 (0–0.3 s): deep rumble + rising chromatic sweep builds tension.
 * Phase 2 (0.3–0.65 s): shimmering held chord with fast tremolo (the "aura" glow).
 * Phase 3 (0.65 s): sharp distorted burst + pitched impact on the flash hit.
 */
function playSignatureIntro() {
  const ctx = getCtx();

  // ── Phase 1: deep rumble ──────────────────────────────────
  const gRumble = out(ctx, 1);
  adsr(
    gRumble.gain,
    ctx,
    { attack: 0.04, decay: 0.0, sustain: 1.0, release: 0.18, peak: v(0.22) },
    0.62,
  );
  const rumbleOsc = osc(
    ctx,
    {
      type: "sawtooth",
      freq: 55,
      detune: -6,
      stopOffset: ctx.currentTime + 0.85,
    },
    gRumble,
  );
  lfo(ctx, rumbleOsc.frequency, 3, 4, { stopOffset: ctx.currentTime + 0.65 });

  // Sub-bass sine layer
  const gSub = out(ctx, 1);
  adsr(
    gSub.gain,
    ctx,
    { attack: 0.06, decay: 0.0, sustain: 1.0, release: 0.2, peak: v(0.18) },
    0.62,
  );
  osc(
    ctx,
    { type: "sine", freq: 40, stopOffset: ctx.currentTime + 0.85 },
    gSub,
  );

  // Rising chromatic sweep (low → high over 0.6 s)
  const gSweep = out(ctx, 1);
  adsr(
    gSweep.gain,
    ctx,
    { attack: 0.06, decay: 0.0, sustain: 0.7, release: 0.14, peak: v(0.16) },
    0.58,
  );
  const sweepOsc = osc(
    ctx,
    { type: "sawtooth", freq: 120, stopOffset: ctx.currentTime + 0.75 },
    gSweep,
  );
  freqRamp(sweepOsc, ctx, 120, 880, 0.62);

  // Filtered noise breath
  const gBreath = out(ctx, 1);
  adsr(
    gBreath.gain,
    ctx,
    { attack: 0.12, decay: 0.0, sustain: 0.6, release: 0.2, peak: v(0.1) },
    0.5,
  );
  whiteNoise(ctx, 0.72, gBreath, {
    filterType: "bandpass",
    filterFreq: 600,
    filterQ: 1.2,
  });

  // ── Phase 2: shimmering held aura (0.2 s → 0.65 s) ───────
  setTimeout(() => {
    const gChoir = out(ctx, 1);
    adsr(
      gChoir.gain,
      ctx,
      { attack: 0.1, decay: 0.0, sustain: 1.0, release: 0.22, peak: v(0.14) },
      0.38,
    );
    chord(ctx, [440, 554, 659, 880], "sine", gChoir, 0, 0.52);
    lfo(ctx, gChoir.gain, 18, v(0.06), { stopOffset: ctx.currentTime + 0.52 });

    const gHi = out(ctx, 1);
    adsr(
      gHi.gain,
      ctx,
      { attack: 0.08, decay: 0.0, sustain: 0.8, release: 0.18, peak: v(0.1) },
      0.38,
    );
    chord(ctx, [1760, 2200], "triangle", gHi, 0, 0.52);
    lfo(ctx, gHi.gain, 22, v(0.05), { stopOffset: ctx.currentTime + 0.52 });
  }, 200);

  // ── Phase 3: burst impact at the flash (0.65 s) ──────────
  setTimeout(() => {
    // Hard-clipped distorted crunch
    const dist = makeDistortion(ctx, 320);
    dist.connect(ctx.destination);
    const gCrunch = ctx.createGain();
    gCrunch.gain.value = 0;
    adsr(
      gCrunch.gain,
      ctx,
      { attack: 0.002, decay: 0.09, sustain: 0, release: 0, peak: v(0.3) },
      0.01,
    );
    gCrunch.connect(dist);
    const crunchOsc = osc(
      ctx,
      { type: "sawtooth", freq: 180, stopOffset: ctx.currentTime + 0.2 },
      gCrunch,
    );
    freqRamp(crunchOsc, ctx, 180, 60, 0.15);

    // Big pitched impact
    const gImpact = out(ctx, 1);
    adsr(
      gImpact.gain,
      ctx,
      { attack: 0.002, decay: 0.18, sustain: 0, release: 0, peak: v(0.28) },
      0.01,
    );
    const impactOsc = osc(
      ctx,
      { type: "sine", freq: 110, stopOffset: ctx.currentTime + 0.38 },
      gImpact,
    );
    freqRamp(impactOsc, ctx, 110, 35, 0.25);

    // High shimmer burst
    const gShimmer = out(ctx, 1);
    adsr(
      gShimmer.gain,
      ctx,
      { attack: 0.003, decay: 0.12, sustain: 0, release: 0, peak: v(0.18) },
      0.01,
    );
    chord(ctx, [1320, 1760, 2200], "sine", gShimmer, 0, 0.22);

    // Noise blast
    const gNoise = out(ctx, 1);
    adsr(
      gNoise.gain,
      ctx,
      { attack: 0.002, decay: 0.1, sustain: 0, release: 0, peak: v(0.22) },
      0.01,
    );
    whiteNoise(ctx, 0.18, gNoise, {
      filterType: "bandpass",
      filterFreq: 2000,
      filterQ: 0.6,
    });

    void crunchOsc;
    void impactOsc;
  }, 650);

  void rumbleOsc;
  void sweepOsc;
}

/**
 * Element-flavoured attack accent.
 * If `secondary` is provided, a softer version of that element plays after a brief delay.
 */
function playElementAccent(element: string, secondary?: string) {
  const ctx = getCtx();
  _playElementOnce(ctx, element, 1.0);

  if (secondary && secondary !== element) {
    setTimeout(() => {
      const ctx2 = getCtx();
      _playElementOnce(ctx2, secondary, 0.45);
    }, 90);
  }
}

function _playElementOnce(
  ctx: AudioContext,
  element: string,
  volScale: number,
) {
  const vv = (base: number) => v(base * volScale);

  switch (element) {
    case "fire": {
      const gf = out(ctx, 1);
      adsr(
        gf.gain,
        ctx,
        {
          attack: 0.008,
          decay: 0.14,
          sustain: 0.15,
          release: 0.18,
          peak: vv(0.22),
        },
        0.1,
      );
      whiteNoise(ctx, 0.28, gf, {
        filterType: "bandpass",
        filterFreq: 800,
        filterQ: 0.7,
      });
      const gf2 = out(ctx, 1);
      adsr(
        gf2.gain,
        ctx,
        { attack: 0.005, decay: 0.12, sustain: 0, release: 0, peak: vv(0.18) },
        0.02,
      );
      const fireOsc = osc(
        ctx,
        { type: "sawtooth", freq: 300, stopOffset: ctx.currentTime + 0.22 },
        gf2,
      );
      freqRamp(fireOsc, ctx, 300, 150, 0.18);
      break;
    }
    case "water": {
      const gw = out(ctx, 1);
      adsr(
        gw.gain,
        ctx,
        {
          attack: 0.02,
          decay: 0.08,
          sustain: 0.5,
          release: 0.25,
          peak: vv(0.2),
        },
        0.18,
      );
      const w1 = osc(
        ctx,
        { type: "sine", freq: 400, stopOffset: ctx.currentTime + 0.45 },
        gw,
      );
      const w2 = osc(
        ctx,
        {
          type: "sine",
          freq: 500,
          detune: -5,
          stopOffset: ctx.currentTime + 0.38,
        },
        gw,
      );
      freqRamp(w1, ctx, 400, 350, 0.22);
      freqRamp(w2, ctx, 500, 300, 0.22);
      lfo(ctx, w1.frequency, 4, 12, { stopOffset: ctx.currentTime + 0.45 });
      const gn = out(ctx, 1);
      adsr(
        gn.gain,
        ctx,
        { attack: 0.01, decay: 0.2, sustain: 0, release: 0, peak: vv(0.08) },
        0.01,
      );
      whiteNoise(ctx, 0.25, gn, {
        filterType: "bandpass",
        filterFreq: 600,
        filterQ: 2,
      });
      void w2;
      break;
    }
    case "electric": {
      const ge = out(ctx, 1);
      adsr(
        ge.gain,
        ctx,
        { attack: 0.003, decay: 0.05, sustain: 0, release: 0, peak: vv(0.22) },
        0.01,
      );
      chord(ctx, [2000, 1500, 3000], "square", ge, 0, 0.12);
      const gn = out(ctx, 1);
      adsr(
        gn.gain,
        ctx,
        { attack: 0.003, decay: 0.08, sustain: 0, release: 0, peak: vv(0.2) },
        0.01,
      );
      whiteNoise(ctx, 0.12, gn, {
        filterType: "bandpass",
        filterFreq: 3500,
        filterQ: 0.5,
      });
      setTimeout(() => {
        const ge2 = out(ctx, 1);
        adsr(
          ge2.gain,
          ctx,
          {
            attack: 0.002,
            decay: 0.05,
            sustain: 0,
            release: 0,
            peak: vv(0.18),
          },
          0.01,
        );
        chord(ctx, [1800, 2400], "square", ge2, 0, 0.1);
      }, 55);
      break;
    }
    case "earth": {
      const gearth = out(ctx, 1);
      adsr(
        gearth.gain,
        ctx,
        {
          attack: 0.005,
          decay: 0.18,
          sustain: 0.1,
          release: 0.25,
          peak: vv(0.28),
        },
        0.1,
      );
      const earthOsc = osc(
        ctx,
        { type: "sawtooth", freq: 80, stopOffset: ctx.currentTime + 0.45 },
        gearth,
      );
      freqRamp(earthOsc, ctx, 80, 40, 0.2);
      const gn = out(ctx, 1);
      adsr(
        gn.gain,
        ctx,
        { attack: 0.005, decay: 0.15, sustain: 0, release: 0, peak: vv(0.2) },
        0.01,
      );
      whiteNoise(ctx, 0.2, gn, {
        filterType: "lowpass",
        filterFreq: 350,
        filterQ: 0.6,
      });
      lfo(ctx, earthOsc.frequency, 3, 5, {
        stopOffset: ctx.currentTime + 0.45,
      });
      break;
    }
    case "ice": {
      const gi = out(ctx, 1);
      adsr(
        gi.gain,
        ctx,
        {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.2,
          release: 0.2,
          peak: vv(0.16),
        },
        0.12,
      );
      chord(ctx, [1800, 2200, 2800], "sine", gi, 0, 0.42);
      lfo(ctx, gi.gain, 12, vv(0.06), { stopOffset: ctx.currentTime + 0.42 });
      const gn = out(ctx, 1);
      adsr(
        gn.gain,
        ctx,
        { attack: 0.005, decay: 0.18, sustain: 0, release: 0, peak: vv(0.1) },
        0.01,
        0.05,
      );
      whiteNoise(ctx, 0.22, gn, {
        filterType: "highpass",
        filterFreq: 4000,
        filterQ: 1,
        startOffset: 0.05,
      });
      break;
    }
    case "shadow": {
      const gs = out(ctx, 1);
      adsr(
        gs.gain,
        ctx,
        {
          attack: 0.015,
          decay: 0.08,
          sustain: 0.6,
          release: 0.3,
          peak: vv(0.18),
        },
        0.2,
      );
      osc(
        ctx,
        {
          type: "sawtooth",
          freq: 150,
          detune: -30,
          stopOffset: ctx.currentTime + 0.52,
        },
        gs,
      );
      osc(
        ctx,
        {
          type: "sawtooth",
          freq: 150,
          detune: 30,
          stopOffset: ctx.currentTime + 0.52,
        },
        gs,
      );
      lfo(ctx, gs.gain, 7, vv(0.09), { stopOffset: ctx.currentTime + 0.52 });
      break;
    }
    case "wind": {
      const gwind = out(ctx, 1);
      adsr(
        gwind.gain,
        ctx,
        {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.3,
          release: 0.22,
          peak: vv(0.18),
        },
        0.18,
      );
      whiteNoise(ctx, 0.32, gwind, {
        filterType: "bandpass",
        filterFreq: 900,
        filterQ: 1.5,
      });
      const gw = out(ctx, 1);
      adsr(
        gw.gain,
        ctx,
        {
          attack: 0.015,
          decay: 0.08,
          sustain: 0.2,
          release: 0.18,
          peak: vv(0.12),
        },
        0.14,
      );
      const windOsc = osc(
        ctx,
        { type: "sine", freq: 800, stopOffset: ctx.currentTime + 0.38 },
        gw,
      );
      freqRamp(windOsc, ctx, 800, 1300, 0.22);
      break;
    }
    case "nature": {
      const gn = out(ctx, 1);
      adsr(
        gn.gain,
        ctx,
        {
          attack: 0.015,
          decay: 0.12,
          sustain: 0.2,
          release: 0.2,
          peak: vv(0.14),
        },
        0.14,
      );
      whiteNoise(ctx, 0.28, gn, {
        filterType: "bandpass",
        filterFreq: 400,
        filterQ: 1.2,
      });
      const gnat = out(ctx, 1);
      adsr(
        gnat.gain,
        ctx,
        {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.4,
          release: 0.25,
          peak: vv(0.18),
        },
        0.18,
      );
      chord(ctx, [260, 330, 392], "triangle", gnat, 0, 0.45);
      lfo(ctx, gnat.gain, 5, vv(0.05), { stopOffset: ctx.currentTime + 0.45 });
      break;
    }
    case "psychic": {
      const gp = out(ctx, 1);
      adsr(
        gp.gain,
        ctx,
        {
          attack: 0.02,
          decay: 0.08,
          sustain: 0.6,
          release: 0.3,
          peak: vv(0.2),
        },
        0.2,
      );
      osc(
        ctx,
        {
          type: "sine",
          freq: 600,
          detune: 20,
          stopOffset: ctx.currentTime + 0.52,
        },
        gp,
      );
      osc(
        ctx,
        {
          type: "sine",
          freq: 600,
          detune: -20,
          stopOffset: ctx.currentTime + 0.52,
        },
        gp,
      );
      const go = out(ctx, 1);
      adsr(
        go.gain,
        ctx,
        {
          attack: 0.03,
          decay: 0.1,
          sustain: 0.3,
          release: 0.25,
          peak: vv(0.1),
        },
        0.18,
        0.06,
      );
      osc(
        ctx,
        { type: "sine", freq: 1800, stopOffset: ctx.currentTime + 0.52 },
        go,
      );
      break;
    }
    case "metal": {
      const gm = out(ctx, 1);
      adsr(
        gm.gain,
        ctx,
        {
          attack: 0.003,
          decay: 0.06,
          sustain: 0.15,
          release: 0.35,
          peak: vv(0.22),
        },
        0.04,
      );
      chord(ctx, [1600, 2400], "square", gm, 0, 0.52);
      const dist = makeDistortion(ctx, 80);
      dist.connect(ctx.destination);
      const gdist = ctx.createGain();
      gdist.gain.value = 0;
      adsr(
        gdist.gain,
        ctx,
        { attack: 0.003, decay: 0.1, sustain: 0, release: 0, peak: vv(0.12) },
        0.01,
      );
      gdist.connect(dist);
      whiteNoise(ctx, 0.14, gdist, {
        filterType: "bandpass",
        filterFreq: 3000,
        filterQ: 1.5,
      });
      break;
    }
    case "light": {
      const gl = out(ctx, 1);
      adsr(
        gl.gain,
        ctx,
        {
          attack: 0.01,
          decay: 0.08,
          sustain: 0.3,
          release: 0.3,
          peak: vv(0.18),
        },
        0.16,
      );
      chord(ctx, [1400, 1800, 2200, 2800], "sine", gl, 0, 0.52);
      lfo(ctx, gl.gain, 15, vv(0.05), { stopOffset: ctx.currentTime + 0.52 });
      const gn = out(ctx, 1);
      adsr(
        gn.gain,
        ctx,
        { attack: 0.008, decay: 0.15, sustain: 0, release: 0, peak: vv(0.1) },
        0.01,
      );
      whiteNoise(ctx, 0.2, gn, {
        filterType: "highpass",
        filterFreq: 5000,
        filterQ: 0.8,
      });
      break;
    }
    case "toxic": {
      const gt = out(ctx, 1);
      adsr(
        gt.gain,
        ctx,
        {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.3,
          release: 0.22,
          peak: vv(0.18),
        },
        0.14,
      );
      const t1 = osc(
        ctx,
        {
          type: "sawtooth",
          freq: 220,
          detune: 10,
          stopOffset: ctx.currentTime + 0.42,
        },
        gt,
      );
      const t2 = osc(
        ctx,
        {
          type: "sawtooth",
          freq: 220,
          detune: -10,
          stopOffset: ctx.currentTime + 0.42,
        },
        gt,
      );
      freqRamp(t1, ctx, 220, 160, 0.22);
      freqRamp(t2, ctx, 220, 180, 0.22);
      const gn = out(ctx, 1);
      adsr(
        gn.gain,
        ctx,
        { attack: 0.008, decay: 0.18, sustain: 0, release: 0, peak: vv(0.16) },
        0.01,
      );
      whiteNoise(ctx, 0.24, gn, {
        filterType: "bandpass",
        filterFreq: 600,
        filterQ: 1,
      });
      void t1;
      void t2;
      break;
    }
    case "void": {
      // The absence of sound: deep sub-bass implosion thud, near-silence breath,
      // then a faint high spectral shimmer — like reality being swallowed.

      // Sub-bass implosion thud (very low, immediate, heavy)
      const gThud = out(ctx, 1);
      adsr(
        gThud.gain,
        ctx,
        { attack: 0.003, decay: 0.22, sustain: 0, release: 0, peak: vv(0.32) },
        0.01,
      );
      const thudOsc = osc(
        ctx,
        { type: "sine", freq: 42, stopOffset: ctx.currentTime + 0.38 },
        gThud,
      );
      freqRamp(thudOsc, ctx, 42, 18, 0.28);

      // Second lower sub pulse — feels like a black hole pulling
      const gPulse = out(ctx, 1);
      adsr(
        gPulse.gain,
        ctx,
        { attack: 0.01, decay: 0.28, sustain: 0, release: 0, peak: vv(0.2) },
        0.05,
      );
      const pulseOsc = osc(
        ctx,
        { type: "sawtooth", freq: 28, stopOffset: ctx.currentTime + 0.45 },
        gPulse,
      );
      freqRamp(pulseOsc, ctx, 28, 10, 0.3);

      // Vacuum-like filtered noise breath (lowpass, very quiet — the silence)
      const gVacuum = out(ctx, 1);
      adsr(
        gVacuum.gain,
        ctx,
        {
          attack: 0.04,
          decay: 0.0,
          sustain: 1.0,
          release: 0.3,
          peak: vv(0.07),
        },
        0.42,
      );
      whiteNoise(ctx, 0.55, gVacuum, {
        filterType: "lowpass",
        filterFreq: 180,
        filterQ: 0.5,
      });

      // Faint spectral shimmer at the end (a distant high tone, like a ghost)
      setTimeout(() => {
        const gShimmer = out(ctx, 1);
        adsr(
          gShimmer.gain,
          ctx,
          {
            attack: 0.08,
            decay: 0.0,
            sustain: 1.0,
            release: 0.35,
            peak: vv(0.06),
          },
          0.25,
        );
        chord(ctx, [3200, 4000, 5200], "sine", gShimmer, 0, 0.42);
        lfo(ctx, gShimmer.gain, 6, vv(0.03), {
          stopOffset: ctx.currentTime + 0.42,
        });
      }, 160);

      void thudOsc;
      void pulseOsc;
      break;
    }
    default: {
      const gg = out(ctx, 1);
      adsr(
        gg.gain,
        ctx,
        {
          attack: 0.008,
          decay: 0.12,
          sustain: 0.1,
          release: 0.15,
          peak: vv(0.18),
        },
        0.1,
      );
      whiteNoise(ctx, 0.18, gg, {
        filterType: "bandpass",
        filterFreq: 600,
        filterQ: 1,
      });
      const go2 = out(ctx, 1);
      adsr(
        go2.gain,
        ctx,
        { attack: 0.008, decay: 0.1, sustain: 0, release: 0, peak: vv(0.18) },
        0.02,
      );
      osc(
        ctx,
        { type: "sawtooth", freq: 400, stopOffset: ctx.currentTime + 0.22 },
        go2,
      );
      break;
    }
  }
}

// ─── Mute control ───────────────────────────────────────────

/** Evolution fanfare — 3 phases:
 *  1. Low rumble + rising freq sweep (monster "charging up")
 *  2. Sparkling shimmer layer (crystalline transformation)
 *  3. Triumphant chord impact + tail
 */
function playEvolution() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Phase 1: sub-bass power rumble (0–0.6s)
  const rumble = out(ctx, 1);
  adsr(
    rumble.gain,
    ctx,
    { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.4, peak: v(0.22) },
    0.55,
    now,
  );
  freqRamp(
    osc(ctx, { type: "sine", freq: 55, startOffset: now }, rumble),
    ctx,
    55,
    200,
    0.6,
    now,
  );

  // Sub-harmonic bump
  const sub = out(ctx, 1);
  adsr(
    sub.gain,
    ctx,
    { attack: 0.02, decay: 0.3, sustain: 0.0, release: 0.0, peak: v(0.18) },
    0.32,
    now,
  );
  osc(
    ctx,
    { type: "sine", freq: 40, startOffset: now, stopOffset: now + 0.32 },
    sub,
  );

  // Phase 2: rising chromatic sweep (0.3–1.5s)
  const sweep = out(ctx, 1);
  adsr(
    sweep.gain,
    ctx,
    { attack: 0.08, decay: 0.1, sustain: 0.6, release: 0.5, peak: v(0.12) },
    1.1,
    now + 0.3,
  );
  freqRamp(
    osc(ctx, { type: "sine", freq: 200, startOffset: now + 0.3 }, sweep),
    ctx,
    200,
    1600,
    1.1,
    now + 0.3,
  );

  // Phase 2: sparkle shimmer — 3 detuned high sines
  const sparkleFreqs = [2400, 3200, 4800, 6400];
  sparkleFreqs.forEach((freq, i) => {
    const sg = out(ctx, 1);
    adsr(
      sg.gain,
      ctx,
      {
        attack: 0.1 + i * 0.06,
        decay: 0.0,
        sustain: 0.8,
        release: 0.6,
        peak: v(0.05),
      },
      0.7,
      now + 0.5 + i * 0.12,
    );
    osc(
      ctx,
      {
        type: "sine",
        freq,
        startOffset: now + 0.5 + i * 0.12,
        stopOffset: now + 1.3 + i * 0.12,
      },
      sg,
    );
  });

  // Phase 3: triumphant chord impact (1.4s)
  const impactGain = out(ctx, 1);
  adsr(
    impactGain.gain,
    ctx,
    { attack: 0.02, decay: 0.2, sustain: 0.5, release: 0.8, peak: v(0.22) },
    1.0,
    now + 1.4,
  );
  chord(
    ctx,
    [523, 659, 784, 1047],
    "triangle",
    impactGain,
    now + 1.4,
    now + 2.4,
  );

  // Bright overtone layer
  const shineGain = out(ctx, 1);
  adsr(
    shineGain.gain,
    ctx,
    { attack: 0.03, decay: 0.15, sustain: 0.4, release: 0.7, peak: v(0.1) },
    0.85,
    now + 1.42,
  );
  chord(ctx, [1047, 1319, 1568], "sine", shineGain, now + 1.42, now + 2.27);
}

function toggleMute() {
  isMuted.value = !isMuted.value;
}

/**
 * Stat boost — soft "power welling up" feel:
 *  A warm sine swell that rises in pitch + a pair of bell pings + high shimmer breath.
 *  Subtle, magical, distinct from the arpeggio fanfares elsewhere.
 */
function playStatUp() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Rising sine swell — starts low, glides upward smoothly
  const gSwell = out(ctx, 1);
  adsr(
    gSwell.gain,
    ctx,
    { attack: 0.08, decay: 0.0, sustain: 1.0, release: 0.4, peak: v(0.06) },
    0.45,
    now,
  );
  const swellOsc = osc(
    ctx,
    { type: "sine", freq: 220, startOffset: now, stopOffset: now + 0.55 },
    gSwell,
  );
  freqRamp(swellOsc, ctx, 220, 660, 0.45, now);

  // Detuned second swell for warmth
  const gSwell2 = out(ctx, 1);
  adsr(
    gSwell2.gain,
    ctx,
    { attack: 0.1, decay: 0.0, sustain: 1.0, release: 0.4, peak: v(0.035) },
    0.45,
    now,
  );
  const swellOsc2 = osc(
    ctx,
    { type: "sine", freq: 222, startOffset: now, stopOffset: now + 0.55 },
    gSwell2,
  );
  freqRamp(swellOsc2, ctx, 222, 664, 0.45, now);

  // Bell ping 1 — hits at the midpoint
  const t1 = now + 0.18;
  const gBell1 = out(ctx, 1);
  adsr(
    gBell1.gain,
    ctx,
    { attack: 0.003, decay: 0.18, sustain: 0.0, release: 0.0, peak: v(0.07) },
    0.18,
    t1,
  );
  osc(
    ctx,
    { type: "sine", freq: 1047, startOffset: t1, stopOffset: t1 + 0.28 },
    gBell1,
  );

  // Bell ping 2 — slightly higher, a beat later
  const t2 = now + 0.32;
  const gBell2 = out(ctx, 1);
  adsr(
    gBell2.gain,
    ctx,
    { attack: 0.003, decay: 0.22, sustain: 0.0, release: 0.0, peak: v(0.055) },
    0.22,
    t2,
  );
  osc(
    ctx,
    { type: "sine", freq: 1319, startOffset: t2, stopOffset: t2 + 0.32 },
    gBell2,
  );

  // Airy highpass noise breath — feels like energy gathering
  const gBreath = out(ctx, 1);
  adsr(
    gBreath.gain,
    ctx,
    { attack: 0.12, decay: 0.1, sustain: 0.3, release: 0.35, peak: v(0.04) },
    0.35,
    now,
  );
  whiteNoise(ctx, 0.55, gBreath, {
    filterType: "highpass",
    filterFreq: 5500,
    filterQ: 0.8,
  });

  void swellOsc;
  void swellOsc2;
}

// ─── Monster Cries ───────────────────────────────────────────

/** Deterministic float 0–1 derived from a monster's id string. */
function idHash(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) % 997;
  }
  return h / 996;
}

/**
 * Unique synthesized cry played when a monster enters battle.
 * Sound parameters are deterministically derived from the monster's stats and id.
 */
function playMonsterCry(monster: {
  id: string;
  element: ElementType;
  speed: number;
  attack: number;
  defense: number;
  baseHP: number;
}) {
  const ctx = getCtx();
  const { id, element, speed, attack, defense, baseHP } = monster;
  const hash = idHash(id);

  // Base frequency from speed (faster monsters pitch higher) + per-id variance
  const baseFreq = 80 + (speed / 130) * 320 + (hash * 40 - 20);

  // Duration from baseHP (tankier monsters cry longer)
  const duration = 0.8 + (baseHP / 120) * 0.9;

  // Sweep direction: attack-heavy → rising; defense-heavy → falling; balanced → slight rise
  const endFreq =
    attack > defense
      ? baseFreq * (1.4 + hash * 0.3)
      : defense > attack
        ? baseFreq * (0.55 + hash * 0.2)
        : baseFreq * (0.9 + hash * 0.2);

  // Oscillator type derived from element
  const elementOscType = ((): OscillatorType => {
    switch (element) {
      case "fire":
      case "metal":
        return "sawtooth";
      case "water":
      case "ice":
      case "light":
        return "sine";
      case "electric":
        return "square";
      case "wind":
      case "psychic":
        return "triangle";
      default:
        // shadow, void, toxic, earth, nature
        return "sawtooth";
    }
  })();

  const stopAt = ctx.currentTime + duration + 0.08;

  // Main cry oscillator with frequency sweep
  const gCry = out(ctx, 1);
  adsr(
    gCry.gain,
    ctx,
    {
      attack: 0.02,
      decay: duration * 0.2,
      sustain: 0.6,
      release: duration * 0.35,
      peak: v(0.28),
    },
    duration,
  );
  const cryOsc = osc(
    ctx,
    { type: elementOscType, freq: baseFreq, stopOffset: stopAt },
    gCry,
  );
  freqRamp(cryOsc, ctx, baseFreq, endFreq, duration * 0.8);

  // Vibrato — rate and depth vary per monster id
  lfo(ctx, cryOsc.frequency, 4 + hash * 6, 8 + hash * 18, {
    stopOffset: stopAt,
  });

  // Dark elements: add a distorted under-tone
  if (element === "shadow" || element === "void" || element === "toxic") {
    const dist = makeDistortion(ctx, 120 + hash * 80);
    dist.connect(ctx.destination);
    const gDist = ctx.createGain();
    gDist.gain.value = 0;
    adsr(
      gDist.gain,
      ctx,
      {
        attack: 0.03,
        decay: duration * 0.25,
        sustain: 0.3,
        release: duration * 0.4,
        peak: v(0.1),
      },
      duration,
    );
    gDist.connect(dist);
    osc(
      ctx,
      { type: "sawtooth", freq: baseFreq * 0.5, stopOffset: stopAt },
      gDist,
    );
  }

  // Electric: add a fizzy bandpass noise burst
  if (element === "electric") {
    const gNoise = out(ctx, 1);
    adsr(
      gNoise.gain,
      ctx,
      {
        attack: 0.01,
        decay: duration * 0.3,
        sustain: 0,
        release: 0,
        peak: v(0.08),
      },
      duration * 0.4,
    );
    whiteNoise(ctx, duration * 0.4 + 0.05, gNoise, {
      filterType: "bandpass",
      filterFreq: 3000 + hash * 2000,
      filterQ: 2,
    });
  }
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
    playSignatureIntro,
    playEvolution,
    playStatUp,
    playMonsterCry,
  };
}
