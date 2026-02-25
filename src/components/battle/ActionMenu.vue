<script setup lang="ts">
import { computed } from "vue";
import type { ActionType, BattleMonster, MoveEffect } from "@/types";
import { ELEMENT_COLORS, ELEMENT_ICONS } from "@/types";

interface Props {
  monster: BattleMonster;
  disabled?: boolean;
  disableRun?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  disableRun: false,
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

const effectMeta: Record<string, { label: string; color: string }> = {
  poison: { label: "PSN", color: "#86efac" },
  stun: { label: "STN", color: "#fde047" },
  sleep: { label: "SLP", color: "#a5b4fc" },
  heal: { label: "HEAL", color: "#34d399" },
  burn: { label: "BRN", color: "#f97316" },
  freeze: { label: "FRZ", color: "#7dd3fc" },
  confusion: { label: "CNF", color: "#e879f9" },
};

const moveActions = computed(() =>
  props.monster.moves.map((move, index) => ({
    type: `move${index}` as ActionType,
    label: move.name,
    icon: index === 0 ? "hand-fist" : "wand-sparkles",
    elementIcon: ELEMENT_ICONS[move.element],
    color: ELEMENT_COLORS[move.element],
    power: move.power,
    accuracy: move.accuracy,
    effect: move.effect ?? null,
  }))
);

const utilityActions = computed(() => [
  {
    type: "guard" as ActionType,
    label: "Guard",
    icon: "shield-halved",
    color: "#00bfff",
  },
  {
    type: "run" as ActionType,
    label: "Run",
    icon: "person-running",
    color: "#888888",
  },
]);
</script>

<template>
  <div class="action-menu space-y-2">
    <!-- Move Buttons -->
    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="action in moveActions"
        :key="action.type"
        :disabled="props.disabled"
        :class="[
          'relative flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 p-2.5 sm:p-3',
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
          boxShadow: props.disabled
            ? 'none'
            : `inset 0 0 20px ${action.color}11`,
        }"
        @mouseenter="onHover($event, action.color)"
        @mouseleave="onLeave($event, action.color)"
        @click="emit('action', action.type)"
      >
        <font-awesome-icon
          :icon="['fas', action.icon]"
          class="text-base sm:text-lg"
        />
        <span class="text-xs sm:text-sm leading-tight">{{ action.label }}</span>
        <div class="flex items-center gap-1">
          <span class="text-[10px] opacity-50"> PWR {{ action.power }} </span>
          <span
            v-if="action.effect"
            class="text-[9px] font-bold px-1 rounded"
            :style="{
              color: effectMeta[action.effect.type]?.color,
              backgroundColor: effectMeta[action.effect.type]?.color + '22',
            }"
          >
            {{ effectMeta[action.effect.type]?.label }}
            {{ action.effect.chance < 100 ? action.effect.chance + "%" : "" }}
          </span>
        </div>
      </button>
    </div>

    <!-- Utility Buttons (Guard + Run) -->
    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="action in utilityActions"
        :key="action.type"
        :disabled="
          props.disabled || (props.disableRun && action.type === 'run')
        "
        :title="
          props.disableRun && action.type === 'run'
            ? `Can't flee a gauntlet!`
            : undefined
        "
        :class="[
          'relative flex items-center justify-center gap-2 rounded-xl border-2 p-2 sm:p-2.5',
          'font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer',
          'hover:scale-105 active:scale-95',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100',
          'bg-black/40 backdrop-blur-sm',
        ]"
        :style="{
          borderColor: props.disabled
            ? 'rgba(255,255,255,0.1)'
            : action.color + '44',
          color: action.color,
          boxShadow: props.disabled
            ? 'none'
            : `inset 0 0 20px ${action.color}11`,
        }"
        @mouseenter="onHover($event, action.color)"
        @mouseleave="onLeave($event, action.color)"
        @click="emit('action', action.type)"
      >
        <font-awesome-icon :icon="['fas', action.icon]" class="text-sm" />
        <span>{{ action.label }}</span>
      </button>
    </div>
  </div>
</template>
