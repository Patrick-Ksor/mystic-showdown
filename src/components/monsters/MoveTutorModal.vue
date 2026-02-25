<script setup lang="ts">
import { ref, computed } from "vue";
import { useGameStore } from "@/stores/useGameStore";
import {
  useMonsterLevelStore,
  MAX_EQUIPPED_SPECIALS,
} from "@/stores/useMonsterLevelStore";
import { TUTOR_MOVES } from "@/data/tutorMoves";
import { ELEMENT_COLORS, ELEMENT_ICONS } from "@/types";
import type { MonsterDefinition } from "@/types";
import ElementBadge from "@/components/ui/ElementBadge.vue";

interface Props {
  monster: MonsterDefinition;
}

const props = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();

const gameStore = useGameStore();
const monsterLevelStore = useMonsterLevelStore();

const flashedMove = ref<string | null>(null);

const level = computed(() => monsterLevelStore.getLevel(props.monster.id));

function isLearned(moveName: string): boolean {
  return monsterLevelStore
    .getTutorMoveNames(props.monster.id)
    .includes(moveName);
}

function canAfford(cost: number): boolean {
  return gameStore.coins >= cost;
}

function purchase(moveName: string, cost: number) {
  if (isLearned(moveName) || !canAfford(cost)) return;
  const success = gameStore.spendCoins(cost);
  if (!success) return;
  monsterLevelStore.learnTutorMove(props.monster.id, moveName);

  // Auto-equip if there's a free slot
  const equipped = monsterLevelStore.getEquippedMoveNames(props.monster.id);
  if (equipped.length < MAX_EQUIPPED_SPECIALS) {
    monsterLevelStore.setEquippedMoveNames(props.monster.id, [
      ...equipped,
      moveName,
    ]);
  }

  // Brief success flash
  flashedMove.value = moveName;
  setTimeout(() => (flashedMove.value = null), 1500);
}
</script>

<template>
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    style="background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(4px)"
    @click.self="emit('close')"
  >
    <div
      class="relative w-full max-w-2xl max-h-[90vh] rounded-2xl border border-white/10 bg-[#0f0f1a] overflow-hidden flex flex-col"
      style="box-shadow: 0 0 60px rgba(168, 85, 247, 0.2)"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5 shrink-0"
      >
        <div class="flex items-center gap-3">
          <font-awesome-icon
            :icon="['fas', 'book-open']"
            class="text-purple-400 text-lg"
          />
          <div>
            <h2 class="font-black text-white text-base tracking-wide">
              Move Tutor
            </h2>
            <p class="text-xs text-white/40">
              Teaching &nbsp;<span class="text-white/70 font-semibold">{{
                monster.name
              }}</span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <!-- Coin balance -->
          <span
            class="flex items-center gap-1.5 text-sm font-bold text-amber-400"
          >
            <font-awesome-icon :icon="['fas', 'coins']" />
            {{ gameStore.coins }}
          </span>
          <button
            class="text-white/40 hover:text-white transition-colors cursor-pointer"
            @click="emit('close')"
          >
            <font-awesome-icon :icon="['fas', 'xmark']" class="text-lg" />
          </button>
        </div>
      </div>

      <!-- Move Grid -->
      <div
        class="overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 scrollbar-thin"
      >
        <div
          v-for="move in TUTOR_MOVES"
          :key="move.name"
          :class="[
            'relative rounded-xl border-2 p-3 flex flex-col gap-2 transition-all duration-200',
            isLearned(move.name)
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : canAfford(move.cost)
              ? 'border-white/10 bg-white/5 hover:border-white/20 cursor-pointer hover:scale-[1.02]'
              : 'border-white/5 bg-white/3 opacity-50',
          ]"
          @click="purchase(move.name, move.cost)"
        >
          <!-- Flash overlay -->
          <Transition
            enter-active-class="transition-opacity duration-200"
            leave-active-class="transition-opacity duration-700"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
          >
            <div
              v-if="flashedMove === move.name"
              class="absolute inset-0 rounded-xl bg-emerald-500/20 flex items-center justify-center z-10"
            >
              <span
                class="text-emerald-400 font-black text-sm flex items-center gap-2"
              >
                <font-awesome-icon :icon="['fas', 'check-circle']" />
                Learned!
              </span>
            </div>
          </Transition>

          <!-- Move Name + Element -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <font-awesome-icon
                :icon="['fas', ELEMENT_ICONS[move.element]]"
                class="text-sm"
                :style="{ color: ELEMENT_COLORS[move.element] }"
              />
              <span class="font-bold text-white text-sm">{{ move.name }}</span>
            </div>
            <ElementBadge :element="move.element" size="sm" />
          </div>

          <!-- Cross-theme label -->
          <p class="text-[10px] text-white/40 italic">{{ move.crossTheme }}</p>

          <!-- Description -->
          <p class="text-[11px] text-white/60 leading-relaxed">
            {{ move.description }}
          </p>

          <!-- Stats row + effect -->
          <div
            class="flex items-center gap-3 text-[10px] text-white/50 mt-auto"
          >
            <span
              >PWR
              <span class="font-bold text-white/80">{{
                move.power
              }}</span></span
            >
            <span
              >ACC
              <span class="font-bold text-white/80"
                >{{ move.accuracy }}%</span
              ></span
            >
            <span
              v-if="move.effect"
              class="font-bold uppercase"
              :style="{
                color:
                  move.effect.type === 'heal'
                    ? '#34d399'
                    : move.effect.type === 'poison'
                    ? '#86efac'
                    : move.effect.type === 'stun'
                    ? '#fde047'
                    : '#a5b4fc',
              }"
            >
              {{ move.effect.type }}
              {{ move.effect.chance < 100 ? move.effect.chance + "%" : "" }}
            </span>
          </div>

          <!-- Cost / Status -->
          <div class="flex items-center justify-end mt-1">
            <span
              v-if="isLearned(move.name)"
              class="text-xs font-bold text-emerald-400 flex items-center gap-1"
            >
              <font-awesome-icon :icon="['fas', 'check']" />
              Learned
            </span>
            <span
              v-else
              :class="[
                'text-xs font-bold flex items-center gap-1',
                canAfford(move.cost) ? 'text-amber-400' : 'text-white/25',
              ]"
            >
              <font-awesome-icon :icon="['fas', 'coins']" />
              {{ move.cost }}
            </span>
          </div>
        </div>
      </div>

      <!-- Footer hint -->
      <div
        class="px-5 py-3 border-t border-white/10 bg-white/5 text-[11px] text-white/30 text-center shrink-0"
      >
        Learned moves appear in the Move Manager. Click a move to purchase and
        auto-equip to a free slot.
      </div>
    </div>
  </div>
</template>
