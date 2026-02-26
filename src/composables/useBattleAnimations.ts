import gsap from "gsap";
import type { ElementType } from "@/types";
import { gsapPromise } from "./useGsapContext";

// ─── Attack Animations by Element ────────────────────────────

async function fireAttack(targetEl: HTMLElement): Promise<void> {
  const tl = gsap.timeline();

  // Orange flash on target
  tl.to(targetEl, {
    filter: "brightness(2.5) drop-shadow(0 0 30px #ff4d00)",
    duration: 0.15,
  });
  // Scale pulse
  tl.to(targetEl, { scale: 1.15, duration: 0.1 }, "<");
  tl.to(targetEl, { scale: 1, filter: "none", duration: 0.3 });

  // Particle burst — create temp elements
  const parent = targetEl.parentElement;
  if (parent) {
    const particles: HTMLDivElement[] = [];
    for (let i = 0; i < 12; i++) {
      const p = document.createElement("div");
      p.style.cssText = `
        position: absolute; width: 8px; height: 8px; border-radius: 50%;
        background: ${Math.random() > 0.5 ? "#ff4d00" : "#ff8800"};
        top: 50%; left: 50%; pointer-events: none; z-index: 50;
        box-shadow: 0 0 6px #ff4d00;
      `;
      parent.style.position = "relative";
      parent.appendChild(p);
      particles.push(p);

      const angle = (i / 12) * Math.PI * 2;
      const dist = 40 + Math.random() * 40;
      gsap.to(p, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        scale: 0,
        duration: 0.5 + Math.random() * 0.3,
        ease: "power2.out",
        onComplete: () => p.remove(),
      });
    }
  }

  return gsapPromise(tl);
}

async function waterAttack(targetEl: HTMLElement): Promise<void> {
  const tl = gsap.timeline();

  // Blue wave sweep overlay
  const parent = targetEl.parentElement;
  if (parent) {
    const wave = document.createElement("div");
    wave.style.cssText = `
      position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, #00bfff66, #00bfff99, #00bfff66, transparent);
      pointer-events: none; z-index: 50; border-radius: 8px;
    `;
    parent.style.position = "relative";
    parent.appendChild(wave);

    tl.to(wave, {
      left: "100%",
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: () => wave.remove(),
    });
  }

  tl.to(
    targetEl,
    { filter: "brightness(1.8) hue-rotate(180deg)", duration: 0.15 },
    0,
  );
  tl.to(targetEl, { filter: "none", duration: 0.3 }, 0.2);

  return gsapPromise(tl);
}

async function electricAttack(targetEl: HTMLElement): Promise<void> {
  const tl = gsap.timeline();

  // Rapid lightning flashes
  for (let i = 0; i < 3; i++) {
    tl.to(targetEl, {
      filter: "brightness(4) drop-shadow(0 0 25px #ffe44d)",
      duration: 0.05,
    });
    tl.to(targetEl, {
      filter: "brightness(1)",
      duration: 0.08,
    });
  }

  // Yellow shimmer
  tl.to(targetEl, {
    filter: "brightness(1.5) drop-shadow(0 0 15px #ffe44d)",
    duration: 0.1,
  });
  tl.to(targetEl, { filter: "none", duration: 0.25 });

  return gsapPromise(tl);
}

async function earthAttack(targetEl: HTMLElement): Promise<void> {
  const tl = gsap.timeline();

  // Screen rumble on the battle container
  const container = targetEl.closest(".battle-scene") as HTMLElement | null;
  if (container) {
    tl.to(container, {
      x: 8,
      duration: 0.05,
      yoyo: true,
      repeat: 7,
      ease: "power2.inOut",
    });
    tl.set(container, { x: 0 });
  }

  // Brown dust particles rising
  const parent = targetEl.parentElement;
  if (parent) {
    for (let i = 0; i < 8; i++) {
      const p = document.createElement("div");
      p.style.cssText = `
        position: absolute; width: 6px; height: 6px; border-radius: 50%;
        background: ${Math.random() > 0.5 ? "#c48a2a" : "#8B6914"};
        bottom: 10%; left: ${30 + Math.random() * 40}%; pointer-events: none; z-index: 50;
      `;
      parent.style.position = "relative";
      parent.appendChild(p);

      gsap.to(p, {
        y: -(50 + Math.random() * 50),
        x: (Math.random() - 0.5) * 40,
        opacity: 0,
        duration: 0.6 + Math.random() * 0.4,
        ease: "power1.out",
        onComplete: () => p.remove(),
      });
    }
  }

  tl.to(targetEl, { filter: "brightness(1.5) sepia(0.5)", duration: 0.15 }, 0);
  tl.to(targetEl, { filter: "none", duration: 0.3 }, 0.3);

  return gsapPromise(tl);
}

async function iceAttack(targetEl: HTMLElement): Promise<void> {
  const tl = gsap.timeline();

  // Frost overlay
  const parent = targetEl.parentElement;
  if (parent) {
    const frost = document.createElement("div");
    frost.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: radial-gradient(circle, #7fdbff44, #e0f7ff22, transparent);
      pointer-events: none; z-index: 50; border-radius: 8px; opacity: 0;
    `;
    parent.style.position = "relative";
    parent.appendChild(frost);

    tl.to(frost, { opacity: 1, duration: 0.2 });
    tl.to(frost, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => frost.remove(),
    });
  }

  // Target turns blue-tinted
  tl.to(
    targetEl,
    {
      filter: "brightness(1.5) hue-rotate(160deg) saturate(1.5)",
      duration: 0.2,
    },
    0,
  );
  tl.to(targetEl, { filter: "none", duration: 0.4 }, 0.3);

  return gsapPromise(tl);
}

async function shadowAttack(targetEl: HTMLElement): Promise<void> {
  const tl = gsap.timeline();

  // Target dims
  tl.to(targetEl, { opacity: 0.3, filter: "brightness(0.3)", duration: 0.2 });

  // Purple pulse
  const parent = targetEl.parentElement;
  if (parent) {
    const pulse = document.createElement("div");
    pulse.style.cssText = `
      position: absolute; top: 50%; left: 50%; width: 20px; height: 20px;
      border-radius: 50%; background: #a855f7; transform: translate(-50%, -50%);
      pointer-events: none; z-index: 50; opacity: 0.8;
      box-shadow: 0 0 20px #a855f7;
    `;
    parent.style.position = "relative";
    parent.appendChild(pulse);

    tl.to(
      pulse,
      {
        width: 150,
        height: 150,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => pulse.remove(),
      },
      0.2,
    );
  }

  tl.to(targetEl, { opacity: 1, filter: "none", duration: 0.3 }, 0.4);

  return gsapPromise(tl);
}

async function windAttack(targetEl: HTMLElement): Promise<void> {
  const tl = gsap.timeline();

  // Mint-green whoosh lines sweeping across
  const parent = targetEl.parentElement;
  if (parent) {
    for (let i = 0; i < 6; i++) {
      const line = document.createElement("div");
      line.style.cssText = `
        position: absolute; width: 60px; height: 3px;
        background: linear-gradient(90deg, transparent, #6ee7b7, transparent);
        top: ${25 + i * 12}%; left: -30%; pointer-events: none; z-index: 50;
        border-radius: 2px; opacity: 0.8;
      `;
      parent.style.position = "relative";
      parent.appendChild(line);

      gsap.to(line, {
        left: "130%",
        duration: 0.35 + i * 0.04,
        delay: i * 0.04,
        ease: "power2.in",
        onComplete: () => line.remove(),
      });
    }
  }

  tl.to(
    targetEl,
    { x: 12, duration: 0.08, yoyo: true, repeat: 3, ease: "power2.inOut" },
    0,
  );
  tl.to(
    targetEl,
    { filter: "brightness(1.5) hue-rotate(100deg)", duration: 0.15 },
    0,
  );
  tl.to(targetEl, { filter: "none", duration: 0.3 }, 0.25);
  tl.set(targetEl, { x: 0 });

  return gsapPromise(tl);
}

async function natureAttack(targetEl: HTMLElement): Promise<void> {
  const tl = gsap.timeline();

  // Green flash
  tl.to(targetEl, {
    filter: "brightness(2) hue-rotate(70deg) saturate(2)",
    duration: 0.15,
  });
  tl.to(targetEl, { filter: "none", duration: 0.3 });

  // Leaf particles rising
  const parent = targetEl.parentElement;
  if (parent) {
    for (let i = 0; i < 10; i++) {
      const leaf = document.createElement("div");
      leaf.style.cssText = `
        position: absolute; width: 8px; height: 10px;
        background: ${Math.random() > 0.5 ? "#22c55e" : "#4ade80"};
        border-radius: 0 50% 50% 50%;
        top: 70%; left: ${35 + Math.random() * 30}%;
        pointer-events: none; z-index: 50; opacity: 0.9;
      `;
      parent.style.position = "relative";
      parent.appendChild(leaf);

      gsap.to(leaf, {
        y: -(60 + Math.random() * 60),
        x: (Math.random() - 0.5) * 50,
        rotation: Math.random() * 360,
        opacity: 0,
        duration: 0.7 + Math.random() * 0.4,
        ease: "power1.out",
        onComplete: () => leaf.remove(),
      });
    }
  }

  return gsapPromise(tl);
}

async function psychicAttack(targetEl: HTMLElement): Promise<void> {
  const tl = gsap.timeline();

  // Pink pulsing rings
  const parent = targetEl.parentElement;
  if (parent) {
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement("div");
      ring.style.cssText = `
        position: absolute; top: 50%; left: 50%; width: 20px; height: 20px;
        border: 2px solid #ec4899; border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none; z-index: 50; opacity: 0.8;
        box-shadow: 0 0 10px #ec4899;
      `;
      parent.style.position = "relative";
      parent.appendChild(ring);

      gsap.to(ring, {
        width: 120 + i * 30,
        height: 120 + i * 30,
        opacity: 0,
        duration: 0.5,
        delay: i * 0.12,
        ease: "power2.out",
        onComplete: () => ring.remove(),
      });
    }
  }

  // Distortion effect
  tl.to(
    targetEl,
    {
      filter: "brightness(1.8) hue-rotate(280deg)",
      scale: 0.95,
      duration: 0.15,
    },
    0,
  );
  tl.to(targetEl, { filter: "none", scale: 1, duration: 0.35 }, 0.2);

  return gsapPromise(tl);
}

async function metalAttack(targetEl: HTMLElement): Promise<void> {
  const tl = gsap.timeline();

  // Metallic flash with sharp impact
  tl.to(targetEl, {
    filter: "brightness(3) contrast(1.5) saturate(0.2)",
    duration: 0.08,
  });
  tl.to(targetEl, {
    filter: "brightness(1) saturate(0.6)",
    duration: 0.08,
  });
  tl.to(targetEl, {
    filter: "brightness(2.5) contrast(1.3) saturate(0.3)",
    duration: 0.06,
  });
  tl.to(targetEl, { filter: "none", duration: 0.25 });

  // Steel spark particles
  const parent = targetEl.parentElement;
  if (parent) {
    for (let i = 0; i < 10; i++) {
      const spark = document.createElement("div");
      spark.style.cssText = `
        position: absolute; width: 4px; height: 4px; border-radius: 50%;
        background: ${Math.random() > 0.5 ? "#e2e8f0" : "#94a3b8"};
        top: 50%; left: 50%; pointer-events: none; z-index: 50;
        box-shadow: 0 0 4px #fff;
      `;
      parent.style.position = "relative";
      parent.appendChild(spark);

      const angle = (i / 10) * Math.PI * 2;
      const dist = 30 + Math.random() * 35;
      gsap.to(spark, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        duration: 0.3 + Math.random() * 0.2,
        ease: "power2.out",
        onComplete: () => spark.remove(),
      });
    }
  }

  return gsapPromise(tl);
}

async function lightAttack(targetEl: HTMLElement): Promise<void> {
  const tl = gsap.timeline();

  // Blinding flash
  tl.to(targetEl, {
    filter: "brightness(5) drop-shadow(0 0 30px #fbbf24)",
    duration: 0.1,
  });
  tl.to(targetEl, {
    filter: "brightness(1.5) drop-shadow(0 0 15px #fbbf24)",
    duration: 0.15,
  });
  tl.to(targetEl, { filter: "none", duration: 0.3 });

  // Radiant overlay
  const parent = targetEl.parentElement;
  if (parent) {
    const flash = document.createElement("div");
    flash.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: radial-gradient(circle, #fbbf2466, #fef3c722, transparent);
      pointer-events: none; z-index: 50; border-radius: 8px; opacity: 0;
    `;
    parent.style.position = "relative";
    parent.appendChild(flash);

    tl.to(flash, { opacity: 1, duration: 0.1 }, 0);
    tl.to(
      flash,
      { opacity: 0, duration: 0.4, onComplete: () => flash.remove() },
      0.15,
    );
  }

  return gsapPromise(tl);
}

async function toxicAttack(targetEl: HTMLElement): Promise<void> {
  const tl = gsap.timeline();

  // Green toxic tint
  tl.to(targetEl, {
    filter: "brightness(1.3) hue-rotate(50deg) saturate(2.5)",
    duration: 0.2,
  });
  tl.to(targetEl, { filter: "none", duration: 0.4 });

  // Sludge bubbles rising
  const parent = targetEl.parentElement;
  if (parent) {
    for (let i = 0; i < 8; i++) {
      const bubble = document.createElement("div");
      const size = 6 + Math.random() * 8;
      bubble.style.cssText = `
        position: absolute; width: ${size}px; height: ${size}px;
        border-radius: 50%;
        background: ${Math.random() > 0.5 ? "#84cc16" : "#a3e635"};
        bottom: 20%; left: ${30 + Math.random() * 40}%;
        pointer-events: none; z-index: 50; opacity: 0.8;
        box-shadow: 0 0 6px #84cc1688;
      `;
      parent.style.position = "relative";
      parent.appendChild(bubble);

      gsap.to(bubble, {
        y: -(40 + Math.random() * 50),
        x: (Math.random() - 0.5) * 30,
        opacity: 0,
        scale: 0.3,
        duration: 0.6 + Math.random() * 0.4,
        delay: Math.random() * 0.15,
        ease: "power1.out",
        onComplete: () => bubble.remove(),
      });
    }
  }

  return gsapPromise(tl);
}

async function voidAttack(targetEl: HTMLElement): Promise<void> {
  const tl = gsap.timeline();

  // Dark implosion — scale down then burst
  tl.to(targetEl, {
    scale: 0.7,
    filter: "brightness(0.2) saturate(3) hue-rotate(270deg)",
    duration: 0.3,
    ease: "power3.in",
  });
  tl.to(targetEl, {
    scale: 1.2,
    filter: "brightness(2) saturate(2) hue-rotate(270deg)",
    duration: 0.15,
  });
  tl.to(targetEl, { scale: 1, filter: "none", duration: 0.4 });

  // Void particles collapsing inward
  const parent = targetEl.parentElement;
  if (parent) {
    for (let i = 0; i < 16; i++) {
      const p = document.createElement("div");
      const size = 4 + Math.random() * 8;
      const angle = (i / 16) * Math.PI * 2;
      const dist = 60 + Math.random() * 40;
      const startX = Math.cos(angle) * dist;
      const startY = Math.sin(angle) * dist;
      p.style.cssText = `
        position: absolute; width: ${size}px; height: ${size}px;
        border-radius: 50%;
        background: ${Math.random() > 0.5 ? "#7c3aed" : "#a855f7"};
        top: 50%; left: 50%; pointer-events: none; z-index: 50;
        box-shadow: 0 0 10px #7c3aed, 0 0 20px #1a1a2e;
        transform: translate(${startX}px, ${startY}px);
        opacity: 0.9;
      `;
      parent.style.position = "relative";
      parent.appendChild(p);

      gsap.to(p, {
        x: 0,
        y: 0,
        opacity: 0,
        scale: 0,
        duration: 0.4 + Math.random() * 0.3,
        delay: Math.random() * 0.1,
        ease: "power3.in",
        onComplete: () => p.remove(),
      });
    }
  }

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
      duration: 0.8,
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

  // ── Shadow / Void: dark implosion ─────────────────────────
  if (element === "shadow" || element === "void") {
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
