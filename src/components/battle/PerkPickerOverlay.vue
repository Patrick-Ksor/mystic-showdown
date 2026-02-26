<script setup lang="ts">
import { ref, onMounted } from "vue";
import gsap from "gsap";
import type { RunPerkDefinition, RunPerkId } from "@/types";

interface Props {
  perks: RunPerkDefinition[];
  round: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{ pick: [id: RunPerkId] }>();

const containerRef = ref<HTMLElement | null>(null);
const pickedId = ref<RunPerkId | null>(null);

onMounted(async () => {
  await new Promise((r) => setTimeout(r, 40));
  if (containerRef.value) {
    gsap.fromTo(
      containerRef.value,
      { scale: 0.85, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.8)" }
    );
    gsap.fromTo(
      containerRef.value.querySelectorAll(".perk-card"),
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.35,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.15,
      }
    );
  }
});

function pick(id: RunPerkId) {
  if (pickedId.value) return;
  pickedId.value = id;
  emit("pick", id);
}
</script>

<template>
  <div
    class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
  >
    <div ref="containerRef" class="w-full max-w-md px-4 text-center space-y-5">
      <!-- Header -->
      <div class="space-y-1">
        <p class="text-purple-400 text-xs font-bold tracking-[0.3em] uppercase">
          Stage {{ round }} Clear — Choose a Perk
        </p>
        <h2
          class="text-2xl sm:text-3xl font-black tracking-wide text-white"
          style="text-shadow: 0 0 16px rgba(168, 85, 247, 0.6)"
        >
          Run Perk Upgrade
        </h2>
        <p class="text-white/40 text-xs">
          Pick one — lasts the rest of this run
        </p>
      </div>

      <!-- Perk cards -->
      <div class="flex flex-col gap-3">
        <button
          v-for="perk in props.perks"
          :key="perk.id"
          class="perk-card relative flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95 bg-black/50 backdrop-blur-sm"
          :class="
            pickedId === perk.id
              ? 'opacity-100'
              : pickedId
              ? 'opacity-30 pointer-events-none'
              : ''
          "
          :style="{
            borderColor: perk.color + '55',
            boxShadow:
              pickedId === perk.id
                ? `0 0 24px ${perk.color}66, inset 0 0 24px ${perk.color}22`
                : `inset 0 0 20px ${perk.color}11`,
          }"
          @click="pick(perk.id)"
        >
          <!-- Icon -->
          <div
            class="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
            :style="{ backgroundColor: perk.color + '22', color: perk.color }"
          >
            <font-awesome-icon :icon="['fas', perk.icon]" class="text-xl" />
          </div>

          <!-- Text -->
          <div class="flex-1 min-w-0">
            <p class="font-bold text-sm" :style="{ color: perk.color }">
              {{ perk.name }}
            </p>
            <p class="text-white/60 text-xs leading-snug mt-0.5">
              {{ perk.description }}
            </p>
          </div>

          <!-- Checkmark when picked -->
          <font-awesome-icon
            v-if="pickedId === perk.id"
            :icon="['fas', 'circle-check']"
            class="shrink-0 text-lg"
            :style="{ color: perk.color }"
          />
        </button>
      </div>
    </div>
  </div>
</template>
