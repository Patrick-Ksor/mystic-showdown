<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import gsap from "gsap";
import { useBattleStore } from "@/stores/useBattleStore";
import { useProgressionStore } from "@/stores/useProgressionStore";
import { MONSTERS } from "@/data/monsters";
import type { MonsterDefinition } from "@/types";
import MonsterCard from "@/components/monsters/MonsterCard.vue";
import MonsterStats from "@/components/monsters/MonsterStats.vue";
import GlowText from "@/components/ui/GlowText.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import { ELEMENT_COLORS } from "@/types";
import { useSoundEffects } from "@/composables/useSoundEffects";

const router = useRouter();
const battleStore = useBattleStore();
const progressionStore = useProgressionStore();
const sfx = useSoundEffects();

const selectedId = ref<string | null>(null);
const gridRef = ref<HTMLElement | null>(null);

const selectedMonster = computed<MonsterDefinition | null>(() => {
  if (!selectedId.value) return null;
  return MONSTERS.find((m) => m.id === selectedId.value) ?? null;
});

function selectMonster(id: string) {
  if (!progressionStore.isUnlocked(id)) return;
  sfx.playSelect();
  selectedId.value = id;
}

function enterArena() {
  if (!selectedId.value) return;
  sfx.playConfirm();
  battleStore.selectMonster(selectedId.value);
  router.push("/battle");
}

onMounted(() => {
  // Stagger-in animation for cards
  if (gridRef.value) {
    const cards = gridRef.value.querySelectorAll(".monster-card-wrapper");
    gsap.fromTo(
      cards,
      { y: 60, opacity: 0, scale: 0.9 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: "back.out(1.5)",
      }
    );
  }

  // Floating title animation
  gsap.to(".title-glow", {
    filter: "drop-shadow(0 0 40px #a855f788)",
    duration: 2,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
  });
});
</script>

<template>
  <div class="min-h-screen flex flex-col items-center px-4 py-8 sm:py-12">
    <!-- Title -->
    <div class="title-glow text-center mb-8 sm:mb-12">
      <GlowText tag="h1" color="#a855f7" class="text-3xl sm:text-5xl mb-2">
        MythicBeast Arena
      </GlowText>
      <p class="text-white/40 text-sm sm:text-base">Choose your champion</p>
      <p class="text-white/30 text-xs mt-1">
        <span class="text-purple-400 font-semibold">{{
          progressionStore.unlockedMonsters.length
        }}</span>
        / {{ MONSTERS.length }} unlocked
        <span
          v-if="progressionStore.isTournamentComplete"
          class="text-yellow-400 font-bold ml-2"
          >— Tournament Complete!</span
        >
      </p>
    </div>

    <!-- Main Grid + Detail Panel -->
    <div class="w-full max-w-6xl flex flex-col lg:flex-row gap-6 lg:gap-8">
      <!-- Monster Grid -->
      <div class="flex-1">
        <div
          ref="gridRef"
          class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
        >
          <div
            v-for="monster in MONSTERS"
            :key="monster.id"
            class="monster-card-wrapper"
          >
            <MonsterCard
              :monster="monster"
              :selected="selectedId === monster.id"
              :is-locked="!progressionStore.isUnlocked(monster.id)"
              @select="selectMonster"
            />
          </div>
        </div>
      </div>

      <!-- Detail Panel -->
      <div
        class="lg:w-80 rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm p-5 transition-all duration-300"
        :style="{
          borderColor: selectedMonster
            ? ELEMENT_COLORS[selectedMonster.element] + '33'
            : undefined,
        }"
      >
        <template v-if="selectedMonster">
          <MonsterStats :monster="selectedMonster" />

          <div class="mt-6">
            <BaseButton
              :variant="selectedMonster.element"
              size="lg"
              icon="chevron-right"
              class="w-full"
              @click="enterArena"
            >
              Enter Arena
            </BaseButton>
          </div>
        </template>

        <template v-else>
          <div
            class="flex flex-col items-center justify-center h-full min-h-75 text-white/30"
          >
            <font-awesome-icon
              :icon="['fas', 'hand-pointer']"
              class="text-4xl mb-3"
            />
            <p class="text-sm text-center">
              Select a monster<br />to view details
            </p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
