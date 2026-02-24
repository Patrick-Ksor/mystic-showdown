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
        ? 'w-32 h-32 sm:w-40 sm:h-40'
        : 'w-28 h-28 sm:w-36 sm:h-36',
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
