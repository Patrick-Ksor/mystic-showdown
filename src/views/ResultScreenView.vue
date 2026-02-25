<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import gsap from "gsap";
import { useBattleStore } from "@/stores/useBattleStore";
import { useGameStore } from "@/stores/useGameStore";
import { useProgressionStore } from "@/stores/useProgressionStore";
import { useGauntletStore } from "@/stores/useGauntletStore";
import { useMonsterLevelStore } from "@/stores/useMonsterLevelStore";
import { MONSTERS } from "@/data/monsters";
import { useConfetti } from "@/composables/useConfetti";
import { useSoundEffects } from "@/composables/useSoundEffects";
import GlowText from "@/components/ui/GlowText.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import { ELEMENT_COLORS } from "@/types";
import type { Move } from "@/types";

const router = useRouter();
const battleStore = useBattleStore();
const gameStore = useGameStore();
const progressionStore = useProgressionStore();
const gauntletStore = useGauntletStore();
const monsterLevelStore = useMonsterLevelStore();
const { burst } = useConfetti();
const sfx = useSoundEffects();

const { phase, playerMonster, enemyMonster, turnCount } =
  storeToRefs(battleStore);

const isVictory = computed(() => phase.value === "victory");
const isGauntletComplete = computed(() => gauntletStore.isComplete);
const isGauntletFailed = computed(() => gauntletStore.isFailed);
const isGauntletResult = computed(
  () => isGauntletComplete.value || isGauntletFailed.value
);
const containerRef = ref<HTMLElement | null>(null);
const xpBarRef = ref<HTMLElement | null>(null);
const xpDisplay = ref(0);
const xpEarned = ref(0);
const didLevelUp = ref(false);
const showContent = ref(false);
const newlyUnlocked = ref<string | null>(null);
const isTournamentChampion = ref(false);
const monsterXPEarned = ref(0);
const monsterDidLevelUp = ref(false);
const monsterNewLevel = ref(1);
const monsterXPBarRef = ref<HTMLElement | null>(null);
const monsterXPDisplay = ref(0);
const newMoveAvailable = ref<Move | null>(null);
const showMoveSwapUI = ref(false);
const moveSwapResolved = ref(false);
const learnedMoveName = ref<string | null>(null);

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

    // Skip individual unlock in gauntlet mode — gauntletStore.advanceRound() already handled it
    if (!isGauntletResult.value) {
      if (
        enemyMonster.value &&
        !progressionStore.isUnlocked(enemyMonster.value.id)
      ) {
        progressionStore.unlockMonster(enemyMonster.value.id);
        newlyUnlocked.value = enemyMonster.value.name;
      }
    }

    isTournamentChampion.value = progressionStore.isTournamentComplete;
  } else {
    gameStore.recordLoss();
  }

  didLevelUp.value = gameStore.awardXP(xpEarned.value);

  // Award monster XP
  if (playerMonster.value) {
    monsterXPEarned.value = monsterLevelStore.calculateBattleXP(
      enemyMonster.value.level,
      isVictory.value
    );
    const result = monsterLevelStore.awardXP(
      playerMonster.value.id,
      monsterXPEarned.value
    );
    monsterDidLevelUp.value = result.didLevelUp;
    monsterNewLevel.value = result.newLevel;

    // Check for newly learnable move
    if (result.newMove) {
      newMoveAvailable.value = result.newMove;
      const equippedNames = monsterLevelStore.getEquippedMoveNames(
        playerMonster.value.id
      );
      if (equippedNames.length < 3) {
        // Auto-equip: less than 3 specials
        monsterLevelStore.setEquippedMoveNames(playerMonster.value.id, [
          ...equippedNames,
          result.newMove.name,
        ]);
        learnedMoveName.value = result.newMove.name;
        moveSwapResolved.value = true;
      } else {
        // Need to show swap UI
        showMoveSwapUI.value = true;
      }
    }
  }

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
  if ((isVictory.value || isGauntletComplete.value) && containerRef.value) {
    sfx.playVictory();
    await delay(300);
    burst(containerRef.value, isGauntletComplete.value ? 120 : 80);

    // Level up extra burst
    if (didLevelUp.value) {
      await delay(500);
      sfx.playLevelUp();
      burst(containerRef.value, 50);
    }

    // Champion extra burst
    if (isTournamentChampion.value) {
      await delay(800);
      burst(containerRef.value, 120);
    }
  } else {
    sfx.playDefeat();
  }
});

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Move Swap Logic ─────────────────────────────────────
const currentEquippedSpecials = computed(() => {
  if (!playerMonster.value) return [];
  const equippedNames = monsterLevelStore.getEquippedMoveNames(
    playerMonster.value.id
  );
  const def = MONSTERS.find((m) => m.id === playerMonster.value!.id);
  if (!def) return [];
  const allSpecials = [def.specialMove, ...def.learnset.map((l) => l.move)];
  return equippedNames
    .map((name) => allSpecials.find((m) => m.name === name))
    .filter((m): m is Move => m !== undefined);
});

function swapMove(oldMoveName: string) {
  if (!playerMonster.value || !newMoveAvailable.value) return;
  const equippedNames = monsterLevelStore.getEquippedMoveNames(
    playerMonster.value.id
  );
  const updated = equippedNames.map((name) =>
    name === oldMoveName ? newMoveAvailable.value!.name : name
  );
  monsterLevelStore.setEquippedMoveNames(playerMonster.value.id, updated);
  learnedMoveName.value = newMoveAvailable.value.name;
  showMoveSwapUI.value = false;
  moveSwapResolved.value = true;
  sfx.playLevelUp();
}

function skipNewMove() {
  showMoveSwapUI.value = false;
  moveSwapResolved.value = true;
}

function battleAgain() {
  sfx.playConfirm();
  gauntletStore.resetGauntlet();
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
  if (isGauntletResult.value) {
    // Re-enter gauntlet with same player monster
    gauntletStore.resetGauntlet();
    battleStore.$reset();
    gauntletStore.startGauntlet(playerId);
    const firstOpponent = gauntletStore.currentOpponent;
    battleStore.selectMonster(playerId, firstOpponent ?? undefined);
    router.push("/gauntlet");
  } else {
    battleStore.$reset();
    battleStore.selectMonster(playerId);
    router.push("/battle");
  }
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
            :icon="[
              'fas',
              isGauntletComplete
                ? 'shield-halved'
                : isVictory
                ? 'trophy'
                : 'skull',
            ]"
            :class="[
              'text-6xl sm:text-7xl mb-4',
              isGauntletComplete
                ? 'text-purple-400'
                : isVictory
                ? 'text-yellow-400'
                : 'text-red-500',
            ]"
            :style="{
              filter: isGauntletComplete
                ? 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.6))'
                : isVictory
                ? 'drop-shadow(0 0 20px rgba(250, 204, 21, 0.5))'
                : 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))',
            }"
          />
          <GlowText
            tag="h1"
            :color="
              isGauntletComplete
                ? '#a855f7'
                : isTournamentChampion
                ? '#facc15'
                : isVictory
                ? '#facc15'
                : '#ef4444'
            "
            class="text-4xl sm:text-5xl"
          >
            {{
              isGauntletComplete
                ? "GAUNTLET CLEARED!"
                : isGauntletFailed
                ? "GAUNTLET OVER..."
                : isTournamentChampion
                ? "CHAMPION!"
                : isVictory
                ? "VICTORY!"
                : "DEFEATED..."
            }}
          </GlowText>
        </div>

        <!-- Tournament Champion Banner -->
        <div
          v-if="isTournamentChampion && !isGauntletResult"
          class="text-center py-4 px-5 rounded-xl border border-yellow-400/40 bg-yellow-500/10"
        >
          <p
            class="text-yellow-300 font-bold text-sm tracking-widest uppercase mb-1"
          >
            Tournament Complete
          </p>
          <p class="text-white/60 text-xs">
            All 24 monsters unlocked &mdash; free play is now active!
          </p>
        </div>

        <!-- Newly Unlocked Monster Banner (normal mode) -->
        <div
          v-else-if="newlyUnlocked && !isGauntletResult"
          class="text-center py-3 px-5 rounded-xl border border-purple-400/40 bg-purple-500/10"
        >
          <p
            class="text-purple-300 font-bold text-xs tracking-widest uppercase mb-1"
          >
            New Monster Unlocked
          </p>
          <p class="text-white font-bold text-base">{{ newlyUnlocked }}</p>
        </div>

        <!-- Gauntlet Unlocked Monsters -->
        <div
          v-if="isGauntletResult && gauntletStore.defeatedMonsters.length"
          class="text-center py-4 px-5 rounded-xl border border-purple-400/40 bg-purple-500/10 space-y-3"
        >
          <p
            class="text-purple-300 font-bold text-xs tracking-widest uppercase"
          >
            {{
              isGauntletComplete
                ? "Monsters Unlocked"
                : "Monsters Unlocked So Far"
            }}
          </p>
          <div class="flex flex-wrap items-center justify-center gap-2">
            <span
              v-for="m in gauntletStore.defeatedMonsters"
              :key="m.id"
              class="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border"
              :style="{
                color: m.color,
                borderColor: m.color + '44',
                backgroundColor: m.color + '11',
              }"
            >
              <font-awesome-icon
                :icon="['fas', 'lock-open']"
                class="text-[10px]"
              />
              {{ m.name }}
            </span>
          </div>
          <p v-if="isGauntletFailed" class="text-white/40 text-xs">
            Round {{ gauntletStore.currentRound }} /
            {{ gauntletStore.totalRounds }}
          </p>
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

          <!-- Monster XP Section -->
          <div class="pt-3 border-t border-white/10">
            <div class="flex items-center justify-between text-sm mb-2">
              <span class="text-white/50 flex items-center gap-1.5">
                <font-awesome-icon
                  :icon="['fas', 'paw']"
                  class="text-purple-400"
                />
                {{ playerMonster?.name }} XP
              </span>
              <span class="font-bold text-purple-400"
                >+{{ monsterXPEarned }}</span
              >
            </div>

            <!-- Monster XP Bar -->
            <div
              class="h-3 bg-black/60 rounded-full overflow-hidden border border-white/10"
            >
              <div
                ref="monsterXPBarRef"
                class="h-full rounded-full bg-linear-to-r from-purple-500 to-purple-300"
                :style="{
                  width: playerMonster
                    ? `${
                        monsterLevelStore.getLevel(playerMonster.id) >=
                        monsterLevelStore.maxLevel
                          ? 100
                          : (monsterLevelStore.getXP(playerMonster.id) /
                              Math.max(
                                monsterLevelStore.getXPToNextLevel(
                                  monsterLevelStore.getLevel(playerMonster.id)
                                ),
                                1
                              )) *
                            100
                      }%`
                    : '0%',
                  boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
                }"
              />
            </div>

            <div
              class="flex items-center justify-between mt-1 text-[10px] text-white/40"
            >
              <span>Lv.{{ monsterNewLevel }}</span>
              <span v-if="monsterNewLevel >= monsterLevelStore.maxLevel"
                >MAX</span
              >
              <span v-else>
                {{ monsterLevelStore.getXP(playerMonster?.id ?? "") }} /
                {{ monsterLevelStore.getXPToNextLevel(monsterNewLevel) }}
              </span>
            </div>
          </div>

          <!-- Monster Level Up -->
          <div
            v-if="monsterDidLevelUp"
            class="text-center py-2 px-4 rounded-lg bg-purple-500/10 border border-purple-500/30"
          >
            <span
              class="text-purple-400 font-bold text-sm flex items-center justify-center gap-2"
            >
              <font-awesome-icon :icon="['fas', 'arrow-up']" />
              {{ playerMonster?.name }} is now Lv.{{ monsterNewLevel }}!
              <font-awesome-icon :icon="['fas', 'arrow-up']" />
            </span>
          </div>

          <!-- Auto-learned Move Banner -->
          <div
            v-if="learnedMoveName && moveSwapResolved && !showMoveSwapUI"
            class="text-center py-3 px-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30"
          >
            <p
              class="text-cyan-300 font-bold text-xs tracking-widest uppercase mb-1"
            >
              New Move Learned!
            </p>
            <p class="text-white font-bold text-sm">{{ learnedMoveName }}</p>
          </div>

          <!-- Move Swap UI -->
          <div
            v-if="showMoveSwapUI && newMoveAvailable"
            class="rounded-xl border border-cyan-400/40 bg-cyan-500/5 p-4 space-y-3"
          >
            <p
              class="text-cyan-300 font-bold text-xs tracking-widest uppercase text-center"
            >
              New Move Available!
            </p>

            <!-- New Move Card -->
            <div
              class="p-3 rounded-lg border-2 border-cyan-400/40 bg-cyan-500/10"
            >
              <div
                class="flex items-center gap-2 text-sm font-bold"
                :style="{
                  color: ELEMENT_COLORS[newMoveAvailable.element],
                }"
              >
                <font-awesome-icon
                  :icon="['fas', 'wand-sparkles']"
                  class="text-xs"
                />
                {{ newMoveAvailable.name }}
                <span class="ml-auto text-white/40 text-xs"
                  >PWR {{ newMoveAvailable.power }} &middot; ACC
                  {{ newMoveAvailable.accuracy }}%</span
                >
              </div>
              <p class="text-[10px] text-white/50 mt-1">
                {{ newMoveAvailable.description }}
              </p>
            </div>

            <p class="text-white/50 text-xs text-center">
              Choose a move to replace:
            </p>

            <!-- Current Equipped Specials -->
            <div class="space-y-1.5">
              <button
                v-for="move in currentEquippedSpecials"
                :key="move.name"
                class="w-full p-2.5 rounded-lg border border-white/10 bg-white/5 text-left transition-all duration-200 hover:border-red-400/40 hover:bg-red-500/10 cursor-pointer group"
                @click="swapMove(move.name)"
              >
                <div class="flex items-center gap-2 text-sm font-semibold">
                  <font-awesome-icon
                    :icon="['fas', 'wand-sparkles']"
                    class="text-xs"
                    :style="{
                      color: ELEMENT_COLORS[move.element],
                    }"
                  />
                  <span
                    :style="{
                      color: ELEMENT_COLORS[move.element],
                    }"
                  >
                    {{ move.name }}
                  </span>
                  <span class="ml-auto text-white/40 text-xs"
                    >PWR {{ move.power }}</span
                  >
                  <font-awesome-icon
                    :icon="['fas', 'arrow-right-arrow-left']"
                    class="text-[10px] text-white/20 group-hover:text-red-400 transition-colors"
                  />
                </div>
              </button>
            </div>

            <button
              class="w-full text-center text-xs text-white/30 hover:text-white/60 transition-colors py-1 cursor-pointer"
              @click="skipNewMove"
            >
              Skip — keep current moves
            </button>
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
            {{ isGauntletResult ? "Retry Gauntlet" : "Rematch" }}
          </BaseButton>
        </div>
      </div>
    </Transition>
  </div>
</template>
