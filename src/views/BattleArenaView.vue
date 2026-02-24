<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useBattleStore } from "@/stores/useBattleStore";
import BattleScene from "@/components/battle/BattleScene.vue";
import arenaImg from "@/assets/sprites/Arena.png";

const router = useRouter();
const battleStore = useBattleStore();
const { playerMonster } = storeToRefs(battleStore);

onMounted(() => {
  if (!playerMonster.value) {
    router.push("/");
  }
});
</script>

<template>
  <div
    class="h-screen flex flex-col overflow-hidden relative"
    :style="{
      backgroundImage: `url(${arenaImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }"
  >
    <!-- Dark overlay to keep UI readable -->
    <div class="absolute inset-0 bg-black/40 pointer-events-none" />

    <!-- Ambient grid overlay -->
    <div
      class="absolute inset-0 pointer-events-none opacity-5"
      style="
        background-image: linear-gradient(
            rgba(168, 85, 247, 0.3) 1px,
            transparent 1px
          ),
          linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px);
        background-size: 50px 50px;
      "
    />

    <BattleScene v-if="playerMonster" class="relative z-10 flex-1" />
  </div>
</template>
