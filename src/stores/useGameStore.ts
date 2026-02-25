import { ref, watch } from "vue";
import { defineStore } from "pinia";
import type { DifficultyTier } from "@/types";

const DIFFICULTY_KEY = "game_difficulty";
const COINS_KEY = "game_coins";
const TOTAL_XP_KEY = "game_totalXP";
const PLAYER_LEVEL_KEY = "game_playerLevel";

export const useGameStore = defineStore("game", () => {
  const totalXP = ref<number>(
    parseInt(localStorage.getItem(TOTAL_XP_KEY) ?? "0", 10),
  );
  const playerLevel = ref<number>(
    parseInt(localStorage.getItem(PLAYER_LEVEL_KEY) ?? "1", 10),
  );
  const wins = ref(0);
  const losses = ref(0);
  const difficulty = ref<DifficultyTier>(
    (localStorage.getItem(DIFFICULTY_KEY) as DifficultyTier) ?? "normal",
  );
  const coins = ref<number>(
    parseInt(localStorage.getItem(COINS_KEY) ?? "0", 10),
  );

  watch(difficulty, (val) => localStorage.setItem(DIFFICULTY_KEY, val));
  watch(coins, (val) => localStorage.setItem(COINS_KEY, String(val)));
  watch(totalXP, (val) => localStorage.setItem(TOTAL_XP_KEY, String(val)));
  watch(playerLevel, (val) =>
    localStorage.setItem(PLAYER_LEVEL_KEY, String(val)),
  );

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

  /**
   * Award Mystic Coins after a battle. Win = 25, loss = 10, scaled by difficulty.
   * Returns the coin amount awarded.
   */
  function awardCoins(won: boolean): number {
    const base = won ? 25 : 10;
    const multipliers: Record<DifficultyTier, number> = {
      easy: 0.75,
      normal: 1,
      hard: 1.25,
      nightmare: 1.5,
    };
    const amount = Math.round(base * multipliers[difficulty.value]);
    coins.value += amount;
    return amount;
  }

  /**
   * Spend Mystic Coins. Returns false if the balance is insufficient.
   */
  function spendCoins(amount: number): boolean {
    if (coins.value < amount) return false;
    coins.value -= amount;
    return true;
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
    localStorage.removeItem(TOTAL_XP_KEY);
    localStorage.removeItem(PLAYER_LEVEL_KEY);
  }

  return {
    totalXP,
    playerLevel,
    wins,
    losses,
    difficulty,
    coins,
    XP_PER_LEVEL,
    awardXP,
    recordWin,
    recordLoss,
    setDifficulty,
    awardCoins,
    spendCoins,
    calculateXPReward,
    $reset,
  };
});
