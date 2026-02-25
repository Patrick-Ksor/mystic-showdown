import type { MonsterDefinition } from "@/types";
import voltigonSprite from "../assets/sprites/Voltigon.png";
import aquaphantSprite from "../assets/sprites/Aquaphant.png";
import pyroclashSprite from "../assets/sprites/Pyroclash.png";
import glacifangSprite from "../assets/sprites/Glacifang.png";
import stormfinSprite from "../assets/sprites/Stormfin.png";
import coraliThSprite from "../assets/sprites/Coralith.png";
import cinderbackSprite from "../assets/sprites/Cinderback.png";
import terravexSprite from "../assets/sprites/Terravex.png";
import umbraveilSprite from "../assets/sprites/Umbraveil.png";
import zephyrionSprite from "../assets/sprites/Zephyrion.png";
import aerovexSprite from "../assets/sprites/Aerovex.png";
import frostmawSprite from "../assets/sprites/Frostmaw.png";
import duskTalonSprite from "../assets/sprites/Dusktalon.png";
import thornbloomSprite from "../assets/sprites/Thornbloom.png";
import sylvursaSprite from "../assets/sprites/Sylvursa.png";
import mentalisSprite from "../assets/sprites/Mentalis.png";
import cerebryxSprite from "../assets/sprites/Cerebryx.png";
import ferroclawSprite from "../assets/sprites/Ferroclaw.png";
import titanoxSprite from "../assets/sprites/Titanox.png";
import solariusSprite from "../assets/sprites/Solarius.png";
import luxfawnSprite from "../assets/sprites/Luxfawn.png";
import venomireSprite from "../assets/sprites/Venomire.png";
import blightwingSprite from "../assets/sprites/Blightwing.png";
import quarroxSprite from "../assets/sprites/Quarrox.png";
import nihiluxSprite from "../assets/sprites/Nihilux.png";

export const MONSTERS: MonsterDefinition[] = [
  {
    id: "voltigon",
    name: "Voltigon",
    element: "electric",
    baseHP: 110,
    attack: 75,
    defense: 55,
    speed: 75,
    weaknesses: ["earth", "ice"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Arc Cascade",
          power: 85,
          element: "electric",
          accuracy: 84,
          isSpecial: true,
          description:
            "Sends cascading arcs of electricity through the battlefield.",
        },
      },
      {
        level: 12,
        move: {
          name: "Storm Reckoning",
          power: 95,
          element: "electric",
          accuracy: 80,
          isSpecial: true,
          description:
            "Calls down the full fury of a thunderstorm in a single devastating strike.",
        },
      },
    ],
    spriteUrl: voltigonSprite,
    color: "#ffe44d",
    lore: "A crackling dragon-serpent born from perpetual storms. Its scales hum with stored lightning.",
    basicMove: {
      name: "Spark Strike",
      power: 40,
      element: "electric",
      accuracy: 95,
      isSpecial: false,
      description: "Lashes out with an electrified tail whip.",
    },
    specialMove: {
      name: "Thunderlance",
      power: 75,
      element: "electric",
      accuracy: 85,
      isSpecial: true,
      description:
        "Hurls a concentrated bolt of lightning at the foe. May stun the target.",
      effect: { type: "stun", chance: 30 },
    },
  },
  {
    id: "aquaphant",
    name: "Aquaphant",
    element: "water",
    baseHP: 125,
    attack: 55,
    defense: 60,
    speed: 50,
    weaknesses: ["electric", "nature", "toxic"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Riptide Crush",
          power: 85,
          element: "water",
          accuracy: 84,
          isSpecial: true,
          description:
            "Summons a crushing tidal force that engulfs the target.",
        },
      },
      {
        level: 12,
        move: {
          name: "Oceanic Wrath",
          power: 95,
          element: "water",
          accuracy: 80,
          isSpecial: true,
          description:
            "Channels the fury of the deep ocean into an overwhelming deluge.",
        },
      },
    ],
    spriteUrl: aquaphantSprite,
    color: "#00bfff",
    lore: "A colossal water-tusked beast that can summon tidal waves with a stomp of its mighty feet.",
    basicMove: {
      name: "Tidal Slam",
      power: 40,
      element: "water",
      accuracy: 95,
      isSpecial: false,
      description: "Charges forward with a wave of pressurized water.",
    },
    specialMove: {
      name: "Abyssal Torrent",
      power: 70,
      element: "water",
      accuracy: 88,
      isSpecial: true,
      description: "Summons a spiraling vortex of deep-sea water.",
    },
  },
  {
    id: "pyroclash",
    name: "Pyroclash",
    element: "fire",
    baseHP: 95,
    attack: 85,
    defense: 60,
    speed: 60,
    weaknesses: ["water", "earth", "light"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Blaze Torrent",
          power: 88,
          element: "fire",
          accuracy: 83,
          isSpecial: true,
          description: "Unleashes a searing stream of white-hot plasma.",
        },
      },
      {
        level: 12,
        move: {
          name: "Firestorm Omega",
          power: 98,
          element: "fire",
          accuracy: 78,
          isSpecial: true,
          description: "Engulfs the battlefield in an apocalyptic firestorm.",
        },
      },
    ],
    spriteUrl: pyroclashSprite,
    color: "#ff4d00",
    lore: "A living flame entity forged in volcanic craters. It feeds on heat and leaves embers in its wake.",
    basicMove: {
      name: "Ember Claw",
      power: 40,
      element: "fire",
      accuracy: 95,
      isSpecial: false,
      description: "Slashes with claws wreathed in white-hot flame.",
    },
    specialMove: {
      name: "Inferno Burst",
      power: 80,
      element: "fire",
      accuracy: 82,
      isSpecial: true,
      description: "Erupts in a devastating explosion of superheated plasma.",
    },
  },
  {
    id: "stormfin",
    name: "Stormfin",
    element: "electric",
    baseHP: 90,
    attack: 85,
    defense: 65,
    speed: 70,
    weaknesses: ["earth", "ice"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Levin Barrage",
          power: 88,
          element: "electric",
          accuracy: 83,
          isSpecial: true,
          description:
            "Fires rapid bolts of lightning from its charged dorsal fin.",
        },
      },
      {
        level: 12,
        move: {
          name: "Thunderquake",
          power: 98,
          element: "electric",
          accuracy: 79,
          isSpecial: true,
          description:
            "Slams the ground with enough voltage to crack the earth.",
        },
      },
    ],
    spriteUrl: stormfinSprite,
    color: "#facc15",
    lore: "An electrified deep-sea predator that crackles with bio-luminescent charge. Its dorsal fin channels lightning.",
    basicMove: {
      name: "Jolt Fin",
      power: 40,
      element: "electric",
      accuracy: 95,
      isSpecial: false,
      description: "Slams the foe with a fin crackling with static.",
    },
    specialMove: {
      name: "Voltaic Surge",
      power: 78,
      element: "electric",
      accuracy: 83,
      isSpecial: true,
      description:
        "Unleashes a chain of electricity through the battlefield. The shock may stun the target.",
      effect: { type: "stun", chance: 30 },
    },
  },
  {
    id: "coralith",
    name: "Coralith",
    element: "water",
    baseHP: 105,
    attack: 70,
    defense: 65,
    speed: 55,
    weaknesses: ["electric", "nature", "toxic"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Depth Charge",
          power: 86,
          element: "water",
          accuracy: 83,
          isSpecial: true,
          description:
            "Launches a pressurized sphere of deep-sea water at the target.",
        },
      },
      {
        level: 12,
        move: {
          name: "Maelstrom",
          power: 96,
          element: "water",
          accuracy: 79,
          isSpecial: true,
          description:
            "Creates a devastating whirlpool that engulfs everything nearby.",
        },
      },
    ],
    spriteUrl: coraliThSprite,
    color: "#0ea5e9",
    lore: "A living reef golem that drifts through deep trenches. Barnacles and coral grow across its stony hide.",
    basicMove: {
      name: "Tide Crash",
      power: 40,
      element: "water",
      accuracy: 95,
      isSpecial: false,
      description: "Charges with the force of a crashing wave.",
    },
    specialMove: {
      name: "Trench Deluge",
      power: 72,
      element: "water",
      accuracy: 86,
      isSpecial: true,
      description:
        "Summons a crushing column of abyssal seawater. The deep-tide energy restores the user's vitality.",
      effect: { type: "heal", chance: 100, value: 25 },
    },
  },
  {
    id: "cinderback",
    name: "Cinderback",
    element: "fire",
    baseHP: 115,
    attack: 60,
    defense: 65,
    speed: 45,
    weaknesses: ["water", "earth", "light"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Lava Flow",
          power: 85,
          element: "fire",
          accuracy: 84,
          isSpecial: true,
          description:
            "Releases a river of molten rock from its volcanic shell.",
        },
      },
      {
        level: 12,
        move: {
          name: "Volcanic Ruin",
          power: 95,
          element: "fire",
          accuracy: 80,
          isSpecial: true,
          description:
            "Triggers a full volcanic eruption that devastates the field.",
        },
      },
    ],
    spriteUrl: cinderbackSprite,
    color: "#ef4444",
    lore: "A smoldering tortoise whose shell is an active caldera. Magma pools in the cracks of its back.",
    basicMove: {
      name: "Cinder Slam",
      power: 40,
      element: "fire",
      accuracy: 95,
      isSpecial: false,
      description: "Crushes the foe under a white-hot shell.",
    },
    specialMove: {
      name: "Magma Plume",
      power: 76,
      element: "fire",
      accuracy: 84,
      isSpecial: true,
      description: "Erupts a fountain of molten rock from its shell.",
    },
  },
  {
    id: "quarrox",
    name: "Quarrox",
    element: "earth",
    baseHP: 120,
    attack: 55,
    defense: 65,
    speed: 40,
    weaknesses: ["water", "nature"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Landslide",
          power: 86,
          element: "earth",
          accuracy: 84,
          isSpecial: true,
          description:
            "Triggers a cascade of boulders crashing toward the foe.",
        },
      },
      {
        level: 12,
        move: {
          name: "Continental Crush",
          power: 96,
          element: "earth",
          accuracy: 79,
          isSpecial: true,
          description:
            "Raises and drops an enormous slab of bedrock on the target.",
        },
      },
    ],
    spriteUrl: quarroxSprite,
    color: "#a0845c",
    lore: "A crystalline rhinoceros formed from quartzite and sandstone. Its charge can split boulders.",
    basicMove: {
      name: "Stone Horn",
      power: 40,
      element: "earth",
      accuracy: 95,
      isSpecial: false,
      description: "Gores the foe with a petrified horn.",
    },
    specialMove: {
      name: "Tectonic Ram",
      power: 74,
      element: "earth",
      accuracy: 85,
      isSpecial: true,
      description:
        "Charges with enough force to trigger a localized earthquake.",
    },
  },
  {
    id: "frostmaw",
    name: "Frostmaw",
    element: "ice",
    baseHP: 90,
    attack: 85,
    defense: 65,
    speed: 50,
    weaknesses: ["fire", "metal"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Permafrost Slam",
          power: 88,
          element: "ice",
          accuracy: 83,
          isSpecial: true,
          description:
            "Slams the ground with enough cold to flash-freeze the terrain.",
        },
      },
      {
        level: 12,
        move: {
          name: "Absolute Zero",
          power: 98,
          element: "ice",
          accuracy: 78,
          isSpecial: true,
          description:
            "Drops the temperature to absolute zero in a devastating pulse.",
        },
      },
    ],
    spriteUrl: frostmawSprite,
    color: "#7dd3fc",
    lore: "A hulking ice-beast from the polar abyss whose jaws freeze anything they touch. Blizzards follow it.",
    basicMove: {
      name: "Glacial Snap",
      power: 40,
      element: "ice",
      accuracy: 95,
      isSpecial: false,
      description: "Bites down with jaws rimmed in permafrost.",
    },
    specialMove: {
      name: "Polar Shatter",
      power: 77,
      element: "ice",
      accuracy: 83,
      isSpecial: true,
      description:
        "Exhales an arctic blast that flash-freezes everything in its path.",
    },
  },
  {
    id: "dusktalon",
    name: "Dusktalon",
    element: "shadow",
    baseHP: 85,
    attack: 90,
    defense: 65,
    speed: 75,
    weaknesses: ["wind", "light"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Abyssal Talon",
          power: 88,
          element: "shadow",
          accuracy: 83,
          isSpecial: true,
          description:
            "Strikes with talons infused with the void between worlds.",
        },
      },
      {
        level: 12,
        move: {
          name: "Oblivion Strike",
          power: 98,
          element: "shadow",
          accuracy: 78,
          isSpecial: true,
          description:
            "Tears a rift in reality, unleashing pure nothingness on the foe.",
        },
      },
    ],
    spriteUrl: duskTalonSprite,
    color: "#7c3aed",
    lore: "A spectral raptor that hunts between twilight and midnight. Its talons tear through both flesh and spirit.",
    basicMove: {
      name: "Dusk Rake",
      power: 40,
      element: "shadow",
      accuracy: 95,
      isSpecial: false,
      description: "Rakes the foe with talons of condensed darkness.",
    },
    specialMove: {
      name: "Eclipse Dive",
      power: 80,
      element: "shadow",
      accuracy: 82,
      isSpecial: true,
      description:
        "Plunges from a rift of pure void, striking with annihilating shadow.",
    },
  },
  {
    id: "terravex",
    name: "Terravex",
    element: "earth",
    baseHP: 100,
    attack: 60,
    defense: 80,
    speed: 40,
    weaknesses: ["water", "nature"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Fault Line",
          power: 85,
          element: "earth",
          accuracy: 84,
          isSpecial: true,
          description:
            "Splits the ground along a deep fissure beneath the foe.",
        },
      },
      {
        level: 12,
        move: {
          name: "Earthsplitter",
          power: 95,
          element: "earth",
          accuracy: 80,
          isSpecial: true,
          description: "Cleaves the very bedrock apart with titanic force.",
        },
      },
    ],
    spriteUrl: terravexSprite,
    color: "#c48a2a",
    lore: "An ancient golem of compacted stone and crystal. Legends say it has stood guard for millennia.",
    basicMove: {
      name: "Boulder Bash",
      power: 40,
      element: "earth",
      accuracy: 95,
      isSpecial: false,
      description: "Slams a massive stone fist into the ground.",
    },
    specialMove: {
      name: "Seismic Shatter",
      power: 72,
      element: "earth",
      accuracy: 86,
      isSpecial: true,
      description: "Ruptures the earth beneath the foe with devastating force.",
    },
  },
  {
    id: "glacifang",
    name: "Glacifang",
    element: "ice",
    baseHP: 105,
    attack: 65,
    defense: 70,
    speed: 55,
    weaknesses: ["fire", "metal"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Frozen Torrent",
          power: 85,
          element: "ice",
          accuracy: 84,
          isSpecial: true,
          description: "Breathes a torrent of sub-zero wind and ice shards.",
        },
      },
      {
        level: 12,
        move: {
          name: "Glacial Ruin",
          power: 96,
          element: "ice",
          accuracy: 79,
          isSpecial: true,
          description:
            "Encases the battlefield in an ancient glacier's crushing force.",
        },
      },
    ],
    spriteUrl: glacifangSprite,
    color: "#7fdbff",
    lore: "A crystalline predator from frozen wastelands. Its fangs can freeze anything on contact.",
    basicMove: {
      name: "Frost Bite",
      power: 40,
      element: "ice",
      accuracy: 95,
      isSpecial: false,
      description: "Snaps with razor-sharp icicle fangs.",
    },
    specialMove: {
      name: "Blizzard Fang",
      power: 73,
      element: "ice",
      accuracy: 84,
      isSpecial: true,
      description: "Unleashes a freezing gale from its crystalline jaws.",
    },
  },
  {
    id: "umbraveil",
    name: "Umbraveil",
    element: "shadow",
    baseHP: 100,
    attack: 75,
    defense: 65,
    speed: 65,
    weaknesses: ["wind", "light"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Phantom Surge",
          power: 86,
          element: "shadow",
          accuracy: 83,
          isSpecial: true,
          description:
            "Releases a wave of spectral energy from the shadow realm.",
        },
      },
      {
        level: 12,
        move: {
          name: "Eternal Night",
          power: 96,
          element: "shadow",
          accuracy: 79,
          isSpecial: true,
          description:
            "Plunges the field into permanent darkness that devours all light.",
        },
      },
    ],
    spriteUrl: umbraveilSprite,
    color: "#a855f7",
    lore: "A spectral wraith that drifts between dimensions. It feeds on fear and casts no reflection.",
    basicMove: {
      name: "Shadow Swipe",
      power: 40,
      element: "shadow",
      accuracy: 95,
      isSpecial: false,
      description: "Strikes from the darkness with ethereal claws.",
    },
    specialMove: {
      name: "Void Pulse",
      power: 78,
      element: "shadow",
      accuracy: 83,
      isSpecial: true,
      description:
        "Releases a shockwave of pure void energy that warps reality.",
    },
  },

  // ─── Wind ──────────────────────────────────────────────────
  {
    id: "zephyrion",
    name: "Zephyrion",
    element: "wind",
    baseHP: 105,
    attack: 70,
    defense: 65,
    speed: 70,
    weaknesses: ["electric", "ice"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Gale Force",
          power: 85,
          element: "wind",
          accuracy: 84,
          isSpecial: true,
          description: "Whips up a concentrated blast of hurricane-force wind.",
        },
      },
      {
        level: 12,
        move: {
          name: "Hurricane Wrath",
          power: 95,
          element: "wind",
          accuracy: 80,
          isSpecial: true,
          description:
            "Summons a full-scale hurricane focused on a single point.",
        },
      },
    ],
    spriteUrl: zephyrionSprite,
    color: "#6ee7b7",
    lore: "A sinuous aerial serpent born from mountain gales. It slithers through the sky on invisible currents.",
    basicMove: {
      name: "Gust Slash",
      power: 40,
      element: "wind",
      accuracy: 95,
      isSpecial: false,
      description: "Slices the foe with a razor-thin blade of compressed air.",
    },
    specialMove: {
      name: "Cyclone Fury",
      power: 76,
      element: "wind",
      accuracy: 84,
      isSpecial: true,
      description:
        "Summons a devastating vortex that shreds everything in its path.",
    },
  },
  {
    id: "aerovex",
    name: "Aerovex",
    element: "wind",
    baseHP: 90,
    attack: 85,
    defense: 65,
    speed: 80,
    weaknesses: ["electric", "ice"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Sonic Boom",
          power: 88,
          element: "wind",
          accuracy: 83,
          isSpecial: true,
          description: "Breaks the sound barrier in a devastating shockwave.",
        },
      },
      {
        level: 12,
        move: {
          name: "Apocalypse Wind",
          power: 98,
          element: "wind",
          accuracy: 78,
          isSpecial: true,
          description:
            "Creates a sky-splitting tempest of unrivaled destructive power.",
        },
      },
    ],
    spriteUrl: aerovexSprite,
    color: "#34d399",
    lore: "A storm hawk that dives at supersonic speed. Thunder follows in its wake.",
    basicMove: {
      name: "Talon Wind",
      power: 40,
      element: "wind",
      accuracy: 95,
      isSpecial: false,
      description: "Rakes the foe with talons trailing compressed air.",
    },
    specialMove: {
      name: "Tempest Dive",
      power: 78,
      element: "wind",
      accuracy: 82,
      isSpecial: true,
      description: "Plummets from the sky wreathed in a spiraling tempest.",
    },
  },

  // ─── Nature ────────────────────────────────────────────────
  {
    id: "thornbloom",
    name: "Thornbloom",
    element: "nature",
    baseHP: 110,
    attack: 65,
    defense: 65,
    speed: 50,
    weaknesses: ["fire", "ice", "metal"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Overgrowth",
          power: 85,
          element: "nature",
          accuracy: 84,
          isSpecial: true,
          description:
            "Causes explosive plant growth that entangles and crushes. Channels the life-force back into the user.",
          effect: { type: "heal", chance: 100, value: 25 },
        },
      },
      {
        level: 12,
        move: {
          name: "Verdant Cataclysm",
          power: 95,
          element: "nature",
          accuracy: 80,
          isSpecial: true,
          description:
            "Unleashes the primordial force of nature in a devastating bloom.",
        },
      },
    ],
    spriteUrl: thornbloomSprite,
    color: "#22c55e",
    lore: "A flowering beast covered in razor thorns. It photosynthesizes during battle to heal.",
    basicMove: {
      name: "Vine Whip",
      power: 40,
      element: "nature",
      accuracy: 95,
      isSpecial: false,
      description: "Lashes out with barbed vines at blinding speed.",
    },
    specialMove: {
      name: "Thorn Barrage",
      power: 72,
      element: "nature",
      accuracy: 86,
      isSpecial: true,
      description: "Launches a volley of poison-tipped thorns at the foe.",
    },
  },
  {
    id: "sylvursa",
    name: "Sylvursa",
    element: "nature",
    baseHP: 120,
    attack: 50,
    defense: 70,
    speed: 45,
    weaknesses: ["fire", "ice", "metal"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Wild Growth",
          power: 85,
          element: "nature",
          accuracy: 84,
          isSpecial: true,
          description:
            "Channels ancient forest energy into a surge of crushing roots.",
        },
      },
      {
        level: 12,
        move: {
          name: "Primal Bloom",
          power: 95,
          element: "nature",
          accuracy: 80,
          isSpecial: true,
          description:
            "The ancient forest awakens, releasing millennia of stored energy.",
        },
      },
    ],
    spriteUrl: sylvursaSprite,
    color: "#16a34a",
    lore: "An ancient forest bear draped in living moss. Saplings grow where it sleeps.",
    basicMove: {
      name: "Root Swipe",
      power: 40,
      element: "nature",
      accuracy: 95,
      isSpecial: false,
      description: "Swings a massive paw entwined with hardened roots.",
    },
    specialMove: {
      name: "Forest Wrath",
      power: 70,
      element: "nature",
      accuracy: 88,
      isSpecial: true,
      description:
        "Commands the forest to entangle and crush the foe. The smothering vines may lull the target to sleep.",
      effect: { type: "sleep", chance: 25 },
    },
  },

  // ─── Psychic ───────────────────────────────────────────────
  {
    id: "mentalis",
    name: "Mentalis",
    element: "psychic",
    baseHP: 85,
    attack: 90,
    defense: 65,
    speed: 70,
    weaknesses: ["shadow", "nature", "toxic"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Mindshatter",
          power: 88,
          element: "psychic",
          accuracy: 83,
          isSpecial: true,
          description:
            "Concentrates psychic power into a mind-shattering blast.",
        },
      },
      {
        level: 12,
        move: {
          name: "Psychic Annihilation",
          power: 98,
          element: "psychic",
          accuracy: 78,
          isSpecial: true,
          description: "Erases all coherent thought in the target's mind.",
        },
      },
    ],
    spriteUrl: mentalisSprite,
    color: "#ec4899",
    lore: "A floating crystalline entity of pure thought. It speaks directly into the minds of others.",
    basicMove: {
      name: "Mind Jab",
      power: 40,
      element: "psychic",
      accuracy: 95,
      isSpecial: false,
      description: "Strikes with a focused spike of telekinetic force.",
    },
    specialMove: {
      name: "Psi Storm",
      power: 82,
      element: "psychic",
      accuracy: 80,
      isSpecial: true,
      description:
        "Assaults all senses with a psychic maelstrom. The mental overload may force the target into a deep, involuntary sleep.",
      effect: { type: "sleep", chance: 25 },
    },
  },
  {
    id: "cerebryx",
    name: "Cerebryx",
    element: "psychic",
    baseHP: 100,
    attack: 70,
    defense: 70,
    speed: 55,
    weaknesses: ["shadow", "nature", "toxic"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Brain Wave",
          power: 86,
          element: "psychic",
          accuracy: 83,
          isSpecial: true,
          description: "Emits a devastating wave of pure cognitive dissonance.",
        },
      },
      {
        level: 12,
        move: {
          name: "Cognitive Collapse",
          power: 96,
          element: "psychic",
          accuracy: 79,
          isSpecial: true,
          description:
            "Induces a total mental breakdown with overwhelming psychic force.",
        },
      },
    ],
    spriteUrl: cerebryxSprite,
    color: "#f472b6",
    lore: "A bio-engineered creature with an exposed brain-like crest. It predicts attacks before they happen.",
    basicMove: {
      name: "Thought Lance",
      power: 40,
      element: "psychic",
      accuracy: 95,
      isSpecial: false,
      description: "Hurls a hardened shard of psychic energy at the foe.",
    },
    specialMove: {
      name: "Neural Overload",
      power: 76,
      element: "psychic",
      accuracy: 83,
      isSpecial: true,
      description:
        "Overwhelms the foe's nervous system with raw mental feedback.",
    },
  },

  // ─── Metal ─────────────────────────────────────────────────
  {
    id: "ferroclaw",
    name: "Ferroclaw",
    element: "metal",
    baseHP: 100,
    attack: 65,
    defense: 75,
    speed: 45,
    weaknesses: ["fire", "psychic", "toxic"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Shrapnel Storm",
          power: 85,
          element: "metal",
          accuracy: 84,
          isSpecial: true,
          description:
            "Detonates its outer plating into a storm of razor shrapnel.",
        },
      },
      {
        level: 12,
        move: {
          name: "Titan's Edge",
          power: 95,
          element: "metal",
          accuracy: 80,
          isSpecial: true,
          description:
            "Concentrates all alloys into one impossibly sharp, devastating slash.",
        },
      },
    ],
    spriteUrl: ferroclawSprite,
    color: "#94a3b8",
    lore: "A predatory machine-beast forged in an ancient foundry. Its claws can shear through solid steel.",
    basicMove: {
      name: "Steel Rake",
      power: 40,
      element: "metal",
      accuracy: 95,
      isSpecial: false,
      description: "Slashes with reinforced alloy claws.",
    },
    specialMove: {
      name: "Iron Barrage",
      power: 74,
      element: "metal",
      accuracy: 85,
      isSpecial: true,
      description: "Fires a rapid volley of white-hot metal shards.",
    },
  },
  {
    id: "titanox",
    name: "Titanox",
    element: "metal",
    baseHP: 120,
    attack: 50,
    defense: 70,
    speed: 40,
    weaknesses: ["fire", "psychic", "toxic"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Heavy Artillery",
          power: 85,
          element: "metal",
          accuracy: 84,
          isSpecial: true,
          description:
            "Deploys built-in siege cannons for a devastating salvo.",
        },
      },
      {
        level: 12,
        move: {
          name: "Apocalypse Anvil",
          power: 95,
          element: "metal",
          accuracy: 80,
          isSpecial: true,
          description:
            "Drops its entire mass in a gravity-defying crushing blow.",
        },
      },
    ],
    spriteUrl: titanoxSprite,
    color: "#64748b",
    lore: "A hulking automaton built for siege warfare. Its armored plating absorbs most attacks.",
    basicMove: {
      name: "Chrome Bash",
      power: 40,
      element: "metal",
      accuracy: 95,
      isSpecial: false,
      description: "Slams the foe with a massive chrome-plated fist.",
    },
    specialMove: {
      name: "Alloy Crusher",
      power: 72,
      element: "metal",
      accuracy: 86,
      isSpecial: true,
      description: "Compresses metal plates into a devastating crushing blow.",
    },
  },

  // ─── Light ─────────────────────────────────────────────────
  {
    id: "solarius",
    name: "Solarius",
    element: "light",
    baseHP: 95,
    attack: 80,
    defense: 65,
    speed: 65,
    weaknesses: ["shadow", "metal"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Sunbeam Barrage",
          power: 88,
          element: "light",
          accuracy: 83,
          isSpecial: true,
          description:
            "Focuses multiple beams of concentrated sunlight on the target.",
        },
      },
      {
        level: 12,
        move: {
          name: "Supernova",
          power: 98,
          element: "light",
          accuracy: 78,
          isSpecial: true,
          description:
            "Releases energy comparable to a dying star's final explosion.",
        },
      },
    ],
    spriteUrl: solariusSprite,
    color: "#fbbf24",
    lore: "A radiant phoenix born from the heart of a dying star. It shines with blinding intensity.",
    basicMove: {
      name: "Ray Strike",
      power: 40,
      element: "light",
      accuracy: 95,
      isSpecial: false,
      description: "Fires a concentrated beam of pure light.",
    },
    specialMove: {
      name: "Solar Flare",
      power: 78,
      element: "light",
      accuracy: 83,
      isSpecial: true,
      description: "Erupts in a blinding supernova of radiant energy.",
    },
  },
  {
    id: "luxfawn",
    name: "Luxfawn",
    element: "light",
    baseHP: 110,
    attack: 60,
    defense: 70,
    speed: 60,
    weaknesses: ["shadow", "metal"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Moonlight Surge",
          power: 85,
          element: "light",
          accuracy: 84,
          isSpecial: true,
          description:
            "Channels amplified moonlight into a piercing lance of energy.",
        },
      },
      {
        level: 12,
        move: {
          name: "Divine Radiance",
          power: 95,
          element: "light",
          accuracy: 80,
          isSpecial: true,
          description:
            "Bathes the field in overwhelming celestial light that sears all shadows.",
        },
      },
    ],
    spriteUrl: luxfawnSprite,
    color: "#fcd34d",
    lore: "A celestial deer made of solidified moonlight. Its antlers glow with healing energy.",
    basicMove: {
      name: "Gleam Rush",
      power: 40,
      element: "light",
      accuracy: 95,
      isSpecial: false,
      description: "Charges the foe in a streak of brilliant light.",
    },
    specialMove: {
      name: "Radiant Burst",
      power: 70,
      element: "light",
      accuracy: 87,
      isSpecial: true,
      description:
        "Detonates a sphere of concentrated luminance. The sacred light washes over the user, mending their wounds.",
      effect: { type: "heal", chance: 100, value: 25 },
    },
  },

  // ─── Toxic ─────────────────────────────────────────────────
  {
    id: "venomire",
    name: "Venomire",
    element: "toxic",
    baseHP: 100,
    attack: 75,
    defense: 65,
    speed: 55,
    weaknesses: ["earth", "wind", "psychic"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Acid Rain",
          power: 86,
          element: "toxic",
          accuracy: 83,
          isSpecial: true,
          description:
            "Sprays a corrosive mist that eats through everything it touches.",
        },
      },
      {
        level: 12,
        move: {
          name: "Pandemic",
          power: 96,
          element: "toxic",
          accuracy: 79,
          isSpecial: true,
          description:
            "Releases a hyper-virulent toxin that overwhelms all defenses.",
        },
      },
    ],
    spriteUrl: venomireSprite,
    color: "#84cc16",
    lore: "A serpentine horror made of living acid. It dissolves terrain as it slithers.",
    basicMove: {
      name: "Acid Lash",
      power: 40,
      element: "toxic",
      accuracy: 95,
      isSpecial: false,
      description: "Whips the foe with a tendril of corrosive slime.",
    },
    specialMove: {
      name: "Toxic Eruption",
      power: 77,
      element: "toxic",
      accuracy: 83,
      isSpecial: true,
      description:
        "Sprays a geyser of virulent acid across the battlefield. May poison the target.",
      effect: { type: "poison", chance: 30 },
    },
  },
  {
    id: "blightwing",
    name: "Blightwing",
    element: "toxic",
    baseHP: 85,
    attack: 90,
    defense: 65,
    speed: 70,
    weaknesses: ["earth", "wind", "psychic"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Miasma Bomb",
          power: 88,
          element: "toxic",
          accuracy: 83,
          isSpecial: true,
          description:
            "Drops a concentrated orb of poisonous gas on the target.",
        },
      },
      {
        level: 12,
        move: {
          name: "Extinction Cloud",
          power: 98,
          element: "toxic",
          accuracy: 78,
          isSpecial: true,
          description:
            "Creates a toxic cloud so dense it threatens all life in the area.",
        },
      },
    ],
    spriteUrl: blightwingSprite,
    color: "#a3e635",
    lore: "A venomous moth that spreads plague clouds from its wings. Its dust is lethal.",
    basicMove: {
      name: "Poison Sting",
      power: 40,
      element: "toxic",
      accuracy: 95,
      isSpecial: false,
      description: "Jabs the foe with a venom-dripping proboscis.",
    },
    specialMove: {
      name: "Plague Cloud",
      power: 80,
      element: "toxic",
      accuracy: 81,
      isSpecial: true,
      description:
        "Releases a choking miasma of toxic spores that seep into the target, slowly poisoning them.",
      effect: { type: "poison", chance: 30 },
    },
  },
  // ─── VOID LEGENDARY ─────────────────────────────────────────
  {
    id: "nihilux",
    name: "Nihilux",
    element: "void",
    baseHP: 150,
    attack: 100,
    defense: 85,
    speed: 80,
    weaknesses: ["light"],
    learnset: [
      {
        level: 6,
        move: {
          name: "Rift Shatter",
          power: 120,
          element: "void",
          accuracy: 82,
          isSpecial: true,
          description:
            "Tears open a rift in reality, unleashing raw void energy.",
        },
      },
      {
        level: 12,
        move: {
          name: "Oblivion Pulse",
          power: 150,
          element: "void",
          accuracy: 75,
          isSpecial: true,
          description:
            "Erases a fragment of existence itself. Nothing survives the void.",
        },
      },
    ],
    spriteUrl: nihiluxSprite,
    color: "#7c3aed",
    lore: "Born from the space between worlds, Nihilux is the embodiment of nothingness given form. Legends say it existed before the elements themselves.",
    basicMove: {
      name: "Void Touch",
      power: 55,
      element: "void",
      accuracy: 95,
      isSpecial: false,
      description: "A strike that unravels matter at the point of contact.",
    },
    specialMove: {
      name: "Entropy Wave",
      power: 90,
      element: "void",
      accuracy: 85,
      isSpecial: true,
      description:
        "Unleashes a wave of pure entropy. The unraveling of matter leaves the target paralysed with existential shock.",
      effect: { type: "stun", chance: 35 },
    },
  },
];
