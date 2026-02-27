import { ref } from "vue";
import { defineStore } from "pinia";
import type { MonsterDefinition, MonsterProgress, Move } from "@/types";
import { EVOLUTION_LEVEL } from "@/types";
import { MONSTERS } from "@/data/monsters";
import { TUTOR_MOVES } from "@/data/tutorMoves";

const STORAGE_KEY = "monsterLevels";
const MAX_LEVEL = 20;
const STAT_SCALE_PER_LEVEL = 0.02; // +2% per level above 1

/** Maximum number of special moves a player monster can have equipped.
 *  Combined with the 1 basic move this fills all 4 battle action slots. */
export const MAX_EQUIPPED_SPECIALS = 3;

function xpForLevel(level: number): number {
  return level * 50; // 50 XP to reach L2, 100 for L3, etc.
}

function loadFromStorage(): MonsterProgress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as MonsterProgress[];
    }
  } catch {
    // corrupted — fall back to empty
  }
  return [];
}

function saveToStorage(data: MonsterProgress[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const useMonsterLevelStore = defineStore("monsterLevel", () => {
  // ─── State ───────────────────────────────────────────────
  const monsterLevels = ref<MonsterProgress[]>(loadFromStorage());

  // ─── Getters ─────────────────────────────────────────────
  function getProgress(id: string): MonsterProgress {
    return (
      monsterLevels.value.find((m) => m.id === id) ?? {
        id,
        level: 1,
        xp: 0,
      }
    );
  }

  function getLevel(id: string): number {
    return getProgress(id).level;
  }

  function getXP(id: string): number {
    return getProgress(id).xp;
  }

  function getXPToNextLevel(level: number): number {
    if (level >= MAX_LEVEL) return 0;
    return xpForLevel(level);
  }

  /** Whether a monster has reached EVOLUTION_LEVEL (15) and evolved. */
  function isEvolved(monsterId: string): boolean {
    return getLevel(monsterId) >= EVOLUTION_LEVEL;
  }

  /**
   * Returns level-scaled stats for a monster definition at a given level.
   * Formula: stat = floor(baseStat * (1 + 0.02 * (level - 1)))
   */
  function getScaledStats(
    def: MonsterDefinition,
    level: number,
  ): { hp: number; attack: number; defense: number; speed: number } {
    const multiplier = 1 + STAT_SCALE_PER_LEVEL * (level - 1);
    return {
      hp: Math.floor(def.baseHP * multiplier),
      attack: Math.floor(def.attack * multiplier),
      defense: Math.floor(def.defense * multiplier),
      speed: Math.floor(def.speed * multiplier),
    };
  }

  // ─── Move Management ────────────────────────────────────

  /**
   * Get the names of currently equipped special moves for a monster.
   * Defaults to just the starter special move if nothing is stored.
   */
  function getEquippedMoveNames(monsterId: string): string[] {
    const progress = monsterLevels.value.find((m) => m.id === monsterId);
    if (progress) {
      // Record exists — trust the stored array even if empty (user unequipped everything)
      if (progress.equippedMoveNames !== undefined) {
        return progress.equippedMoveNames;
      }
      // Record exists but equippedMoveNames field was never set (legacy data) — use starter
    }
    // No record at all — first time this monster is seen, default to starter special
    const def = MONSTERS.find((m) => m.id === monsterId);
    return def ? [def.specialMove.name] : [];
  }

  /**
   * Persist the equipped special move names for a monster.
   * Silently trims to MAX_EQUIPPED_SPECIALS if more names are provided.
   */
  function setEquippedMoveNames(monsterId: string, moveNames: string[]): void {
    const capped = moveNames.slice(0, MAX_EQUIPPED_SPECIALS);
    const existing = monsterLevels.value.find((m) => m.id === monsterId);
    if (existing) {
      existing.equippedMoveNames = capped;
    } else {
      monsterLevels.value = [
        ...monsterLevels.value,
        { id: monsterId, level: 1, xp: 0, equippedMoveNames: capped },
      ];
    }
    saveToStorage(monsterLevels.value);
  }

  // ─── Tutor Move Management ─────────────────────────────────

  function getTutorMoveNames(monsterId: string): string[] {
    return (
      monsterLevels.value.find((m) => m.id === monsterId)
        ?.learnedTutorMoveNames ?? []
    );
  }

  function learnTutorMove(monsterId: string, moveName: string): void {
    const existing = monsterLevels.value.find((m) => m.id === monsterId);
    if (existing) {
      if (!existing.learnedTutorMoveNames) existing.learnedTutorMoveNames = [];
      if (!existing.learnedTutorMoveNames.includes(moveName)) {
        existing.learnedTutorMoveNames.push(moveName);
      }
    } else {
      monsterLevels.value = [
        ...monsterLevels.value,
        { id: monsterId, level: 1, xp: 0, learnedTutorMoveNames: [moveName] },
      ];
    }
    saveToStorage(monsterLevels.value);
  }

  /**
   * Get all special moves available to a monster at a given level
   * (starter special + learnset moves at or below that level + learned tutor moves).
   */
  function getAvailableSpecials(def: MonsterDefinition, level: number): Move[] {
    const specials: Move[] = [def.specialMove];
    for (const entry of def.learnset) {
      if (entry.level <= level) {
        specials.push(entry.move);
      }
    }
    // Append learned tutor moves
    const tutorNames = getTutorMoveNames(def.id);
    for (const name of tutorNames) {
      const tm = TUTOR_MOVES.find((t) => t.name === name);
      if (tm) specials.push(tm);
    }
    // Append ultimate move once evolved
    if (level >= EVOLUTION_LEVEL && def.evolution) {
      specials.push(def.evolution.ultimateMove);
    }
    return specials;
  }

  /**
   * Build the full moves array for battle: [basicMove, ...equippedSpecials].
   * For player monsters: uses stored equipped moves.
   * For enemies (isEnemy=true): uses all available moves at level.
   * isSignature is read directly from the move data defined in monsters.ts.
   */
  function buildMovesArray(
    def: MonsterDefinition,
    level: number,
    isEnemy: boolean,
  ): Move[] {
    if (isEnemy) {
      const specials = getAvailableSpecials(def, level);
      return [def.basicMove, ...specials.slice(0, MAX_EQUIPPED_SPECIALS)];
    }

    const equippedNames = getEquippedMoveNames(def.id);
    const allSpecials: Move[] = [
      def.specialMove,
      ...def.learnset.map((l) => l.move),
      ...getTutorMoveNames(def.id)
        .map((name) => TUTOR_MOVES.find((t) => t.name === name))
        .filter((m): m is NonNullable<typeof m> => m !== undefined),
      ...(level >= EVOLUTION_LEVEL && def.evolution
        ? [def.evolution.ultimateMove]
        : []),
    ];
    const equippedSpecials = equippedNames
      .map((name) => allSpecials.find((m) => m.name === name))
      .filter((m): m is NonNullable<typeof m> => m !== undefined)
      .slice(0, MAX_EQUIPPED_SPECIALS);

    return [def.basicMove, ...equippedSpecials];
  }

  /**
   * Check if a learnset move was unlocked between two levels.
   * Returns the first newly unlockable move, or null.
   */
  function getNewlyLearnableMove(
    monsterId: string,
    oldLevel: number,
    newLevel: number,
  ): Move | null {
    const def = MONSTERS.find((m) => m.id === monsterId);
    if (!def) return null;

    for (const entry of def.learnset) {
      if (entry.level > oldLevel && entry.level <= newLevel) {
        return entry.move;
      }
    }
    return null;
  }

  // ─── Actions ─────────────────────────────────────────────

  /**
   * Calculate how much XP a monster earns from a battle.
   */
  function calculateBattleXP(enemyLevel: number, won: boolean): number {
    return 530 + enemyLevel * 5 + (won ? 20 : 0);
  }

  /**
   * Award XP to a specific monster. Handles level-ups (capped at MAX_LEVEL).
   * Returns { newLevel, didLevelUp, didEvolve, newMove } where:
   * - newMove is a learnset move unlocked during this level-up (if any)
   * - didEvolve is true when the monster crosses EVOLUTION_LEVEL this award
   */
  function awardXP(
    monsterId: string,
    amount: number,
  ): {
    newLevel: number;
    didLevelUp: boolean;
    didEvolve: boolean;
    newMove: Move | null;
  } {
    const existing = monsterLevels.value.find((m) => m.id === monsterId);
    let progress: MonsterProgress;

    if (existing) {
      progress = existing;
    } else {
      progress = { id: monsterId, level: 1, xp: 0 };
      monsterLevels.value = [...monsterLevels.value, progress];
      // Re-find after push so we mutate the reactive copy
      const found = monsterLevels.value.find((m) => m.id === monsterId);
      if (found) progress = found;
    }

    if (progress.level >= MAX_LEVEL) {
      return {
        newLevel: progress.level,
        didLevelUp: false,
        didEvolve: false,
        newMove: null,
      };
    }

    const startLevel = progress.level;
    progress.xp += amount;

    // Level up loop
    while (progress.level < MAX_LEVEL) {
      const needed = xpForLevel(progress.level);
      if (progress.xp >= needed) {
        progress.xp -= needed;
        progress.level++;
      } else {
        break;
      }
    }

    // Cap at max level
    if (progress.level >= MAX_LEVEL) {
      progress.level = MAX_LEVEL;
      progress.xp = 0;
    }

    // Check for newly learnable learnset move
    const newLearnsetMove = getNewlyLearnableMove(
      monsterId,
      startLevel,
      progress.level,
    );

    // Check for evolution crossing EVOLUTION_LEVEL
    const didEvolve =
      startLevel < EVOLUTION_LEVEL && progress.level >= EVOLUTION_LEVEL;
    const def = MONSTERS.find((m) => m.id === monsterId);
    const evolutionMove =
      didEvolve && def?.evolution ? def.evolution.ultimateMove : null;

    // If both a learnset move AND the ultimate arrive, prefer the ultimate
    const newMove = evolutionMove ?? newLearnsetMove;

    // Persist
    saveToStorage(monsterLevels.value);

    return {
      newLevel: progress.level,
      didLevelUp: progress.level > startLevel,
      didEvolve,
      newMove,
    };
  }

  function resetLevels() {
    monsterLevels.value = [];
    saveToStorage([]);
  }

  const maxLevel = MAX_LEVEL;

  return {
    // State
    monsterLevels,
    maxLevel,
    // Getters
    getProgress,
    getLevel,
    getXP,
    getXPToNextLevel,
    getScaledStats,
    isEvolved,
    getEquippedMoveNames,
    getAvailableSpecials,
    buildMovesArray,
    getNewlyLearnableMove,
    // Actions
    calculateBattleXP,
    awardXP,
    setEquippedMoveNames,
    getTutorMoveNames,
    learnTutorMove,
    resetLevels,
  };
});
