import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type {
  BattleMonster,
  BattlePhase,
  BattleLogEntry,
  ActionType,
  DamageResult,
  Move,
} from "@/types";
import { MONSTERS } from "@/data/monsters";
import {
  getEffectivenessMultiplier,
  calculateDamage,
  rollCritical,
} from "@/data/weaknessChart";
import { useProgressionStore } from "@/stores/useProgressionStore";

let logIdCounter = 0;

function toBattleMonster(def: (typeof MONSTERS)[number]): BattleMonster {
  return {
    ...def,
    currentHP: def.baseHP,
    maxHP: def.baseHP,
    level: 5,
    xp: 0,
    isGuarding: false,
  };
}

export const useBattleStore = defineStore("battle", () => {
  // ─── State ───────────────────────────────────────────────
  const phase = ref<BattlePhase>("select");
  const playerMonster = ref<BattleMonster | null>(null);
  const enemyMonster = ref<BattleMonster | null>(null);
  const turnCount = ref(0);
  const battleLog = ref<BattleLogEntry[]>([]);
  const lastDamageResult = ref<
    (DamageResult & { target: "player" | "enemy" }) | null
  >(null);
  const isAnimating = ref(false);

  // ─── Getters ─────────────────────────────────────────────
  const isPlayerTurn = computed(() => phase.value === "playerTurn");
  const isBattleOver = computed(
    () => phase.value === "victory" || phase.value === "defeat",
  );

  const playerHPPercent = computed(() => {
    if (!playerMonster.value) return 100;
    return Math.max(
      0,
      (playerMonster.value.currentHP / playerMonster.value.maxHP) * 100,
    );
  });

  const enemyHPPercent = computed(() => {
    if (!enemyMonster.value) return 100;
    return Math.max(
      0,
      (enemyMonster.value.currentHP / enemyMonster.value.maxHP) * 100,
    );
  });

  // ─── Actions ─────────────────────────────────────────────
  function addLog(text: string, type: BattleLogEntry["type"] = "normal") {
    battleLog.value.push({ id: ++logIdCounter, text, type });
    // Keep only last 50 entries
    if (battleLog.value.length > 50) {
      battleLog.value = battleLog.value.slice(-50);
    }
  }

  function selectMonster(monsterId: string) {
    const selected = MONSTERS.find((m) => m.id === monsterId);
    if (!selected) return;

    playerMonster.value = toBattleMonster(selected);

    const progressionStore = useProgressionStore();

    // In tournament mode the enemy is always a locked monster so defeating it
    // unlocks it for the player's roster. Once all are unlocked, fall back to
    // any monster other than the selected one (free-play).
    let pool: string[];
    if (progressionStore.isTournamentComplete) {
      pool = MONSTERS.filter((m) => m.id !== monsterId).map((m) => m.id);
    } else {
      pool = progressionStore.lockedMonsters;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    const enemyId = pool[randomIndex];
    const enemyDef = MONSTERS.find((m) => m.id === enemyId);
    if (enemyDef) {
      enemyMonster.value = toBattleMonster(enemyDef);
    }
  }

  function startBattle() {
    if (!playerMonster.value || !enemyMonster.value) return;
    phase.value = "intro";
    turnCount.value = 0;
    battleLog.value = [];
    logIdCounter = 0;
    addLog(
      `${playerMonster.value.name} vs ${enemyMonster.value.name}!`,
      "system",
    );
    addLog("The battle begins!", "system");
  }

  function beginPlayerTurn() {
    phase.value = "playerTurn";
    turnCount.value++;
    // Clear guarding from previous turn
    if (playerMonster.value) {
      playerMonster.value.isGuarding = false;
    }
  }

  function performAttack(
    attacker: BattleMonster,
    defender: BattleMonster,
    move: Move,
    target: "player" | "enemy",
  ): DamageResult {
    // Check accuracy
    const accuracyRoll = Math.random() * 100;
    if (accuracyRoll > move.accuracy) {
      const result: DamageResult = {
        damage: 0,
        isCritical: false,
        effectiveness: "neutral",
        message: `${attacker.name}'s ${move.name} missed!`,
      };
      addLog(result.message, "miss");
      lastDamageResult.value = { ...result, target };
      return result;
    }

    const isCritical = rollCritical();
    const { multiplier, effectiveness } = getEffectivenessMultiplier(
      move.element,
      defender.weakness,
      defender.element,
    );

    const damage = calculateDamage(
      move.power,
      attacker.attack,
      defender.defense,
      multiplier,
      isCritical,
      defender.isGuarding,
    );

    // Apply damage
    defender.currentHP = Math.max(0, defender.currentHP - damage);

    // Build message
    let message = `${attacker.name} used ${move.name}! Dealt ${damage} damage!`;

    const result: DamageResult = { damage, isCritical, effectiveness, message };
    lastDamageResult.value = { ...result, target };

    addLog(message, "normal");

    if (isCritical) {
      addLog("A critical hit!", "critical");
    }

    if (effectiveness === "super") {
      addLog("It's super effective!", "effective");
    } else if (effectiveness === "resisted") {
      addLog("It's not very effective...", "ineffective");
    }

    if (defender.isGuarding) {
      addLog(`${defender.name}'s guard softened the blow!`, "guard");
      defender.isGuarding = false;
    }

    return result;
  }

  async function executePlayerAction(
    action: ActionType,
  ): Promise<DamageResult | null> {
    if (!playerMonster.value || !enemyMonster.value) return null;
    if (phase.value !== "playerTurn") return null;

    phase.value = "animating";
    isAnimating.value = true;

    let result: DamageResult | null = null;

    switch (action) {
      case "strike":
        result = performAttack(
          playerMonster.value,
          enemyMonster.value,
          playerMonster.value.basicMove,
          "enemy",
        );
        break;

      case "special":
        result = performAttack(
          playerMonster.value,
          enemyMonster.value,
          playerMonster.value.specialMove,
          "enemy",
        );
        break;

      case "guard":
        playerMonster.value.isGuarding = true;
        addLog(`${playerMonster.value.name} is bracing for impact!`, "guard");
        result = {
          damage: 0,
          isCritical: false,
          effectiveness: "neutral",
          message: "",
        };
        break;

      case "run":
        if (Math.random() < 0.5) {
          addLog("Can't escape!", "system");
          result = {
            damage: 0,
            isCritical: false,
            effectiveness: "neutral",
            message: "",
          };
        } else {
          addLog("Got away safely!", "system");
          phase.value = "select";
          isAnimating.value = false;
          $reset();
          return null;
        }
        break;
    }

    // Check if enemy fainted
    if (enemyMonster.value.currentHP <= 0) {
      addLog(`${enemyMonster.value.name} fainted!`, "system");
      phase.value = "victory";
      isAnimating.value = false;
      return result;
    }

    isAnimating.value = false;
    return result;
  }

  function beginEnemyTurn() {
    if (!enemyMonster.value) return;
    phase.value = "enemyTurn";
    enemyMonster.value.isGuarding = false;
  }

  async function executeEnemyTurn(): Promise<DamageResult | null> {
    if (!playerMonster.value || !enemyMonster.value) return null;

    phase.value = "animating";
    isAnimating.value = true;

    // CPU AI: 50% strike, 30% special, 20% guard
    const roll = Math.random();
    let result: DamageResult | null = null;

    if (roll < 0.5) {
      result = performAttack(
        enemyMonster.value,
        playerMonster.value,
        enemyMonster.value.basicMove,
        "player",
      );
    } else if (roll < 0.8) {
      result = performAttack(
        enemyMonster.value,
        playerMonster.value,
        enemyMonster.value.specialMove,
        "player",
      );
    } else {
      enemyMonster.value.isGuarding = true;
      addLog(`${enemyMonster.value.name} is bracing for impact!`, "guard");
      result = {
        damage: 0,
        isCritical: false,
        effectiveness: "neutral",
        message: "",
      };
    }

    // Check if player fainted
    if (playerMonster.value.currentHP <= 0) {
      addLog(`${playerMonster.value.name} fainted!`, "system");
      phase.value = "defeat";
      isAnimating.value = false;
      return result;
    }

    isAnimating.value = false;
    return result;
  }

  function $reset() {
    phase.value = "select";
    playerMonster.value = null;
    enemyMonster.value = null;
    turnCount.value = 0;
    battleLog.value = [];
    lastDamageResult.value = null;
    isAnimating.value = false;
    logIdCounter = 0;
  }

  return {
    // State
    phase,
    playerMonster,
    enemyMonster,
    turnCount,
    battleLog,
    lastDamageResult,
    isAnimating,
    // Getters
    isPlayerTurn,
    isBattleOver,
    playerHPPercent,
    enemyHPPercent,
    // Actions
    addLog,
    selectMonster,
    startBattle,
    beginPlayerTurn,
    executePlayerAction,
    beginEnemyTurn,
    executeEnemyTurn,
    $reset,
  };
});
