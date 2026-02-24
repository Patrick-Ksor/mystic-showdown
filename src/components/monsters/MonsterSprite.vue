<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import type { BattleMonster } from "@/types";
import { animateIdle } from "@/composables/useBattleAnimations";

interface Props {
  monster: BattleMonster;
  side: "player" | "enemy";
}

const props = defineProps<Props>();

const spriteRef = ref<HTMLElement | null>(null);
let idleTween: gsap.core.Tween | null = null;

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
      'monster-sprite relative flex items-center justify-center',
      props.side === 'player'
        ? 'w-64 h-64 sm:w-80 sm:h-80'
        : 'w-56 h-56 sm:w-72 sm:h-72',
    ]"
  >
    <img
      :src="props.monster.spriteUrl"
      :alt="props.monster.name"
      :class="[
        'w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]',
        props.side === 'enemy' ? '' : '',
      ]"
      :style="{
        filter: `drop-shadow(0 0 10px ${props.monster.color}44)`,
        transform: props.side === 'enemy' ? 'scaleX(-1)' : undefined,
      }"
    />
  </div>
</template>
