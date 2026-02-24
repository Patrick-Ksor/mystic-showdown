<script setup lang="ts">
interface Props {
  variant?:
    | "primary"
    | "danger"
    | "ghost"
    | "fire"
    | "water"
    | "electric"
    | "earth"
    | "ice"
    | "shadow";
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  disabled: false,
  size: "md",
});

const sizeClasses: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const variantClasses: Record<string, string> = {
  primary:
    "bg-purple-600/80 hover:bg-purple-500 border-purple-400/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]",
  danger:
    "bg-red-600/80 hover:bg-red-500 border-red-400/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]",
  ghost:
    "bg-transparent hover:bg-white/10 border-white/20 hover:border-white/40",
  fire: "bg-orange-600/80 hover:bg-orange-500 border-orange-400/50 hover:shadow-[0_0_20px_rgba(255,77,0,0.5)]",
  water:
    "bg-cyan-600/80 hover:bg-cyan-500 border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,191,255,0.5)]",
  electric:
    "bg-yellow-600/80 hover:bg-yellow-500 border-yellow-400/50 hover:shadow-[0_0_20px_rgba(255,228,77,0.5)]",
  earth:
    "bg-amber-700/80 hover:bg-amber-600 border-amber-500/50 hover:shadow-[0_0_20px_rgba(196,138,42,0.5)]",
  ice: "bg-sky-500/80 hover:bg-sky-400 border-sky-300/50 hover:shadow-[0_0_20px_rgba(127,219,255,0.5)]",
  shadow:
    "bg-violet-700/80 hover:bg-violet-600 border-violet-400/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]",
};
</script>

<template>
  <button
    :class="[
      'relative inline-flex items-center justify-center gap-2 font-bold rounded-lg border',
      'transition-all duration-200 cursor-pointer select-none',
      'active:scale-95 hover:scale-105',
      'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none',
      sizeClasses[props.size],
      variantClasses[props.variant],
    ]"
    :disabled="props.disabled"
  >
    <font-awesome-icon
      v-if="props.icon"
      :icon="['fas', props.icon]"
      class="text-[0.9em]"
    />
    <slot />
  </button>
</template>
