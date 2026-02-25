<script setup lang="ts">
import { onMounted, ref } from "vue";
import gsap from "gsap";
import type { MonsterDefinition } from "@/types";
import { ELEMENT_COLORS, ELEMENT_ICONS } from "@/types";

interface Props {
  currentRound: number;
  totalRounds: number;
  opponent: MonsterDefinition | null;
}

const props = defineProps<Props>();
const bannerRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (bannerRef.value) {
    gsap.fromTo(
      bannerRef.value,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.5)" }
    );
  }
});
</script>

<template>
  <div
    ref="bannerRef"
    class="flex items-center justify-between px-4 py-2 sm:px-6 bg-black/60 backdrop-blur-sm border-b border-white/10"
  >
    <!-- Round indicator pills -->
    <div class="flex items-center gap-2">
      <span
        class="text-white/50 text-xs font-semibold tracking-widest uppercase"
      >
        Gauntlet
      </span>
      <div class="flex items-center gap-1 ml-2">
        <div
          v-for="n in props.totalRounds"
          :key="n"
          :class="[
            'w-2.5 h-2.5 rounded-full border transition-all duration-300',
            n < props.currentRound
              ? 'bg-green-400 border-green-400'
              : n === props.currentRound
              ? 'bg-purple-400 border-purple-400 shadow-[0_0_8px_#a855f7]'
              : 'bg-transparent border-white/20',
          ]"
        />
      </div>
      <span class="text-white font-bold text-sm ml-1">
        Round {{ props.currentRound }}/{{ props.totalRounds }}
      </span>
    </div>

    <!-- Opponent preview -->
    <div v-if="props.opponent" class="flex items-center gap-2 text-xs">
      <span class="text-white/40">vs</span>
      <font-awesome-icon
        :icon="['fas', ELEMENT_ICONS[props.opponent.element]]"
        :style="{ color: ELEMENT_COLORS[props.opponent.element] }"
        class="text-sm"
      />
      <span
        class="font-bold"
        :style="{ color: ELEMENT_COLORS[props.opponent.element] }"
      >
        {{ props.opponent.name }}
      </span>
    </div>

    <!-- Sword icon right -->
    <div class="flex items-center gap-1 text-purple-400/60">
      <font-awesome-icon :icon="['fas', 'swords']" class="text-sm" />
    </div>
  </div>
</template>
