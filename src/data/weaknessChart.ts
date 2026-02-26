import type { ElementType } from "@/types";

// ─── Super-Effective Chart (many-to-many) ─────────────────────
// Each element is super-effective against 2-3 others.
//
// fire  → nature, ice, metal   (burns plants, melts ice & metal)
// water → fire, earth           (extinguishes fire, erodes earth)
// electric → water, wind        (electrifies water, charges through wind)
// earth → electric, fire, toxic (grounds electricity, smothers fire, absorbs poison)
// ice   → wind, nature, electric (stills air, freezes plants, disrupts circuits)
// shadow → psychic, light       (overwhelms mind, eclipses light)
// wind  → toxic, shadow         (disperses poison, blows away shadows)
// nature → water, earth, psychic (absorbs water, roots crack stone, natural calm)
// psychic → toxic, metal        (purifies poison, telekinesis crushes metal)
// metal → ice, light, nature    (shatters ice, reflects light, cleaves plants)
// light → shadow, fire          (dispels darkness, outshines flame)
// toxic → water, psychic, metal (contaminates water, clouds mind, corrodes metal)
//
export const SUPER_EFFECTIVE: Record<ElementType, ElementType[]> = {
  fire: ["nature", "ice", "metal"],
  water: ["fire", "earth"],
  electric: ["water", "wind"],
  earth: ["electric", "fire", "toxic"],
  ice: ["wind", "nature", "electric"],
  shadow: ["psychic", "light"],
  wind: ["toxic", "shadow"],
  nature: ["water", "earth", "psychic"],
  psychic: ["toxic", "metal"],
  metal: ["ice", "light", "nature"],
  light: ["shadow", "fire"],
  toxic: ["water", "psychic", "metal"],
  void: ["shadow", "psychic", "light"],
};

// ─── Resistance Chart (many-to-many) ─────────────────────────
// If type A beats type B, then A also resists B's attacks.
// NOT_EFFECTIVE[moveElement] = defender elements that resist this move.
//
const NOT_EFFECTIVE: Record<ElementType, ElementType[]> = {
  fire: ["water", "earth", "light"],
  water: ["electric", "nature", "toxic"],
  electric: ["earth", "ice"],
  earth: ["water", "nature"],
  ice: ["fire", "metal"],
  shadow: ["wind", "light"],
  wind: ["electric", "ice"],
  nature: ["fire", "ice", "metal"],
  psychic: ["shadow", "nature", "toxic"],
  metal: ["fire", "psychic", "toxic"],
  light: ["shadow", "metal"],
  toxic: ["earth", "wind", "psychic"],
  void: [],
};

/**
 * Returns all element types that are super-effective against the given element(s).
 * When secondaryElement is provided, returns the union of both types' weakness sets.
 */
export function getWeaknesses(
  element: ElementType,
  secondaryElement?: ElementType,
): ElementType[] {
  const primary = (Object.keys(SUPER_EFFECTIVE) as ElementType[]).filter(
    (attacker) => SUPER_EFFECTIVE[attacker].includes(element),
  );
  if (!secondaryElement) return primary;
  const secondary = (Object.keys(SUPER_EFFECTIVE) as ElementType[]).filter(
    (attacker) => SUPER_EFFECTIVE[attacker].includes(secondaryElement),
  );
  // Union, deduplicated
  return [...new Set([...primary, ...secondary])];
}

/**
 * Returns the effectiveness multiplier for a move against a defender.
 * Supports dual-type defenders via optional defenderSecondaryElement.
 * 2.0 = super effective (move element is in defender's combined weaknesses)
 * 0.5 = not very effective (either of the defender's types resists the move)
 * 1.0 = neutral
 */
export function getEffectivenessMultiplier(
  moveElement: ElementType,
  defenderElement: ElementType,
  defenderSecondaryElement?: ElementType,
): { multiplier: number; effectiveness: "super" | "resisted" | "neutral" } {
  const defenderWeaknesses = getWeaknesses(
    defenderElement,
    defenderSecondaryElement,
  );

  // Super effective: the move element is one of the defender's (combined) weaknesses
  if (defenderWeaknesses.includes(moveElement)) {
    return { multiplier: 2.0, effectiveness: "super" };
  }

  // Resisted: either of the defender's types naturally resists this move
  const resistedByPrimary =
    NOT_EFFECTIVE[moveElement].includes(defenderElement);
  const resistedBySecondary =
    defenderSecondaryElement !== undefined &&
    NOT_EFFECTIVE[moveElement].includes(defenderSecondaryElement);

  if (resistedByPrimary || resistedBySecondary) {
    return { multiplier: 0.5, effectiveness: "resisted" };
  }

  return { multiplier: 1.0, effectiveness: "neutral" };
}

/**
 * Damage multiplier applied when a move's element does NOT match
 * the attacker's element (off-element penalty).
 * Matching element = 1.0 (full damage). Off-element = this multiplier.
 */
export const STAB_PENALTY = 0.75;

/**
 * Calculate damage dealt by an attacker's move against a defender.
 * Formula: floor((power * ATK/DEF * effectiveness * crit * guardMod) / 5 + 2)
 */
export function calculateDamage(
  movePower: number,
  attackerAttack: number,
  defenderDefense: number,
  effectivenessMultiplier: number,
  isCritical: boolean,
  isDefenderGuarding: boolean,
): number {
  const critMultiplier = isCritical ? 1.5 : 1.0;
  const guardMultiplier = isDefenderGuarding ? 0.5 : 1.0;

  // Add a small random variance (0.85 - 1.0)
  const randomFactor = 0.85 + Math.random() * 0.15;

  const damage = Math.floor(
    ((movePower *
      (attackerAttack / defenderDefense) *
      effectivenessMultiplier *
      critMultiplier *
      guardMultiplier) /
      5 +
      2) *
      randomFactor,
  );

  return Math.max(1, damage); // Always deal at least 1 damage
}

/**
 * Roll for critical hit. 12% base chance.
 */
export function rollCritical(): boolean {
  return Math.random() < 0.12;
}
