import gsap from "gsap";

/**
 * Creates a confetti burst animation in the given container element.
 * Spawns colored particles that fall with rotation and drift.
 */
export function useConfetti() {
  function burst(container: HTMLElement, count: number = 60) {
    const colors = [
      "#ff4d00",
      "#00bfff",
      "#ffe44d",
      "#00ff88",
      "#a855f7",
      "#ff2244",
      "#7fdbff",
      "#c48a2a",
    ];
    const particles: HTMLDivElement[] = [];

    const rect = container.getBoundingClientRect();

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      const size = 6 + Math.random() * 8;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const isCircle = Math.random() > 0.5;

      particle.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${isCircle ? size : size * 2}px;
        background: ${color};
        border-radius: ${isCircle ? "50%" : "2px"};
        top: ${rect.top + rect.height * 0.3}px;
        left: ${rect.left + rect.width * 0.5}px;
        pointer-events: none;
        z-index: 9999;
        box-shadow: 0 0 4px ${color}88;
      `;

      document.body.appendChild(particle);
      particles.push(particle);

      const angle = Math.random() * Math.PI * 2;
      const velocity = 100 + Math.random() * 200;
      const destX = Math.cos(angle) * velocity;
      const destY = Math.sin(angle) * velocity - 100; // Bias upward first

      gsap.to(particle, {
        x: destX,
        y: destY + 400 + Math.random() * 200, // Gravity pulls down
        rotation: Math.random() * 720 - 360,
        opacity: 0,
        duration: 1.5 + Math.random() * 1,
        ease: "power1.out",
        delay: Math.random() * 0.3,
        onComplete: () => particle.remove(),
      });
    }

    // Safety cleanup after 4s
    setTimeout(() => {
      particles.forEach((p) => {
        if (p.parentElement) p.remove();
      });
    }, 4000);
  }

  return { burst };
}
