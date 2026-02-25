<script setup lang="ts">
import { computed } from "vue";
import type { MonsterDefinition, Move } from "@/types";
import { ELEMENT_COLORS } from "@/types";
import ElementBadge from "@/components/ui/ElementBadge.vue";

interface Props {
  monster: MonsterDefinition;
  level?: number;
  xp?: number;
  xpToNext?: number;
  maxLevel?: number;
  equippedMoveNames?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  level: 1,
  xp: 0,
  xpToNext: 50,
  maxLevel: 20,
  equippedMoveNames: () => [],
});

const scaledHP = computed(() =>
  Math.floor(props.monster.baseHP * (1 + 0.02 * (props.level - 1)))
);
const scaledATK = computed(() =>
  Math.floor(props.monster.attack * (1 + 0.02 * (props.level - 1)))
);
const scaledDEF = computed(() =>
  Math.floor(props.monster.defense * (1 + 0.02 * (props.level - 1)))
);
const scaledSPD = computed(() =>
  Math.floor(props.monster.speed * (1 + 0.02 * (props.level - 1)))
);

// Scale bar max denominators by same factor at level 20 for visual consistency
const maxHP = computed(() =>
  Math.floor(140 * (1 + 0.02 * (props.maxLevel - 1)))
);
const maxATK = computed(() =>
  Math.floor(85 * (1 + 0.02 * (props.maxLevel - 1)))
);
const maxDEF = computed(() =>
  Math.floor(80 * (1 + 0.02 * (props.maxLevel - 1)))
);
const maxSPD = computed(() =>
  Math.floor(80 * (1 + 0.02 * (props.maxLevel - 1)))
);

const isMaxLevel = computed(() => props.level >= props.maxLevel);
const xpPercent = computed(() => {
  if (isMaxLevel.value) return 100;
  if (props.xpToNext <= 0) return 0;
  return Math.min((props.xp / props.xpToNext) * 100, 100);
});

// Effective equipped names: use prop if provided, otherwise default to starter
const effectiveEquipped = computed(() => {
  if (props.equippedMoveNames.length > 0) return props.equippedMoveNames;
  return [props.monster.specialMove.name];
});

// All special moves in order: starter, then learnset (sorted by level)
interface SpecialMoveEntry {
  move: Move;
  unlockLevel: number; // 1 for starter
  isUnlocked: boolean;
  isEquipped: boolean;
}

const specialMoves = computed<SpecialMoveEntry[]>(() => {
  const entries: SpecialMoveEntry[] = [
    {
      move: props.monster.specialMove,
      unlockLevel: 1,
      isUnlocked: true,
      isEquipped: effectiveEquipped.value.includes(
        props.monster.specialMove.name
      ),
    },
  ];
  for (const entry of props.monster.learnset) {
    entries.push({
      move: entry.move,
      unlockLevel: entry.level,
      isUnlocked: props.level >= entry.level,
      isEquipped: effectiveEquipped.value.includes(entry.move.name),
    });
  }
  return entries;
});
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
        <div class="flex items-center gap-2">
          <h3
            class="text-lg font-bold"
            :style="{ color: ELEMENT_COLORS[props.monster.element] }"
          >
            {{ props.monster.name }}
          </h3>
          <span
            class="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/40 border border-yellow-400/30 text-[10px] font-bold text-yellow-400"
          >
            <font-awesome-icon :icon="['fas', 'star']" class="text-[8px]" />
            Lv.{{ props.level }}
          </span>
        </div>
        <ElementBadge :element="props.monster.element" size="sm" />
      </div>
    </div>

    <!-- Lore -->
    <p class="text-xs text-white/50 italic leading-relaxed">
      {{ props.monster.lore }}
    </p>

    <!-- Level & XP -->
    <div class="space-y-1">
      <div class="flex items-center justify-between text-xs">
        <span class="text-white/50 flex items-center gap-1">
          <font-awesome-icon
            :icon="['fas', 'star']"
            class="text-yellow-400 text-[10px]"
          />
          Monster XP
        </span>
        <span v-if="isMaxLevel" class="text-yellow-400 font-bold text-[10px]"
          >MAX</span
        >
        <span v-else class="text-white/40 text-[10px]"
          >{{ props.xp }} / {{ props.xpToNext }}</span
        >
      </div>
      <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="isMaxLevel ? 'bg-yellow-400' : 'bg-purple-400'"
          :style="{ width: `${xpPercent}%` }"
        />
      </div>
    </div>

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
              :style="{ width: `${(scaledHP / maxHP) * 100}%` }"
            />
          </div>
          <span class="text-white/80 text-xs w-8 text-right">{{
            scaledHP
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
              :style="{ width: `${(scaledATK / maxATK) * 100}%` }"
            />
          </div>
          <span class="text-white/80 text-xs w-8 text-right">{{
            scaledATK
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
              :style="{ width: `${(scaledDEF / maxDEF) * 100}%` }"
            />
          </div>
          <span class="text-white/80 text-xs w-8 text-right">{{
            scaledDEF
          }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <font-awesome-icon
            :icon="['fas', 'bolt']"
            class="text-yellow-400 w-4"
          />
          <span class="text-white/60 w-10">SPD</span>
          <div class="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-yellow-400"
              :style="{ width: `${(scaledSPD / maxSPD) * 100}%` }"
            />
          </div>
          <span class="text-white/80 text-xs w-8 text-right">{{
            scaledSPD
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
        <!-- Basic Move -->
        <div class="p-2 rounded-lg bg-white/5 border border-white/10">
          <div
            class="flex items-center gap-2 text-sm font-semibold"
            :style="{ color: ELEMENT_COLORS[props.monster.element] }"
          >
            <font-awesome-icon :icon="['fas', 'hand-fist']" class="text-xs" />
            {{ props.monster.basicMove.name }}
            <span class="ml-auto flex items-center gap-1.5">
              <span class="text-white/40 text-xs"
                >PWR {{ props.monster.basicMove.power }}</span
              >
            </span>
          </div>
          <p class="text-[10px] text-white/40 mt-0.5">
            {{ props.monster.basicMove.description }}
          </p>
        </div>

        <!-- Special Moves (starter + learnset) -->
        <div
          v-for="entry in specialMoves"
          :key="entry.move.name"
          class="p-2 rounded-lg border transition-all duration-200"
          :class="
            !entry.isUnlocked
              ? 'bg-white/[0.02] border-white/5 opacity-50'
              : entry.isEquipped
              ? 'bg-white/5 border-white/10'
              : 'bg-white/[0.03] border-white/5 opacity-70'
          "
        >
          <div
            class="flex items-center gap-2 text-sm font-semibold"
            :style="{
              color: entry.isUnlocked
                ? ELEMENT_COLORS[props.monster.element]
                : 'rgba(255,255,255,0.3)',
            }"
          >
            <font-awesome-icon
              :icon="['fas', entry.isUnlocked ? 'wand-sparkles' : 'lock']"
              class="text-xs"
            />
            {{ entry.move.name }}
            <span class="ml-auto flex items-center gap-1.5">
              <span
                v-if="entry.isEquipped"
                class="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 font-bold"
              >
                EQUIPPED
              </span>
              <span
                v-else-if="!entry.isUnlocked"
                class="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/30 font-bold"
              >
                Lv.{{ entry.unlockLevel }}
              </span>
              <span class="text-white/40 text-xs"
                >PWR {{ entry.move.power }}</span
              >
            </span>
          </div>
          <p class="text-[10px] text-white/40 mt-0.5">
            {{ entry.move.description }}
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
      <ElementBadge
        v-for="w in props.monster.weaknesses"
        :key="w"
        :element="w"
        size="sm"
      />
    </div>
  </div>
</template>
