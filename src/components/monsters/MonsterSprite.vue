<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import type { BattleMonster } from "@/types";
import { ELEMENT_COLORS, EVOLUTION_LEVEL } from "@/types";
import { animateIdle } from "@/composables/useBattleAnimations";

interface Props {
  monster: BattleMonster;
  side: "player" | "enemy";
}

const props = defineProps<Props>();

const spriteRef = ref<HTMLElement | null>(null);
let idleTween: gsap.core.Tween | null = null;

const isEvolved = computed(
  () => props.monster.level >= EVOLUTION_LEVEL && !!props.monster.evolution
);

const spriteFilter = computed(() => {
  const base = `drop-shadow(0 0 10px ${props.monster.color}44)`;
  if (!isEvolved.value || !props.monster.evolution) return base;
  const secondaryColor =
    ELEMENT_COLORS[props.monster.evolution.secondaryElement];
  return `brightness(1.18) saturate(1.5) drop-shadow(0 0 18px ${secondaryColor}) drop-shadow(0 0 6px ${props.monster.color}66)`;
});

const statusMeta = computed(() => {
  const s = props.monster.statusEffect;
  if (!s) return null;
  const map: Record<string, { icon: string; color: string; cls: string }> = {
    poison: { icon: "skull", color: "#86efac", cls: "animate-pulse" },
    stun: { icon: "bolt", color: "#fde047", cls: "animate-bounce" },
    sleep: { icon: "moon", color: "#a5b4fc", cls: "status-float" },
  };
  const meta = map[s.type];
  return meta ? { ...meta, turnsLeft: s.turnsLeft } : null;
});

onMounted(() => {
  if (spriteRef.value) {
    idleTween = animateIdle(spriteRef.value);
  }
});

onBeforeUnmount(() => {
  idleTween?.kill();
});

defineExpose({
  el: spriteRef,
});
</script>

<template>
  <div
    ref="spriteRef"
    :class="[
      'monster-sprite relative flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80',
    ]"
  >
    <img
      :src="
        isEvolved && props.monster.evolution?.evolvedSpriteUrl
          ? props.monster.evolution.evolvedSpriteUrl
          : props.monster.spriteUrl
      "
      :alt="props.monster.name"
      :class="[
        'w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]',
        props.side === 'enemy' ? '' : '',
      ]"
      :style="{
        filter: spriteFilter,
        transform: props.side === 'enemy' ? 'scaleX(-1)' : undefined,
      }"
    />

    <!-- Status condition overlay -->
    <div
      v-if="statusMeta"
      class="absolute top-1 right-1 z-10 pointer-events-none"
    >
      <span
        :class="[
          'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold border border-white/20',
          statusMeta.cls,
        ]"
        :style="{
          color: statusMeta.color,
          backgroundColor: statusMeta.color + '28',
          boxShadow: `0 0 8px ${statusMeta.color}44`,
        }"
      >
        <font-awesome-icon
          :icon="['fas', statusMeta.icon]"
          class="text-[10px]"
        />
        {{ statusMeta.turnsLeft }}
      </span>
    </div>
  </div>
</template>
