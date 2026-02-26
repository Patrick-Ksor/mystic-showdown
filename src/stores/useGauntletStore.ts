import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type {
  MonsterDefinition,
  RunPerkId,
  RunPerkDefinition,
  LeaderboardEntry,
} from "@/types";
import { MONSTERS } from "@/data/monsters";
import { PERKS } from "@/data/perks";
import { useProgressionStore } from "@/stores/useProgressionStore";
import { useGameStore } from "@/stores/useGameStore";

const LEADERBOARD_KEY = "gauntlet_leaderboard";
const MAX_LEADERBOARD_ENTRIES = 10;

export const useGauntletStore = defineStore("gauntlet", () => {
  // ─── State ───────────────────────────────────────────────
  const isActive = ref(false);
  const currentRound = ref(0); // 0 = not started, 1–4 = active
  const totalRounds = 4;
  const opponentIds = ref<string[]>([]);
  const defeatedIds = ref<string[]>([]);
  const playerMonsterId = ref<string | null>(null);
  const isComplete = ref(false);
  const isFailed = ref(false);

  // ─── Rogue-lite run state ────────────────────────────────
  const activePerks = ref<RunPerkId[]>([]);
  const totalTurns = ref(0);
  const runScore = ref(0);

  // ─── Getters ─────────────────────────────────────────────
  const currentOpponent = computed<MonsterDefinition | null>(() => {
    if (
      currentRound.value === 0 ||
      currentRound.value > opponentIds.value.length
    )
      return null;
    const id = opponentIds.value[currentRound.value - 1];
    return MONSTERS.find((m) => m.id === id) ?? null;
  });

  const defeatedMonsters = computed<MonsterDefinition[]>(() =>
    defeatedIds.value
      .map((id) => MONSTERS.find((m) => m.id === id))
      .filter((m): m is MonsterDefinition => m !== undefined),
  );

  const canStartGauntlet = computed(() => true);

  /** 3 randomly sampled perks that the player doesn't already own. */
  const offeredPerks = computed<RunPerkDefinition[]>(() => {
    const available = PERKS.filter((p) => !activePerks.value.includes(p.id));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });

  /** Live-read leaderboard from localStorage, sorted by score desc. */
  const leaderboard = computed<LeaderboardEntry[]>(() => {
    try {
      const raw = localStorage.getItem(LEADERBOARD_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as LeaderboardEntry[];
    } catch {
      return [];
    }
  });

  // ─── Actions ─────────────────────────────────────────────
  function startGauntlet(playerId: string) {
    const progressionStore = useProgressionStore();
    // Pick 3 random opponents from unlocked monsters (excluding player + Nihilux)
    const pool = progressionStore.unlockedMonsters.filter(
      (id) => id !== playerId && id !== "nihilux",
    );
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    // Nihilux is always the final boss (round 4)
    opponentIds.value = [...shuffled.slice(0, totalRounds - 1), "nihilux"];

    playerMonsterId.value = playerId;
    currentRound.value = 1;
    defeatedIds.value = [];
    isComplete.value = false;
    isFailed.value = false;
    isActive.value = true;
  }

  function advanceRound() {
    const progressionStore = useProgressionStore();
    const defeatedId = opponentIds.value[currentRound.value - 1];

    // Unlock the defeated opponent immediately
    if (defeatedId) {
      progressionStore.unlockMonster(defeatedId);
      defeatedIds.value = [...defeatedIds.value, defeatedId];
    }

    if (currentRound.value >= totalRounds) {
      isComplete.value = true;
      isActive.value = false;
    } else {
      currentRound.value++;
    }
  }

  function handleDefeat() {
    isFailed.value = true;
    isActive.value = false;
  }

  function resetGauntlet() {
    isActive.value = false;
    currentRound.value = 0;
    opponentIds.value = [];
    defeatedIds.value = [];
    playerMonsterId.value = null;
    isComplete.value = false;
    isFailed.value = false;
    activePerks.value = [];
    totalTurns.value = 0;
    runScore.value = 0;
  }

  /** Add a perk chosen by the player between rounds. */
  function addPerk(id: RunPerkId) {
    if (!activePerks.value.includes(id)) {
      activePerks.value = [...activePerks.value, id];
    }
  }

  /** Accumulate turns from the just-finished round before the store resets. */
  function accumulateTurns(n: number) {
    totalTurns.value += n;
  }

  /**
   * Compute and persist the run score, then save it to the leaderboard.
   * Call after the last round completes (before navigating to /result).
   */
  function finalizeScore(playerHP: number, maxHP: number) {
    const gameStore = useGameStore();
    const roundsCleared = defeatedIds.value.length;
    const base = roundsCleared * 1000;
    const completionBonus = isComplete.value ? 500 : 0;
    const hpBonus = maxHP > 0 && playerHP / maxHP > 0.5 ? 200 : 0;
    const turnsPenalty = totalTurns.value * 30;
    const diffMult: Record<string, number> = {
      easy: 0.75,
      normal: 1.0,
      hard: 1.25,
      nightmare: 1.5,
    };
    const mult = diffMult[gameStore.difficulty] ?? 1.0;
    runScore.value = Math.round(
      Math.max(0, (base + completionBonus + hpBonus - turnsPenalty) * mult),
    );
    _saveToLeaderboard();
  }

  function _saveToLeaderboard() {
    const gameStore = useGameStore();
    const entry: LeaderboardEntry = {
      score: runScore.value,
      totalTurns: totalTurns.value,
      roundsCleared: defeatedIds.value.length,
      difficulty: gameStore.difficulty,
      monsterUsed: playerMonsterId.value ?? "Unknown",
      perks: [...activePerks.value],
      date: new Date().toLocaleDateString(),
    };
    let board: LeaderboardEntry[] = [];
    try {
      const raw = localStorage.getItem(LEADERBOARD_KEY);
      if (raw) board = JSON.parse(raw) as LeaderboardEntry[];
    } catch {
      /* ignore */
    }
    board.push(entry);
    board.sort((a, b) => b.score - a.score);
    board = board.slice(0, MAX_LEADERBOARD_ENTRIES);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board));
  }

  return {
    // State
    isActive,
    currentRound,
    totalRounds,
    opponentIds,
    defeatedIds,
    playerMonsterId,
    isComplete,
    isFailed,
    activePerks,
    totalTurns,
    runScore,
    // Getters
    currentOpponent,
    defeatedMonsters,
    canStartGauntlet,
    offeredPerks,
    leaderboard,
    // Actions
    startGauntlet,
    advanceRound,
    handleDefeat,
    resetGauntlet,
    addPerk,
    accumulateTurns,
    finalizeScore,
  };
});
