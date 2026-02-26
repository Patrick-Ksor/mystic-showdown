<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import gsap from "gsap";
import type { MonsterDefinition } from "@/types";
import { ELEMENT_COLORS, EVOLUTION_LEVEL } from "@/types";
import ElementBadge from "@/components/ui/ElementBadge.vue";

interface Props {
  monster: MonsterDefinition;
  selected?: boolean;
  isLocked?: boolean;
  level?: number;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  isLocked: false,
  level: 1,
});

const emit = defineEmits<{
  select: [id: string];
}>();

const isEvolved = computed(
  () => props.level >= EVOLUTION_LEVEL && !!props.monster.evolution
);

const secondaryElement = computed(() =>
  isEvolved.value ? props.monster.evolution!.secondaryElement : null
);

const evolvedFilter = computed(() => {
  if (!isEvolved.value || !secondaryElement.value) return undefined;
  const c = ELEMENT_COLORS[secondaryElement.value];
  return `brightness(1.18) saturate(1.5) drop-shadow(0 0 14px ${c})`;
});

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
    <!-- Level badge -->
    <div
      v-if="!props.isLocked && props.level > 0"
      class="absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] font-bold text-yellow-400 z-10"
    >
      <font-awesome-icon :icon="['fas', 'star']" class="text-[8px]" />
      Lv.{{ props.level }}
    </div>

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
        :src="
          isEvolved && props.monster.evolution?.evolvedSpriteUrl
            ? props.monster.evolution.evolvedSpriteUrl
            : props.monster.spriteUrl
        "
        :alt="props.monster.name"
        class="w-3/4 h-3/4 object-contain drop-shadow-lg transition-[filter] duration-500"
        :style="{ filter: props.isLocked ? undefined : evolvedFilter }"
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
      {{
        props.isLocked
          ? "???"
          : isEvolved && props.monster.evolution
          ? props.monster.evolution.evolvedName
          : props.monster.name
      }}
    </h3>

    <!-- Element badge(s) -->
    <div class="flex flex-wrap items-center gap-1 mb-2 min-w-0">
      <ElementBadge
        :element="props.monster.element"
        :size="secondaryElement && !props.isLocked ? 'xs' : 'sm'"
      />
      <template v-if="!props.isLocked && secondaryElement">
        <span class="text-white/30 text-[9px] leading-none">+</span>
        <ElementBadge :element="secondaryElement" size="xs" />
      </template>
    </div>

    <!-- Mini Stats -->
    <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-white/60">
      <div class="flex items-center gap-1">
        <font-awesome-icon :icon="['fas', 'heart']" class="text-red-400" />
        <span>{{
          Math.floor(props.monster.baseHP * (1 + 0.02 * (props.level - 1)))
        }}</span>
      </div>
      <div class="flex items-center gap-1">
        <font-awesome-icon
          :icon="['fas', 'hand-fist']"
          class="text-orange-400"
        />
        <span>{{
          Math.floor(props.monster.attack * (1 + 0.02 * (props.level - 1)))
        }}</span>
      </div>
      <div class="flex items-center gap-1">
        <font-awesome-icon
          :icon="['fas', 'shield-halved']"
          class="text-blue-400"
        />
        <span>{{
          Math.floor(props.monster.defense * (1 + 0.02 * (props.level - 1)))
        }}</span>
      </div>
      <div class="flex items-center gap-1">
        <font-awesome-icon :icon="['fas', 'bolt']" class="text-yellow-400" />
        <span>{{
          Math.floor(props.monster.speed * (1 + 0.02 * (props.level - 1)))
        }}</span>
      </div>
    </div>
  </div>
</template>
