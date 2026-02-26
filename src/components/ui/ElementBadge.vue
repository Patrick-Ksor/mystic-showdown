<script setup lang="ts">
import type { ElementType } from "@/types";
import { ELEMENT_ICONS, ELEMENT_COLORS } from "@/types";

interface Props {
  element: ElementType;
  size?: "xs" | "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
});

const sizeClasses: Record<string, string> = {
  xs: "px-1 py-0.5 text-[9px] gap-0.5",
  sm: "px-1.5 py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2",
};
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full font-bold uppercase tracking-wider border',
      sizeClasses[props.size],
    ]"
    :style="{
      backgroundColor: ELEMENT_COLORS[props.element] + '22',
      borderColor: ELEMENT_COLORS[props.element] + '66',
      color: ELEMENT_COLORS[props.element],
      boxShadow: `0 0 8px ${ELEMENT_COLORS[props.element]}33`,
    }"
  >
    <font-awesome-icon :icon="['fas', ELEMENT_ICONS[props.element]]" />
    {{ props.element }}
  </span>
</template>
