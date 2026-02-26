/**
 * Arena background particle effects – one per ElementType.
 * Call startArenaParticles(containerEl, element) to begin; the returned
 * function stops and cleans up all intervals.
 *
 * Particles are absolutely-positioned, pointer-events:none divs/spans
 * injected directly into the container and removed via GSAP onComplete.
 */
import gsap from "gsap";
import type { ElementType } from "@/types";

type SpawnFn = (container: HTMLElement) => void;

// ─── Helpers ─────────────────────────────────────────────────

function rnd(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function baseStyles(
  container: HTMLElement,
  size: string,
  color: string,
  extraCss = "",
): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText = `
    position: absolute;
    pointer-events: none;
    z-index: 1;
    width: ${size}; height: ${size};
    background: ${color};
    left: ${rnd(5, 95)}%;
    ${extraCss}
  `;
  container.appendChild(el);
  return el;
}

// ─── Per-element spawn functions ──────────────────────────────

const spawnFire: SpawnFn = (c) => {
  const size = `${rnd(4, 10)}px`;
  const color = Math.random() > 0.5 ? "#ff4d00" : "#ff8800";
  const el = baseStyles(
    c,
    size,
    color,
    `border-radius: 50%; bottom: 0; filter: blur(1px); opacity: 0.8;`,
  );
  gsap.to(el, {
    y: -rnd(80, 200),
    x: rnd(-30, 30),
    opacity: 0,
    scale: rnd(0.3, 0.8),
    duration: rnd(1.2, 2.2),
    ease: "power1.out",
    onComplete: () => el.remove(),
  });
};

const spawnWater: SpawnFn = (c) => {
  const el = baseStyles(
    c,
    `${rnd(3, 7)}px`,
    `rgba(0, 150, 255, ${rnd(0.3, 0.7)})`,
    `border-radius: 50% 50% 50% 0; top: -10px; filter: blur(0.5px);`,
  );
  gsap.to(el, {
    y: rnd(120, 250),
    x: rnd(-20, 20),
    opacity: 0,
    duration: rnd(1.4, 2.4),
    ease: "power1.in",
    onComplete: () => el.remove(),
  });
};

const spawnIce: SpawnFn = (c) => {
  const el = document.createElement("span");
  el.textContent = "❄";
  el.style.cssText = `
    position: absolute; pointer-events: none; z-index: 1;
    font-size: ${rnd(8, 14)}px;
    color: rgba(${Math.random() > 0.5 ? "147, 210, 255" : "200, 240, 255"}, ${rnd(0.3, 0.7)});
    top: -15px; left: ${rnd(5, 95)}%;
  `;
  c.appendChild(el);
  gsap.to(el, {
    y: rnd(100, 220),
    x: rnd(-40, 40),
    rotation: rnd(-180, 180),
    opacity: 0,
    duration: rnd(2, 3.5),
    ease: "none",
    onComplete: () => el.remove(),
  });
};

const spawnElectric: SpawnFn = (c) => {
  const el = document.createElement("div");
  el.style.cssText = `
    position: absolute; pointer-events: none; z-index: 1;
    width: ${rnd(1, 3)}px; height: ${rnd(6, 14)}px;
    background: rgba(255, 230, 50, ${rnd(0.5, 0.9)});
    border-radius: 1px;
    top: ${rnd(20, 80)}%; left: ${rnd(10, 90)}%;
    filter: blur(0.5px);
  `;
  c.appendChild(el);
  const angle = rnd(0, Math.PI * 2);
  gsap.to(el, {
    x: Math.cos(angle) * rnd(30, 80),
    y: Math.sin(angle) * rnd(30, 80),
    opacity: 0,
    duration: rnd(0.25, 0.5),
    ease: "power2.out",
    onComplete: () => el.remove(),
  });
};

const spawnEarth: SpawnFn = (c) => {
  const s = rnd(4, 9);
  const el = baseStyles(
    c,
    `${s}px`,
    `rgba(${Math.random() > 0.5 ? "139, 90, 43" : "160, 120, 60"}, ${rnd(0.4, 0.7)})`,
    `border-radius: 2px; top: -10px;`,
  );
  gsap.to(el, {
    y: rnd(80, 200),
    x: rnd(-25, 25),
    rotation: rnd(-90, 90),
    opacity: 0,
    duration: rnd(1.2, 2),
    ease: "power1.in",
    onComplete: () => el.remove(),
  });
};

const spawnShadow: SpawnFn = (c) => {
  const el = baseStyles(
    c,
    `${rnd(5, 12)}px`,
    `rgba(100, 0, 180, ${rnd(0.15, 0.35)})`,
    `border-radius: 50%; top: ${rnd(10, 90)}%; filter: blur(3px);`,
  );
  el.style.left = `${rnd(5, 95)}%`;
  gsap.to(el, {
    x: rnd(-50, 50),
    y: rnd(-40, 40),
    opacity: 0,
    scale: rnd(0.5, 2),
    duration: rnd(1.5, 2.8),
    ease: "none",
    onComplete: () => el.remove(),
  });
};

const spawnWind: SpawnFn = (c) => {
  const el = document.createElement("div");
  el.style.cssText = `
    position: absolute; pointer-events: none; z-index: 1;
    width: ${rnd(15, 35)}px; height: ${rnd(1, 2)}px;
    background: rgba(200, 230, 255, ${rnd(0.2, 0.5)});
    border-radius: 1px;
    top: ${rnd(15, 85)}%;
    left: -40px;
  `;
  c.appendChild(el);
  gsap.to(el, {
    x: rnd(120, 200) * (Math.random() > 0.5 ? 1 : -1) + "%",
    opacity: 0,
    duration: rnd(0.6, 1.2),
    ease: "power1.out",
    onComplete: () => el.remove(),
  });
};

const spawnNature: SpawnFn = (c) => {
  const el = baseStyles(
    c,
    `${rnd(4, 8)}px`,
    `rgba(40, 180, 80, ${rnd(0.4, 0.8)})`,
    `border-radius: 50% 0 50% 0; top: -10px; filter: blur(0.5px);`,
  );
  gsap.to(el, {
    y: rnd(80, 200),
    x: rnd(-40, 40),
    rotation: rnd(-90, 90),
    opacity: 0,
    duration: rnd(1.5, 2.8),
    ease: "power1.inOut",
    onComplete: () => el.remove(),
  });
};

const spawnPsychic: SpawnFn = (c) => {
  const el = baseStyles(
    c,
    `${rnd(4, 9)}px`,
    `rgba(230, 100, 255, ${rnd(0.3, 0.6)})`,
    `border-radius: 50%; bottom: ${rnd(10, 40)}%; filter: blur(2px);`,
  );
  const startY = parseFloat(el.style.bottom);
  gsap.to(el, {
    y: -rnd(60, 160),
    x: rnd(-20, 20),
    opacity: 0,
    scale: rnd(0.5, 1.5),
    duration: rnd(1.5, 2.5),
    ease: "sine.inOut",
    onComplete: () => el.remove(),
  });
};

const spawnMetal: SpawnFn = (c) => {
  const el = baseStyles(
    c,
    `${rnd(2, 5)}px`,
    `rgba(160, 170, 190, ${rnd(0.5, 0.9)})`,
    `border-radius: 1px; top: -8px;`,
  );
  gsap.to(el, {
    y: rnd(100, 220),
    x: rnd(-15, 15),
    rotation: rnd(-180, 180),
    opacity: 0,
    duration: rnd(0.6, 1.2),
    ease: "power2.in",
    onComplete: () => el.remove(),
  });
};

const spawnLight: SpawnFn = (c) => {
  const el = baseStyles(
    c,
    `${rnd(3, 7)}px`,
    `rgba(255, 215, 50, ${rnd(0.5, 0.9)})`,
    `border-radius: 50%; bottom: ${rnd(10, 50)}%; filter: blur(1px); box-shadow: 0 0 6px #ffd700;`,
  );
  gsap.to(el, {
    y: -rnd(60, 150),
    x: rnd(-25, 25),
    opacity: 0,
    scale: rnd(0.3, 1.2),
    duration: rnd(1.2, 2.2),
    ease: "power1.out",
    onComplete: () => el.remove(),
  });
};

const spawnToxic: SpawnFn = (c) => {
  const el = baseStyles(
    c,
    `${rnd(4, 8)}px`,
    `rgba(100, 210, 40, ${rnd(0.35, 0.65)})`,
    `border-radius: 50%; bottom: 0; filter: blur(1.5px);`,
  );
  gsap.to(el, {
    y: -rnd(60, 160),
    x: rnd(-20, 20),
    opacity: 0,
    scale: rnd(0.6, 1.4),
    duration: rnd(1.5, 2.5),
    ease: "power1.out",
    onComplete: () => el.remove(),
  });
};

// ─── Element → config map ─────────────────────────────────────

const PARTICLE_MAP: Record<ElementType, { spawn: SpawnFn; interval: number }> =
  {
    fire: { spawn: spawnFire, interval: 350 },
    water: { spawn: spawnWater, interval: 500 },
    ice: { spawn: spawnIce, interval: 600 },
    electric: { spawn: spawnElectric, interval: 200 },
    earth: { spawn: spawnEarth, interval: 700 },
    shadow: { spawn: spawnShadow, interval: 500 },
    void: { spawn: spawnShadow, interval: 450 },
    wind: { spawn: spawnWind, interval: 400 },
    nature: { spawn: spawnNature, interval: 650 },
    psychic: { spawn: spawnPsychic, interval: 550 },
    metal: { spawn: spawnMetal, interval: 300 },
    light: { spawn: spawnLight, interval: 450 },
    toxic: { spawn: spawnToxic, interval: 600 },
  };

// ─── Public API ───────────────────────────────────────────────

/**
 * Start spawning ambient particles inside `containerEl` matching `element`.
 * Returns a cleanup function that stops the interval and removes all
 * in-flight particles.
 */
export function startArenaParticles(
  containerEl: HTMLElement,
  element: ElementType,
): () => void {
  const cfg = PARTICLE_MAP[element];

  // Make container overflow-hidden and relative (safety net)
  containerEl.style.overflow = "hidden";
  containerEl.style.position = "absolute";
  containerEl.style.inset = "0";

  const id = window.setInterval(() => {
    cfg.spawn(containerEl);
  }, cfg.interval);

  return () => {
    clearInterval(id);
    // Remove any lingering particle children
    while (containerEl.firstChild) {
      containerEl.removeChild(containerEl.firstChild);
    }
  };
}
