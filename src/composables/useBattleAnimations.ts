import gsap from "gsap";
import type { ElementType } from "@/types";
import { ELEMENT_COLORS } from "@/types";
import { gsapPromise } from "./useGsapContext";

function rnd(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeParticle(parent: HTMLElement, css: string): HTMLDivElement {
  const p = document.createElement("div");
  p.style.cssText = css;
  parent.style.position = "relative";
  parent.appendChild(p);
  return p;
}

// ─── Attack Animations by Element ────────────────────────────

async function fireAttack(targetEl: HTMLElement): Promise<void> {
  const parent = targetEl.parentElement;
  const tl = gsap.timeline();

  // Heat-shockwave overlay sweeps from right
  if (parent) {
    const wave = makeParticle(
      parent,
      `position:absolute;top:0;right:-110%;width:110%;height:100%;
       background:linear-gradient(270deg,transparent,#ff4d0055,#ff800066,#ff4d0033,transparent);
       pointer-events:none;z-index:50;`,
    );
    tl.to(
      wave,
      {
        right: "100%",
        duration: 0.28,
        ease: "power3.in",
        onComplete: () => wave.remove(),
      },
      0,
    );
  }

  // Target: flare + scale recoil
  tl.to(
    targetEl,
    {
      filter: "brightness(3) drop-shadow(0 0 35px #ff4d00)",
      scale: 1.12,
      duration: 0.12,
    },
    0.15,
  );
  tl.to(targetEl, { scale: 0.93, duration: 0.1, ease: "power2.in" });
  tl.to(targetEl, {
    scale: 1,
    filter: "none",
    duration: 0.3,
    ease: "back.out(2)",
  });

  // 20 ember particles
  if (parent) {
    for (let i = 0; i < 20; i++) {
      const p = makeParticle(
        parent,
        `position:absolute;width:${rnd(5, 10)}px;height:${rnd(5, 10)}px;border-radius:50%;
         background:${Math.random() > 0.5 ? "#ff4d00" : "#ff8c00"};
         top:50%;left:50%;pointer-events:none;z-index:50;
         box-shadow:0 0 6px #ff4d00;filter:blur(0.5px);`,
      );
      const angle = (i / 20) * Math.PI * 2;
      const dist = rnd(45, 90);
      gsap.to(p, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - rnd(10, 30),
        opacity: 0,
        scale: 0,
        duration: rnd(0.45, 0.75),
        delay: 0.15,
        ease: "power2.out",
        onComplete: () => p.remove(),
      });
    }
  }

  return gsapPromise(tl);
}

async function waterAttack(targetEl: HTMLElement): Promise<void> {
  const parent = targetEl.parentElement;
  const tl = gsap.timeline();

  if (parent) {
    // Primary wave left→right
    const wave1 = makeParticle(
      parent,
      `position:absolute;top:0;left:-105%;width:105%;height:100%;
       background:linear-gradient(90deg,transparent,#00bfff55,#00bfffaa,#00bfff55,transparent);
       pointer-events:none;z-index:50;border-radius:8px;`,
    );
    // Secondary wave right→left
    const wave2 = makeParticle(
      parent,
      `position:absolute;top:0;right:-105%;width:105%;height:100%;
       background:linear-gradient(270deg,transparent,#00bfff33,#00bfff77,#00bfff33,transparent);
       pointer-events:none;z-index:49;border-radius:8px;`,
    );
    tl.to(
      wave1,
      {
        left: "105%",
        duration: 0.38,
        ease: "power2.inOut",
        onComplete: () => wave1.remove(),
      },
      0,
    );
    tl.to(
      wave2,
      {
        right: "105%",
        duration: 0.38,
        ease: "power2.inOut",
        onComplete: () => wave2.remove(),
      },
      0.14,
    );

    // 10 water droplets erupting upward
    for (let i = 0; i < 10; i++) {
      const drop = makeParticle(
        parent,
        `position:absolute;width:${rnd(4, 8)}px;height:${rnd(6, 12)}px;
         border-radius:50% 50% 50% 0;background:rgba(0,191,255,${rnd(0.6, 0.9).toFixed(2)});
         bottom:10%;left:${rnd(20, 80).toFixed(1)}%;pointer-events:none;z-index:50;`,
      );
      gsap.to(drop, {
        y: -rnd(50, 100),
        x: rnd(-25, 25),
        opacity: 0,
        duration: rnd(0.5, 0.8),
        delay: rnd(0, 0.15),
        ease: "power2.out",
        onComplete: () => drop.remove(),
      });
    }
  }

  // Target: blue tint + horizontal tremor
  tl.to(
    targetEl,
    {
      filter: "brightness(2) hue-rotate(180deg) saturate(1.5)",
      duration: 0.15,
    },
    0.1,
  );
  tl.to(
    targetEl,
    { x: -10, duration: 0.06, yoyo: true, repeat: 3, ease: "power2.inOut" },
    0.15,
  );
  tl.to(targetEl, { filter: "none", duration: 0.3 }, 0.35);
  tl.set(targetEl, { x: 0 });

  return gsapPromise(tl);
}

async function electricAttack(targetEl: HTMLElement): Promise<void> {
  const parent = targetEl.parentElement;
  const tl = gsap.timeline();

  // 5 zigzag bolt divs
  if (parent) {
    for (let i = 0; i < 5; i++) {
      const bolt = makeParticle(
        parent,
        `position:absolute;width:${rnd(2, 4)}px;height:${rnd(30, 60)}px;
         background:linear-gradient(180deg,#ffe44d,rgba(255,228,77,0.2));
         top:${rnd(10, 50).toFixed(1)}%;left:${rnd(20, 80).toFixed(1)}%;
         transform:rotate(${rnd(-25, 25).toFixed(1)}deg);
         border-radius:2px;pointer-events:none;z-index:50;
         box-shadow:0 0 8px #ffe44d,0 0 20px #ffe44d88;opacity:0;`,
      );
      tl.to(bolt, { opacity: 1, duration: 0.04, delay: i * 0.06 }, 0);
      tl.to(
        bolt,
        { opacity: 0, duration: 0.06, onComplete: () => bolt.remove() },
        i * 0.06 + 0.04,
      );
    }

    // 12 spark particles
    for (let i = 0; i < 12; i++) {
      const spark = makeParticle(
        parent,
        `position:absolute;width:${rnd(2, 5)}px;height:${rnd(2, 5)}px;
         border-radius:50%;background:${Math.random() > 0.5 ? "#ffe44d" : "#fff9c4"};
         top:50%;left:50%;pointer-events:none;z-index:50;box-shadow:0 0 6px #ffe44d;`,
      );
      const angle = (i / 12) * Math.PI * 2;
      const dist = rnd(30, 75);
      gsap.to(spark, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        duration: rnd(0.3, 0.55),
        delay: 0.18,
        ease: "power2.out",
        onComplete: () => spark.remove(),
      });
    }
  }

  // 5 rapid flickers
  for (let i = 0; i < 5; i++) {
    tl.to(targetEl, {
      filter: "brightness(5) drop-shadow(0 0 30px #ffe44d)",
      duration: 0.04,
    });
    tl.to(targetEl, { filter: "brightness(1)", duration: 0.05 });
  }
  tl.to(targetEl, {
    filter: "brightness(2) drop-shadow(0 0 15px #ffe44d)",
    duration: 0.08,
  });
  tl.to(targetEl, { filter: "none", duration: 0.2 });

  return gsapPromise(tl);
}

async function earthAttack(targetEl: HTMLElement): Promise<void> {
  const parent = targetEl.parentElement;
  const tl = gsap.timeline();

  // Extended screen rumble
  const container = targetEl.closest(".battle-scene") as HTMLElement | null;
  if (container) {
    tl.to(
      container,
      { x: 10, duration: 0.05, yoyo: true, repeat: 9, ease: "power2.inOut" },
      0,
    );
    tl.set(container, { x: 0 });
  }

  // 3 crack lines from bottom center
  if (parent) {
    const angles = [-15, 0, 15];
    angles.forEach((deg, idx) => {
      const crack = makeParticle(
        parent,
        `position:absolute;width:3px;height:0;
         background:linear-gradient(180deg,#5a3e1b,rgba(90,62,27,0));
         bottom:0;left:calc(50% + ${(idx - 1) * 18}px);pointer-events:none;z-index:50;
         transform-origin:bottom center;transform:rotate(${deg}deg);`,
      );
      tl.to(
        crack,
        {
          height: rnd(55, 90),
          duration: 0.2,
          ease: "power2.out",
          delay: idx * 0.04,
        },
        0.05,
      );
      tl.to(
        crack,
        { opacity: 0, duration: 0.2, onComplete: () => crack.remove() },
        0.45,
      );
    });

    // 16 dust/rock particles
    for (let i = 0; i < 16; i++) {
      const p = makeParticle(
        parent,
        `position:absolute;width:${rnd(4, 9)}px;height:${rnd(4, 9)}px;
         border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
         background:${Math.random() > 0.5 ? "#c48a2a" : "#8b6914"};
         bottom:8%;left:${rnd(25, 75).toFixed(1)}%;pointer-events:none;z-index:50;`,
      );
      gsap.to(p, {
        y: -rnd(40, 90),
        x: rnd(-40, 40),
        rotation: rnd(-120, 120),
        opacity: 0,
        duration: rnd(0.5, 0.85),
        ease: "power1.out",
        onComplete: () => p.remove(),
      });
    }
  }

  // Target: sepia slam + bounce
  tl.to(
    targetEl,
    { filter: "brightness(1.8) sepia(0.6)", scaleY: 0.88, duration: 0.1 },
    0.1,
  );
  tl.to(
    targetEl,
    { filter: "none", scaleY: 1, duration: 0.35, ease: "back.out(2)" },
    0.22,
  );

  return gsapPromise(tl);
}

async function iceAttack(targetEl: HTMLElement): Promise<void> {
  const parent = targetEl.parentElement;
  const tl = gsap.timeline();

  // 7 ice spike pillars rising from bottom
  if (parent) {
    for (let i = 0; i < 7; i++) {
      const spike = makeParticle(
        parent,
        `position:absolute;width:${rnd(5, 10)}px;height:0;
         background:linear-gradient(180deg,rgba(125,211,252,0.9),rgba(186,230,255,0.5));
         bottom:0;left:${15 + i * 11}%;pointer-events:none;z-index:50;
         border-radius:3px 3px 0 0;
         clip-path:polygon(20% 0%,80% 0%,100% 100%,0% 100%);`,
      );
      tl.to(
        spike,
        {
          height: rnd(40, 85),
          duration: 0.18,
          delay: i * 0.04,
          ease: "power3.out",
        },
        0,
      );
      tl.to(
        spike,
        { opacity: 0, duration: 0.25, onComplete: () => spike.remove() },
        0.45,
      );
    }
  }

  // Frost overlay — more opaque
  if (parent) {
    const frost = makeParticle(
      parent,
      `position:absolute;top:0;left:0;width:100%;height:100%;
       background:radial-gradient(circle,#7dd3fc55,#bae6ff33,transparent);
       pointer-events:none;z-index:49;border-radius:8px;opacity:0;
       box-shadow:inset 0 0 25px #7dd3fc44;`,
    );
    tl.to(frost, { opacity: 1, duration: 0.18 }, 0.05);
    tl.to(
      frost,
      { opacity: 0, duration: 0.45, onComplete: () => frost.remove() },
      0.3,
    );
  }

  // Target: blue flash + freeze shrink
  tl.to(
    targetEl,
    {
      filter: "brightness(2) hue-rotate(170deg) saturate(2)",
      scale: 0.92,
      duration: 0.15,
    },
    0.1,
  );
  tl.to(
    targetEl,
    { filter: "none", scale: 1, duration: 0.4, ease: "back.out(1.5)" },
    0.3,
  );

  return gsapPromise(tl);
}

async function shadowAttack(targetEl: HTMLElement): Promise<void> {
  const parent = targetEl.parentElement;
  const tl = gsap.timeline();

  if (parent) {
    // Spinning dark vortex overlay
    const vortex = makeParticle(
      parent,
      `position:absolute;top:50%;left:50%;width:30px;height:30px;
       border-radius:50%;
       background:conic-gradient(#1a0030,#6b21a8,#1a0030,#7c3aed,#1a0030);
       pointer-events:none;z-index:50;opacity:0;
       transform:translate(-50%,-50%);`,
    );
    tl.to(
      vortex,
      {
        width: 200,
        height: 200,
        opacity: 0.75,
        rotation: 360,
        duration: 0.6,
        ease: "power2.out",
      },
      0,
    );
    tl.to(
      vortex,
      {
        opacity: 0,
        scale: 1.5,
        duration: 0.25,
        onComplete: () => vortex.remove(),
      },
      0.6,
    );

    // 3 expanding concentric rings
    for (let i = 0; i < 3; i++) {
      const ring = makeParticle(
        parent,
        `position:absolute;top:50%;left:50%;width:18px;height:18px;
         border:2px solid ${i === 1 ? "#7c3aed" : "#a855f7"};
         border-radius:50%;transform:translate(-50%,-50%);
         pointer-events:none;z-index:51;opacity:0.9;
         box-shadow:0 0 12px #7c3aed,inset 0 0 8px #7c3aed44;`,
      );
      tl.to(
        ring,
        {
          width: 140 + i * 40,
          height: 140 + i * 40,
          opacity: 0,
          duration: 0.55,
          delay: i * 0.1,
          ease: "power2.out",
          onComplete: () => ring.remove(),
        },
        0.1,
      );
    }
  }

  // Target: darkness + scale implosion
  tl.to(
    targetEl,
    {
      opacity: 0.2,
      scale: 0.87,
      filter: "brightness(0.15) saturate(3)",
      duration: 0.25,
    },
    0,
  );
  tl.to(
    targetEl,
    {
      opacity: 1,
      scale: 1,
      filter: "none",
      duration: 0.35,
      ease: "back.out(1.5)",
    },
    0.45,
  );

  return gsapPromise(tl);
}

async function windAttack(targetEl: HTMLElement): Promise<void> {
  const parent = targetEl.parentElement;
  const tl = gsap.timeline();

  // 12 slash lines at multiple angles
  if (parent) {
    const slashConfigs = [
      { w: 70, angle: -10, top: 20, delay: 0 },
      { w: 55, angle: 8, top: 38, delay: 0.04 },
      { w: 85, angle: -18, top: 55, delay: 0.02 },
      { w: 45, angle: 15, top: 70, delay: 0.06 },
      { w: 65, angle: -5, top: 15, delay: 0.08 },
      { w: 50, angle: 22, top: 80, delay: 0.03 },
      { w: 75, angle: -12, top: 45, delay: 0.05 },
      { w: 40, angle: 5, top: 62, delay: 0.07 },
      { w: 90, angle: -8, top: 30, delay: 0.01 },
      { w: 60, angle: 18, top: 50, delay: 0.09 },
      { w: 35, angle: -20, top: 75, delay: 0.04 },
      { w: 80, angle: 10, top: 25, delay: 0.06 },
    ];
    slashConfigs.forEach(({ w, angle, top, delay }) => {
      const line = makeParticle(
        parent,
        `position:absolute;width:${w}px;height:${rnd(2, 4)}px;
         background:linear-gradient(90deg,transparent,rgba(110,231,183,0.9),transparent);
         top:${top}%;left:-${w + 10}px;border-radius:2px;
         pointer-events:none;z-index:50;opacity:0.85;
         transform:rotate(${angle}deg);`,
      );
      gsap.to(line, {
        left: "115%",
        duration: rnd(0.2, 0.35),
        delay,
        ease: "power3.in",
        onComplete: () => line.remove(),
      });
    });
  }

  // Target: simultaneous x/y shake + strong tint
  tl.to(targetEl, {
    filter: "brightness(1.8) hue-rotate(100deg) saturate(1.5)",
    duration: 0.1,
  });
  tl.to(
    targetEl,
    { x: 14, duration: 0.05, yoyo: true, repeat: 5, ease: "power2.inOut" },
    0.05,
  );
  tl.to(
    targetEl,
    { y: -8, duration: 0.06, yoyo: true, repeat: 3, ease: "power2.inOut" },
    0.08,
  );
  tl.to(targetEl, { filter: "none", duration: 0.25 }, 0.38);
  tl.set(targetEl, { x: 0, y: 0 });

  return gsapPromise(tl);
}

async function natureAttack(targetEl: HTMLElement): Promise<void> {
  const parent = targetEl.parentElement;
  const tl = gsap.timeline();

  if (parent) {
    // 3 vine tendrils growing from left edge
    for (let i = 0; i < 3; i++) {
      const vine = makeParticle(
        parent,
        `position:absolute;width:0;height:${rnd(3, 6)}px;
         background:linear-gradient(90deg,#16a34a,#4ade80,rgba(74,222,128,0));
         top:${25 + i * 24}%;left:0;border-radius:3px;
         pointer-events:none;z-index:50;opacity:0.85;
         transform:rotate(${rnd(-8, 8).toFixed(1)}deg);`,
      );
      tl.to(
        vine,
        {
          width: rnd(60, 110),
          duration: 0.22,
          delay: i * 0.06,
          ease: "power3.out",
        },
        0.05,
      );
      tl.to(
        vine,
        { opacity: 0, duration: 0.25, onComplete: () => vine.remove() },
        0.45,
      );
    }

    // 18 leaf particles rising
    for (let i = 0; i < 18; i++) {
      const leaf = makeParticle(
        parent,
        `position:absolute;width:${rnd(6, 11)}px;height:${rnd(8, 13)}px;
         background:${Math.random() > 0.5 ? "#22c55e" : "#4ade80"};
         border-radius:0 50% 50% 50%;
         bottom:8%;left:${rnd(25, 75).toFixed(1)}%;
         pointer-events:none;z-index:50;opacity:0.95;`,
      );
      gsap.to(leaf, {
        y: -rnd(55, 110),
        x: rnd(-55, 55),
        rotation: rnd(-360, 360),
        opacity: 0,
        duration: rnd(0.6, 1.0),
        delay: rnd(0, 0.2),
        ease: "power1.out",
        onComplete: () => leaf.remove(),
      });
    }
  }

  // Target: green flash + scale-up pulse
  tl.to(
    targetEl,
    {
      filter: "brightness(2.5) hue-rotate(70deg) saturate(2.5)",
      scale: 1.1,
      duration: 0.15,
    },
    0.1,
  );
  tl.to(
    targetEl,
    { filter: "none", scale: 1, duration: 0.35, ease: "back.out(2)" },
    0.28,
  );

  return gsapPromise(tl);
}

async function psychicAttack(targetEl: HTMLElement): Promise<void> {
  const parent = targetEl.parentElement;
  const tl = gsap.timeline();

  // 5 expanding concentric rings
  if (parent) {
    for (let i = 0; i < 5; i++) {
      const ring = makeParticle(
        parent,
        `position:absolute;top:50%;left:50%;width:16px;height:16px;
         border:${i % 2 === 0 ? "2" : "1"}px solid #ec4899;
         border-radius:50%;transform:translate(-50%,-50%);
         pointer-events:none;z-index:50;opacity:0.9;
         box-shadow:0 0 10px #ec4899,0 0 20px #ec489944;`,
      );
      tl.to(
        ring,
        {
          width: 100 + i * 35,
          height: 100 + i * 35,
          opacity: 0,
          duration: 0.55,
          delay: i * 0.09,
          ease: "power2.out",
          onComplete: () => ring.remove(),
        },
        0,
      );
    }
  }

  // Target: scaleX warp oscillation (reality distortion)
  tl.to(
    targetEl,
    {
      scaleX: 0.82,
      filter: "brightness(2) hue-rotate(280deg) saturate(2)",
      duration: 0.1,
    },
    0,
  );
  tl.to(targetEl, { scaleX: 1.12, duration: 0.1 });
  tl.to(targetEl, { scaleX: 0.88, duration: 0.09 });
  tl.to(targetEl, {
    scaleX: 1,
    filter: "none",
    duration: 0.3,
    ease: "elastic.out(1,0.5)",
  });

  return gsapPromise(tl);
}

async function metalAttack(targetEl: HTMLElement): Promise<void> {
  const parent = targetEl.parentElement;
  const tl = gsap.timeline();

  // Target: vertical compression then bounce (metallic slam)
  tl.to(targetEl, {
    scaleY: 0.82,
    filter: "brightness(4) contrast(2) saturate(0.1)",
    duration: 0.07,
  });
  tl.to(targetEl, {
    scaleY: 0.95,
    filter: "brightness(2) saturate(0.3)",
    duration: 0.06,
  });
  tl.to(targetEl, {
    scaleY: 1.06,
    filter: "brightness(3) contrast(1.5) saturate(0.15)",
    duration: 0.05,
  });
  tl.to(targetEl, {
    scaleY: 1,
    filter: "none",
    duration: 0.3,
    ease: "elastic.out(1,0.4)",
  });

  // 15 directional sparks
  if (parent) {
    for (let i = 0; i < 15; i++) {
      const spark = makeParticle(
        parent,
        `position:absolute;width:${rnd(2, 5)}px;height:${rnd(3, 7)}px;
         border-radius:1px;
         background:${Math.random() > 0.5 ? "#e2e8f0" : "#cbd5e1"};
         top:50%;left:50%;pointer-events:none;z-index:50;
         box-shadow:0 0 5px #fff,0 0 10px #94a3b8;`,
      );
      const angle = (i / 15) * Math.PI * 2;
      const dist = rnd(35, 80);
      gsap.to(spark, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        rotation: angle * (180 / Math.PI),
        opacity: 0,
        duration: rnd(0.25, 0.45),
        delay: 0.05,
        ease: "power3.out",
        onComplete: () => spark.remove(),
      });
    }
  }

  return gsapPromise(tl);
}

async function lightAttack(targetEl: HTMLElement): Promise<void> {
  const parent = targetEl.parentElement;
  const tl = gsap.timeline();

  if (parent) {
    // 4 ray beams from corners converging inward
    const corners = [
      { left: "0", top: "0", angle: 45 },
      { left: "100%", top: "0", angle: 135 },
      { left: "0", top: "100%", angle: -45 },
      { left: "100%", top: "100%", angle: -135 },
    ];
    corners.forEach(({ left, top, angle }, i) => {
      const ray = makeParticle(
        parent,
        `position:absolute;width:4px;height:0;border-radius:2px;
         background:linear-gradient(180deg,#fef08a,rgba(253,224,71,0));
         pointer-events:none;z-index:50;
         left:${left};top:${top};transform-origin:top center;
         transform:rotate(${angle}deg);opacity:0;`,
      );
      tl.to(
        ray,
        {
          height: rnd(70, 110),
          opacity: 1,
          duration: 0.2,
          delay: i * 0.04,
          ease: "power2.out",
        },
        0.05,
      );
      tl.to(
        ray,
        {
          height: 0,
          opacity: 0,
          duration: 0.2,
          onComplete: () => ray.remove(),
        },
        0.35,
      );
    });

    // 8 golden star particles
    for (let i = 0; i < 8; i++) {
      const gp = makeParticle(
        parent,
        `position:absolute;width:${rnd(4, 8)}px;height:${rnd(4, 8)}px;
         border-radius:50%;background:${Math.random() > 0.5 ? "#fbbf24" : "#fde68a"};
         top:50%;left:50%;pointer-events:none;z-index:50;
         box-shadow:0 0 8px #fbbf24;`,
      );
      const angle = (i / 8) * Math.PI * 2;
      const dist = rnd(40, 80);
      gsap.to(gp, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        duration: rnd(0.35, 0.6),
        delay: 0.15,
        ease: "power2.out",
        onComplete: () => gp.remove(),
      });
    }

    // Central blinding radial overlay
    const glare = makeParticle(
      parent,
      `position:absolute;top:0;left:0;width:100%;height:100%;
       background:radial-gradient(circle,#fef3c7cc,#fbbf2455,transparent 70%);
       pointer-events:none;z-index:49;border-radius:8px;opacity:0;`,
    );
    tl.to(glare, { opacity: 1, duration: 0.1 }, 0.12);
    tl.to(
      glare,
      { opacity: 0, duration: 0.4, onComplete: () => glare.remove() },
      0.25,
    );
  }

  // Target: double blinding flash
  tl.to(
    targetEl,
    { filter: "brightness(6) drop-shadow(0 0 40px #fbbf24)", duration: 0.1 },
    0.1,
  );
  tl.to(targetEl, {
    filter: "brightness(2) drop-shadow(0 0 20px #fbbf24)",
    duration: 0.12,
  });
  tl.to(targetEl, { filter: "none", duration: 0.3 });

  return gsapPromise(tl);
}

async function toxicAttack(targetEl: HTMLElement): Promise<void> {
  const parent = targetEl.parentElement;
  const tl = gsap.timeline();

  if (parent) {
    // 6 acid drip droplets falling from the top
    for (let i = 0; i < 6; i++) {
      const drip = makeParticle(
        parent,
        `position:absolute;width:${rnd(5, 9)}px;height:${rnd(8, 14)}px;
         border-radius:50% 50% 50% 50% / 30% 30% 70% 70%;
         background:rgba(${Math.random() > 0.5 ? "132,204,22" : "163,230,53"},${rnd(0.75, 0.95).toFixed(2)});
         top:-10px;left:${rnd(15, 85).toFixed(1)}%;pointer-events:none;z-index:50;
         box-shadow:0 0 6px #84cc1688;`,
      );
      gsap.to(drip, {
        y: rnd(80, 160),
        opacity: 0,
        scaleY: 1.4,
        duration: rnd(0.45, 0.7),
        delay: rnd(0, 0.2),
        ease: "power2.in",
        onComplete: () => drip.remove(),
      });
    }

    // 14 sludge bubbles rising from bottom
    for (let i = 0; i < 14; i++) {
      const bubble = makeParticle(
        parent,
        `position:absolute;width:${rnd(5, 11)}px;height:${rnd(5, 11)}px;
         border-radius:50%;
         background:${Math.random() > 0.5 ? "rgba(132,204,22,0.8)" : "rgba(163,230,53,0.8)"};
         bottom:${rnd(5, 20).toFixed(1)}%;left:${rnd(15, 85).toFixed(1)}%;
         pointer-events:none;z-index:50;
         box-shadow:0 0 6px #84cc1666;`,
      );
      gsap.to(bubble, {
        y: -rnd(35, 80),
        x: rnd(-25, 25),
        opacity: 0,
        scale: 0.2,
        duration: rnd(0.5, 0.85),
        delay: rnd(0, 0.2),
        ease: "power1.out",
        onComplete: () => bubble.remove(),
      });
    }
  }

  // Target: strong toxic tint + scale pulse
  tl.to(
    targetEl,
    {
      filter: "brightness(1.6) hue-rotate(50deg) saturate(3.5)",
      scale: 1.07,
      duration: 0.18,
    },
    0.1,
  );
  tl.to(
    targetEl,
    { filter: "none", scale: 1, duration: 0.45, ease: "back.out(1.5)" },
    0.3,
  );

  return gsapPromise(tl);
}

async function voidAttack(targetEl: HTMLElement): Promise<void> {
  const parent = targetEl.parentElement;
  const tl = gsap.timeline();

  if (parent) {
    // Total blackout overlay — reality itself goes dark
    const dark = makeParticle(
      parent,
      `position:absolute;top:0;left:0;width:100%;height:100%;
       background:radial-gradient(circle at 50% 50%,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.97) 100%);
       pointer-events:none;z-index:48;opacity:0;border-radius:8px;`,
    );
    tl.to(dark, { opacity: 1, duration: 0.22 }, 0);
    tl.to(
      dark,
      { opacity: 0, duration: 0.5, onComplete: () => dark.remove() },
      0.54,
    );

    // 3 white rift cracks tearing open in the darkness
    for (let i = 0; i < 3; i++) {
      const rift = makeParticle(
        parent,
        `position:absolute;width:${rnd(1, 2.5)}px;height:${rnd(38, 72)}px;
         background:linear-gradient(180deg,transparent,#e8eeff,rgba(255,255,255,0.95),#e8eeff,transparent);
         top:${rnd(15, 60).toFixed(1)}%;left:${rnd(25, 72).toFixed(1)}%;
         transform:rotate(${rnd(-6, 6).toFixed(1)}deg);
         pointer-events:none;z-index:51;opacity:0;
         box-shadow:0 0 10px #ffffff,0 0 28px #c8d8ff;`,
      );
      tl.to(rift, { opacity: 1, duration: 0.06 }, 0.2 + i * 0.07);
      tl.to(
        rift,
        {
          scaleX: 4,
          opacity: 0,
          duration: 0.25,
          onComplete: () => rift.remove(),
        },
        0.34 + i * 0.06,
      );
    }

    // 20 near-black particles with white-glowing edges collapsing inward (micro black holes)
    for (let i = 0; i < 20; i++) {
      const p = makeParticle(
        parent,
        `position:absolute;width:${rnd(5, 11)}px;height:${rnd(5, 11)}px;
         border-radius:50%;
         background:${Math.random() > 0.5 ? "#0a0a14" : "#070710"};
         top:50%;left:50%;pointer-events:none;z-index:50;
         box-shadow:0 0 6px #ffffffaa,0 0 14px #c0d0ff66,inset 0 0 4px #000;`,
      );
      const angle = (i / 20) * Math.PI * 2;
      const dist = rnd(65, 115);
      gsap.set(p, { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
      gsap.to(p, {
        x: 0,
        y: 0,
        opacity: 0,
        scale: 0,
        duration: rnd(0.38, 0.62),
        delay: rnd(0, 0.08),
        ease: "power3.in",
        onComplete: () => p.remove(),
      });
    }
  }

  // Target: total erasure (drains to black) → white invert flash → restore
  tl.to(targetEl, {
    scale: 0.7,
    filter: "brightness(0) saturate(0)",
    duration: 0.3,
    ease: "power3.in",
  });
  tl.to(targetEl, {
    scale: 1.2,
    filter: "brightness(5) saturate(0) invert(1)",
    duration: 0.1,
  });
  tl.to(targetEl, {
    scale: 1,
    filter: "none",
    duration: 0.42,
    ease: "elastic.out(1, 0.5)",
  });

  return gsapPromise(tl);
}

// ─── Public API ──────────────────────────────────────────────

const attackAnimations: Record<
  ElementType,
  (el: HTMLElement) => Promise<void>
> = {
  fire: fireAttack,
  water: waterAttack,
  electric: electricAttack,
  earth: earthAttack,
  ice: iceAttack,
  shadow: shadowAttack,
  wind: windAttack,
  nature: natureAttack,
  psychic: psychicAttack,
  metal: metalAttack,
  light: lightAttack,
  toxic: toxicAttack,
  void: voidAttack,
};

export async function animateAttack(
  element: ElementType,
  targetEl: HTMLElement,
): Promise<void> {
  const fn = attackAnimations[element];
  if (fn) await fn(targetEl);
}

/**
 * Signature move charge-up sequence (~1 s).
 * Plays BEFORE animateAttack — dims the scene, builds a glowing aura on the
 * attacker with orbiting motes, then releases into a blinding element flash.
 */
export async function animateSignatureIntro(
  attackerEl: HTMLElement,
  element: ElementType,
  sceneEl: HTMLElement,
): Promise<void> {
  const color = ELEMENT_COLORS[element];
  const tl = gsap.timeline();

  // 1. Dark overlay descends over the whole scene
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:absolute;inset:0;background:rgba(0,0,0,0.72);
    pointer-events:none;z-index:30;opacity:0;
  `;
  sceneEl.style.position = "relative";
  sceneEl.appendChild(overlay);
  tl.to(overlay, { opacity: 1, duration: 0.28, ease: "power2.in" });

  // 2. Attacker glows with element colour + scales up
  tl.to(
    attackerEl,
    {
      filter: `brightness(1.9) drop-shadow(0 0 20px ${color}) drop-shadow(0 0 50px ${color}88)`,
      scale: 1.14,
      duration: 0.32,
      ease: "power2.out",
    },
    "-=0.1",
  );

  // 3. 8 energy motes orbit out then collapse back
  const parent = attackerEl.parentElement;
  if (parent) {
    for (let i = 0; i < 8; i++) {
      const mote = makeParticle(
        parent,
        `position:absolute;width:${rnd(5, 9)}px;height:${rnd(5, 9)}px;
         border-radius:50%;background:${color};
         top:50%;left:50%;pointer-events:none;z-index:40;
         box-shadow:0 0 10px ${color};
         transform:translate(-50%,-50%);`,
      );
      const angle = (i / 8) * Math.PI * 2;
      const dist = rnd(55, 90);
      gsap.to(mote, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        duration: 0.3,
        delay: 0.12,
        ease: "power2.out",
      });
      gsap.to(mote, {
        x: 0,
        y: 0,
        opacity: 0,
        scale: 2.5,
        duration: 0.28,
        delay: 0.52,
        ease: "power3.in",
        onComplete: () => mote.remove(),
      });
    }
  }

  // 4. Element-colour flash across the whole scene
  const flash = document.createElement("div");
  flash.style.cssText = `
    position:absolute;inset:0;background:${color};
    pointer-events:none;z-index:31;opacity:0;
  `;
  sceneEl.appendChild(flash);
  tl.to(flash, { opacity: 0.45, duration: 0.08 }, 0.62);
  tl.to(
    flash,
    { opacity: 0, duration: 0.22, onComplete: () => flash.remove() },
    0.7,
  );

  // 5. Scene un-dims, attacker resets
  tl.to(
    overlay,
    { opacity: 0, duration: 0.22, onComplete: () => overlay.remove() },
    0.7,
  );
  tl.to(
    attackerEl,
    { filter: "none", scale: 1, duration: 0.22, ease: "back.out(2)" },
    0.7,
  );

  return gsapPromise(tl);
}

export async function animateDamage(
  targetEl: HTMLElement,
  isCritical: boolean,
  damageRatio = 0,
): Promise<void> {
  // Scale intensity with how much HP was removed (0–1)
  const ratio = Math.min(1, Math.max(0, damageRatio));
  const shakeDistance = (isCritical ? 14 : 8) + ratio * (isCritical ? 18 : 14);
  const flashBrightness = 2.0 + ratio * 2.5;

  const tl = gsap.timeline();

  // Red flash — brighter for big hits
  tl.to(targetEl, {
    filter: `brightness(${flashBrightness.toFixed(1)}) drop-shadow(0 0 ${Math.round(15 + ratio * 20)}px #ff2244)`,
    duration: 0.1,
  });
  tl.to(targetEl, { filter: "none", duration: 0.2 });

  // Shake — wider for big hits
  tl.to(
    targetEl,
    {
      x: shakeDistance,
      duration: 0.04,
      yoyo: true,
      repeat: isCritical ? 7 : 4,
      ease: "power2.inOut",
    },
    0,
  );
  tl.set(targetEl, { x: 0 });

  return gsapPromise(tl);
}

export async function animateScreenShake(
  sceneEl: HTMLElement,
  intensity = 1,
): Promise<void> {
  const dist = Math.round(7 * intensity);
  const tl = gsap.timeline();

  // 6-step rapid oscillation on the whole scene
  const steps = [dist, -dist, dist * 0.7, -dist * 0.7, dist * 0.4, 0];
  steps.forEach((x) => {
    tl.to(sceneEl, { x, duration: 0.05, ease: "none" });
  });
  tl.set(sceneEl, { x: 0 });

  return gsapPromise(tl);
}

export async function animateEntrance(
  el: HTMLElement,
  side: "left" | "right",
): Promise<void> {
  const startX = side === "left" ? -200 : 200;

  gsap.set(el, { x: startX, opacity: 0 });

  return gsapPromise(
    gsap.to(el, {
      x: 0,
      opacity: 1,
      duration: 1.3,
      ease: "back.out(1.4)",
    }),
  );
}

export function animateIdle(el: HTMLElement): gsap.core.Tween {
  return gsap.to(el, {
    y: -6,
    duration: 2,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });
}

export async function animateFaint(
  el: HTMLElement,
  element?: ElementType,
): Promise<void> {
  // ── Fire: glow-burst then crumble ──────────────────────────
  if (element === "fire") {
    const parent = el.parentElement;
    // Spawn ember shards
    if (parent) {
      for (let i = 0; i < 8; i++) {
        const p = document.createElement("div");
        const size = 4 + Math.random() * 6;
        p.style.cssText = `
          position:absolute; width:${size}px; height:${size}px;
          border-radius:50%; background:${Math.random() > 0.5 ? "#ff4d00" : "#ffaa00"};
          top:50%; left:50%; pointer-events:none; z-index:50;
          filter:blur(1px);
        `;
        parent.style.position = "relative";
        parent.appendChild(p);
        const angle = (i / 8) * Math.PI * 2;
        const dist = 50 + Math.random() * 60;
        gsap.to(p, {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 30,
          opacity: 0,
          scale: 0,
          duration: 0.7 + Math.random() * 0.4,
          ease: "power2.out",
          onComplete: () => p.remove(),
        });
      }
    }
    const tl = gsap.timeline();
    tl.to(el, {
      filter: "brightness(3.5) drop-shadow(0 0 30px #ff4d00)",
      scale: 1.2,
      duration: 0.2,
    });
    tl.to(el, {
      filter: "brightness(0) drop-shadow(0 0 0px transparent)",
      scale: 0.4,
      opacity: 0,
      duration: 0.55,
      ease: "power2.in",
    });
    return gsapPromise(tl);
  }

  // ── Ice: shatter flat ──────────────────────────────────────
  if (element === "ice") {
    const tl = gsap.timeline();
    tl.to(el, {
      filter: "brightness(2.5) drop-shadow(0 0 20px #7dd3fc)",
      duration: 0.1,
    });
    tl.to(
      el,
      {
        scaleX: 0.05,
        scaleY: 1.35,
        duration: 0.12,
        ease: "power3.in",
      },
      "<",
    );
    tl.to(el, { scaleY: 0, opacity: 0, duration: 0.18, ease: "power2.in" });
    return gsapPromise(tl);
  }

  // ── Electric: flash then blast upward ─────────────────────
  if (element === "electric") {
    const tl = gsap.timeline();
    for (let i = 0; i < 5; i++) {
      tl.to(el, {
        filter: "brightness(4) drop-shadow(0 0 25px #ffe44d)",
        x: i % 2 === 0 ? 8 : -8,
        duration: 0.04,
      });
      tl.to(el, { filter: "brightness(1)", x: 0, duration: 0.04 });
    }
    tl.to(el, { y: -40, opacity: 0, duration: 0.3, ease: "power2.out" });
    return gsapPromise(tl);
  }

  // ── Void: erasure from existence — drains to black, then simply ceases ─
  if (element === "void") {
    const tl = gsap.timeline();
    tl.to(el, {
      filter: "brightness(0) saturate(0)",
      scale: 0.85,
      duration: 0.35,
      ease: "power2.in",
    });
    tl.to(el, {
      filter: "brightness(0) saturate(0)",
      scale: 0,
      opacity: 0,
      duration: 0.55,
      ease: "power3.in",
    });
    return gsapPromise(tl);
  }

  // ── Shadow: dark implosion ─────────────────────────────────
  if (element === "shadow") {
    return gsapPromise(
      gsap.to(el, {
        filter: "grayscale(1) brightness(0.2) drop-shadow(0 0 20px #6600cc)",
        scale: 0,
        opacity: 0,
        duration: 1.1,
        ease: "power3.inOut",
      }),
    );
  }

  // ── Default: tip-over ─────────────────────────────────────
  return gsapPromise(
    gsap.to(el, {
      rotation: 90,
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power2.in",
    }),
  );
}

/**
 * Spawn a floating damage number above `targetEl`.
 * Fire-and-forget — does not need to be awaited.
 */
export function spawnDamageNumber(
  targetEl: HTMLElement,
  amount: number,
  isCritical: boolean,
  effectiveness: "super" | "resisted" | "neutral",
  elementColor: string,
): void {
  let color = elementColor;
  let fontSize = "1.6rem";
  let fontWeight = "bold";
  let text = `${amount}`;
  let fontStyle = "normal";

  if (isCritical) {
    color = "#ff2244";
    fontSize = "2.2rem";
    text = `${amount}!`;
  } else if (effectiveness === "super") {
    color = "#fde047";
    fontSize = "1.9rem";
  } else if (effectiveness === "resisted") {
    color = "#93c5fd";
    fontSize = "1.1rem";
    fontStyle = "italic";
  }

  const el = document.createElement("div");
  el.textContent = text;
  el.style.cssText = `
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
    font-size: ${fontSize};
    font-weight: ${fontWeight};
    font-style: ${fontStyle};
    color: ${color};
    pointer-events: none;
    z-index: 100;
    text-shadow: 0 2px 8px rgba(0,0,0,0.8), 0 0 20px ${color}88;
    white-space: nowrap;
    user-select: none;
  `;

  // targetEl is `position:relative` so absolute children position correctly
  targetEl.style.position = "relative";
  targetEl.appendChild(el);

  gsap.fromTo(
    el,
    { y: 0, opacity: 1, scale: isCritical ? 0.4 : 0.8 },
    {
      y: isCritical ? -90 : -70,
      opacity: 0,
      scale: 1,
      duration: isCritical ? 1.0 : 0.85,
      ease: "power2.out",
      onComplete: () => el.remove(),
    },
  );
}

export async function animateVictory(el: HTMLElement): Promise<void> {
  return gsapPromise(
    gsap
      .timeline()
      .to(el, { y: -30, duration: 0.3, ease: "power2.out" })
      .to(el, { y: 0, duration: 0.3, ease: "bounce.out" })
      .to(el, { scale: 1.1, duration: 0.2 })
      .to(el, { scale: 1, duration: 0.2, ease: "back.out(2)" }),
  );
}

export async function animateGuard(el: HTMLElement): Promise<void> {
  return gsapPromise(
    gsap
      .timeline()
      .to(el, {
        filter: `brightness(1.5) drop-shadow(0 0 20px #00bfff)`,
        scale: 1.05,
        duration: 0.2,
      })
      .to(el, { filter: "none", scale: 1, duration: 0.4 }),
  );
}

/**
 * Evolution animation sequence played on the result screen.
 * secondaryColor = ELEMENT_COLORS[evolution.secondaryElement]
 */
export async function animateEvolution(
  el: HTMLElement,
  secondaryColor: string,
): Promise<void> {
  const parent = el.parentElement;

  // Fullscreen white flash overlay
  let flash: HTMLDivElement | null = null;
  if (parent) {
    flash = document.createElement("div");
    flash.style.cssText = `position:absolute;inset:-100%;background:white;pointer-events:none;z-index:100;opacity:0;border-radius:inherit;`;
    parent.appendChild(flash);
  }

  // Energy ring
  let ring: HTMLDivElement | null = null;
  if (parent) {
    ring = document.createElement("div");
    ring.style.cssText = `position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
      width:80px;height:80px;border-radius:50%;
      border:3px solid ${secondaryColor};pointer-events:none;z-index:99;opacity:0;`;
    parent.appendChild(ring);
  }

  const evolvedFilter = `brightness(1.3) saturate(1.8) drop-shadow(0 0 22px ${secondaryColor}) drop-shadow(0 0 8px white)`;

  const tl = gsap.timeline();

  // Phase 1: charge — pulse scale up + brighten (0–0.6s)
  tl.to(
    el,
    {
      scale: 1.15,
      filter: `brightness(2) saturate(2.5)`,
      duration: 0.5,
      ease: "power2.in",
    },
    0,
  );

  // Phase 2: energy ring expands (0.4–1.0s)
  if (ring) {
    tl.to(
      ring,
      {
        opacity: 1,
        width: "160px",
        height: "160px",
        duration: 0.35,
        ease: "power2.out",
      },
      0.4,
    );
    tl.to(
      ring,
      {
        opacity: 0,
        width: "220px",
        height: "220px",
        duration: 0.3,
        ease: "power1.in",
        onComplete: () => ring?.remove(),
      },
      0.75,
    );
  }

  // Phase 3: white flash (0.6–0.85s)
  if (flash) {
    tl.to(flash, { opacity: 1, duration: 0.15, ease: "power3.in" }, 0.55);
    tl.to(
      flash,
      {
        opacity: 0,
        duration: 0.25,
        ease: "power1.out",
        onComplete: () => flash?.remove(),
      },
      0.7,
    );
  }

  // Phase 4: land in evolved appearance (0.85s+)
  tl.to(
    el,
    {
      scale: 1.08,
      filter: evolvedFilter,
      duration: 0.4,
      ease: "back.out(2)",
    },
    0.82,
  );

  // Phase 5: sparkle particles (0.9s)
  if (parent) {
    for (let i = 0; i < 18; i++) {
      const p = makeParticle(
        parent,
        `position:absolute;width:${rnd(4, 9)}px;height:${rnd(4, 9)}px;border-radius:50%;
         background:${i % 2 === 0 ? secondaryColor : "white"};
         top:50%;left:50%;pointer-events:none;z-index:98;
         box-shadow:0 0 8px ${secondaryColor};`,
      );
      const angle = (i / 18) * Math.PI * 2;
      const dist = rnd(55, 110);
      gsap.to(p, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - rnd(10, 25),
        opacity: 0,
        scale: 0,
        duration: rnd(0.55, 0.9),
        delay: 0.9,
        ease: "power2.out",
        onComplete: () => p.remove(),
      });
    }
  }

  // Phase 6: settle to normal scale, keep evolved filter (1.3s+)
  tl.to(el, { scale: 1, duration: 0.35, ease: "power2.out" }, 1.25);

  return gsapPromise(tl);
}
