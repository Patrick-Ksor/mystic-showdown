<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import gsap from "gsap";
import { useTeamBattleStore, TEAM_SIZE } from "@/stores/useTeamBattleStore";
import { useProgressionStore } from "@/stores/useProgressionStore";
import { useMonsterLevelStore } from "@/stores/useMonsterLevelStore";
import { useGameStore } from "@/stores/useGameStore";
import { MONSTERS } from "@/data/monsters";
import { ELEMENT_COLORS, EVOLUTION_LEVEL } from "@/types";
import type { DifficultyTier } from "@/types";
import GlowText from "@/components/ui/GlowText.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import ElementBadge from "@/components/ui/ElementBadge.vue";
import MonsterCard from "@/components/monsters/MonsterCard.vue";

const router = useRouter();
const teamBattleStore = useTeamBattleStore();
const progressionStore = useProgressionStore();
const monsterLevelStore = useMonsterLevelStore();
const gameStore = useGameStore();

const selectedIds = ref<string[]>([]);
const gridRef = ref<HTMLElement | null>(null);

const difficultyTiers: {
  id: DifficultyTier;
  label: string;
  color: string;
  desc: string;
}[] = [
  { id: "easy", label: "Easy", color: "#22c55e", desc: "Weaker enemies" },
  { id: "normal", label: "Normal", color: "#00bfff", desc: "Balanced" },
  { id: "hard", label: "Hard", color: "#f97316", desc: "Stronger enemies" },
  {
    id: "nightmare",
    label: "Nightmare",
    color: "#ef4444",
    desc: "Max challenge",
  },
];

const canBattle = computed(() => selectedIds.value.length === TEAM_SIZE);

function toggleSelect(id: string) {
  if (!progressionStore.isUnlocked(id)) return;
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((s) => s !== id);
  } else if (selectedIds.value.length < TEAM_SIZE) {
    selectedIds.value = [...selectedIds.value, id];
  }
}

function slotMonster(slotIdx: number) {
  return MONSTERS.find((m) => m.id === selectedIds.value[slotIdx]) ?? null;
}

function displayName(id: string): string {
  const def = MONSTERS.find((m) => m.id === id);
  if (!def) return id;
  const lvl = monsterLevelStore.getLevel(id);
  if (lvl >= EVOLUTION_LEVEL && def.evolution?.evolvedName) {
    return def.evolution.evolvedName;
  }
  return def.name;
}

function enterTeamBattle() {
  if (!canBattle.value) return;
  teamBattleStore.selectTeam(selectedIds.value);
  router.push("/team-battle");
}

onMounted(() => {
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
        stagger: 0.05,
        ease: "back.out(1.5)",
      }
    );
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col items-center px-4 py-8 sm:py-12">
    <!-- Header -->
    <div class="text-center mb-8 sm:mb-10">
      <GlowText tag="h1" color="#a855f7" class="text-3xl sm:text-4xl mb-1">
        Team Battle
      </GlowText>
      <p class="text-white/40 text-sm">Choose your team of {{ TEAM_SIZE }}</p>
    </div>

    <!-- Not unlocked gate -->
    <div
      v-if="!progressionStore.hasCompletedGauntlet"
      class="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-12 max-w-md text-center"
    >
      <font-awesome-icon
        :icon="['fas', 'lock']"
        class="text-5xl text-white/20"
      />
      <h2 class="text-xl font-bold text-white/60">Locked</h2>
      <p class="text-white/30 text-sm">
        Complete a full Gauntlet run to unlock Team Battle mode.
      </p>
      <BaseButton variant="primary" size="md" @click="router.push('/')">
        Back to Select
      </BaseButton>
    </div>

    <!-- Selection UI -->
    <template v-else>
      <!-- Team slots strip -->
      <div class="flex items-center gap-3 mb-6">
        <div
          v-for="slotIdx in TEAM_SIZE"
          :key="slotIdx"
          class="w-20 h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-200"
          :style="{
            borderColor: slotMonster(slotIdx - 1)
              ? ELEMENT_COLORS[slotMonster(slotIdx - 1)!.element] + 'aa'
              : 'rgba(255,255,255,0.1)',
            backgroundColor: slotMonster(slotIdx - 1)
              ? ELEMENT_COLORS[slotMonster(slotIdx - 1)!.element] + '12'
              : 'rgba(255,255,255,0.03)',
          }"
        >
          <template v-if="slotMonster(slotIdx - 1)">
            <img
              :src="
                monsterLevelStore.getLevel(selectedIds[slotIdx - 1]) >= EVOLUTION_LEVEL &&
                slotMonster(slotIdx - 1)!.evolution?.evolvedSpriteUrl
                  ? slotMonster(slotIdx - 1)!.evolution!.evolvedSpriteUrl!
                  : slotMonster(slotIdx - 1)!.spriteUrl
              "
              class="w-12 h-12 object-contain"
              :style="{
                filter: `drop-shadow(0 0 6px ${ELEMENT_COLORS[slotMonster(slotIdx - 1)!.element]}88)`,
              }"
            />
            <span
              class="text-[9px] font-bold truncate max-w-[72px] px-1"
              :style="{ color: ELEMENT_COLORS[slotMonster(slotIdx - 1)!.element] }"
            >
              {{ displayName(selectedIds[slotIdx - 1]) }}
            </span>
          </template>
          <template v-else>
            <font-awesome-icon
              :icon="['fas', 'circle-plus']"
              class="text-white/20 text-xl"
            />
            <span class="text-[10px] text-white/20">Slot {{ slotIdx }}</span>
          </template>
        </div>
      </div>

      <!-- Difficulty -->
      <div class="mb-5 w-full max-w-md">
        <p
          class="text-[10px] text-white/40 uppercase tracking-wider mb-2 font-semibold text-center"
        >
          Difficulty
        </p>
        <div class="grid grid-cols-4 gap-1">
          <button
            v-for="tier in difficultyTiers"
            :key="tier.id"
            :title="tier.desc"
            class="rounded-lg border-2 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-all duration-200 cursor-pointer hover:scale-105"
            :style="{
              borderColor:
                gameStore.difficulty === tier.id
                  ? tier.color
                  : 'rgba(255,255,255,0.08)',
              color:
                gameStore.difficulty === tier.id
                  ? tier.color
                  : 'rgba(255,255,255,0.35)',
              backgroundColor:
                gameStore.difficulty === tier.id
                  ? tier.color + '18'
                  : 'transparent',
            }"
            @click="gameStore.setDifficulty(tier.id)"
          >
            {{ tier.label }}
          </button>
        </div>
      </div>

      <!-- Instruction -->
      <p class="text-white/30 text-xs mb-4">
        Click monsters to add them to your team
        <span class="font-bold text-purple-400"
          >({{ selectedIds.length }}/{{ TEAM_SIZE }} selected)</span
        >
      </p>

      <!-- Monster Grid -->
      <div
        ref="gridRef"
        class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 w-full max-w-4xl"
      >
        <div
          v-for="monster in MONSTERS"
          :key="monster.id"
          class="monster-card-wrapper"
        >
          <div
            class="relative cursor-pointer"
            :class="[
              !progressionStore.isUnlocked(monster.id)
                ? 'cursor-not-allowed'
                : '',
            ]"
            @click="toggleSelect(monster.id)"
          >
            <MonsterCard
              :monster="monster"
              :selected="selectedIds.includes(monster.id)"
              :is-locked="!progressionStore.isUnlocked(monster.id)"
              :level="monsterLevelStore.getLevel(monster.id)"
            />
            <!-- Selection number badge -->
            <div
              v-if="selectedIds.includes(monster.id)"
              class="absolute top-1 right-1 w-5 h-5 rounded-full bg-purple-500 border border-purple-300 flex items-center justify-center z-10"
            >
              <span class="text-[10px] font-black text-white">
                {{ selectedIds.indexOf(monster.id) + 1 }}
              </span>
            </div>
            <!-- Dim unselectable when 3 already picked -->
            <div
              v-else-if="
                selectedIds.length >= TEAM_SIZE &&
                progressionStore.isUnlocked(monster.id)
              "
              class="absolute inset-0 rounded-xl bg-black/50 pointer-events-none"
            />
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 mt-8">
        <BaseButton variant="secondary" size="lg" @click="router.push('/')">
          Back
        </BaseButton>
        <BaseButton
          variant="primary"
          size="lg"
          icon="users"
          :class="canBattle ? '' : 'opacity-40 cursor-not-allowed'"
          @click="enterTeamBattle"
        >
          Battle! ({{ selectedIds.length }}/{{ TEAM_SIZE }})
        </BaseButton>
      </div>
    </template>
  </div>
</template>
