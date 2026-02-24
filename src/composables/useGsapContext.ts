import { ref, onMounted, onBeforeUnmount, type Ref } from "vue";
import gsap from "gsap";

/**
 * Provides a scoped GSAP context that auto-cleans up on component unmount.
 * All GSAP animations created inside the context are killed when the component is destroyed.
 */
export function useGsapContext(scope?: Ref<HTMLElement | null>) {
  let ctx: gsap.Context | null = null;

  onMounted(() => {
    ctx = gsap.context(() => {}, scope?.value ?? undefined);
  });

  onBeforeUnmount(() => {
    ctx?.revert();
  });

  function add(fn: () => void) {
    if (ctx) {
      ctx.add(fn);
    } else {
      fn();
    }
  }

  return { getCtx: () => ctx, add };
}

/**
 * Utility: promisify a GSAP tween for async/await usage.
 */
export function gsapPromise(
  tween: gsap.core.Tween | gsap.core.Timeline,
): Promise<void> {
  return new Promise((resolve) => {
    tween.eventCallback("onComplete", () => resolve());
  });
}

/**
 * Simple delay using GSAP's timing (pauses correctly with GSAP's global timeline).
 */
export function gsapDelay(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    gsap.delayedCall(seconds, resolve);
  });
}

/**
 * Shake an element (for damage effects).
 */
export function shakeElement(
  el: HTMLElement,
  intensity: number = 8,
): Promise<void> {
  return gsapPromise(
    gsap.to(el, {
      x: `+=${intensity}`,
      duration: 0.05,
      yoyo: true,
      repeat: 5,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(el, { x: 0 });
      },
    }),
  );
}

/**
 * Flash an element with a color overlay effect.
 */
export function flashElement(
  el: HTMLElement,
  color: string = "#ff0000",
): Promise<void> {
  const originalFilter = el.style.filter;
  return gsapPromise(
    gsap
      .timeline()
      .to(el, {
        filter: `brightness(3) drop-shadow(0 0 20px ${color})`,
        duration: 0.1,
      })
      .to(el, { filter: originalFilter || "none", duration: 0.3 }),
  );
}

/**
 * Idle floating animation — returns the tween so it can be killed.
 */
export function idleFloat(el: HTMLElement): gsap.core.Tween {
  return gsap.to(el, {
    y: -6,
    duration: 2,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });
}

/**
 * Stagger-in animation for a list of elements.
 */
export function staggerIn(
  els: HTMLElement[] | string,
  container?: HTMLElement,
): Promise<void> {
  return gsapPromise(
    gsap.from(els, {
      y: 40,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: "back.out(1.7)",
      ...(container ? {} : {}),
    }) as gsap.core.Tween,
  );
}

/**
 * Helper to create a ref and wait for it to be mounted.
 */
export function useElementRef() {
  const elRef = ref<HTMLElement | null>(null);
  return elRef;
}
