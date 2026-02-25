import { ref, watch } from "vue";
import { defineStore } from "pinia";
import type { DifficultyTier } from "@/types";

const DIFFICULTY_KEY = "game_difficulty";

export const useGameStore = defineStore("game", () => {
  const totalXP = ref(0);
  const playerLevel = ref(1);
  const wins = ref(0);
  const losses = ref(0);
  const difficulty = ref<DifficultyTier>(
    (localStorage.getItem(DIFFICULTY_KEY) as DifficultyTier) ?? "normal",
  );

  watch(difficulty, (val) => localStorage.setItem(DIFFICULTY_KEY, val));

  const XP_PER_LEVEL = 100;

  function awardXP(amount: number): boolean {
    totalXP.value += amount;
    const newLevel = Math.floor(totalXP.value / XP_PER_LEVEL) + 1;
    const didLevelUp = newLevel > playerLevel.value;
    playerLevel.value = newLevel;
    return didLevelUp;
  }

  function recordWin() {
    wins.value++;
  }

  function recordLoss() {
    losses.value++;
  }

  function setDifficulty(tier: DifficultyTier) {
    difficulty.value = tier;
  }

  function calculateXPReward(enemyLevel: number, won: boolean): number {
    const base = 50;
    const levelBonus = enemyLevel * 10;
    const victoryBonus = won ? 30 : 0;
    const raw = base + levelBonus + victoryBonus;
    const multipliers: Record<DifficultyTier, number> = {
      easy: 0.75,
      normal: 1,
      hard: 1.25,
      nightmare: 1.5,
    };
    return Math.round(raw * multipliers[difficulty.value]);
  }

  function $reset() {
    totalXP.value = 0;
    playerLevel.value = 1;
    wins.value = 0;
    losses.value = 0;
  }

  return {
    totalXP,
    playerLevel,
    wins,
    losses,
    difficulty,
    XP_PER_LEVEL,
    awardXP,
    recordWin,
    recordLoss,
    setDifficulty,
    calculateXPReward,
    $reset,
  };
});
