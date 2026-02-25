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
  DifficultyTier,
} from "@/types";
import { MONSTERS } from "@/data/monsters";
import {
  getEffectivenessMultiplier,
  calculateDamage,
  rollCritical,
  STAB_PENALTY,
} from "@/data/weaknessChart";
import { useProgressionStore } from "@/stores/useProgressionStore";
import { useMonsterLevelStore } from "@/stores/useMonsterLevelStore";
import { useGameStore } from "@/stores/useGameStore";

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
    const durations: Record<string, number> = {
      poison: 3,
      stun: 1,
      sleep: 2,
      burn: 3,
      freeze: 3,
      confusion: 3,
    };
    defender.statusEffect = {
      type: type as StatusCondition["type"],
      turnsLeft: durations[type],
    };
    const labels: Record<string, string> = {
      poison: "was poisoned",
      stun: "was stunned",
      sleep: "fell asleep",
      burn: "was burned",
      freeze: "was frozen solid",
      confusion: "became confused",
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

    if (status.type === "burn") {
      const dmg = Math.max(1, Math.floor(monster.maxHP * 0.08));
      monster.currentHP = Math.max(0, monster.currentHP - dmg);
      addLog(`${monster.name} is hurt by its burn! (${dmg} dmg)`, "burn");
      status.turnsLeft--;
      if (status.turnsLeft <= 0) {
        monster.statusEffect = null;
        addLog(`${monster.name}'s burn faded!`, "system");
      }
      if (monster.currentHP <= 0) {
        addLog(`${monster.name} fainted!`, "system");
        phase.value = target === "player" ? "defeat" : "victory";
      }
      return false; // burn never skips the turn
    }

    if (status.type === "freeze") {
      // 33% chance to thaw early each turn
      if (Math.random() < 0.33) {
        monster.statusEffect = null;
        addLog(`${monster.name} thawed out!`, "system");
        return false; // acts normally this turn
      }
      addLog(`${monster.name} is frozen solid!`, "freeze");
      status.turnsLeft--;
      if (status.turnsLeft <= 0) {
        monster.statusEffect = null;
        addLog(`${monster.name} gradually thawed out!`, "system");
      }
      return true; // skip turn
    }

    if (status.type === "confusion") {
      status.turnsLeft--;
      if (status.turnsLeft <= 0) {
        monster.statusEffect = null;
        addLog(`${monster.name} snapped out of confusion!`, "system");
        return false; // acts normally on the turn they snap out
      }
      // 40% chance to hurt itself instead of acting
      if (Math.random() < 0.4) {
        const dmg = Math.max(1, Math.floor(monster.maxHP * 0.06));
        monster.currentHP = Math.max(0, monster.currentHP - dmg);
        addLog(
          `${monster.name} hurt itself in confusion! (${dmg} dmg)`,
          "confusion",
        );
        if (monster.currentHP <= 0) {
          addLog(`${monster.name} fainted!`, "system");
          phase.value = target === "player" ? "defeat" : "victory";
        }
        return true; // skip action
      }
      addLog(`${monster.name} is confused but pushed through!`, "confusion");
      return false; // acts normally this turn
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

    const gameStore = useGameStore();
    const levelOffsets: Record<DifficultyTier, number> = {
      easy: -2,
      normal: 0,
      hard: 2,
      nightmare: 4,
    };
    const statMults: Record<DifficultyTier, number> = {
      easy: 0.85,
      normal: 1,
      hard: 1.15,
      nightmare: 1.3,
    };
    const adjustedLevel = Math.max(
      1,
      playerLevel + levelOffsets[gameStore.difficulty],
    );
    const statMult = statMults[gameStore.difficulty];

    function applyDifficultyStats(monster: BattleMonster) {
      if (statMult === 1) return;
      monster.attack = Math.round(monster.attack * statMult);
      monster.defense = Math.round(monster.defense * statMult);
    }

    // Gauntlet mode: enemy is predetermined
    if (presetEnemy) {
      enemyMonster.value = toBattleMonster(presetEnemy, adjustedLevel);
      applyDifficultyStats(enemyMonster.value);
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
      enemyMonster.value = toBattleMonster(enemyDef, adjustedLevel);
      applyDifficultyStats(enemyMonster.value);
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
        isSpecial: move.isSpecial,
        isStab: move.element === attacker.element,
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

    // STAB: same element = full damage; different element = STAB_PENALTY
    const isStab = move.element === attacker.element;
    const stabMultiplier = isStab ? 1.0 : STAB_PENALTY;

    // Burn reduces attacker's physical/special output by 25%
    const burnMult = attacker.statusEffect?.type === "burn" ? 0.75 : 1.0;

    const damage = Math.max(
      1,
      Math.floor(
        calculateDamage(
          move.power,
          attacker.attack,
          defender.defense,
          multiplier,
          isCritical,
          defender.isGuarding,
        ) *
          stabMultiplier *
          burnMult,
      ),
    );

    // Apply damage
    defender.currentHP = Math.max(0, defender.currentHP - damage);

    // Apply secondary move effect
    applyMoveEffect(move, attacker, defender);

    // Build message
    let message = `${attacker.name} used ${move.name}! Dealt ${damage} damage!`;

    const result: DamageResult = {
      damage,
      isCritical,
      effectiveness,
      message,
      isSpecial: move.isSpecial,
      isStab,
    };
    lastDamageResult.value = { ...result, target };

    addLog(message, "normal");

    if (isCritical) {
      addLog("A critical hit!", "critical");
    }

    if (!isStab) {
      addLog("Off-element — reduced damage!", "system");
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

    // CPU AI — thresholds are [basicMax, attackMax]; remainder = guard
    const aiThresholds: Record<DifficultyTier, [number, number]> = {
      easy: [0.6, 0.8],
      normal: [0.4, 0.8],
      hard: [0.2, 0.85],
      nightmare: [0.1, 0.9],
    };
    const gameStore = useGameStore();
    const [basicMax, attackMax] = aiThresholds[gameStore.difficulty];
    const roll = Math.random();
    let result: DamageResult | null = null;

    if (roll < attackMax) {
      const moves = enemyMonster.value.moves;
      let selectedMove: Move;
      if (roll < basicMax || moves.length <= 1) {
        // Basic move
        selectedMove = moves[0];
      } else if (
        (gameStore.difficulty === "hard" ||
          gameStore.difficulty === "nightmare") &&
        playerMonster.value
      ) {
        // Prefer a super-effective move when available
        const seMove = moves
          .slice(1)
          .find(
            (m) =>
              getEffectivenessMultiplier(
                m.element,
                playerMonster.value!.weaknesses,
                playerMonster.value!.element,
              ).effectiveness === "super",
          );
        selectedMove =
          seMove ?? moves[1 + Math.floor(Math.random() * (moves.length - 1))];
      } else {
        // Random special move
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
