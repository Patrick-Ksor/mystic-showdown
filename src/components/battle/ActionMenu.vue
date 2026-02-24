<script setup lang="ts">
import { computed } from "vue";
import type { ActionType, BattleMonster } from "@/types";
import { ACTION_ICONS, ELEMENT_COLORS } from "@/types";

interface Props {
  monster: BattleMonster;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{
  action: [type: ActionType];
}>();

function onHover(event: Event, color: string) {
  const el = event.currentTarget as HTMLElement | null;
  if (el) el.style.boxShadow = `0 0 20px ${color}44, inset 0 0 20px ${color}22`;
}

function onLeave(event: Event, color: string) {
  const el = event.currentTarget as HTMLElement | null;
  if (el) el.style.boxShadow = `inset 0 0 20px ${color}11`;
}

const actions = computed(() => [
  {
    type: "strike" as ActionType,
    label: props.monster.basicMove.name,
    icon: ACTION_ICONS.strike,
    color: ELEMENT_COLORS[props.monster.element],
    power: props.monster.basicMove.power,
  },
  {
    type: "special" as ActionType,
    label: props.monster.specialMove.name,
    icon: ACTION_ICONS.special,
    color: ELEMENT_COLORS[props.monster.element],
    power: props.monster.specialMove.power,
  },
  {
    type: "guard" as ActionType,
    label: "Guard",
    icon: ACTION_ICONS.guard,
    color: "#00bfff",
    power: null,
  },
  {
    type: "run" as ActionType,
    label: "Run",
    icon: ACTION_ICONS.run,
    color: "#888888",
    power: null,
  },
]);
</script>

<template>
  <div class="action-menu grid grid-cols-2 gap-2 sm:gap-3">
    <button
      v-for="action in actions"
      :key="action.type"
      :disabled="props.disabled"
      :class="[
        'relative flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-3 sm:p-4',
        'font-bold text-sm transition-all duration-200 cursor-pointer',
        'hover:scale-105 active:scale-95',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100',
        'bg-black/40 backdrop-blur-sm',
      ]"
      :style="{
        borderColor: props.disabled
          ? 'rgba(255,255,255,0.1)'
          : action.color + '44',
        color: action.color,
        boxShadow: props.disabled ? 'none' : `inset 0 0 20px ${action.color}11`,
      }"
      @mouseenter="onHover($event, action.color)"
      @mouseleave="onLeave($event, action.color)"
      @click="emit('action', action.type)"
    >
      <font-awesome-icon
        :icon="['fas', action.icon]"
        class="text-lg sm:text-xl"
      />
      <span class="text-xs sm:text-sm">{{ action.label }}</span>
      <span v-if="action.power" class="text-[10px] opacity-50">
        PWR {{ action.power }}
      </span>
    </button>
  </div>
</template>
