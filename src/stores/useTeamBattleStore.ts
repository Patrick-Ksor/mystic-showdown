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
  StatBuff,
  DifficultyTier,
} from "@/types";
import { EVOLUTION_LEVEL } from "@/types";
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

export const TEAM_SIZE = 3;

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
    statBuff: null,
    moves,
  };
}

export const useTeamBattleStore = defineStore("teamBattle", () => {
  // ─── State ───────────────────────────────────────────────
  const phase = ref<BattlePhase>("select");
  const playerTeam = ref<BattleMonster[]>([]);
  const enemyTeam = ref<BattleMonster[]>([]);
  const activePlayerIndex = ref(0);
  const activeEnemyIndex = ref(0);
  const turnCount = ref(0);
  const battleLog = ref<BattleLogEntry[]>([]);
  const lastDamageResult = ref<
    (DamageResult & { target: "player" | "enemy" }) | null
  >(null);
  const isAnimating = ref(false);
  // Index of the next enemy to switch in after faint animation plays
  const pendingEnemySwitchIdx = ref(-1);

  // ─── Getters ─────────────────────────────────────────────
  const activePlayer = computed<BattleMonster | null>(
    () => playerTeam.value[activePlayerIndex.value] ?? null,
  );
  const activeEnemy = computed<BattleMonster | null>(
    () => enemyTeam.value[activeEnemyIndex.value] ?? null,
  );

  const playerAlive = computed(() =>
    playerTeam.value.filter((m) => m.currentHP > 0),
  );
  const enemyAlive = computed(() =>
    enemyTeam.value.filter((m) => m.currentHP > 0),
  );

  const isPlayerTurn = computed(() => phase.value === "playerTurn");
  const isBattleOver = computed(
    () => phase.value === "victory" || phase.value === "defeat",
  );

  const activePlayerHPPercent = computed(() => {
    if (!activePlayer.value) return 0;
    return Math.max(
      0,
      (activePlayer.value.currentHP / activePlayer.value.maxHP) * 100,
    );
  });
  const activeEnemyHPPercent = computed(() => {
    if (!activeEnemy.value) return 0;
    return Math.max(
      0,
      (activeEnemy.value.currentHP / activeEnemy.value.maxHP) * 100,
    );
  });

  // ─── Helpers ─────────────────────────────────────────────
  function addLog(
    text: string,
    type: BattleLogEntry["type"] = "normal",
    elementColor?: string,
  ) {
    battleLog.value.push({ id: ++logIdCounter, text, type, elementColor });
    if (battleLog.value.length > 80) {
      battleLog.value = battleLog.value.slice(-80);
    }
  }

  function displayName(monster: BattleMonster): string {
    if (monster.level >= EVOLUTION_LEVEL && monster.evolution?.evolvedName) {
      return monster.evolution.evolvedName;
    }
    return monster.name;
  }

  function getEffectiveStat(
    monster: BattleMonster,
    stat: "attack" | "defense",
  ): number {
    const base = stat === "attack" ? monster.attack : monster.defense;
    if (monster.statBuff?.stat === stat)
      return Math.round(base * monster.statBuff.multiplier);
    return base;
  }

  function tickStatBuff(monster: BattleMonster): void {
    if (!monster.statBuff) return;
    monster.statBuff.turnsLeft--;
    if (monster.statBuff.turnsLeft <= 0) {
      const labels: Record<string, string> = {
        attack: "Attack",
        defense: "Defense",
        speed: "Speed",
      };
      addLog(
        `${displayName(monster)}'s ${labels[monster.statBuff.stat]} boost faded!`,
        "system",
      );
      monster.statBuff = null;
    }
  }

  function applyMoveEffect(
    move: Move,
    attacker: BattleMonster,
    defender: BattleMonster,
    defenderSide: "player" | "enemy",
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
      addLog(`${displayName(attacker)} recovered ${actual} HP!`, "heal");
      return;
    }

    if (type === "atk_up" || type === "def_up" || type === "spd_up") {
      const statMap: Record<string, StatBuff["stat"]> = {
        atk_up: "attack",
        def_up: "defense",
        spd_up: "speed",
      };
      const stat = statMap[type];
      if (attacker.statBuff?.stat === stat) {
        addLog(
          `${displayName(attacker)}'s ${stat} is already boosted!`,
          "system",
        );
        return;
      }
      attacker.statBuff = { stat, multiplier: 1.5, turnsLeft: 3 };
      const labelMap: Record<string, string> = {
        attack: "Attack",
        defense: "Defense",
        speed: "Speed",
      };
      const logTypeMap: Record<string, BattleLogEntry["type"]> = {
        atk_up: "atk_up",
        def_up: "def_up",
        spd_up: "spd_up",
      };
      addLog(
        `${displayName(attacker)}'s ${labelMap[stat]} rose sharply!`,
        logTypeMap[type],
      );
      return;
    }

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
    addLog(
      `${displayName(defender)} ${labels[type]}!`,
      type as BattleLogEntry["type"],
    );
    void defenderSide; // used for future perk hooks
  }

  /** Tick status. Returns true if turn should be skipped. */
  function tickStatus(
    monster: BattleMonster,
    side: "player" | "enemy",
  ): boolean {
    if (!monster.statusEffect) return false;
    const status = monster.statusEffect;

    if (status.type === "poison") {
      const dmg = Math.max(1, Math.floor(monster.maxHP * 0.1));
      monster.currentHP = Math.max(0, monster.currentHP - dmg);
      addLog(
        `${displayName(monster)} is hurt by poison! (${dmg} dmg)`,
        "poison",
      );
      status.turnsLeft--;
      if (status.turnsLeft <= 0) {
        monster.statusEffect = null;
        addLog(`${displayName(monster)} recovered from poison!`, "system");
      }
      if (monster.currentHP <= 0) {
        addLog(`${displayName(monster)} fainted!`, "system");
        handleFaint(side);
      }
      return false;
    }

    if (status.type === "stun") {
      addLog(`${displayName(monster)} is stunned and can't move!`, "stun");
      status.turnsLeft--;
      if (status.turnsLeft <= 0) monster.statusEffect = null;
      return true;
    }

    if (status.type === "sleep") {
      addLog(`${displayName(monster)} is fast asleep!`, "sleep");
      status.turnsLeft--;
      if (status.turnsLeft <= 0) {
        monster.statusEffect = null;
        addLog(`${displayName(monster)} woke up!`, "system");
      }
      return true;
    }

    if (status.type === "burn") {
      const dmg = Math.max(1, Math.floor(monster.maxHP * 0.08));
      monster.currentHP = Math.max(0, monster.currentHP - dmg);
      addLog(
        `${displayName(monster)} is hurt by its burn! (${dmg} dmg)`,
        "burn",
      );
      status.turnsLeft--;
      if (status.turnsLeft <= 0) {
        monster.statusEffect = null;
        addLog(`${displayName(monster)}'s burn faded!`, "system");
      }
      if (monster.currentHP <= 0) {
        addLog(`${displayName(monster)} fainted!`, "system");
        handleFaint(side);
      }
      return false;
    }

    if (status.type === "freeze") {
      if (Math.random() < 0.33) {
        monster.statusEffect = null;
        addLog(`${displayName(monster)} thawed out!`, "system");
        return false;
      }
      addLog(`${displayName(monster)} is frozen solid!`, "freeze");
      status.turnsLeft--;
      if (status.turnsLeft <= 0) {
        monster.statusEffect = null;
        addLog(`${displayName(monster)} gradually thawed out!`, "system");
      }
      return true;
    }

    if (status.type === "confusion") {
      status.turnsLeft--;
      if (status.turnsLeft <= 0) {
        monster.statusEffect = null;
        addLog(`${displayName(monster)} snapped out of confusion!`, "system");
        return false;
      }
      if (Math.random() < 0.4) {
        const dmg = Math.max(1, Math.floor(monster.maxHP * 0.06));
        monster.currentHP = Math.max(0, monster.currentHP - dmg);
        addLog(
          `${displayName(monster)} hurt itself in confusion! (${dmg} dmg)`,
          "confusion",
        );
        if (monster.currentHP <= 0) {
          addLog(`${displayName(monster)} fainted!`, "system");
          handleFaint(side);
        }
        return true;
      }
      addLog(
        `${displayName(monster)} is confused but pushed through!`,
        "confusion",
      );
      return false;
    }

    return false;
  }

  /** Handle a monster fainting — switch enemy automatically, prompt player */
  function handleFaint(side: "player" | "enemy"): void {
    if (side === "enemy") {
      const nextIdx = enemyTeam.value.findIndex(
        (m, i) => i !== activeEnemyIndex.value && m.currentHP > 0,
      );
      if (nextIdx === -1) {
        phase.value = "victory";
      } else {
        // Defer the actual switch until the scene has animated the faint
        pendingEnemySwitchIdx.value = nextIdx;
        phase.value = "enemyFainted";
      }
    } else {
      const remaining = playerTeam.value.filter(
        (m, i) => i !== activePlayerIndex.value && m.currentHP > 0,
      );
      if (remaining.length === 0) {
        phase.value = "defeat";
      } else {
        // Defer showing the switch prompt until scene animates the faint
        phase.value = "playerFainted";
      }
    }
  }

  // ─── Damage ──────────────────────────────────────────────
  function performAttack(
    attacker: BattleMonster,
    defender: BattleMonster,
    move: Move,
    target: "player" | "enemy",
  ): DamageResult {
    if (move.power === 0) {
      addLog(
        `${displayName(attacker)} used ${move.name}!`,
        "normal",
        attacker.color,
      );
      applyMoveEffect(move, attacker, defender, target);
      const result: DamageResult = {
        damage: 0,
        isCritical: false,
        effectiveness: "neutral",
        message: `${displayName(attacker)} used ${move.name}!`,
        isSpecial: move.isSpecial,
        isStab: true,
        isSignature: false,
        isBuff: true,
      };
      lastDamageResult.value = { ...result, target };
      return result;
    }

    const speedBoosted = attacker.statBuff?.stat === "speed";
    const accuracyRoll = Math.random() * 100;
    if (!speedBoosted && accuracyRoll > move.accuracy) {
      const result: DamageResult = {
        damage: 0,
        isCritical: false,
        effectiveness: "neutral",
        message: `${displayName(attacker)}'s ${move.name} missed!`,
        isSpecial: move.isSpecial,
        isStab:
          move.element === attacker.element ||
          (attacker.level >= EVOLUTION_LEVEL &&
            move.element === attacker.evolution?.secondaryElement),
        isSignature: move.isSignature ?? false,
      };
      addLog(result.message, "miss");
      lastDamageResult.value = { ...result, target };
      return result;
    }

    const isCritical = rollCritical();
    const { multiplier, effectiveness } = getEffectivenessMultiplier(
      move.element,
      defender.element,
      defender.evolution?.secondaryElement,
    );
    const isStab =
      move.element === attacker.element ||
      (attacker.level >= EVOLUTION_LEVEL &&
        move.element === attacker.evolution?.secondaryElement);
    const stabMultiplier = isStab ? 1.0 : STAB_PENALTY;
    const burnMult = attacker.statusEffect?.type === "burn" ? 0.75 : 1.0;

    const gameStore = useGameStore();
    const isPlayerAttacking = target === "enemy";
    const powerSurgeMult = 1.0; // no gauntlet perks in team mode (for now)
    void powerSurgeMult;

    const damage = Math.max(
      1,
      Math.floor(
        calculateDamage(
          move.power,
          getEffectiveStat(attacker, "attack"),
          getEffectiveStat(defender, "defense"),
          multiplier,
          isCritical,
          defender.isGuarding,
        ) *
          stabMultiplier *
          burnMult,
      ),
    );
    void gameStore;
    void isPlayerAttacking;

    defender.currentHP = Math.max(0, defender.currentHP - damage);
    applyMoveEffect(move, attacker, defender, target);

    let message = `${displayName(attacker)} used ${move.name}! Dealt ${damage} damage!`;

    const result: DamageResult = {
      damage,
      isCritical,
      effectiveness,
      message,
      isSpecial: move.isSpecial,
      isStab,
      isSignature: move.isSignature ?? false,
    };
    lastDamageResult.value = { ...result, target };

    addLog(message, "normal", attacker.color);

    if (isCritical) addLog("A critical hit!", "critical");
    if (!isStab) addLog("Off-element — reduced damage!", "system");
    if (effectiveness === "super") addLog("It's super effective!", "effective");
    else if (effectiveness === "resisted")
      addLog("It's not very effective...", "ineffective");

    if (defender.isGuarding) {
      addLog(`${displayName(defender)}'s guard softened the blow!`, "guard");
      defender.isGuarding = false;
    }

    if (defender.currentHP <= 0) {
      addLog(`${displayName(defender)} fainted!`, "system");
      handleFaint(target);
    }

    return result;
  }

  // ─── Team Setup ──────────────────────────────────────────
  function selectTeam(playerIds: string[]) {
    const gameStore = useGameStore();
    const progressionStore = useProgressionStore();

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

    // Build player team from their selected IDs (use stored levels)
    playerTeam.value = playerIds
      .map((id) => MONSTERS.find((m) => m.id === id))
      .filter((d): d is (typeof MONSTERS)[number] => d !== undefined)
      .map((def) => toBattleMonster(def));

    const playerAvgLevel =
      playerTeam.value.reduce((sum, m) => sum + m.level, 0) /
      (playerTeam.value.length || 1);

    const adjustedLevel = Math.max(
      1,
      Math.round(playerAvgLevel) + levelOffsets[gameStore.difficulty],
    );
    const statMult = statMults[gameStore.difficulty];

    // Build enemy team: 3 random from unlocked pool, excluding player picks
    const pool = progressionStore.unlockedMonsters.filter(
      (id) => !playerIds.includes(id),
    );
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const enemyIds = shuffled.slice(0, TEAM_SIZE);

    enemyTeam.value = enemyIds
      .map((id) => MONSTERS.find((m) => m.id === id))
      .filter((d): d is (typeof MONSTERS)[number] => d !== undefined)
      .map((def) => {
        const monster = toBattleMonster(def, adjustedLevel);
        if (statMult !== 1) {
          monster.attack = Math.round(monster.attack * statMult);
          monster.defense = Math.round(monster.defense * statMult);
        }
        return monster;
      });

    // Pad if not enough pool monsters (shouldn't happen with 25 monsters)
    while (enemyTeam.value.length < TEAM_SIZE) {
      const fallback = MONSTERS.find(
        (m) =>
          !playerIds.includes(m.id) &&
          !enemyTeam.value.some((e) => e.id === m.id),
      );
      if (!fallback) break;
      const monster = toBattleMonster(fallback, adjustedLevel);
      if (statMult !== 1) {
        monster.attack = Math.round(monster.attack * statMult);
        monster.defense = Math.round(monster.defense * statMult);
      }
      enemyTeam.value.push(monster);
    }

    activePlayerIndex.value = 0;
    activeEnemyIndex.value = 0;
  }

  function startBattle() {
    phase.value = "intro";
    turnCount.value = 0;
    battleLog.value = [];
    logIdCounter = 0;
    const p = activePlayer.value;
    const e = activeEnemy.value;
    if (p && e) {
      addLog(`Team Battle begins!`, "system");
      addLog(
        `${displayName(p)} leads for your team vs ${displayName(e)}!`,
        "system",
      );
    }
  }

  function beginPlayerTurn() {
    if (isBattleOver.value || phase.value === "switchPrompt") return;
    phase.value = "playerTurn";
    turnCount.value++;
    const p = activePlayer.value;
    if (p) {
      p.isGuarding = false;
      tickStatBuff(p);
    }
  }

  function beginEnemyTurn() {
    if (!activeEnemy.value) return;
    phase.value = "enemyTurn";
    activeEnemy.value.isGuarding = false;
  }

  function tickPlayerStatus(): { skipped: boolean } {
    const p = activePlayer.value;
    if (!p) return { skipped: false };
    tickStatBuff(p);
    const skipped = tickStatus(p, "player");
    return { skipped };
  }

  function switchActiveMonster(playerIndex: number): void {
    if (
      playerIndex < 0 ||
      playerIndex >= playerTeam.value.length ||
      playerTeam.value[playerIndex].currentHP <= 0
    )
      return;
    const incoming = playerTeam.value[playerIndex];
    activePlayerIndex.value = playerIndex;
    addLog(`Go, ${displayName(incoming)}!`, "system");
    phase.value = "playerTurn";
  }

  function autoSwitchEnemy(nextIdx?: number): void {
    const idx =
      nextIdx ??
      enemyTeam.value.findIndex(
        (m, i) => i !== activeEnemyIndex.value && m.currentHP > 0,
      );
    if (idx === -1) return;
    activeEnemyIndex.value = idx;
    const incoming = enemyTeam.value[idx];
    addLog(`The opponent sends in ${displayName(incoming)}!`, "system");
  }

  /** Called by the scene after it has played the faint animation for the enemy. */
  function resolveEnemyFaint(): void {
    autoSwitchEnemy(pendingEnemySwitchIdx.value);
    pendingEnemySwitchIdx.value = -1;
  }

  /** Called by the scene after it has played the faint animation for the player's monster. */
  function resolvePlayerFaint(): void {
    phase.value = "switchPrompt";
  }

  // ─── Player Action ───────────────────────────────────────
  async function executePlayerAction(
    action: ActionType,
  ): Promise<DamageResult | null> {
    const p = activePlayer.value;
    const e = activeEnemy.value;
    if (!p || !e) return null;
    if (phase.value !== "playerTurn") return null;

    phase.value = "animating";
    isAnimating.value = true;

    // Tick player status first
    tickStatBuff(p);
    const skipped = tickStatus(p, "player");
    if (isBattleOver.value) {
      isAnimating.value = false;
      return null;
    }
    if (skipped) {
      isAnimating.value = false;
      return null;
    }

    let result: DamageResult | null = null;

    if (action === "guard") {
      p.isGuarding = true;
      addLog(`${displayName(p)} is bracing for impact!`, "guard");
      result = {
        damage: 0,
        isCritical: false,
        effectiveness: "neutral",
        message: "",
        isGuard: true,
      };
    } else if (action === "run") {
      addLog("Can't escape a team battle!", "system");
      result = null;
    } else {
      const moveIndex = parseInt(action.replace("move", ""));
      const move = p.moves[moveIndex];
      if (!move) {
        isAnimating.value = false;
        return null;
      }
      result = performAttack(p, e, move, "enemy");
    }

    lastDamageResult.value = result ? { ...result, target: "enemy" } : null;
    isAnimating.value = false;
    return result;
  }

  // ─── Enemy Turn ──────────────────────────────────────────
  async function executeEnemyTurn(): Promise<DamageResult | null> {
    const p = activePlayer.value;
    const e = activeEnemy.value;
    if (!p || !e) return null;

    phase.value = "animating";
    isAnimating.value = true;

    tickStatBuff(e);
    const skipped = tickStatus(e, "enemy");
    if (isBattleOver.value) {
      isAnimating.value = false;
      return null;
    }
    if (skipped) {
      isAnimating.value = false;
      return null;
    }

    const gameStore = useGameStore();
    const aiThresholds: Record<DifficultyTier, [number, number]> = {
      easy: [0.6, 0.8],
      normal: [0.4, 0.8],
      hard: [0.2, 0.85],
      nightmare: [0.1, 0.9],
    };
    const [basicMax, attackMax] = aiThresholds[gameStore.difficulty];
    const roll = Math.random();
    let result: DamageResult | null = null;
    const moves = e.moves;

    if (roll < basicMax) {
      result = performAttack(e, p, moves[0], "player");
    } else if (roll < attackMax) {
      let selectedMove = moves[1] ?? moves[0];
      if (
        gameStore.difficulty === "hard" ||
        gameStore.difficulty === "nightmare"
      ) {
        const seMove = moves
          .slice(1)
          .find(
            (m) =>
              getEffectivenessMultiplier(
                m.element,
                p.element,
                (p.level >= EVOLUTION_LEVEL && p.evolution?.secondaryElement) ||
                  undefined,
              ).effectiveness === "super",
          );
        selectedMove =
          seMove ?? moves[1 + Math.floor(Math.random() * (moves.length - 1))];
      }
      result = performAttack(e, p, selectedMove, "player");
    } else {
      e.isGuarding = true;
      addLog(`${displayName(e)} is bracing for impact!`, "guard");
      result = {
        damage: 0,
        isCritical: false,
        effectiveness: "neutral",
        message: "",
        isGuard: true,
      };
    }

    lastDamageResult.value = result ? { ...result, target: "player" } : null;
    isAnimating.value = false;
    return result;
  }

  // ─── XP Distribution ─────────────────────────────────────
  function awardTeamXP(baseXP: number): void {
    const monsterLevelStore = useMonsterLevelStore();
    const share = Math.max(1, Math.floor(baseXP / TEAM_SIZE));
    for (const monster of playerTeam.value) {
      monsterLevelStore.awardXP(monster.id, share);
    }
  }

  // ─── Reset ───────────────────────────────────────────────
  function $reset() {
    phase.value = "select";
    playerTeam.value = [];
    enemyTeam.value = [];
    activePlayerIndex.value = 0;
    activeEnemyIndex.value = 0;
    turnCount.value = 0;
    battleLog.value = [];
    lastDamageResult.value = null;
    isAnimating.value = false;
    logIdCounter = 0;
  }

  return {
    // State
    phase,
    playerTeam,
    enemyTeam,
    activePlayerIndex,
    activeEnemyIndex,
    turnCount,
    battleLog,
    lastDamageResult,
    isAnimating,
    // Getters
    activePlayer,
    activeEnemy,
    playerAlive,
    enemyAlive,
    isPlayerTurn,
    isBattleOver,
    activePlayerHPPercent,
    activeEnemyHPPercent,
    // Actions
    selectTeam,
    startBattle,
    beginPlayerTurn,
    beginEnemyTurn,
    tickPlayerStatus,
    switchActiveMonster,
    autoSwitchEnemy,
    resolveEnemyFaint,
    resolvePlayerFaint,
    executePlayerAction,
    executeEnemyTurn,
    awardTeamXP,
    $reset,
  };
});
