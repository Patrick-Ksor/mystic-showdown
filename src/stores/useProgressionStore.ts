import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { MONSTERS } from "@/data/monsters";

const STORAGE_KEY = "unlockedMonsters";
const STARTER_IDS = ["voltigon", "aquaphant", "pyroclash"];
const GAUNTLET_COMPLETE_KEY = "gauntletCompleted";

function loadFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as string[];
    }
  } catch {
    // corrupted data — fall back to starters
  }
  return [...STARTER_IDS];
}

function saveToStorage(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export const useProgressionStore = defineStore("progression", () => {
  // ─── State ───────────────────────────────────────────────
  const unlockedMonsters = ref<string[]>(loadFromStorage());
  const hasCompletedGauntlet = ref<boolean>(
    localStorage.getItem(GAUNTLET_COMPLETE_KEY) === "true",
  );
  // ─── Getters ─────────────────────────────────────────────
  const lockedMonsters = computed(() =>
    MONSTERS.filter((m) => !unlockedMonsters.value.includes(m.id)).map(
      (m) => m.id,
    ),
  );

  const isTournamentComplete = computed(
    () => lockedMonsters.value.length === 0,
  );

  function isUnlocked(id: string): boolean {
    return unlockedMonsters.value.includes(id);
  }

  // ─── Actions ─────────────────────────────────────────────
  function unlockMonster(id: string) {
    if (!unlockedMonsters.value.includes(id)) {
      unlockedMonsters.value = [...unlockedMonsters.value, id];
      saveToStorage(unlockedMonsters.value);
    }
  }

  function resetProgress() {
    unlockedMonsters.value = [...STARTER_IDS];
    saveToStorage(unlockedMonsters.value);
  }

  function markGauntletComplete() {
    hasCompletedGauntlet.value = true;
    localStorage.setItem(GAUNTLET_COMPLETE_KEY, "true");
  }

  return {
    unlockedMonsters,
    lockedMonsters,
    isTournamentComplete,
    hasCompletedGauntlet,
    isUnlocked,
    unlockMonster,
    resetProgress,
    markGauntletComplete,
  };
});
