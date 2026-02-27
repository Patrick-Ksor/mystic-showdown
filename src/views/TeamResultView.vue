<script setup lang="ts">
import { ref, nextTick, onMounted } from "vue";
import { useRouter } from "vue-router";
import gsap from "gsap";
import { useTeamBattleStore } from "@/stores/useTeamBattleStore";
import { useGameStore } from "@/stores/useGameStore";
import { useSoundEffects } from "@/composables/useSoundEffects";
import { useConfetti } from "@/composables/useConfetti";
import type { BattleMonster } from "@/types";
import { ELEMENT_COLORS, EVOLUTION_LEVEL } from "@/types";
import MonsterSprite from "@/components/monsters/MonsterSprite.vue";
import ElementBadge from "@/components/ui/ElementBadge.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import GlowText from "@/components/ui/GlowText.vue";

const router = useRouter();
const teamBattleStore = useTeamBattleStore();
const gameStore = useGameStore();
const sfx = useSoundEffects();
const { burst } = useConfetti();

// ─── Snapshot state before any reset ────────────────────────
const isVictory = ref(teamBattleStore.phase === "victory");
const playerTeam = ref<BattleMonster[]>([]);
const enemyTeam = ref<BattleMonster[]>([]);
const turnCount = ref(0);

// ─── Refs ───────────────────────────────────────────────────
const bannerRef = ref<HTMLElement | null>(null);
const cardsRef = ref<HTMLElement | null>(null);
const showBanner = ref(false);

function displayName(m: BattleMonster): string {
  if (m.level >= EVOLUTION_LEVEL && m.evolution?.evolvedName) {
    return m.evolution.evolvedName;
  }
  return m.name;
}

function hpPercent(m: BattleMonster): number {
  return Math.max(0, Math.round((m.currentHP / m.maxHP) * 100));
}

function hpBarColor(pct: number): string {
  if (pct > 50) return "#22c55e";
  if (pct > 20) return "#f59e0b";
  return "#ef4444";
}

onMounted(async () => {
  // Snapshot before reset
  if (!teamBattleStore.playerTeam.length) {
    router.push("/team-select");
    return;
  }

  playerTeam.value = teamBattleStore.playerTeam.map((m) => ({ ...m }));
  enemyTeam.value = teamBattleStore.enemyTeam.map((m) => ({ ...m }));
  turnCount.value = teamBattleStore.turnCount;

  // Record win/loss
  if (isVictory.value) {
    gameStore.recordWin();
  } else {
    gameStore.recordLoss();
  }

  // Reset store — no longer needed
  teamBattleStore.$reset();

  // ── Animate entrance ──
  showBanner.value = true;
  await nextTick(); // ensure bannerRef is mounted before animating/confetti

  if (isVictory.value) {
    sfx.playVictory();
    if (bannerRef.value) burst(bannerRef.value, 80);
  } else {
    sfx.playDefeat();
  }

  if (bannerRef.value) {
    gsap.fromTo(
      bannerRef.value,
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(2)" }
    );
  }

  await new Promise<void>((resolve) => setTimeout(resolve, 350));

  if (cardsRef.value) {
    const cards = cardsRef.value.querySelectorAll(".result-card");
    const enemyCards = cardsRef.value.querySelectorAll(".enemy-card");
    gsap.fromTo(
      cards,
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.35,
        stagger: 0.08,
        ease: "power2.out",
        onComplete: () => {
          // Dim enemy cards after entrance when player won
          if (isVictory.value && enemyCards.length) {
            gsap.to(enemyCards, { opacity: 0.45, duration: 0.3 });
          }
        },
      }
    );
  }
});

function goAgain() {
  router.push("/team-select");
}

function goHome() {
  router.push("/");
}
</script>

<template>
  <div
    class="min-h-screen bg-[#0d0d1a] text-white flex flex-col items-center px-4 py-8 overflow-y-auto"
  >
    <!-- Background grid -->
    <div
      class="fixed inset-0 pointer-events-none opacity-[0.03]"
      style="
        background-image: linear-gradient(
            rgba(168, 85, 247, 0.5) 1px,
            transparent 1px
          ),
          linear-gradient(90deg, rgba(168, 85, 247, 0.5) 1px, transparent 1px);
        background-size: 48px 48px;
      "
    />

    <div class="relative z-10 w-full max-w-xl flex flex-col gap-6">
      <!-- ── Hero Banner ───────────────────────────────────── -->
      <div
        v-if="showBanner"
        ref="bannerRef"
        class="text-center py-4"
        style="opacity: 0"
      >
        <GlowText
          :text="isVictory ? 'VICTORY!' : 'DEFEATED...'"
          :color="isVictory ? '#a855f7' : '#ef4444'"
          class="text-5xl sm:text-6xl font-black tracking-widest"
        />
        <p class="text-white/40 text-sm mt-2 font-mono tracking-wider">
          Team Battle &bull; {{ turnCount }} turns
        </p>
      </div>

      <!-- ── Cards container ───────────────────────────────── -->
      <div ref="cardsRef">
        <!-- Your Team -->
        <div class="mb-5">
          <p
            class="text-xs text-white/40 uppercase tracking-widest font-semibold mb-3 pl-1"
          >
            Your Team
          </p>
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="monster in playerTeam"
              :key="monster.id"
              class="result-card rounded-xl border p-3 flex flex-col items-center gap-2 opacity-0"
              :style="{
                borderColor: ELEMENT_COLORS[monster.element] + '44',
                background: `linear-gradient(160deg, ${
                  ELEMENT_COLORS[monster.element]
                }08, #0d0d1a)`,
              }"
            >
              <!-- Sprite -->
              <div
                class="w-16 h-16 flex items-center justify-center"
                :class="{ 'opacity-40 grayscale': monster.currentHP === 0 }"
              >
                <MonsterSprite :monster="monster" side="player" />
              </div>

              <!-- Name + element -->
              <p class="text-[11px] font-bold text-center leading-tight">
                {{ displayName(monster) }}
              </p>
              <ElementBadge :element="monster.element" size="xs" />

              <!-- HP bar -->
              <div class="w-full">
                <div
                  class="w-full h-1.5 rounded-full bg-white/10 overflow-hidden"
                >
                  <div
                    class="h-full rounded-full transition-none"
                    :style="{
                      width: hpPercent(monster) + '%',
                      backgroundColor: hpBarColor(hpPercent(monster)),
                      boxShadow: `0 0 6px ${hpBarColor(hpPercent(monster))}88`,
                    }"
                  />
                </div>
                <p class="text-[9px] text-white/30 text-right mt-0.5 font-mono">
                  {{ monster.currentHP }}/{{ monster.maxHP }}
                </p>
              </div>

              <!-- Status chip -->
              <div
                class="text-[9px] font-bold px-2 py-0.5 rounded-full"
                :class="
                  monster.currentHP > 0
                    ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                    : 'bg-red-500/15 text-red-400 border border-red-500/30'
                "
              >
                {{ monster.currentHP > 0 ? "Survived" : "KO'd" }}
              </div>
            </div>
          </div>
        </div>

        <!-- Enemy Team -->
        <div class="mb-5">
          <p
            class="text-xs text-white/40 uppercase tracking-widest font-semibold mb-3 pl-1"
          >
            {{ isVictory ? "Defeated Team" : "Opposing Team" }}
          </p>
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="monster in enemyTeam"
              :key="monster.id"
              class="result-card enemy-card rounded-xl border p-3 flex flex-col items-center gap-2 opacity-0"
              :style="{
                borderColor: ELEMENT_COLORS[monster.element] + '33',
                background: `linear-gradient(160deg, ${
                  ELEMENT_COLORS[monster.element]
                }05, #0d0d1a)`,
              }"
            >
              <!-- Sprite -->
              <div
                class="w-16 h-16 flex items-center justify-center"
                :class="{ 'grayscale opacity-40': isVictory }"
              >
                <MonsterSprite :monster="monster" side="enemy" />
              </div>

              <!-- Name + element -->
              <p class="text-[11px] font-bold text-center leading-tight">
                {{ displayName(monster) }}
              </p>
              <ElementBadge :element="monster.element" size="xs" />

              <!-- HP bar -->
              <div class="w-full">
                <div
                  class="w-full h-1.5 rounded-full bg-white/10 overflow-hidden"
                >
                  <div
                    class="h-full rounded-full transition-none"
                    :style="{
                      width: hpPercent(monster) + '%',
                      backgroundColor: hpBarColor(hpPercent(monster)),
                    }"
                  />
                </div>
                <p class="text-[9px] text-white/30 text-right mt-0.5 font-mono">
                  {{ monster.currentHP }}/{{ monster.maxHP }}
                </p>
              </div>

              <!-- Status chip -->
              <div
                class="text-[9px] font-bold px-2 py-0.5 rounded-full"
                :class="
                  monster.currentHP > 0
                    ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                    : 'bg-red-500/15 text-red-400 border border-red-500/30'
                "
              >
                {{ monster.currentHP > 0 ? "Alive" : "KO'd" }}
              </div>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="result-card grid grid-cols-2 gap-3 opacity-0">
          <BaseButton
            variant="primary"
            size="lg"
            icon="rotate-right"
            class="w-full"
            @click="goAgain"
          >
            Battle Again
          </BaseButton>
          <BaseButton
            variant="secondary"
            size="lg"
            icon="house"
            class="w-full"
            @click="goHome"
          >
            Main Menu
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
