import { ref } from "vue";
import { defineStore } from "pinia";

export const useGameStore = defineStore("game", () => {
  const totalXP = ref(0);
  const playerLevel = ref(1);
  const wins = ref(0);
  const losses = ref(0);

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

  function calculateXPReward(enemyLevel: number, won: boolean): number {
    const base = 50;
    const levelBonus = enemyLevel * 10;
    const victoryBonus = won ? 30 : 0;
    return base + levelBonus + victoryBonus;
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
    XP_PER_LEVEL,
    awardXP,
    recordWin,
    recordLoss,
    calculateXPReward,
    $reset,
  };
});
