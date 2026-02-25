import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type {
  BattleMonster,
  BattlePhase,
  BattleLogEntry,
  ActionType,
  DamageResult,
  Move,
  MonsterDefinition,
  StatusCondition,
} from "@/types";
import { MONSTERS } from "@/data/monsters";
import {
  getEffectivenessMultiplier,
  calculateDamage,
  rollCritical,
} from "@/data/weaknessChart";
import { useProgressionStore } from "@/stores/useProgressionStore";
import { useMonsterLevelStore } from "@/stores/useMonsterLevelStore";

let logIdCounter = 0;

function toBattleMonster(
  def: (typeof MONSTERS)[number],
  levelOverride?: number,
): BattleMonster {
  const monsterLevelStore = useMonsterLevelStore();
  const isEnemy = levelOverride !== undefined;
  const level = levelOverride ?? monsterLevelStore.getLevel(def.id);
  const scaled = monsterLevelStore.getScaledStats(def, level);
  const moves = monsterLevelStore.buildMovesArray(def, level, isEnemy);
  return {
    ...def,
    currentHP: scaled.hp,
    maxHP: scaled.hp,
    attack: scaled.attack,
    defense: scaled.defense,
    speed: scaled.speed,
    level,
    xp: 0,
    isGuarding: false,
    statusEffect: null,
    moves,
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

  // ─── Move Effect Application ────────────────────────────
  function applyMoveEffect(
    move: Move,
    attacker: BattleMonster,
    defender: BattleMonster,
  ): void {
    if (!move.effect) return;
    const { type, chance, value } = move.effect;
    if (Math.random() * 100 > chance) return;

    if (type === "heal") {
      const healAmt = Math.floor(((value ?? 25) / 100) * attacker.maxHP);
      const actual = Math.min(healAmt, attacker.maxHP - attacker.currentHP);
      if (actual <= 0) return;
      attacker.currentHP = Math.min(
        attacker.maxHP,
        attacker.currentHP + healAmt,
      );
      addLog(`${attacker.name} recovered ${actual} HP!`, "heal");
      return;
    }

    // Status conditions – can't stack
    if (defender.statusEffect) return;
    const durations: Record<string, number> = { poison: 3, stun: 1, sleep: 2 };
    defender.statusEffect = {
      type: type as StatusCondition["type"],
      turnsLeft: durations[type],
    };
    const labels: Record<string, string> = {
      poison: "was poisoned",
      stun: "was stunned",
      sleep: "fell asleep",
    };
    addLog(`${defender.name} ${labels[type]}!`, type as BattleLogEntry["type"]);
  }

  // ─── Status Tick ─────────────────────────────────────────
  /** Tick status for a monster. Returns true if the monster's turn is skipped. */
  function tickStatus(
    monster: BattleMonster,
    target: "player" | "enemy",
  ): boolean {
    if (!monster.statusEffect) return false;
    const status = monster.statusEffect;

    if (status.type === "poison") {
      const dmg = Math.max(1, Math.floor(monster.maxHP * 0.1));
      monster.currentHP = Math.max(0, monster.currentHP - dmg);
      addLog(`${monster.name} is hurt by poison! (${dmg} dmg)`, "poison");
      status.turnsLeft--;
      if (status.turnsLeft <= 0) {
        monster.statusEffect = null;
        addLog(`${monster.name} recovered from poison!`, "system");
      }
      if (monster.currentHP <= 0) {
        addLog(`${monster.name} fainted!`, "system");
        phase.value = target === "player" ? "defeat" : "victory";
      }
      return false;
    }

    if (status.type === "stun") {
      addLog(`${monster.name} is stunned and can't move!`, "stun");
      status.turnsLeft--;
      if (status.turnsLeft <= 0) monster.statusEffect = null;
      return true;
    }

    if (status.type === "sleep") {
      addLog(`${monster.name} is fast asleep!`, "sleep");
      status.turnsLeft--;
      if (status.turnsLeft <= 0) {
        monster.statusEffect = null;
        addLog(`${monster.name} woke up!`, "system");
      }
      return true;
    }

    return false;
  }

  /** Tick player's status. Returns whether their turn should be skipped. */
  function tickPlayerStatus(): { skipped: boolean } {
    if (!playerMonster.value) return { skipped: false };
    const skipped = tickStatus(playerMonster.value, "player");
    return { skipped };
  }

  function selectMonster(monsterId: string, presetEnemy?: MonsterDefinition) {
    const selected = MONSTERS.find((m) => m.id === monsterId);
    if (!selected) return;

    playerMonster.value = toBattleMonster(selected);
    const playerLevel = playerMonster.value.level;

    // Gauntlet mode: enemy is predetermined
    if (presetEnemy) {
      enemyMonster.value = toBattleMonster(presetEnemy, playerLevel);
      return;
    }

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
      enemyMonster.value = toBattleMonster(enemyDef, playerLevel);
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
      defender.weaknesses,
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

    // Apply secondary move effect
    applyMoveEffect(move, attacker, defender);

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
      case "move0":
      case "move1":
      case "move2":
      case "move3": {
        const moveIndex = parseInt(action.replace("move", ""));
        const move = playerMonster.value.moves[moveIndex];
        if (move) {
          result = performAttack(
            playerMonster.value,
            enemyMonster.value,
            move,
            "enemy",
          );
        }
        break;
      }

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

    // Tick enemy status – skip turn if stunned/asleep
    const skipped = tickStatus(enemyMonster.value, "enemy");
    if (skipped || isBattleOver.value) {
      isAnimating.value = false;
      return null;
    }

    // CPU AI: 40% basic move, 40% random special, 20% guard
    const roll = Math.random();
    let result: DamageResult | null = null;

    if (roll < 0.8) {
      const moves = enemyMonster.value.moves;
      let selectedMove: Move;
      if (roll < 0.4 || moves.length <= 1) {
        // Use basic move (index 0)
        selectedMove = moves[0];
      } else {
        // Pick a random special move (indices 1+)
        const specialIndex = 1 + Math.floor(Math.random() * (moves.length - 1));
        selectedMove = moves[specialIndex];
      }
      result = performAttack(
        enemyMonster.value,
        playerMonster.value,
        selectedMove,
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
    tickPlayerStatus,
    $reset,
  };
});
