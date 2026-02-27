<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import gsap from "gsap";
import { useBattleStore } from "@/stores/useBattleStore";
import { useProgressionStore } from "@/stores/useProgressionStore";
import { useGauntletStore } from "@/stores/useGauntletStore";
import { useMonsterLevelStore } from "@/stores/useMonsterLevelStore";
import { useGameStore } from "@/stores/useGameStore";
import { MONSTERS } from "@/data/monsters";
import type { MonsterDefinition, DifficultyTier } from "@/types";
import MonsterCard from "@/components/monsters/MonsterCard.vue";
import MonsterStats from "@/components/monsters/MonsterStats.vue";
import MoveTutorModal from "@/components/monsters/MoveTutorModal.vue";
import GlowText from "@/components/ui/GlowText.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import { ELEMENT_COLORS } from "@/types";
import { useSoundEffects } from "@/composables/useSoundEffects";

const router = useRouter();
const battleStore = useBattleStore();
const progressionStore = useProgressionStore();
const gauntletStore = useGauntletStore();
const monsterLevelStore = useMonsterLevelStore();
const gameStore = useGameStore();
const sfx = useSoundEffects();

const difficultyTiers: {
  id: DifficultyTier;
  label: string;
  color: string;
  desc: string;
}[] = [
  {
    id: "easy",
    label: "Easy",
    color: "#22c55e",
    desc: "Weaker enemies, less XP",
  },
  {
    id: "normal",
    label: "Normal",
    color: "#00bfff",
    desc: "Balanced challenge",
  },
  {
    id: "hard",
    label: "Hard",
    color: "#f97316",
    desc: "Stronger enemies, smarter AI",
  },
  {
    id: "nightmare",
    label: "Nightmare",
    color: "#a855f7",
    desc: "Maximum difficulty, +50% XP",
  },
];

const selectedId = ref<string | null>(null);
const gridRef = ref<HTMLElement | null>(null);
const showTutorModal = ref(false);

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

function enterGauntlet() {
  if (!selectedId.value) return;
  sfx.playConfirm();
  gauntletStore.startGauntlet(selectedId.value);
  const firstOpponent = gauntletStore.currentOpponent;
  battleStore.selectMonster(selectedId.value, firstOpponent ?? undefined);
  router.push("/gauntlet");
}

function handleToggleEquip(moveName: string) {
  if (!selectedId.value) return;
  // Starter special move is always locked in — cannot be unequipped
  const def = MONSTERS.find((m) => m.id === selectedId.value);
  if (def && moveName === def.specialMove.name) return;
  const current = monsterLevelStore.getEquippedMoveNames(selectedId.value);
  const next = current.includes(moveName)
    ? current.filter((n) => n !== moveName)
    : [...current, moveName];
  monsterLevelStore.setEquippedMoveNames(selectedId.value, next);
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
              :level="monsterLevelStore.getLevel(monster.id)"
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
          <!-- Coin balance -->
          <div class="flex items-center justify-end mb-3">
            <span
              class="flex items-center gap-1.5 text-sm font-bold text-amber-400"
            >
              <font-awesome-icon :icon="['fas', 'coins']" />
              {{ gameStore.coins }} Mystic Coins
            </span>
          </div>

          <MonsterStats
            :monster="selectedMonster"
            :level="monsterLevelStore.getLevel(selectedMonster.id)"
            :xp="monsterLevelStore.getXP(selectedMonster.id)"
            :xp-to-next="
              monsterLevelStore.getXPToNextLevel(
                monsterLevelStore.getLevel(selectedMonster.id)
              )
            "
            :max-level="monsterLevelStore.maxLevel"
            :equipped-move-names="
              monsterLevelStore.getEquippedMoveNames(selectedMonster.id)
            "
            :learned-tutor-move-names="
              monsterLevelStore.getTutorMoveNames(selectedMonster.id)
            "
            @toggle-equip="handleToggleEquip"
          />

          <div class="mt-6 flex flex-col gap-2">
            <!-- Difficulty Selector -->
            <div class="mb-1">
              <p
                class="text-[10px] text-white/40 uppercase tracking-wider mb-2 font-semibold"
              >
                Difficulty
              </p>
              <div class="grid grid-cols-4 gap-1">
                <button
                  v-for="tier in difficultyTiers"
                  :key="tier.id"
                  :title="tier.desc"
                  class="rounded-lg border-2 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
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
                    boxShadow:
                      gameStore.difficulty === tier.id
                        ? `0 0 10px ${tier.color}44`
                        : 'none',
                  }"
                  @click="gameStore.setDifficulty(tier.id)"
                >
                  {{ tier.label }}
                </button>
              </div>
            </div>

            <BaseButton
              variant="primary"
              size="lg"
              icon="book-open"
              class="w-full"
              @click="showTutorModal = true"
            >
              Move Tutor
            </BaseButton>
            <BaseButton
              :variant="selectedMonster.element"
              size="lg"
              icon="chevron-right"
              class="w-full"
              @click="enterArena"
            >
              Normal Battle
            </BaseButton>
            <BaseButton
              variant="primary"
              size="lg"
              icon="hand-fist"
              class="w-full"
              @click="enterGauntlet"
            >
              Gauntlet (4 Stages)
            </BaseButton>
            <BaseButton
              variant="secondary"
              size="lg"
              icon="users"
              class="w-full"
              :class="{
                'opacity-40 cursor-not-allowed':
                  !progressionStore.hasCompletedGauntlet,
              }"
              :title="
                !progressionStore.hasCompletedGauntlet
                  ? 'Complete a Gauntlet run to unlock'
                  : 'Team Battle'
              "
              @click="
                progressionStore.hasCompletedGauntlet &&
                  router.push('/team-select')
              "
            >
              Team Battle
              <font-awesome-icon
                v-if="!progressionStore.hasCompletedGauntlet"
                :icon="['fas', 'lock']"
                class="text-xs ml-1"
              />
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

    <!-- Move Tutor Modal (inside root div — required for Transition single root) -->
    <MoveTutorModal
      v-if="showTutorModal && selectedMonster"
      :monster="selectedMonster"
      @close="showTutorModal = false"
    />
  </div>
</template>
