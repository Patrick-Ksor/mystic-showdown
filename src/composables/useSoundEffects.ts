/**
 * Web Audio API synthesizer — generates all game sounds procedurally.
 * Uses useSoundEngine.ts for reusable synthesis primitives.
 * No audio files needed.
 */
import { ref } from "vue";
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
      // Alien beating: two detuned saws + ring-mod pulse + highpass noise tail
      const gvoid = out(ctx, 1);
      adsr(
        gvoid.gain,
        ctx,
        {
          attack: 0.02,
          decay: 0.08,
          sustain: 0.6,
          release: 0.4,
          peak: vv(0.18),
        },
        0.22,
      );
      osc(
        ctx,
        { type: "sawtooth", freq: 196, stopOffset: ctx.currentTime + 0.65 },
        gvoid,
      );
      osc(
        ctx,
        { type: "sawtooth", freq: 244, stopOffset: ctx.currentTime + 0.65 },
        gvoid,
      );
      lfo(ctx, gvoid.gain, 7, vv(0.1), { stopOffset: ctx.currentTime + 0.65 });
      const gsub = out(ctx, 1);
      adsr(
        gsub.gain,
        ctx,
        {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.4,
          release: 0.3,
          peak: vv(0.12),
        },
        0.18,
      );
      osc(
        ctx,
        { type: "sine", freq: 55, stopOffset: ctx.currentTime + 0.52 },
        gsub,
      );
      const gn = out(ctx, 1);
      adsr(
        gn.gain,
        ctx,
        { attack: 0.01, decay: 0.2, sustain: 0, release: 0, peak: vv(0.1) },
        0.01,
        0.04,
      );
      whiteNoise(ctx, 0.28, gn, {
        filterType: "highpass",
        filterFreq: 3500,
        filterQ: 0.8,
        startOffset: 0.04,
      });
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
