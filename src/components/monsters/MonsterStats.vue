<script setup lang="ts">
import type { MonsterDefinition } from "@/types";
import { ELEMENT_COLORS } from "@/types";
import ElementBadge from "@/components/ui/ElementBadge.vue";

interface Props {
  monster: MonsterDefinition;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <div
        class="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden bg-black/30 border border-white/10"
      >
        <img
          :src="props.monster.spriteUrl"
          :alt="props.monster.name"
          class="w-12 h-12 object-contain"
        />
      </div>
      <div>
        <h3
          class="text-lg font-bold"
          :style="{ color: ELEMENT_COLORS[props.monster.element] }"
        >
          {{ props.monster.name }}
        </h3>
        <ElementBadge :element="props.monster.element" size="sm" />
      </div>
    </div>

    <!-- Lore -->
    <p class="text-xs text-white/50 italic leading-relaxed">
      {{ props.monster.lore }}
    </p>

    <!-- Stats -->
    <div class="space-y-2">
      <h4 class="text-xs font-bold text-white/40 uppercase tracking-wider">
        Stats
      </h4>
      <div class="space-y-1.5">
        <div class="flex items-center gap-2 text-sm">
          <font-awesome-icon
            :icon="['fas', 'heart']"
            class="text-red-400 w-4"
          />
          <span class="text-white/60 w-10">HP</span>
          <div class="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-red-400"
              :style="{ width: `${(props.monster.baseHP / 140) * 100}%` }"
            />
          </div>
          <span class="text-white/80 text-xs w-8 text-right">{{
            props.monster.baseHP
          }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <font-awesome-icon
            :icon="['fas', 'hand-fist']"
            class="text-orange-400 w-4"
          />
          <span class="text-white/60 w-10">ATK</span>
          <div class="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-orange-400"
              :style="{ width: `${(props.monster.attack / 85) * 100}%` }"
            />
          </div>
          <span class="text-white/80 text-xs w-8 text-right">{{
            props.monster.attack
          }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <font-awesome-icon
            :icon="['fas', 'shield-halved']"
            class="text-blue-400 w-4"
          />
          <span class="text-white/60 w-10">DEF</span>
          <div class="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-blue-400"
              :style="{ width: `${(props.monster.defense / 80) * 100}%` }"
            />
          </div>
          <span class="text-white/80 text-xs w-8 text-right">{{
            props.monster.defense
          }}</span>
        </div>
      </div>
    </div>

    <!-- Moves -->
    <div class="space-y-2">
      <h4 class="text-xs font-bold text-white/40 uppercase tracking-wider">
        Moves
      </h4>
      <div class="space-y-1.5">
        <div class="p-2 rounded-lg bg-white/5 border border-white/10">
          <div
            class="flex items-center gap-2 text-sm font-semibold"
            :style="{ color: ELEMENT_COLORS[props.monster.element] }"
          >
            <font-awesome-icon :icon="['fas', 'hand-fist']" class="text-xs" />
            {{ props.monster.basicMove.name }}
            <span class="text-white/40 text-xs ml-auto"
              >PWR {{ props.monster.basicMove.power }}</span
            >
          </div>
          <p class="text-[10px] text-white/40 mt-0.5">
            {{ props.monster.basicMove.description }}
          </p>
        </div>
        <div class="p-2 rounded-lg bg-white/5 border border-white/10">
          <div
            class="flex items-center gap-2 text-sm font-semibold"
            :style="{ color: ELEMENT_COLORS[props.monster.element] }"
          >
            <font-awesome-icon
              :icon="['fas', 'wand-sparkles']"
              class="text-xs"
            />
            {{ props.monster.specialMove.name }}
            <span class="text-white/40 text-xs ml-auto"
              >PWR {{ props.monster.specialMove.power }}</span
            >
          </div>
          <p class="text-[10px] text-white/40 mt-0.5">
            {{ props.monster.specialMove.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Weakness -->
    <div class="flex items-center gap-2 text-xs text-white/40">
      <font-awesome-icon
        :icon="['fas', 'triangle-exclamation']"
        class="text-yellow-500"
      />
      Weak to:
      <ElementBadge :element="props.monster.weakness" size="sm" />
    </div>
  </div>
</template>
