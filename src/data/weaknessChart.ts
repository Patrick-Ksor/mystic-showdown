import type { ElementType } from "@/types";

// ─── Super-Effective Chart ────────────────────────────────────
// Two balanced cycles where every matchup has thematic logic:
//
// Cycle 1 (classical):  water → fire → nature → earth → electric → water
//   water extinguishes fire, fire burns plants, roots crack stone,
//   earth grounds electricity, electricity shocks through water
//
// Cycle 2 (mystical):   light → shadow → psychic → toxic → metal → ice → wind → light
//   light dispels darkness, darkness overwhelms the mind, mental purity
//   overcomes poison, acid corrodes metal, hard metal shatters ice,
//   freezing cold stills the air, fierce storms scatter beams of light
//
const SUPER_EFFECTIVE: Record<ElementType, ElementType> = {
  water: "fire",
  fire: "nature",
  nature: "earth",
  earth: "electric",
  electric: "water",
  light: "shadow",
  shadow: "psychic",
  psychic: "toxic",
  toxic: "metal",
  metal: "ice",
  ice: "wind",
  wind: "light",
};

// ─── Resistance Chart ────────────────────────────────────────
// Pattern: if A beats B, then A also resists B's attacks.
// (The dominant element shrugs off the weaker one.)
//
const NOT_EFFECTIVE: Record<ElementType, ElementType> = {
  fire: "water", // fire attacks are weak against water
  nature: "fire", // nature attacks are weak against fire
  earth: "nature", // earth attacks are weak against nature
  electric: "earth", // electric attacks are weak against earth
  water: "electric", // water attacks are weak against electric
  shadow: "light", // shadow attacks are weak against light
  psychic: "shadow", // psychic attacks are weak against shadow
  toxic: "psychic", // toxic attacks are weak against psychic
  metal: "toxic", // metal attacks are weak against toxic
  ice: "metal", // ice attacks are weak against metal
  wind: "ice", // wind attacks are weak against ice
  light: "wind", // light attacks are weak against wind
};

/**
 * Returns the effectiveness multiplier for a move against a defender.
 * 2.0 = super effective (move element targets defender's weakness)
 * 0.5 = not very effective (defender resists the move element)
 * 1.0 = neutral
 */
export function getEffectivenessMultiplier(
  moveElement: ElementType,
  defenderWeakness: ElementType,
  defenderElement: ElementType,
): { multiplier: number; effectiveness: "super" | "resisted" | "neutral" } {
  // Super effective: the move element matches the defender's weakness
  if (
    SUPER_EFFECTIVE[moveElement] === defenderElement ||
    moveElement === defenderWeakness
  ) {
    // Avoid double-counting: if move element IS the weakness, it's super effective
  }

  if (moveElement === defenderWeakness) {
    return { multiplier: 2.0, effectiveness: "super" };
  }

  if (NOT_EFFECTIVE[moveElement] === defenderElement) {
    return { multiplier: 0.5, effectiveness: "resisted" };
  }

  return { multiplier: 1.0, effectiveness: "neutral" };
}

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
