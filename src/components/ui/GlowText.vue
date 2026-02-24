<script setup lang="ts">
interface Props {
  color?: string;
  tag?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: "#a855f7",
  tag: "h2",
});
</script>

<template>
  <component
    :is="props.tag"
    class="font-bold tracking-wide"
    :style="{
      color: props.color,
      textShadow: `0 0 10px ${props.color}88, 0 0 30px ${props.color}44, 0 0 60px ${props.color}22`,
    }"
  >
    <slot />
  </component>
</template>
