<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import gsap from "gsap";
import { useBattleStore } from "@/stores/useBattleStore";
import type { ActionType } from "@/types";
import {
  animateAttack,
  animateDamage,
  animateEntrance,
  animateFaint,
  animateGuard,
} from "@/composables/useBattleAnimations";
import { gsapDelay } from "@/composables/useGsapContext";
import { useSoundEffects } from "@/composables/useSoundEffects";
import MonsterSprite from "@/components/monsters/MonsterSprite.vue";
import HealthBar from "@/components/battle/HealthBar.vue";
import ActionMenu from "@/components/battle/ActionMenu.vue";
import BattleLog from "@/components/battle/BattleLog.vue";

const router = useRouter();
const battleStore = useBattleStore();
const sfx = useSoundEffects();
const { phase, playerMonster, enemyMonster, battleLog, isPlayerTurn } =
  storeToRefs(battleStore);

const playerSpriteRef = ref<InstanceType<typeof MonsterSprite> | null>(null);
const enemySpriteRef = ref<InstanceType<typeof MonsterSprite> | null>(null);
const sceneRef = ref<HTMLElement | null>(null);
const bannerRef = ref<HTMLElement | null>(null);
const isProcessing = ref(false);
const showBanner = ref(false);
const bannerText = ref("");

// ─── Intro Sequence ────────────────────────────────────────
onMounted(async () => {
  if (!playerMonster.value || !enemyMonster.value) {
    router.push("/");
    return;
  }

  battleStore.startBattle();

  await gsapDelay(0.3);

  // Entrance animations
  const playerEl = playerSpriteRef.value?.el;
  const enemyEl = enemySpriteRef.value?.el;

  if (playerEl && enemyEl) {
    await Promise.all([
      animateEntrance(playerEl, "left"),
      animateEntrance(enemyEl, "right"),
    ]);
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

// ─── Player Action Handler ─────────────────────────────────
async function handlePlayerAction(action: ActionType) {
  if (isProcessing.value || phase.value !== "playerTurn") return;
  if (!playerMonster.value || !enemyMonster.value) return;

  isProcessing.value = true;

  const enemyEl = enemySpriteRef.value?.el;
  const playerEl = playerSpriteRef.value?.el;

  if (action === "guard") {
    // Guard animation on player
    sfx.playGuard();
    if (playerEl) await animateGuard(playerEl);
    await battleStore.executePlayerAction(action);
    await gsapDelay(0.5);
  } else if (action === "run") {
    sfx.playRun();
    await battleStore.executePlayerAction(action);
    if (phase.value === "select") {
      router.push("/");
      isProcessing.value = false;
      return;
    }
    await gsapDelay(0.5);
  } else {
    // Attack action (strike or special)
    const move =
      action === "strike"
        ? playerMonster.value.basicMove
        : playerMonster.value.specialMove;

    // Play attack launch + element accent on enemy
    if (enemyEl) {
      sfx.playAttackLaunch();
      sfx.playElementAccent(move.element);
      await animateAttack(move.element, enemyEl);
    }

    const result = await battleStore.executePlayerAction(action);

    // Damage or miss feedback
    if (result && result.damage > 0 && enemyEl) {
      if (result.isCritical) {
        sfx.playCriticalHit();
      } else {
        sfx.playAttackHit();
      }
      await animateDamage(enemyEl, result.isCritical);
    } else if (result && result.damage === 0) {
      sfx.playMiss();
    }

    await gsapDelay(0.3);
  }

  // Check for victory
  if (phase.value === "victory") {
    if (enemySpriteRef.value?.el) {
      sfx.playFaint();
      await animateFaint(enemySpriteRef.value.el);
    }
    sfx.playVictory();
    await showBannerAnimation("VICTORY!");
    await gsapDelay(0.5);
    router.push("/result");
    isProcessing.value = false;
    return;
  }

  // Enemy turn
  await executeEnemyTurn();

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
    sfx.playAttackLaunch();
    sfx.playElementAccent(enemyMonster.value.element);
    await animateAttack(enemyMonster.value.element, playerEl);
    if (result.damage > 0) {
      if (result.isCritical) {
        sfx.playCriticalHit();
      } else {
        sfx.playAttackHit();
      }
      await animateDamage(playerEl, result.isCritical);
    } else {
      sfx.playMiss();
    }
  }

  await gsapDelay(0.3);

  // Check for defeat
  if (phase.value === "defeat") {
    if (playerSpriteRef.value?.el) {
      sfx.playFaint();
      await animateFaint(playerSpriteRef.value.el);
    }
    sfx.playDefeat();
    await showBannerAnimation("DEFEATED...");
    await gsapDelay(0.5);
    router.push("/result");
    return;
  }

  // Back to player turn
  battleStore.beginPlayerTurn();
}

// Cleanup
onBeforeUnmount(() => {
  gsap.killTweensOf("*");
});
</script>

<template>
  <div ref="sceneRef" class="battle-scene relative w-full h-full flex flex-col">
    <!-- Top Banner (BATTLE START / VICTORY / DEFEATED) -->
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

    <!-- Enemy Section -->
    <div
      class="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4 px-4 pt-4 sm:pt-8"
    >
      <div class="order-2 sm:order-1">
        <HealthBar
          v-if="enemyMonster"
          :current-h-p="enemyMonster.currentHP"
          :max-h-p="enemyMonster.maxHP"
          :monster-name="enemyMonster.name"
          :element="enemyMonster.element"
          :level="enemyMonster.level"
          side="enemy"
        />
      </div>
      <div class="order-1 sm:order-2 relative">
        <MonsterSprite
          v-if="enemyMonster"
          ref="enemySpriteRef"
          :monster="enemyMonster"
          side="enemy"
        />
      </div>
    </div>

    <!-- Divider -->
    <div
      class="h-px bg-linear-to-r from-transparent via-white/10 to-transparent mx-4"
    />

    <!-- Player Section -->
    <div
      class="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4 px-4 pb-2"
    >
      <div class="relative">
        <MonsterSprite
          v-if="playerMonster"
          ref="playerSpriteRef"
          :monster="playerMonster"
          side="player"
        />
      </div>
      <div>
        <HealthBar
          v-if="playerMonster"
          :current-h-p="playerMonster.currentHP"
          :max-h-p="playerMonster.maxHP"
          :monster-name="playerMonster.name"
          :element="playerMonster.element"
          :level="playerMonster.level"
          side="player"
        />
      </div>
    </div>

    <!-- Bottom Section: Battle Log + Action Menu -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 px-4 pb-4">
      <BattleLog :entries="battleLog" />
      <ActionMenu
        v-if="playerMonster"
        :monster="playerMonster"
        :disabled="!isPlayerTurn || isProcessing"
        @action="handlePlayerAction"
      />
    </div>
  </div>
</template>
