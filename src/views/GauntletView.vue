<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import gsap from "gsap";
import { useBattleStore } from "@/stores/useBattleStore";
import { useGauntletStore } from "@/stores/useGauntletStore";
import BattleScene from "@/components/battle/BattleScene.vue";
import GauntletRoundBanner from "@/components/battle/GauntletRoundBanner.vue";
import PerkPickerOverlay from "@/components/battle/PerkPickerOverlay.vue";
import { ELEMENT_COLORS } from "@/types";
import type { RunPerkId } from "@/types";
import arenaImg from "@/assets/sprites/Arena.png";

const router = useRouter();
const battleStore = useBattleStore();
const gauntletStore = useGauntletStore();
const { playerMonster } = storeToRefs(battleStore);

// Key changes per round so Vue fully remounts BattleScene between rounds
const battleKey = ref(1);
const showStageClear = ref(false);
const showPerkPicker = ref(false);
const stageClearRef = ref<HTMLElement | null>(null);
// Round that just finished — used for perk picker header
const completedRound = ref(0);
// Snapshot of offered perks — frozen at the moment the picker opens so
// addPerk() re-evaluating offeredPerks doesn't reshuffle the visible cards
const frozenPerks = ref(gauntletStore.offeredPerks);

onMounted(() => {
  if (!gauntletStore.isActive || !gauntletStore.playerMonsterId) {
    router.push("/");
    return;
  }
  if (!playerMonster.value) {
    router.push("/");
  }
});

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function animateStageClear() {
  if (!stageClearRef.value) return;
  await delay(50);
  gsap.fromTo(
    stageClearRef.value,
    { scale: 0.5, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" }
  );
}

async function handleVictory() {
  // Capture player HP before any resets (for score calculation)
  const finalHP = playerMonster.value?.currentHP ?? 0;
  const finalMaxHP = playerMonster.value?.maxHP ?? 1;
  // Accumulate turns from this round before resetting the battle store
  gauntletStore.accumulateTurns(battleStore.turnCount);
  completedRound.value = gauntletStore.currentRound;

  // Advance round in the store — this unlocks the defeated monster
  // and increments currentRound (or marks isComplete)
  gauntletStore.advanceRound();

  if (gauntletStore.isComplete) {
    // All rounds cleared — compute score then head to results
    gauntletStore.finalizeScore(finalHP, finalMaxHP);
    await delay(200);
    router.push("/result");
    return;
  }

  // Show Stage Clear interstitial
  showStageClear.value = true;
  await animateStageClear();
  await delay(1800);
  showStageClear.value = false;

  // Snapshot the offered perks NOW before showing the picker,
  // so addPerk() can't re-randomize them while overlay is open
  frozenPerks.value = gauntletStore.offeredPerks;
  // Show perk picker — wait for the player to pick
  showPerkPicker.value = true;
}

function onPerkPicked(id: RunPerkId) {
  gauntletStore.addPerk(id);
  // Small delay so the pick animation is visible before the battle starts
  setTimeout(() => {
    showPerkPicker.value = false;

    // Set up next round - grab next opponent AFTER advanceRound incremented currentRound
    const nextOpponent = gauntletStore.currentOpponent;
    battleStore.$reset();
    if (gauntletStore.playerMonsterId && nextOpponent) {
      battleStore.selectMonster(gauntletStore.playerMonsterId, nextOpponent);
    }

    // Bump key to remount BattleScene cleanly
    battleKey.value = gauntletStore.currentRound;
  }, 420);
}

async function handleDefeat() {
  gauntletStore.accumulateTurns(battleStore.turnCount);
  gauntletStore.finalizeScore(
    playerMonster.value?.currentHP ?? 0,
    playerMonster.value?.maxHP ?? 1
  );
  gauntletStore.handleDefeat();
  await delay(200);
  router.push("/result");
}
</script>

<template>
  <div
    class="h-screen flex flex-col overflow-hidden relative"
    :style="{
      backgroundImage: `url(${arenaImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }"
  >
    <!-- Dark overlay -->
    <div class="absolute inset-0 bg-black/40 pointer-events-none" />

    <!-- Ambient grid overlay -->
    <div
      class="absolute inset-0 pointer-events-none opacity-5"
      style="
        background-image: linear-gradient(
            rgba(168, 85, 247, 0.3) 1px,
            transparent 1px
          ),
          linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px);
        background-size: 50px 50px;
      "
    />

    <!-- Gauntlet round banner -->
    <GauntletRoundBanner
      :current-round="gauntletStore.currentRound"
      :total-rounds="gauntletStore.totalRounds"
      :opponent="gauntletStore.currentOpponent"
      class="relative z-20"
    />

    <!-- Battle scene — key changes each round to force remount -->
    <BattleScene
      v-if="playerMonster"
      :key="battleKey"
      :disable-run="true"
      class="relative z-10 flex-1"
      @victory="handleVictory"
      @defeat="handleDefeat"
    />

    <!-- Stage Clear interstitial overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showStageClear"
        class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 pointer-events-none"
      >
        <div ref="stageClearRef" class="text-center space-y-3">
          <p
            class="text-green-400 text-xs font-bold tracking-[0.3em] uppercase"
          >
            Stage {{ gauntletStore.currentRound - 1 }} Complete
          </p>
          <h2
            class="text-4xl sm:text-6xl font-black tracking-widest text-white"
            style="text-shadow: 0 0 20px #22c55e, 0 0 40px #22c55e88"
          >
            STAGE CLEAR!
          </h2>
          <p class="text-white/40 text-sm mt-4">
            Get ready for Round {{ gauntletStore.currentRound }}...
          </p>
        </div>
      </div>
    </Transition>

    <!-- Perk picker overlay (between rounds) -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <PerkPickerOverlay
        v-if="showPerkPicker"
        :perks="frozenPerks"
        :round="completedRound"
        @pick="onPerkPicked"
      />
    </Transition>
  </div>
</template>
