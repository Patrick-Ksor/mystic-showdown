<script setup lang="ts">
import type { BattleMonster } from "@/types";
import { ELEMENT_COLORS, EVOLUTION_LEVEL } from "@/types";
import ElementBadge from "@/components/ui/ElementBadge.vue";

interface Props {
  team: BattleMonster[];
  activeIndex: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  switch: [index: number];
}>();

function displayName(m: BattleMonster): string {
  if (m.level >= EVOLUTION_LEVEL && m.evolution?.evolvedName) {
    return m.evolution.evolvedName;
  }
  return m.name;
}

function spriteUrl(m: BattleMonster): string {
  if (m.level >= EVOLUTION_LEVEL && m.evolution?.evolvedSpriteUrl) {
    return m.evolution.evolvedSpriteUrl;
  }
  return m.spriteUrl;
}

function hpPercent(m: BattleMonster): number {
  return Math.max(0, (m.currentHP / m.maxHP) * 100);
}

function hpColor(m: BattleMonster): string {
  const pct = hpPercent(m);
  if (pct > 50) return "#00ff88";
  if (pct > 25) return "#ffdd00";
  return "#ff2244";
}

function secondaryElement(m: BattleMonster) {
  return m.level >= EVOLUTION_LEVEL
    ? m.evolution?.secondaryElement ?? null
    : null;
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
  >
    <!-- Header -->
    <p class="text-xs font-bold tracking-[0.3em] uppercase text-red-400 mb-2">
      Your monster fainted!
    </p>
    <p class="text-white/60 text-sm mb-6">Choose your next fighter</p>

    <!-- Monster cards -->
    <div class="flex flex-col gap-3 w-full max-w-xs">
      <template v-for="(monster, idx) in team" :key="monster.id + '-' + idx">
        <!-- Skip the active (just fainted) monster and already-fainted ones -->
        <button
          v-if="idx !== activeIndex && monster.currentHP > 0"
          class="flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer"
          :style="{
            borderColor: ELEMENT_COLORS[monster.element] + '88',
            backgroundColor: ELEMENT_COLORS[monster.element] + '12',
            boxShadow: `0 0 15px ${ELEMENT_COLORS[monster.element]}22`,
          }"
          @click="emit('switch', idx)"
        >
          <!-- Sprite -->
          <div
            class="w-16 h-16 rounded-lg flex items-center justify-center bg-black/30 shrink-0"
          >
            <img
              :src="spriteUrl(monster)"
              :alt="displayName(monster)"
              class="w-14 h-14 object-contain"
              :style="{
                filter: `drop-shadow(0 0 8px ${
                  ELEMENT_COLORS[monster.element]
                }88)`,
              }"
            />
          </div>

          <!-- Info -->
          <div class="flex-1 text-left">
            <div class="flex items-center gap-2 mb-1">
              <span
                class="font-black text-base"
                :style="{ color: ELEMENT_COLORS[monster.element] }"
              >
                {{ displayName(monster) }}
              </span>
              <span
                class="text-[10px] text-yellow-400 font-bold bg-black/30 px-1.5 py-0.5 rounded-full"
              >
                Lv.{{ monster.level }}
              </span>
            </div>

            <!-- Elements -->
            <div class="flex items-center gap-1 mb-2">
              <ElementBadge :element="monster.element" size="sm" />
              <template v-if="secondaryElement(monster)">
                <span class="text-white/30 text-[9px]">+</span>
                <ElementBadge :element="secondaryElement(monster)!" size="sm" />
              </template>
            </div>

            <!-- HP bar -->
            <div class="space-y-0.5">
              <div class="flex justify-between text-[10px] text-white/50">
                <span>HP</span>
                <span>{{ monster.currentHP }} / {{ monster.maxHP }}</span>
              </div>
              <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :style="{
                    width: `${hpPercent(monster)}%`,
                    backgroundColor: hpColor(monster),
                  }"
                />
              </div>
            </div>
          </div>

          <!-- Arrow -->
          <font-awesome-icon
            :icon="['fas', 'chevron-right']"
            class="text-white/30 text-sm shrink-0"
          />
        </button>
      </template>
    </div>
  </div>
</template>
