<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import gsap from "gsap";
import { useBattleStore } from "@/stores/useBattleStore";
import { useGameStore } from "@/stores/useGameStore";
import { useConfetti } from "@/composables/useConfetti";
import { useSoundEffects } from "@/composables/useSoundEffects";
import GlowText from "@/components/ui/GlowText.vue";
import BaseButton from "@/components/ui/BaseButton.vue";

const router = useRouter();
const battleStore = useBattleStore();
const gameStore = useGameStore();
const { burst } = useConfetti();
const sfx = useSoundEffects();

const { phase, playerMonster, enemyMonster, turnCount } =
  storeToRefs(battleStore);

const isVictory = computed(() => phase.value === "victory");
const containerRef = ref<HTMLElement | null>(null);
const xpBarRef = ref<HTMLElement | null>(null);
const xpDisplay = ref(0);
const xpEarned = ref(0);
const didLevelUp = ref(false);
const showContent = ref(false);

onMounted(async () => {
  if (!playerMonster.value || !enemyMonster.value) {
    router.push("/");
    return;
  }

  // Calculate XP
  const enemyLevel = enemyMonster.value.level;
  xpEarned.value = gameStore.calculateXPReward(enemyLevel, isVictory.value);

  if (isVictory.value) {
    gameStore.recordWin();
  } else {
    gameStore.recordLoss();
  }

  didLevelUp.value = gameStore.awardXP(xpEarned.value);

  // Reveal animation
  await delay(300);
  showContent.value = true;

  await delay(200);

  // Animate title
  const titleEl = containerRef.value?.querySelector(".result-title");
  if (titleEl) {
    gsap.fromTo(
      titleEl,
      { scale: 0.3, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)" }
    );
  }

  await delay(400);

  // Animate XP bar
  if (xpBarRef.value) {
    const targetWidth = Math.min(
      ((gameStore.totalXP % gameStore.XP_PER_LEVEL) / gameStore.XP_PER_LEVEL) *
        100,
      100
    );
    gsap.to(xpBarRef.value, {
      width: `${targetWidth}%`,
      duration: 1.2,
      ease: "power2.out",
    });
    gsap.to(
      { val: 0 },
      {
        val: xpEarned.value,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: function () {
          xpDisplay.value = Math.round(
            (this.targets()[0] as { val: number }).val
          );
        },
      }
    );
  }

  // Victory confetti
  if (isVictory.value && containerRef.value) {
    sfx.playVictory();
    await delay(300);
    burst(containerRef.value, 80);

    // Level up extra burst
    if (didLevelUp.value) {
      await delay(500);
      sfx.playLevelUp();
      burst(containerRef.value, 50);
    }
  } else {
    sfx.playDefeat();
  }
});

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function battleAgain() {
  sfx.playConfirm();
  battleStore.$reset();
  router.push("/");
}

function rematch() {
  sfx.playConfirm();
  if (!playerMonster.value) {
    battleAgain();
    return;
  }
  const playerId = playerMonster.value.id;
  battleStore.$reset();
  battleStore.selectMonster(playerId);
  router.push("/battle");
}
</script>

<template>
  <div
    ref="containerRef"
    class="min-h-screen flex flex-col items-center justify-center px-4 py-8"
  >
    <Transition
      enter-active-class="transition-all duration-500"
      enter-from-class="opacity-0 translate-y-8"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div v-if="showContent" class="w-full max-w-lg text-center space-y-8">
        <!-- Hero Icon -->
        <div class="result-title">
          <font-awesome-icon
            :icon="['fas', isVictory ? 'trophy' : 'skull']"
            :class="[
              'text-6xl sm:text-7xl mb-4',
              isVictory ? 'text-yellow-400' : 'text-red-500',
            ]"
            :style="{
              filter: isVictory
                ? 'drop-shadow(0 0 20px rgba(250, 204, 21, 0.5))'
                : 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))',
            }"
          />
          <GlowText
            tag="h1"
            :color="isVictory ? '#facc15' : '#ef4444'"
            class="text-4xl sm:text-5xl"
          >
            {{ isVictory ? "VICTORY!" : "DEFEATED..." }}
          </GlowText>
        </div>

        <!-- Battle Summary -->
        <div
          class="rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm p-5 space-y-3"
        >
          <div class="flex items-center justify-between text-sm">
            <span class="text-white/50">Monster</span>
            <span class="font-bold" :style="{ color: playerMonster?.color }">
              {{ playerMonster?.name }}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-white/50">Opponent</span>
            <span class="font-bold" :style="{ color: enemyMonster?.color }">
              {{ enemyMonster?.name }}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-white/50">Turns</span>
            <span class="font-bold text-white">{{ turnCount }}</span>
          </div>

          <!-- XP Section -->
          <div class="pt-3 border-t border-white/10">
            <div class="flex items-center justify-between text-sm mb-2">
              <span class="text-white/50 flex items-center gap-1.5">
                <font-awesome-icon
                  :icon="['fas', 'star']"
                  class="text-yellow-400"
                />
                XP Earned
              </span>
              <span class="font-bold text-yellow-400">+{{ xpDisplay }}</span>
            </div>

            <!-- XP Bar -->
            <div
              class="h-3 bg-black/60 rounded-full overflow-hidden border border-white/10"
            >
              <div
                ref="xpBarRef"
                class="h-full rounded-full bg-linear-to-r from-yellow-500 to-yellow-300"
                style="width: 0%; box-shadow: 0 0 10px rgba(250, 204, 21, 0.5)"
              />
            </div>

            <div
              class="flex items-center justify-between mt-1 text-[10px] text-white/40"
            >
              <span>Level {{ gameStore.playerLevel }}</span>
              <span
                >{{ gameStore.totalXP % gameStore.XP_PER_LEVEL }} /
                {{ gameStore.XP_PER_LEVEL }}</span
              >
            </div>
          </div>

          <!-- Level Up -->
          <div
            v-if="didLevelUp"
            class="text-center py-2 px-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
          >
            <span
              class="text-yellow-400 font-bold text-sm flex items-center justify-center gap-2"
            >
              <font-awesome-icon :icon="['fas', 'arrow-up']" />
              LEVEL UP! Now Level {{ gameStore.playerLevel }}
              <font-awesome-icon :icon="['fas', 'arrow-up']" />
            </span>
          </div>
        </div>

        <!-- Win/Loss Record -->
        <div
          class="flex items-center justify-center gap-6 text-sm text-white/40"
        >
          <span class="flex items-center gap-1.5">
            <font-awesome-icon
              :icon="['fas', 'trophy']"
              class="text-yellow-400"
            />
            {{ gameStore.wins }} wins
          </span>
          <span class="flex items-center gap-1.5">
            <font-awesome-icon :icon="['fas', 'skull']" class="text-red-400" />
            {{ gameStore.losses }} losses
          </span>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <BaseButton
            variant="primary"
            size="lg"
            icon="rotate-right"
            @click="battleAgain"
          >
            New Battle
          </BaseButton>
          <BaseButton variant="ghost" size="lg" icon="swords" @click="rematch">
            Rematch
          </BaseButton>
        </div>
      </div>
    </Transition>
  </div>
</template>
