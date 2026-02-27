<script setup lang="ts">
import type { BattleMonster } from "@/types";
import { ELEMENT_COLORS, EVOLUTION_LEVEL } from "@/types";

interface Props {
  team: BattleMonster[];
  activeIndex: number;
  side: "player" | "enemy";
}

const props = defineProps<Props>();

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
</script>

<template>
  <div
    class="flex gap-2"
    :class="side === 'player' ? 'justify-start' : 'justify-end'"
  >
    <div
      v-for="(monster, idx) in team"
      :key="monster.id + '-' + idx"
      class="relative flex flex-col items-center gap-0.5 rounded-lg border transition-all duration-300 px-2 py-1.5"
      :class="[
        idx === activeIndex
          ? 'border-white/30 bg-white/10 scale-105'
          : monster.currentHP <= 0
          ? 'border-white/5 bg-black/20 opacity-40'
          : 'border-white/10 bg-black/20',
      ]"
      :style="{
        boxShadow:
          idx === activeIndex
            ? `0 0 10px ${ELEMENT_COLORS[monster.element]}55`
            : 'none',
      }"
    >
      <!-- Sprite -->
      <div class="relative w-10 h-10 flex items-center justify-center">
        <img
          :src="spriteUrl(monster)"
          :alt="displayName(monster)"
          class="w-full h-full object-contain"
          :class="monster.currentHP <= 0 ? 'grayscale' : ''"
          :style="{
            filter:
              monster.currentHP > 0
                ? `drop-shadow(0 0 4px ${ELEMENT_COLORS[monster.element]}88)`
                : undefined,
          }"
        />
        <!-- KO overlay -->
        <div
          v-if="monster.currentHP <= 0"
          class="absolute inset-0 flex items-center justify-center"
        >
          <font-awesome-icon
            :icon="['fas', 'xmark']"
            class="text-red-400 text-lg drop-shadow"
          />
        </div>
        <!-- Active indicator -->
        <div
          v-else-if="idx === activeIndex"
          class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white"
        />
      </div>

      <!-- HP bar -->
      <div class="w-10 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :style="{
            width: `${hpPercent(monster)}%`,
            backgroundColor: hpColor(monster),
          }"
        />
      </div>

      <!-- Name (tiny) -->
      <span
        class="text-[8px] font-bold truncate max-w-[42px] text-center"
        :style="{ color: ELEMENT_COLORS[monster.element] }"
      >
        {{ displayName(monster) }}
      </span>
    </div>
  </div>
</template>
