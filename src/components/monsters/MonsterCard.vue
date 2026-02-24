<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import gsap from "gsap";
import type { MonsterDefinition } from "@/types";
import { ELEMENT_COLORS } from "@/types";
import ElementBadge from "@/components/ui/ElementBadge.vue";

interface Props {
  monster: MonsterDefinition;
  selected?: boolean;
  isLocked?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  isLocked: false,
});

const emit = defineEmits<{
  select: [id: string];
}>();

const cardRef = ref<HTMLElement | null>(null);
let hoverTween: gsap.core.Tween | null = null;

function onMouseEnter() {
  if (!cardRef.value || props.selected || props.isLocked) return;
  hoverTween = gsap.to(cardRef.value, {
    scale: 1.05,
    duration: 0.25,
    ease: "back.out(1.5)",
  });
}

function onMouseLeave() {
  if (!cardRef.value || props.selected || props.isLocked) return;
  hoverTween?.kill();
  gsap.to(cardRef.value, {
    scale: 1,
    duration: 0.2,
    ease: "power2.out",
  });
}

onMounted(() => {
  if (props.selected && cardRef.value) {
    gsap.to(cardRef.value, { scale: 1.05, duration: 0.3 });
  }
});

onBeforeUnmount(() => {
  hoverTween?.kill();
});
</script>

<template>
  <div
    ref="cardRef"
    :class="[
      'relative rounded-xl border-2 p-4 transition-colors duration-200',
      'bg-linear-to-b from-white/5 to-white/2 backdrop-blur-sm',
      props.isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      !props.isLocked && !props.selected
        ? 'border-white/10 hover:border-opacity-60'
        : '',
      props.selected && !props.isLocked ? 'border-opacity-100' : '',
    ]"
    :style="{
      borderColor:
        props.selected && !props.isLocked
          ? ELEMENT_COLORS[props.monster.element]
          : undefined,
      boxShadow:
        props.selected && !props.isLocked
          ? `0 0 25px ${
              ELEMENT_COLORS[props.monster.element]
            }44, inset 0 0 25px ${ELEMENT_COLORS[props.monster.element]}11`
          : 'none',
      filter: props.isLocked ? 'grayscale(100%)' : undefined,
    }"
    @click="!props.isLocked && emit('select', props.monster.id)"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- Selected indicator -->
    <div
      v-if="props.selected"
      class="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
      :style="{ backgroundColor: ELEMENT_COLORS[props.monster.element] }"
    >
      <font-awesome-icon :icon="['fas', 'check']" />
    </div>

    <!-- Lock overlay -->
    <div
      v-if="props.isLocked"
      class="absolute inset-0 flex flex-col items-center justify-center rounded-xl z-10"
    >
      <font-awesome-icon
        :icon="['fas', 'lock']"
        class="text-white/60 text-2xl"
      />
    </div>

    <!-- Sprite -->
    <div
      class="w-full aspect-square mb-3 flex items-center justify-center overflow-hidden rounded-lg bg-black/20"
    >
      <img
        :src="props.monster.spriteUrl"
        :alt="props.monster.name"
        class="w-3/4 h-3/4 object-contain drop-shadow-lg"
      />
    </div>

    <!-- Name -->
    <h3
      class="text-base font-bold mb-1.5 truncate"
      :style="{
        color: props.isLocked
          ? '#ffffff44'
          : ELEMENT_COLORS[props.monster.element],
      }"
    >
      {{ props.isLocked ? "???" : props.monster.name }}
    </h3>

    <!-- Element badge -->
    <ElementBadge :element="props.monster.element" size="sm" class="mb-2" />

    <!-- Mini Stats -->
    <div class="grid grid-cols-3 gap-1 text-[10px] text-white/60">
      <div class="flex items-center gap-1">
        <font-awesome-icon :icon="['fas', 'heart']" class="text-red-400" />
        <span>{{ props.monster.baseHP }}</span>
      </div>
      <div class="flex items-center gap-1">
        <font-awesome-icon
          :icon="['fas', 'hand-fist']"
          class="text-orange-400"
        />
        <span>{{ props.monster.attack }}</span>
      </div>
      <div class="flex items-center gap-1">
        <font-awesome-icon
          :icon="['fas', 'shield-halved']"
          class="text-blue-400"
        />
        <span>{{ props.monster.defense }}</span>
      </div>
    </div>
  </div>
</template>
