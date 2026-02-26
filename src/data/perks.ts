import type { RunPerkDefinition } from "@/types";

/**
 * All available gauntlet run perks.
 * Between rounds 1→2 and 2→3, the player chooses one from a random
 * sample of 3 non-duplicate perks. Effects are applied in useBattleStore.
 */
export const PERKS: RunPerkDefinition[] = [
  {
    id: "vampiric_crits",
    name: "Vampiric Crits",
    description: "Critical hits restore 5% of your max HP.",
    icon: "heart",
    color: "#f43f5e",
  },
  {
    id: "thorny_guard",
    name: "Thorny Guard",
    description: "Guarding poisons any attacker for 3 turns.",
    icon: "shield-halved",
    color: "#86efac",
  },
  {
    id: "power_surge",
    name: "Power Surge",
    description: "Deal 15% bonus damage on all attacks.",
    icon: "bolt",
    color: "#fde047",
  },
  {
    id: "battle_hardened",
    name: "Battle Hardened",
    description: "Take 12% less incoming damage.",
    icon: "gears",
    color: "#94a3b8",
  },
  {
    id: "last_stand",
    name: "Last Stand",
    description: "Deal 20% bonus damage when below 30% HP.",
    icon: "fire-flame-curved",
    color: "#f97316",
  },
  {
    id: "toxic_aura",
    name: "Toxic Aura",
    description: "All status effect chances are increased by +15%.",
    icon: "biohazard",
    color: "#84cc16",
  },
  {
    id: "opening_blow",
    name: "Opening Blow",
    description: "Your first attack each round is a guaranteed critical hit.",
    icon: "hand-fist",
    color: "#e879f9",
  },
  {
    id: "fireproof",
    name: "Fireproof",
    description: "Your monster is immune to the burn status.",
    icon: "fire",
    color: "#fb923c",
  },
  {
    id: "iron_mind",
    name: "Iron Mind",
    description: "Your monster is immune to confusion.",
    icon: "brain",
    color: "#a78bfa",
  },
  {
    id: "regeneration",
    name: "Regeneration",
    description: "Recover 3% max HP at the start of each of your turns.",
    icon: "leaf",
    color: "#34d399",
  },
];
