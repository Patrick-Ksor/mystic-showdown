import { ref } from "vue";
import { defineStore } from "pinia";
import type { MonsterDefinition, MonsterProgress, Move } from "@/types";
import { MONSTERS } from "@/data/monsters";

const STORAGE_KEY = "monsterLevels";
const MAX_LEVEL = 20;
const STAT_SCALE_PER_LEVEL = 0.02; // +2% per level above 1

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
    if (progress?.equippedMoveNames && progress.equippedMoveNames.length > 0) {
      return progress.equippedMoveNames;
    }
    // Default: starter special move
    const def = MONSTERS.find((m) => m.id === monsterId);
    return def ? [def.specialMove.name] : [];
  }

  /**
   * Persist the equipped special move names for a monster.
   */
  function setEquippedMoveNames(monsterId: string, moveNames: string[]): void {
    const existing = monsterLevels.value.find((m) => m.id === monsterId);
    if (existing) {
      existing.equippedMoveNames = moveNames;
    } else {
      monsterLevels.value = [
        ...monsterLevels.value,
        { id: monsterId, level: 1, xp: 0, equippedMoveNames: moveNames },
      ];
    }
    saveToStorage(monsterLevels.value);
  }

  /**
   * Get all special moves available to a monster at a given level
   * (starter special + any learnset moves unlocked at or below that level).
   */
  function getAvailableSpecials(def: MonsterDefinition, level: number): Move[] {
    const specials: Move[] = [def.specialMove];
    for (const entry of def.learnset) {
      if (entry.level <= level) {
        specials.push(entry.move);
      }
    }
    return specials;
  }

  /**
   * Build the full moves array for battle: [basicMove, ...equippedSpecials].
   * For player monsters: uses stored equipped moves.
   * For enemies (isEnemy=true): uses all available moves at level.
   */
  function buildMovesArray(
    def: MonsterDefinition,
    level: number,
    isEnemy: boolean,
  ): Move[] {
    if (isEnemy) {
      const specials = getAvailableSpecials(def, level);
      return [def.basicMove, ...specials.slice(0, 3)];
    }

    const equippedNames = getEquippedMoveNames(def.id);
    const allSpecials = [def.specialMove, ...def.learnset.map((l) => l.move)];
    const equippedSpecials = equippedNames
      .map((name) => allSpecials.find((m) => m.name === name))
      .filter((m): m is Move => m !== undefined);

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
    return 30 + enemyLevel * 5 + (won ? 20 : 0);
  }

  /**
   * Award XP to a specific monster. Handles level-ups (capped at MAX_LEVEL).
   * Returns { newLevel, didLevelUp, newMove } where newMove is a learnable
   * move unlocked during this level-up (if any).
   */
  function awardXP(
    monsterId: string,
    amount: number,
  ): { newLevel: number; didLevelUp: boolean; newMove: Move | null } {
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
      return { newLevel: progress.level, didLevelUp: false, newMove: null };
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

    // Check for newly learnable move
    const newMove = getNewlyLearnableMove(
      monsterId,
      startLevel,
      progress.level,
    );

    // Persist
    saveToStorage(monsterLevels.value);

    return {
      newLevel: progress.level,
      didLevelUp: progress.level > startLevel,
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
    getEquippedMoveNames,
    getAvailableSpecials,
    buildMovesArray,
    getNewlyLearnableMove,
    // Actions
    calculateBattleXP,
    awardXP,
    setEquippedMoveNames,
    resetLevels,
  };
});
