<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import gsap from "gsap";
import type { ElementType } from "@/types";
import { ELEMENT_COLORS } from "@/types";
import ElementBadge from "@/components/ui/ElementBadge.vue";

interface Props {
  currentHP: number;
  maxHP: number;
  monsterName: string;
  element: ElementType;
  level: number;
  side: "player" | "enemy";
}

const props = defineProps<Props>();

const barRef = ref<HTMLElement | null>(null);
const displayHP = ref(props.currentHP);
const previousHP = ref(props.currentHP);

const hpPercent = computed(() => {
  return Math.max(0, (displayHP.value / props.maxHP) * 100);
});

const barColor = computed(() => {
  const pct = hpPercent.value;
  if (pct > 50) return "#00ff88";
  if (pct > 25) return "#ffdd00";
  return "#ff2244";
});

const barGlow = computed(() => {
  return `0 0 8px ${barColor.value}66, 0 0 16px ${barColor.value}22`;
});

// Animate HP changes
watch(
  () => props.currentHP,
  (newHP) => {
    const oldDisplay = displayHP.value;
    previousHP.value = oldDisplay;

    // Tween the displayed number
    gsap.to(
      { val: oldDisplay },
      {
        val: newHP,
        duration: 0.6,
        ease: "power2.out",
        onUpdate: function () {
          displayHP.value = Math.round(
            (this.targets()[0] as { val: number }).val
          );
        },
      }
    );

    // Flash effect on the bar
    if (barRef.value && newHP < oldDisplay) {
      gsap.fromTo(
        barRef.value,
        { filter: "brightness(2.5)" },
        { filter: "brightness(1)", duration: 0.4 }
      );
    }
  }
);

onMounted(() => {
  displayHP.value = props.currentHP;
});
</script>

<template>
  <div
    :class="[
      'health-bar-container rounded-lg border border-white/10 p-3',
      'bg-black/40 backdrop-blur-sm',
      props.side === 'player' ? 'mr-auto' : 'ml-auto',
    ]"
    style="min-width: 220px; max-width: 280px"
  >
    <!-- Name and Level -->
    <div class="flex items-center justify-between mb-1.5">
      <div class="flex items-center gap-2">
        <span class="font-bold text-sm text-white">{{
          props.monsterName
        }}</span>
        <ElementBadge :element="props.element" size="sm" />
      </div>
      <span class="text-xs text-white/50 flex items-center gap-1">
        <font-awesome-icon
          :icon="['fas', 'star']"
          class="text-yellow-400 text-[10px]"
        />
        Lv.{{ props.level }}
      </span>
    </div>

    <!-- HP Bar -->
    <div
      class="relative h-4 bg-black/60 rounded-full overflow-hidden border border-white/10"
    >
      <div
        ref="barRef"
        class="absolute top-0 left-0 h-full rounded-full transition-none"
        :style="{
          width: `${hpPercent}%`,
          backgroundColor: barColor,
          boxShadow: barGlow,
        }"
      />
    </div>

    <!-- HP Text -->
    <div class="flex items-center justify-between mt-1">
      <span class="text-[10px] text-white/40 font-medium">HP</span>
      <span class="text-xs font-mono font-bold" :style="{ color: barColor }">
        {{ displayHP }} / {{ props.maxHP }}
      </span>
    </div>
  </div>
</template>
