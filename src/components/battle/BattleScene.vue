<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import gsap from "gsap";
import { useBattleStore } from "@/stores/useBattleStore";
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

const emit = defineEmits<{
  victory: [];
  defeat: [];
}>();

interface Props {
  disableRun?: boolean;
}
const props = withDefaults(defineProps<Props>(), { disableRun: false });

const router = useRouter();
const battleStore = useBattleStore();
const sfx = useSoundEffects();
const { phase, playerMonster, enemyMonster, battleLog, isPlayerTurn } =
  storeToRefs(battleStore);

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
  if (!playerMonster.value || !enemyMonster.value) {
    router.push("/");
    return;
  }

  // Hide sprites immediately so they don't flash before the entrance animation
  const playerEl = playerSpriteRef.value?.el;
  const enemyEl = enemySpriteRef.value?.el;
  if (playerEl) gsap.set(playerEl, { opacity: 0 });
  if (enemyEl) gsap.set(enemyEl, { opacity: 0 });

  battleStore.startBattle();
  startBattleMusic();

  // Start ambient arena particles matching the enemy's element
  if (particlesContainerRef.value && enemyMonster.value) {
    stopParticles = startArenaParticles(
      particlesContainerRef.value,
      enemyMonster.value.element
    );
  }

  await gsapDelay(0.3);

  if (playerEl && enemyEl) {
    // Player enters — entrance animation and cry fire simultaneously
    void animateEntrance(playerEl, "left");
    sfx.playMonsterCry(playerMonster.value!);
    await gsapDelay(1.0);
    // Enemy enters — staggered after player
    sfx.playMonsterCry(enemyMonster.value!);
    await animateEntrance(enemyEl, "right");
  }

  // Battle start banner
  sfx.playBattleStart();
  await showBannerAnimation("BATTLE START!");
  await gsapDelay(0.3);

  battleStore.beginPlayerTurn();
});

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
  if (!playerMonster.value || !enemyMonster.value) return null;

  const moveIndex = parseInt(action.replace("move", ""));
  const move = playerMonster.value.moves[moveIndex];
  if (!move) return null;

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

  // Execute action first so we can skip the animation on a miss
  const result = await battleStore.executePlayerAction(action);

  // Play attack launch + element accent on enemy (skip for buff/utility/miss)
  if (enemyEl && move.power > 0 && !result?.missed) {
    sfx.playAttackLaunch();
    sfx.playElementAccent(move.element, move.secondaryElement);
    await animateAttack(move.element, enemyEl);
  }

  // Damage or miss feedback
  if (result && result.damage > 0 && enemyEl) {
    const enemyMaxHP = enemyMonster.value?.maxHP ?? 1;
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
      // Buff / utility move — play stat-up sound, animate caster
      sfx.playStatUp();
      if (playerSpriteRef.value?.el)
        await animateGuard(playerSpriteRef.value.el);
    } else {
      sfx.playMiss();
    }
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
      await animateFaint(enemySpriteRef.value.el, enemyMonster.value?.element);
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
      await animateFaint(
        playerSpriteRef.value.el,
        playerMonster.value?.element
      );
    }
    sfx.playDefeat();
    await showBannerAnimation("DEFEATED...");
    await gsapDelay(0.5);
    emit("defeat");
    return true;
  }
  return false;
}

// ─── Player Action Handler ─────────────────────────────────
async function handlePlayerAction(action: ActionType) {
  if (isProcessing.value || phase.value !== "playerTurn") return;
  if (!playerMonster.value || !enemyMonster.value) return;

  isProcessing.value = true;
  // Tick player status (poison dmg, stun/sleep skip)
  const { skipped } = battleStore.tickPlayerStatus();
  if (battleStore.phase === "defeat") {
    await checkDefeat();
    isProcessing.value = false;
    return;
  }
  if (battleStore.phase === "victory") {
    await checkVictory();
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
    // Guard always resolves before enemy attack
    sfx.playGuard();
    if (playerEl) await animateGuard(playerEl);
    await battleStore.executePlayerAction(action);
    await gsapDelay(0.5);

    await executeEnemyTurn();
    isProcessing.value = false;
    return;
  }

  if (action === "run") {
    sfx.playRun();
    await battleStore.executePlayerAction(action);
    if (phase.value === "select") {
      router.push("/");
      isProcessing.value = false;
      return;
    }
    await gsapDelay(0.5);

    await executeEnemyTurn();
    isProcessing.value = false;
    return;
  }

  // Attack action (move0-move3) — speed determines turn order
  const moveIndex = parseInt(action.replace("move", ""));
  const move = playerMonster.value.moves[moveIndex];
  if (!move) {
    isProcessing.value = false;
    return;
  }

  const playerSpeed = playerMonster.value.speed;
  const enemySpeed = enemyMonster.value.speed;
  // Tie-break: player goes first when speeds are equal
  const playerFirst = playerSpeed >= enemySpeed;

  if (playerFirst) {
    // Player attacks → check victory → enemy turn
    await animatePlayerAttack(action);
    if (await checkVictory()) {
      isProcessing.value = false;
      return;
    }
    await executeEnemyTurn();
  } else {
    // Enemy is faster → enemy attacks first → check defeat → player attacks → check victory
    await executeEnemyTurn();
    if (phase.value === "defeat") {
      isProcessing.value = false;
      return;
    }
    await animatePlayerAttack(action);
    if (await checkVictory()) {
      isProcessing.value = false;
      return;
    }
    // Back to player turn (no extra enemy turn)
    battleStore.beginPlayerTurn();
  }

  isProcessing.value = false;
}

// ─── Enemy Turn ────────────────────────────────────────────
async function executeEnemyTurn() {
  if (!playerMonster.value || !enemyMonster.value) return;

  sfx.playEnemyTurn();
  battleStore.beginEnemyTurn();
  await gsapDelay(0.6); // Brief pause for drama

  const playerEl = playerSpriteRef.value?.el;

  const result = await battleStore.executeEnemyTurn();

  // Animate enemy attack on player
  if (result && playerEl) {
    // Signature move intro on the enemy sprite
    if (result.isSignature && enemySpriteRef.value?.el && sceneRef.value) {
      sfx.playSignatureIntro();
      await animateSignatureIntro(
        enemySpriteRef.value.el,
        enemyMonster.value.element,
        sceneRef.value
      );
    }
    if (!result.isBuff && !result.isGuard && !result.missed) {
      sfx.playAttackLaunch();
      sfx.playElementAccent(enemyMonster.value.element);
      await animateAttack(enemyMonster.value.element, playerEl);
    }
    if (result.damage > 0) {
      const playerMaxHP = playerMonster.value?.maxHP ?? 1;
      const playerRatio = result.damage / playerMaxHP;
      if (result.isCritical) {
        sfx.playCriticalHit();
        if (sceneRef.value)
          void animateScreenShake(sceneRef.value, 1 + playerRatio);
      } else {
        sfx.playAttackHit(result.isSpecial ?? false);
      }
      await animateDamage(playerEl, result.isCritical, playerRatio);
      if (enemyMonster.value) {
        void spawnDamageNumber(
          playerEl,
          result.damage,
          result.isCritical,
          result.effectiveness,
          ELEMENT_COLORS[enemyMonster.value.element]
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

  // Check for defeat
  if (await checkDefeat()) return;
  // Check for victory (e.g. enemy fainted from poison)
  if (await checkVictory()) return;

  // Back to player turn
  battleStore.beginPlayerTurn();
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

      <!-- Enemy HUD — top-right -->
      <div class="absolute top-4 right-4 z-10 w-64">
        <HealthBar
          v-if="enemyMonster"
          :current-h-p="enemyMonster.currentHP"
          :max-h-p="enemyMonster.maxHP"
          :monster-name="
            enemyMonster.level >= EVOLUTION_LEVEL &&
            enemyMonster.evolution?.evolvedName
              ? enemyMonster.evolution.evolvedName
              : enemyMonster.name
          "
          :element="enemyMonster.element"
          :secondary-element="
            enemyMonster.level >= EVOLUTION_LEVEL && enemyMonster.evolution
              ? enemyMonster.evolution.secondaryElement
              : null
          "
          :level="enemyMonster.level"
          :status-effect="enemyMonster.statusEffect"
          :stat-buff="enemyMonster.statBuff"
          side="enemy"
        />
      </div>

      <!-- Enemy sprite — upper-right -->
      <div class="absolute top-[4%] right-[15%] z-10">
        <MonsterSprite
          v-if="enemyMonster"
          ref="enemySpriteRef"
          :monster="enemyMonster"
          side="enemy"
        />
      </div>

      <!-- Player sprite — lower-left -->
      <div class="absolute bottom-[4%] left-[15%] z-10">
        <MonsterSprite
          v-if="playerMonster"
          ref="playerSpriteRef"
          :monster="playerMonster"
          side="player"
        />
      </div>

      <!-- Player HUD — bottom-left -->
      <div class="absolute bottom-4 left-4 z-10 w-64">
        <HealthBar
          v-if="playerMonster"
          :current-h-p="playerMonster.currentHP"
          :max-h-p="playerMonster.maxHP"
          :monster-name="
            playerMonster.level >= EVOLUTION_LEVEL &&
            playerMonster.evolution?.evolvedName
              ? playerMonster.evolution.evolvedName
              : playerMonster.name
          "
          :element="playerMonster.element"
          :secondary-element="
            playerMonster.level >= EVOLUTION_LEVEL && playerMonster.evolution
              ? playerMonster.evolution.secondaryElement
              : null
          "
          :level="playerMonster.level"
          :status-effect="playerMonster.statusEffect"
          :stat-buff="playerMonster.statBuff"
          side="player"
        />
      </div>
    </div>

    <!-- ═══ Action UI (remaining 40%) ═══ -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 px-4 py-3 flex-1 min-h-0">
      <ActionMenu
        v-if="playerMonster"
        :monster="playerMonster"
        :disabled="!isPlayerTurn || isProcessing"
        :disable-run="props.disableRun"
        @action="handlePlayerAction"
      />
      <BattleLog :entries="battleLog" />
    </div>
  </div>
</template>
