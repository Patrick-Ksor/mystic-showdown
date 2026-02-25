import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { MonsterDefinition } from "@/types";
import { MONSTERS } from "@/data/monsters";
import { useProgressionStore } from "@/stores/useProgressionStore";

export const useGauntletStore = defineStore("gauntlet", () => {
  // ─── State ───────────────────────────────────────────────
  const isActive = ref(false);
  const currentRound = ref(0); // 0 = not started, 1–3 = active
  const totalRounds = 3;
  const opponentIds = ref<string[]>([]);
  const defeatedIds = ref<string[]>([]);
  const playerMonsterId = ref<string | null>(null);
  const isComplete = ref(false);
  const isFailed = ref(false);

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

  const canStartGauntlet = computed(() => {
    const progressionStore = useProgressionStore();
    return progressionStore.lockedMonsters.length >= totalRounds;
  });

  // ─── Actions ─────────────────────────────────────────────
  function startGauntlet(playerId: string) {
    const progressionStore = useProgressionStore();
    const lockedIds = [...progressionStore.lockedMonsters];

    // Shuffle and pick `totalRounds` distinct opponents from locked monsters
    const shuffled = lockedIds.sort(() => Math.random() - 0.5);
    opponentIds.value = shuffled.slice(0, totalRounds);

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
    // Getters
    currentOpponent,
    defeatedMonsters,
    canStartGauntlet,
    // Actions
    startGauntlet,
    advanceRound,
    handleDefeat,
    resetGauntlet,
  };
});
