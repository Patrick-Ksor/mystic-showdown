import type { TutorMove } from "@/types";

/**
 * Move Tutor catalog — 12 cross-type moves, one per element.
 * Any monster can learn any of these for the listed Mystic Coin cost.
 */
export const TUTOR_MOVES: TutorMove[] = [
  {
    name: "Soulfire",
    power: 78,
    element: "fire",
    accuracy: 87,
    isSpecial: true,
    cost: 80,
    crossTheme: "fire + shadow",
    description:
      "Ignites the target's life-force with cursed phantom flames. Burns from the inside out.",
  },
  {
    name: "Glacial Deluge",
    power: 76,
    element: "water",
    accuracy: 88,
    isSpecial: true,
    cost: 80,
    crossTheme: "water + ice",
    description:
      "A torrent of supercooled water that flash-freezes everything it touches on impact.",
  },
  {
    name: "Tempest Strike",
    power: 80,
    element: "electric",
    accuracy: 86,
    isSpecial: true,
    cost: 90,
    crossTheme: "electric + wind",
    description:
      "A spiralling cyclone charged with raw lightning that tears through defenses.",
    effect: { type: "stun", chance: 25 },
  },
  {
    name: "Iron Quake",
    power: 78,
    element: "earth",
    accuracy: 85,
    isSpecial: true,
    cost: 85,
    crossTheme: "earth + metal",
    description:
      "Slams the ground with metallic fists, sending shockwaves of iron shards in all directions.",
  },
  {
    name: "Frostmind",
    power: 72,
    element: "ice",
    accuracy: 90,
    isSpecial: true,
    cost: 75,
    crossTheme: "ice + psychic",
    description:
      "Projects a freezing psychic pulse that numbs both the body and mind of the target.",
    effect: { type: "sleep", chance: 20 },
  },
  {
    name: "Void Shroud",
    power: 85,
    element: "shadow",
    accuracy: 82,
    isSpecial: true,
    cost: 120,
    crossTheme: "shadow + void",
    description:
      "Wraps the target in tendrils of pure void energy, unravelling their shadow from existence.",
  },
  {
    name: "Gale Bloom",
    power: 70,
    element: "wind",
    accuracy: 92,
    isSpecial: true,
    cost: 70,
    crossTheme: "wind + nature",
    description:
      "A gust of pollen-laden wind that slices and chokes simultaneously.",
    effect: { type: "poison", chance: 20 },
  },
  {
    name: "Venom Garden",
    power: 74,
    element: "nature",
    accuracy: 88,
    isSpecial: true,
    cost: 80,
    crossTheme: "nature + toxic",
    description:
      "Erupts a field of toxic blossoms that entangle and slowly dissolve the foe.",
    effect: { type: "poison", chance: 30 },
  },
  {
    name: "Radiant Mind",
    power: 76,
    element: "psychic",
    accuracy: 88,
    isSpecial: true,
    cost: 90,
    crossTheme: "psychic + light",
    description:
      "Floods the target's mind with blinding celestial light, overwhelming every sense.",
  },
  {
    name: "Arc Forge",
    power: 80,
    element: "metal",
    accuracy: 85,
    isSpecial: true,
    cost: 95,
    crossTheme: "metal + electric",
    description:
      "Superheats metal particles with electricity, launching a barrage of molten shards.",
    effect: { type: "stun", chance: 20 },
  },
  {
    name: "Solar Burst",
    power: 82,
    element: "light",
    accuracy: 84,
    isSpecial: true,
    cost: 100,
    crossTheme: "light + fire",
    description:
      "Focuses sunlight to a singularity point, then detonates it in a blinding solar explosion.",
    effect: { type: "heal", chance: 100, value: 20 },
  },
  {
    name: "Plaguemist",
    power: 78,
    element: "toxic",
    accuracy: 83,
    isSpecial: true,
    cost: 85,
    crossTheme: "toxic + shadow",
    description:
      "Exhales a cursed miasma of shadow-infused toxins that corrode both body and spirit.",
    effect: { type: "poison", chance: 35 },
  },
];
