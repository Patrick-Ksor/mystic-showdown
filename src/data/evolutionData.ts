import type { EvolutionData } from "@/types";
import voltastormSprite from "../assets/sprites/Voltigon-Evo.png";
import sylphvexSprite from "../assets/sprites/Aerovex-Evo.png";
import tidelancerSprite from "../assets/sprites/Stormfin-Evo.png";
import cryophantSprite from "../assets/sprites/Aquaphant-Evo.png";
import terraquillSprite from "../assets/sprites/Coralith-Evo.png";
import pyrothunderSprite from "../assets/sprites/Pyroclasm-Evo.png";
import igniscladSprite from "../assets/sprites/Cinderback-Evo.png";
import oremancerSprite from "../assets/sprites/Quarrox-Evo.png";
import rootquakeSprite from "../assets/sprites/Terravex-Evo.png";
import abyssomawSprite from "../assets/sprites/Frostmaw-Evo.png";
import blizzardfangSprite from "../assets/sprites/Glacifang-Evo.png";
import purgatalonfangSprite from "../assets/sprites/Dusktalon-Evo.png";
import nullveilSprite from "../assets/sprites/Umbraveil-Evo.png";
import stormrionSprite from "../assets/sprites/Zephyrion-Evo.png";
import venombloomSprite from "../assets/sprites/Thornbloom-Evo.png";
import psychylvursaSprite from "../assets/sprites/Sylvursa-Evo.png";
import auramindSprite from "../assets/sprites/Mentalis-Evo.png";
import darkcebryxSprite from "../assets/sprites/Cerebryx-Evo.png";
import terraferroSprite from "../assets/sprites/Ferroclaw-Evo.png";
import infernotoxSprite from "../assets/sprites/Titanox-Evo.png";
import solarnovaSprite from "../assets/sprites/Solarius-Evo.png";
import aurafawnSprite from "../assets/sprites/Luxfawn-Evo.png";
import mirevenomSprite from "../assets/sprites/Venomire-Evo.png";
import plagueWingSprite from "../assets/sprites/Blightwing-Evo.png";
import singularixSprite from "../assets/sprites/Nihilux-Evo.png";

/**
 * Evolution data keyed by monster ID.
 * At EVOLUTION_LEVEL (15), each monster gains a secondary element type,
 * an evolved name, and an ultimate move whose element matches the new type.
 */
export const EVOLUTION_DATA: Record<string, EvolutionData> = {
  // ─── Electric ─────────────────────────────────────────────
  voltigon: {
    secondaryElement: "wind",
    evolvedName: "Voltastorm",
    evolvedSpriteUrl: voltastormSprite,
    ultimateMove: {
      name: "Tempest Sovereign",
      power: 140,
      element: "wind",
      accuracy: 80,
      isSpecial: true,
      description:
        "Ascends into a raging cyclone charged with thunderbolts, devastating everything in its path.",
      effect: { type: "stun", chance: 30 },
      isSignature: true,
    },
  },
  stormfin: {
    secondaryElement: "water",
    evolvedName: "Tidelancer",
    evolvedSpriteUrl: tidelancerSprite,
    ultimateMove: {
      name: "Hurricane Tide",
      power: 136,
      element: "water",
      accuracy: 82,
      isSpecial: true,
      description:
        "Spins a waterspout of supercharged ocean current, crashing down with devastating force.",
      effect: { type: "stun", chance: 25 },
      isSignature: true,
    },
  },

  // ─── Water ───────────────────────────────────────────────
  aquaphant: {
    secondaryElement: "ice",
    evolvedName: "Cryophant",
    evolvedSpriteUrl: cryophantSprite,
    ultimateMove: {
      name: "Glacial Tide",
      power: 138,
      element: "ice",
      accuracy: 78,
      isSpecial: true,
      description:
        "Unleashes a tidal wave of absolute-zero water that flash-freezes everything it touches.",
      effect: { type: "freeze", chance: 25 },
      isSignature: true,
    },
  },
  coralith: {
    secondaryElement: "earth",
    evolvedName: "Terraquill",
    evolvedSpriteUrl: terraquillSprite,
    ultimateMove: {
      name: "Tectonic Reef",
      power: 135,
      element: "earth",
      accuracy: 82,
      isSpecial: true,
      description:
        "Erupts coral spires from the sea floor, splitting the earth with unstoppable geological force.",
      isSignature: true,
    },
  },

  // ─── Fire ────────────────────────────────────────────────
  pyroclash: {
    secondaryElement: "electric",
    evolvedName: "Pyrothunder",
    evolvedSpriteUrl: pyrothunderSprite,
    ultimateMove: {
      name: "Flaming Lightning Strike",
      power: 142,
      element: "electric",
      accuracy: 76,
      isSpecial: true,
      description:
        "Unleashes a bolt of lightning superheated to plasma temperatures, incinerating everything in its path.",
      effect: { type: "burn", chance: 35 },
      isSignature: true,
    },
  },
  cinderback: {
    secondaryElement: "metal",
    evolvedName: "Ignisclad",
    evolvedSpriteUrl: igniscladSprite,
    ultimateMove: {
      name: "Scorched Rampart",
      power: 138,
      element: "metal",
      accuracy: 80,
      isSpecial: true,
      description:
        "Charges with superheated iron plating, crashing through barriers and searing everything on impact.",
      effect: { type: "burn", chance: 30 },
      isSignature: true,
    },
  },

  // ─── Earth ───────────────────────────────────────────────
  quarrox: {
    secondaryElement: "metal",
    evolvedName: "Oremancer",
    evolvedSpriteUrl: oremancerSprite,
    ultimateMove: {
      name: "Mineral Annihilation",
      power: 140,
      element: "metal",
      accuracy: 78,
      isSpecial: true,
      description:
        "Compresses the earth's deepest ore veins into a single obliterating spike of pure mineral force.",
      isSignature: true,
    },
  },
  terravex: {
    secondaryElement: "nature",
    evolvedName: "Rootquake",
    evolvedSpriteUrl: rootquakeSprite,
    ultimateMove: {
      name: "Ancient Grove",
      power: 137,
      element: "nature",
      accuracy: 80,
      isSpecial: true,
      description:
        "Summons the roots of an ancient forest, erupting through the battlefield to entangle and crush.",
      effect: { type: "poison", chance: 35 },
      isSignature: true,
    },
  },

  // ─── Ice ────────────────────────────────────────────────
  frostmaw: {
    secondaryElement: "water",
    evolvedName: "Abyssomaw",
    evolvedSpriteUrl: abyssomawSprite,
    ultimateMove: {
      name: "Deep Freeze Torrent",
      power: 138,
      element: "water",
      accuracy: 78,
      isSpecial: true,
      description:
        "Unleashes a surge of near-frozen seawater from the abyss, locking foes in creeping ice.",
      effect: { type: "freeze", chance: 35 },
      isSignature: true,
    },
  },
  glacifang: {
    secondaryElement: "wind",
    evolvedName: "Blizzardfang",
    evolvedSpriteUrl: blizzardfangSprite,
    ultimateMove: {
      name: "Polar Gale",
      power: 136,
      element: "wind",
      accuracy: 82,
      isSpecial: true,
      description:
        "Exhales an arctic wind so fierce it crystallises the air itself, tearing through all resistance.",
      effect: { type: "freeze", chance: 25 },
      isSignature: true,
    },
  },

  // ─── Shadow ──────────────────────────────────────────────
  dusktalon: {
    secondaryElement: "light",
    evolvedName: "Purgatalon",
    evolvedSpriteUrl: purgatalonfangSprite,
    ultimateMove: {
      name: "Eclipse Rapture",
      power: 145,
      element: "light",
      accuracy: 76,
      isSpecial: true,
      description:
        "Conjures a blinding celestial eclipse where shadow and light collide, ensnaring the target in a rapturous dream from which they cannot awaken.",
      effect: { type: "sleep", chance: 30 },
      isSignature: true,
    },
  },
  umbraveil: {
    secondaryElement: "void",
    evolvedName: "Nullveil",
    evolvedSpriteUrl: nullveilSprite,
    ultimateMove: {
      name: "Void Shroud",
      power: 148,
      element: "void",
      accuracy: 74,
      isSpecial: true,
      description:
        "Wraps the target in a shroud of nothingness, erasing their will to resist.",
      effect: { type: "confusion", chance: 35 },
      isSignature: true,
    },
  },

  // ─── Wind ────────────────────────────────────────────────
  zephyrion: {
    secondaryElement: "electric",
    evolvedName: "Stormrion",
    evolvedSpriteUrl: stormrionSprite,
    ultimateMove: {
      name: "Storm Conductor",
      power: 140,
      element: "electric",
      accuracy: 78,
      isSpecial: true,
      description:
        "Channels every static charge in the atmosphere into a single directed thunderclap of ruin.",
      effect: { type: "stun", chance: 30 },
      isSignature: true,
    },
  },
  aerovex: {
    secondaryElement: "nature",
    evolvedName: "Sylphvex",
    evolvedSpriteUrl: sylphvexSprite,
    ultimateMove: {
      name: "Windswept Bloom",
      power: 135,
      element: "nature",
      accuracy: 82,
      isSpecial: true,
      description:
        "Scatters healing spores on a warm updraft, restoring vitality while lashing the foe with vines.",
      effect: { type: "heal", chance: 100, value: 15 },
      isSignature: true,
    },
  },

  // ─── Nature ─────────────────────────────────────────────
  thornbloom: {
    secondaryElement: "toxic",
    evolvedName: "Venombloom",
    evolvedSpriteUrl: venombloomSprite,
    ultimateMove: {
      name: "Thorned Miasma",
      power: 138,
      element: "toxic",
      accuracy: 78,
      isSpecial: true,
      description:
        "Erupts in a cloud of toxic pollen laced with crystallised thorns that pierce and poison.",
      effect: { type: "poison", chance: 45 },
      isSignature: true,
    },
  },
  sylvursa: {
    secondaryElement: "psychic",
    evolvedName: "Psychylvursa",
    evolvedSpriteUrl: psychylvursaSprite,
    ultimateMove: {
      name: "Forest Mind",
      power: 137,
      element: "psychic",
      accuracy: 80,
      isSpecial: true,
      description:
        "Melds with the ancient forest consciousness, overwhelming the foe's mind with unfathomable verdant energy.",
      effect: { type: "confusion", chance: 35 },
      isSignature: true,
    },
  },

  // ─── Psychic ────────────────────────────────────────────
  mentalis: {
    secondaryElement: "light",
    evolvedName: "Auramind",
    evolvedSpriteUrl: auramindSprite,
    ultimateMove: {
      name: "Radiant Cognition",
      power: 140,
      element: "light",
      accuracy: 78,
      isSpecial: true,
      description:
        "Projects a blinding lattice of pure thought, searing the target's mind with absolute clarity.",
      effect: { type: "stun", chance: 25 },
      isSignature: true,
    },
  },
  cerebryx: {
    secondaryElement: "shadow",
    evolvedName: "Darkcebryx",
    evolvedSpriteUrl: darkcebryxSprite,
    ultimateMove: {
      name: "Umbral Mindwipe",
      power: 142,
      element: "shadow",
      accuracy: 76,
      isSpecial: true,
      description:
        "Floods the target's psyche with impenetrable shadow, erasing all coherent thought.",
      effect: { type: "confusion", chance: 40 },
      isSignature: true,
    },
  },

  // ─── Metal ──────────────────────────────────────────────
  ferroclaw: {
    secondaryElement: "earth",
    evolvedName: "Terraferro",
    evolvedSpriteUrl: terraferroSprite,
    ultimateMove: {
      name: "Tectonic Rend",
      power: 138,
      element: "earth",
      accuracy: 80,
      isSpecial: false,
      description:
        "Drives adamantine claws into the earth, splitting fault lines with catastrophic physical force.",
      isSignature: true,
    },
  },
  titanox: {
    secondaryElement: "fire",
    evolvedName: "Infernotox",
    evolvedSpriteUrl: infernotoxSprite,
    ultimateMove: {
      name: "Forge Nova",
      power: 142,
      element: "fire",
      accuracy: 77,
      isSpecial: true,
      description:
        "Superheats its molten core to critical mass, detonating in a forge-fire nova that melts all resistance.",
      effect: { type: "burn", chance: 35 },
      isSignature: true,
    },
  },

  // ─── Light ──────────────────────────────────────────────
  solarius: {
    secondaryElement: "fire",
    evolvedName: "Solarnova",
    evolvedSpriteUrl: solarnovaSprite,
    ultimateMove: {
      name: "Solar Coronation",
      power: 145,
      element: "fire",
      accuracy: 76,
      isSpecial: true,
      description:
        "Channels the full output of a stellar corona into a single incandescent column of destruction.",
      effect: { type: "burn", chance: 40 },
      isSignature: true,
    },
  },
  luxfawn: {
    secondaryElement: "nature",
    evolvedName: "Aurafawn",
    evolvedSpriteUrl: aurafawnSprite,
    ultimateMove: {
      name: "Dawn Overgrowth",
      power: 136,
      element: "nature",
      accuracy: 82,
      isSpecial: true,
      description:
        "Calls upon the first light of dawn to awaken a surge of living overgrowth, healing while striking.",
      effect: { type: "heal", chance: 100, value: 20 },
      isSignature: true,
    },
  },

  // ─── Toxic ──────────────────────────────────────────────
  venomire: {
    secondaryElement: "water",
    evolvedName: "Mirevenom",
    evolvedSpriteUrl: mirevenomSprite,
    ultimateMove: {
      name: "Toxic Deluge",
      power: 138,
      element: "water",
      accuracy: 78,
      isSpecial: true,
      description:
        "Floods the battlefield with a torrent of contaminated water that seeps into every wound.",
      effect: { type: "poison", chance: 40 },
      isSignature: true,
    },
  },
  blightwing: {
    secondaryElement: "wind",
    evolvedName: "Plaguewing",
    evolvedSpriteUrl: plagueWingSprite,
    ultimateMove: {
      name: "Pestilent Gale",
      power: 136,
      element: "wind",
      accuracy: 80,
      isSpecial: true,
      description:
        "Whips up a fetid storm of toxic spores that ride the wind to strip away all defenses.",
      effect: { type: "poison", chance: 35 },
      isSignature: true,
    },
  },

  // ─── Void ───────────────────────────────────────────────
  nihilux: {
    secondaryElement: "shadow",
    evolvedName: "Singularix",
    evolvedSpriteUrl: singularixSprite,
    ultimateMove: {
      name: "Singularity",
      power: 150,
      element: "shadow",
      accuracy: 72,
      isSpecial: true,
      description:
        "Collapses space itself into a point of infinite darkness — nothing that enters this void returns.",
      effect: { type: "sleep", chance: 35 },
      isSignature: true,
    },
  },
};
