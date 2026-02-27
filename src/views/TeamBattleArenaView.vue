<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useTeamBattleStore } from "@/stores/useTeamBattleStore";
import TeamBattleScene from "@/components/battle/TeamBattleScene.vue";
import arenaImg from "@/assets/sprites/Arena.png";

const router = useRouter();
const teamBattleStore = useTeamBattleStore();
const { playerTeam } = storeToRefs(teamBattleStore);

onMounted(() => {
  if (!playerTeam.value.length) {
    router.push("/team-select");
  }
});

function onVictory() {
  router.push("/team-result");
}

function onDefeat() {
  router.push("/team-result");
}
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
    <div class="absolute inset-0 bg-black/40 pointer-events-none" />
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

    <TeamBattleScene
      v-if="playerTeam.length"
      class="relative z-10 flex-1"
      @victory="onVictory"
      @defeat="onDefeat"
    />
  </div>
</template>
