<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "@/stores/useGameStore";

const gameStore = useGameStore();

const xpInLevel = computed(() => gameStore.totalXP % gameStore.XP_PER_LEVEL);
const xpPercent = computed(
  () => (xpInLevel.value / gameStore.XP_PER_LEVEL) * 100
);
</script>

<template>
  <div
    class="fixed top-4 left-4 z-50 flex flex-col gap-1 px-3 py-2 rounded-xl bg-black/50 border border-white/10 backdrop-blur-sm min-w-[140px]"
  >
    <!-- Level badge -->
    <div class="flex items-center gap-1.5">
      <font-awesome-icon
        :icon="['fas', 'star']"
        class="text-yellow-400 text-[10px]"
      />
      <span class="text-purple-300 text-xs font-bold tracking-wide">
        Trainer Lv.{{ gameStore.playerLevel }}
      </span>
    </div>

    <!-- XP bar -->
    <div class="flex items-center gap-2">
      <div class="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-400 transition-all duration-500"
          :style="{ width: `${xpPercent}%` }"
        />
      </div>
      <span class="text-white/30 text-[9px] shrink-0">
        {{ xpInLevel }}/{{ gameStore.XP_PER_LEVEL }}
      </span>
    </div>
  </div>
</template>
