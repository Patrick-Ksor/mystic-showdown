<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from "vue";
import gsap from "gsap";
import type { BattleLogEntry } from "@/types";

interface Props {
  entries: BattleLogEntry[];
}

const props = defineProps<Props>();

const logRef = ref<HTMLElement | null>(null);
const visibleEntries = ref<BattleLogEntry[]>([]);

const typeClasses: Record<string, string> = {
  normal: "text-white/80",
  critical: "text-red-400 font-bold",
  effective: "text-yellow-400 font-bold",
  ineffective: "text-blue-300/60 italic",
  system: "text-purple-300",
  guard: "text-cyan-400",
  miss: "text-white/40 italic",
  heal: "text-emerald-400 font-semibold",
  poison: "text-green-400",
  stun: "text-yellow-300",
  sleep: "text-indigo-300",
  burn: "text-orange-400",
  freeze: "text-sky-300",
  confusion: "text-fuchsia-400",
  atk_up: "text-orange-300 font-semibold",
  def_up: "text-blue-300 font-semibold",
  spd_up: "text-emerald-300 font-semibold",
};

const typeIcons: Record<string, string> = {
  normal: "chevron-right",
  critical: "exclamation-circle",
  effective: "bolt",
  ineffective: "circle-minus",
  system: "circle-info",
  guard: "shield-halved",
  miss: "circle-xmark",
  heal: "heart",
  poison: "skull",
  stun: "bolt",
  sleep: "moon",
  burn: "fire",
  freeze: "snowflake",
  confusion: "brain",
  atk_up: "hand-fist",
  def_up: "shield-halved",
  spd_up: "bolt",
};

watch(
  () => props.entries.length,
  async () => {
    visibleEntries.value = props.entries.slice(-8);

    await nextTick();

    // Scroll to bottom
    if (logRef.value) {
      logRef.value.scrollTop = logRef.value.scrollHeight;
    }

    // Animate newest entry
    const lastEl = logRef.value?.querySelector(
      ".log-entry:last-child"
    ) as HTMLElement | null;
    if (lastEl) {
      gsap.fromTo(
        lastEl,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }
);

onMounted(() => {
  visibleEntries.value = props.entries.slice(-8);
});
</script>

<template>
  <div
    class="battle-log rounded-xl border border-white/10 bg-black/50 backdrop-blur-sm overflow-hidden"
  >
    <!-- Header -->
    <div class="px-3 py-2 border-b border-white/10 bg-white/5">
      <span
        class="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5"
      >
        <font-awesome-icon :icon="['fas', 'scroll']" class="text-purple-400" />
        Battle Log
      </span>
    </div>

    <!-- Entries -->
    <div
      ref="logRef"
      class="p-3 space-y-1.5 overflow-y-auto h-32 scrollbar-thin"
    >
      <div
        v-for="entry in visibleEntries"
        :key="entry.id"
        :class="[
          'log-entry flex items-start gap-2 text-xs leading-relaxed',
          entry.elementColor ? '' : typeClasses[entry.type],
        ]"
        :style="entry.elementColor ? { color: entry.elementColor } : {}"
      >
        <font-awesome-icon
          :icon="['fas', typeIcons[entry.type] ?? 'chevron-right']"
          class="mt-0.5 text-[10px] shrink-0"
        />
        <span>{{ entry.text }}</span>
      </div>

      <div
        v-if="visibleEntries.length === 0"
        class="text-xs text-white/30 italic text-center py-4"
      >
        Waiting for battle to begin...
      </div>
    </div>
  </div>
</template>
