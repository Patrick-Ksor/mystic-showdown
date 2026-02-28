<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import gsap from "gsap";
import { useTeamBattleStore } from "@/stores/useTeamBattleStore";
import type { ActionType, DamageResult } from "@/types";
import { ELEMENT_COLORS, EVOLUTION_LEVEL } from "@/types";
import {
  animateAttack,
  animateSignatureIntro,
  animateDamage,
  animateEntrance,
  animateFaint,
  animateGuard,
  animateScreenShake,
  spawnDamageNumber,
} from "@/composables/useBattleAnimations";
import {
  startBattleMusic,
  stopBattleMusic,
} from "@/composables/useBattleMusic";
import { startArenaParticles } from "@/composables/useArenaParticles";
import { gsapDelay } from "@/composables/useGsapContext";
import { useSoundEffects } from "@/composables/useSoundEffects";
import MonsterSprite from "@/components/monsters/MonsterSprite.vue";
import HealthBar from "@/components/battle/HealthBar.vue";
import ActionMenu from "@/components/battle/ActionMenu.vue";
import BattleLog from "@/components/battle/BattleLog.vue";
import TeamBench from "@/components/battle/TeamBench.vue";
import SwitchModal from "@/components/battle/SwitchModal.vue";

const emit = defineEmits<{ victory: []; defeat: [] }>();

const store = useTeamBattleStore();
const sfx = useSoundEffects();

const {
  phase,
  playerTeam,
  enemyTeam,
  activePlayerIndex,
  activeEnemyIndex,
  activePlayer,
  activeEnemy,
  battleLog,
  isPlayerTurn,
} = storeToRefs(store);

const playerSpriteRef = ref<InstanceType<typeof MonsterSprite> | null>(null);
const enemySpriteRef = ref<InstanceType<typeof MonsterSprite> | null>(null);
const sceneRef = ref<HTMLElement | null>(null);
const bannerRef = ref<HTMLElement | null>(null);
const particlesContainerRef = ref<HTMLElement | null>(null);
const isProcessing = ref(false);
const showBanner = ref(false);
const bannerText = ref("");

let stopParticles: (() => void) | null = null;

// ─── Intro Sequence ────────────────────────────────────────
onMounted(async () => {
  // Hide sprites immediately so they don't flash before the entrance animation
  const playerEl = playerSpriteRef.value?.el;
  const enemyEl = enemySpriteRef.value?.el;
  if (playerEl) gsap.set(playerEl, { opacity: 0 });
  if (enemyEl) gsap.set(enemyEl, { opacity: 0 });

  store.startBattle();
  startBattleMusic();

  if (particlesContainerRef.value && activeEnemy.value) {
    stopParticles = startArenaParticles(
      particlesContainerRef.value,
      activeEnemy.value.element
    );
  }

  await gsapDelay(0.3);

  if (playerEl && enemyEl) {
    // Player enters — entrance animation and cry fire simultaneously
    void animateEntrance(playerEl, "left");
    sfx.playMonsterCry(activePlayer.value!);
    await gsapDelay(1.0);
    // Enemy enters — staggered after player
    sfx.playMonsterCry(activeEnemy.value!);
    await animateEntrance(enemyEl, "right");
  }

  sfx.playBattleStart();
  await showBannerAnimation("TEAM BATTLE!");
  await gsapDelay(0.3);

  store.beginPlayerTurn();
});

// ─── Banner ────────────────────────────────────────────────
async function showBannerAnimation(text: string) {
  bannerText.value = text;
  showBanner.value = true;

  await gsapDelay(0.1);

  if (bannerRef.value) {
    await new Promise<void>((resolve) => {
      gsap
        .timeline()
        .fromTo(
          bannerRef.value,
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }
        )
        .to(bannerRef.value, { opacity: 0, y: -20, duration: 0.4, delay: 0.6 })
        .eventCallback("onComplete", () => {
          showBanner.value = false;
          resolve();
        });
    });
  }
}

// ─── Player Attack Animation ───────────────────────────────
async function animatePlayerAttack(
  action: ActionType
): Promise<DamageResult | null> {
  if (!activePlayer.value || !activeEnemy.value) return null;

  const moveIndex = parseInt(action.replace("move", ""));
  const move = activePlayer.value.moves[moveIndex];
  if (!move) return null;

  // Capture enemy element BEFORE the store action (phase may change inside)
  const capturedEnemyElement = activeEnemy.value.element;
  const enemyEl = enemySpriteRef.value?.el;

  // Signature move intro
  if (move.isSignature && playerSpriteRef.value?.el && sceneRef.value) {
    sfx.playSignatureIntro();
    await animateSignatureIntro(
      playerSpriteRef.value.el,
      move.element,
      sceneRef.value
    );
  }

  // Execute the action first so we can skip the animation on a miss
  // Store may set phase to "enemyFainted" or "victory" but will NOT change
  // activeEnemyIndex yet, so enemySpriteRef still shows the correct monster.
  const result = await store.executePlayerAction(action);

  if (enemyEl && move.power > 0 && !result?.missed) {
    sfx.playAttackLaunch();
    sfx.playElementAccent(move.element, move.secondaryElement);
    await animateAttack(move.element, enemyEl);
  }

  if (result && result.damage > 0 && enemyEl) {
    const enemyMaxHP = activeEnemy.value?.maxHP ?? 1;
    const enemyRatio = result.damage / enemyMaxHP;
    if (result.isCritical) {
      sfx.playCriticalHit();
      if (sceneRef.value)
        void animateScreenShake(sceneRef.value, 1 + enemyRatio);
    } else {
      sfx.playAttackHit(result.isSpecial ?? false);
    }
    await animateDamage(enemyEl, result.isCritical, enemyRatio);
    void spawnDamageNumber(
      enemyEl,
      result.damage,
      result.isCritical,
      result.effectiveness,
      ELEMENT_COLORS[move.element]
    );
  } else if (result && result.damage === 0) {
    if (move.power === 0) {
      sfx.playStatUp();
      if (playerSpriteRef.value?.el)
        await animateGuard(playerSpriteRef.value.el);
    } else {
      sfx.playMiss();
    }
  }

  // If enemy fainted mid-team (intermediate switch), animate NOW while
  // the sprite still shows the fainted monster. The "victory" case (last enemy)
  // is handled by checkVictory() so we don't double-animate.
  if (phase.value === "enemyFainted" && enemyEl) {
    sfx.playFaint();
    await animateFaint(enemyEl, capturedEnemyElement);
  }

  await gsapDelay(0.3);
  return result;
}

// ─── Check Victory ─────────────────────────────────────────
async function checkVictory(): Promise<boolean> {
  if (phase.value === "victory") {
    stopBattleMusic();
    if (enemySpriteRef.value?.el) {
      sfx.playFaint();
      await animateFaint(enemySpriteRef.value.el, activeEnemy.value?.element);
    }
    sfx.playVictory();
    await showBannerAnimation("VICTORY!");
    await gsapDelay(0.5);
    emit("victory");
    return true;
  }
  return false;
}

// ─── Check Defeat ──────────────────────────────────────────
async function checkDefeat(): Promise<boolean> {
  if (phase.value === "defeat") {
    stopBattleMusic();
    if (playerSpriteRef.value?.el) {
      sfx.playFaint();
      await animateFaint(playerSpriteRef.value.el, activePlayer.value?.element);
    }
    sfx.playDefeat();
    await showBannerAnimation("DEFEATED...");
    await gsapDelay(0.5);
    emit("defeat");
    return true;
  }
  return false;
}

// ─── Handle Switch (from SwitchModal) ─────────────────────
/** After faint animation, actually swap the enemy index then entrance-animate the new sprite. */
async function doEnemySwitch() {
  store.resolveEnemyFaint();
  await nextTick(); // let Vue swap the MonsterSprite key → fresh DOM element
  const newEl = enemySpriteRef.value?.el;
  if (newEl) {
    if (activeEnemy.value) sfx.playMonsterCry(activeEnemy.value);
    await animateEntrance(newEl, "right");
  }
}

/** After the player's active monster faints and we show SwitchModal, play entrance for the incoming. */
async function doPlayerEntrance() {
  await nextTick();
  const newEl = playerSpriteRef.value?.el;
  if (newEl) {
    if (activePlayer.value) sfx.playMonsterCry(activePlayer.value);
    await animateEntrance(newEl, "left");
  }
}

async function handleSwitch(idx: number) {
  if (isProcessing.value) return;
  isProcessing.value = true;
  store.switchActiveMonster(idx);
  await doPlayerEntrance();
  // Switch counts as the player's action — go straight to enemy turn
  await gsapDelay(0.2);
  await executeEnemyTurn();
  isProcessing.value = false;
}

// ─── Player Action Handler ─────────────────────────────────
async function handlePlayerAction(action: ActionType) {
  if (isProcessing.value || phase.value !== "playerTurn") return;
  if (!activePlayer.value || !activeEnemy.value) return;

  isProcessing.value = true;

  // Tick player status (poison dmg, stun/sleep skip)
  const { skipped } = store.tickPlayerStatus();
  if (store.phase === "defeat") {
    await checkDefeat();
    isProcessing.value = false;
    return;
  }
  if (store.phase === "playerFainted") {
    // Player's monster fainted from poison before acting
    if (playerSpriteRef.value?.el) {
      sfx.playFaint();
      await animateFaint(playerSpriteRef.value.el, activePlayer.value?.element);
    }
    store.resolvePlayerFaint(); // → "switchPrompt"
    isProcessing.value = false;
    return;
  }
  if (skipped) {
    await gsapDelay(0.8);
    await executeEnemyTurn();
    isProcessing.value = false;
    return;
  }

  const playerEl = playerSpriteRef.value?.el;

  if (action === "guard") {
    sfx.playGuard();
    if (playerEl) await animateGuard(playerEl);
    await store.executePlayerAction(action);
    await gsapDelay(0.5);
    await executeEnemyTurn();
    isProcessing.value = false;
    return;
  }

  if (action === "run") {
    // Team battles disallow running — store will log the message
    await store.executePlayerAction(action);
    await gsapDelay(0.5);
    store.beginPlayerTurn();
    isProcessing.value = false;
    return;
  }

  // Attack — speed determines turn order
  const moveIndex = parseInt(action.replace("move", ""));
  const move = activePlayer.value.moves[moveIndex];
  if (!move) {
    isProcessing.value = false;
    return;
  }

  const playerSpeed = activePlayer.value.speed;
  const enemySpeed = activeEnemy.value.speed;
  const playerFirst = playerSpeed >= enemySpeed;

  if (playerFirst) {
    await animatePlayerAttack(action);

    if (phase.value === "enemyFainted") {
      // Faint anim already played inside animatePlayerAttack; now switch + entrance
      await doEnemySwitch();
      await executeEnemyTurn();
      isProcessing.value = false;
      return;
    }
    if (await checkVictory()) {
      isProcessing.value = false;
      return;
    }
    await executeEnemyTurn();
  } else {
    // Enemy is faster
    await executeEnemyTurn();
    if (
      phase.value === "defeat" ||
      phase.value === "switchPrompt" ||
      phase.value === "playerFainted"
    ) {
      isProcessing.value = false;
      return;
    }

    await animatePlayerAttack(action);

    if (phase.value === "enemyFainted") {
      // Player KO'd enemy after enemy moved — switch + entrance, then player acts
      await doEnemySwitch();
      store.beginPlayerTurn();
      isProcessing.value = false;
      return;
    }
    if (await checkVictory()) {
      isProcessing.value = false;
      return;
    }

    store.beginPlayerTurn();
  }

  isProcessing.value = false;
}

// ─── Enemy Turn ────────────────────────────────────────────
async function executeEnemyTurn() {
  if (!activePlayer.value || !activeEnemy.value) return;

  sfx.playEnemyTurn();
  store.beginEnemyTurn();
  await gsapDelay(0.6);

  const playerEl = playerSpriteRef.value?.el;

  const result = await store.executeEnemyTurn();

  if (result && playerEl) {
    if (result.isSignature && enemySpriteRef.value?.el && sceneRef.value) {
      sfx.playSignatureIntro();
      await animateSignatureIntro(
        enemySpriteRef.value.el,
        activeEnemy.value?.element ?? "fire",
        sceneRef.value
      );
    }
    if (!result.isBuff && !result.isGuard && !result.missed) {
      sfx.playAttackLaunch();
      sfx.playElementAccent(activeEnemy.value?.element ?? "fire");
      await animateAttack(activeEnemy.value?.element ?? "fire", playerEl);
    }
    if (result.damage > 0) {
      const playerMaxHP = activePlayer.value?.maxHP ?? 1;
      const playerRatio = result.damage / playerMaxHP;
      if (result.isCritical) {
        sfx.playCriticalHit();
        if (sceneRef.value)
          void animateScreenShake(sceneRef.value, 1 + playerRatio);
      } else {
        sfx.playAttackHit(result.isSpecial ?? false);
      }
      await animateDamage(playerEl, result.isCritical, playerRatio);
      if (activeEnemy.value) {
        void spawnDamageNumber(
          playerEl,
          result.damage,
          result.isCritical,
          result.effectiveness,
          ELEMENT_COLORS[activeEnemy.value.element]
        );
      }
    } else if (result.isBuff) {
      sfx.playStatUp();
      if (enemySpriteRef.value?.el) await animateGuard(enemySpriteRef.value.el);
    } else if (!result.isGuard) {
      sfx.playMiss();
    }
  }

  await gsapDelay(0.3);

  // Enemy may have fainted from poison/burn during its own status tick
  if (phase.value === "enemyFainted") {
    if (enemySpriteRef.value?.el) {
      sfx.playFaint();
      await animateFaint(enemySpriteRef.value.el, activeEnemy.value?.element);
    }
    await doEnemySwitch();
    store.beginPlayerTurn();
    return;
  }
  if (await checkVictory()) return;

  // Player monster fainted — animate before showing the switch prompt
  if (phase.value === "playerFainted") {
    if (playerSpriteRef.value?.el) {
      sfx.playFaint();
      await animateFaint(playerSpriteRef.value.el, activePlayer.value?.element);
    }
    store.resolvePlayerFaint(); // → sets "switchPrompt" (SwitchModal takes over)
    return;
  }
  if (await checkDefeat()) return;

  // phase may be "switchPrompt" already — SwitchModal handles it; do nothing
  if (phase.value === "switchPrompt") return;

  store.beginPlayerTurn();
}

// Cleanup
onBeforeUnmount(() => {
  stopParticles?.();
  gsap.killTweensOf("*");
});
</script>

<template>
  <div ref="sceneRef" class="battle-scene relative w-full h-full flex flex-col">
    <!-- Full-scene banner overlay -->
    <div
      v-if="showBanner"
      class="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
    >
      <div
        ref="bannerRef"
        class="text-3xl sm:text-5xl font-black tracking-widest text-white px-8 py-4"
        style="
          text-shadow: 0 0 20px #a855f7, 0 0 40px #a855f7, 0 0 80px #a855f788;
        "
      >
        {{ bannerText }}
      </div>
    </div>

    <!-- ═══ Battle Field (60%) ═══ -->
    <div class="relative flex-[0_0_60%] overflow-hidden">
      <!-- Arena ambient particles -->
      <div
        ref="particlesContainerRef"
        class="absolute inset-0 pointer-events-none overflow-hidden"
        style="z-index: 0"
      />

      <!-- Enemy HUD — top-right: HealthBar + Bench below -->
      <div class="absolute top-4 right-4 z-10 flex flex-col gap-2 w-64">
        <HealthBar
          v-if="activeEnemy"
          :current-h-p="activeEnemy.currentHP"
          :max-h-p="activeEnemy.maxHP"
          :monster-name="
            activeEnemy.level >= EVOLUTION_LEVEL &&
            activeEnemy.evolution?.evolvedName
              ? activeEnemy.evolution.evolvedName
              : activeEnemy.name
          "
          :element="activeEnemy.element"
          :secondary-element="
            activeEnemy.level >= EVOLUTION_LEVEL && activeEnemy.evolution
              ? activeEnemy.evolution.secondaryElement
              : null
          "
          :level="activeEnemy.level"
          :status-effect="activeEnemy.statusEffect"
          :stat-buff="activeEnemy.statBuff"
          side="enemy"
        />
        <TeamBench
          :team="enemyTeam"
          :active-index="activeEnemyIndex"
          side="enemy"
        />
      </div>

      <!-- Enemy sprite — upper-right -->
      <div class="absolute top-[4%] right-[15%] z-10">
        <MonsterSprite
          v-if="activeEnemy"
          :key="activeEnemyIndex"
          ref="enemySpriteRef"
          :monster="activeEnemy"
          side="enemy"
        />
      </div>

      <!-- Player sprite — lower-left -->
      <div class="absolute bottom-[4%] left-[15%] z-10">
        <MonsterSprite
          v-if="activePlayer"
          :key="activePlayerIndex"
          ref="playerSpriteRef"
          :monster="activePlayer"
          side="player"
        />
      </div>

      <!-- Player HUD — bottom-left: Bench above + HealthBar -->
      <div
        class="absolute bottom-4 left-4 z-10 flex flex-col-reverse gap-2 w-64"
      >
        <HealthBar
          v-if="activePlayer"
          :current-h-p="activePlayer.currentHP"
          :max-h-p="activePlayer.maxHP"
          :monster-name="
            activePlayer.level >= EVOLUTION_LEVEL &&
            activePlayer.evolution?.evolvedName
              ? activePlayer.evolution.evolvedName
              : activePlayer.name
          "
          :element="activePlayer.element"
          :secondary-element="
            activePlayer.level >= EVOLUTION_LEVEL && activePlayer.evolution
              ? activePlayer.evolution.secondaryElement
              : null
          "
          :level="activePlayer.level"
          :status-effect="activePlayer.statusEffect"
          :stat-buff="activePlayer.statBuff"
          side="player"
        />
        <TeamBench
          :team="playerTeam"
          :active-index="activePlayerIndex"
          side="player"
        />
      </div>
    </div>

    <!-- ═══ Action UI (remaining 40%) ═══ -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 px-4 py-3 flex-1 min-h-0">
      <BattleLog :entries="battleLog" />
      <ActionMenu
        v-if="activePlayer"
        :monster="activePlayer"
        :disabled="!isPlayerTurn || isProcessing"
        :disable-run="true"
        @action="handlePlayerAction"
      />
    </div>

    <!-- Switch Modal overlay -->
    <SwitchModal
      v-if="phase === 'switchPrompt'"
      :team="playerTeam"
      :active-index="activePlayerIndex"
      @switch="handleSwitch"
    />
  </div>
</template>
