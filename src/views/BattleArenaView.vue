<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useBattleStore } from "@/stores/useBattleStore";
import BattleScene from "@/components/battle/BattleScene.vue";

const router = useRouter();
const battleStore = useBattleStore();
const { playerMonster } = storeToRefs(battleStore);

onMounted(() => {
  if (!playerMonster.value) {
    router.push("/");
  }
});

function onVictory() {
  router.push("/result");
}

function onDefeat() {
  router.push("/result");
}
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden relative bg-[#050108]">
    <!-- Cosmic sky gradient -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="
        background: radial-gradient(
          ellipse 130% 80% at 50% 10%,
          #1e0b38 0%,
          #0b0119 55%,
          #020006 100%
        );
      "
    />

    <!-- Nebula glow — left -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="
        background: radial-gradient(
          ellipse 55% 45% at 12% 28%,
          rgba(139, 92, 246, 0.2) 0%,
          transparent 100%
        );
      "
    />

    <!-- Nebula glow — right -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="
        background: radial-gradient(
          ellipse 50% 40% at 90% 22%,
          rgba(59, 130, 246, 0.14) 0%,
          transparent 100%
        );
      "
    />

    <!-- Nebula glow — center top -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="
        background: radial-gradient(
          ellipse 40% 30% at 50% 5%,
          rgba(192, 132, 252, 0.1) 0%,
          transparent 100%
        );
      "
    />

    <!-- Star field -->
    <div
      class="absolute inset-0 pointer-events-none opacity-70"
      style="
        background-image: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.85) 0.5px,
            transparent 0.5px
          ),
          radial-gradient(
            circle,
            rgba(255, 255, 255, 0.65) 0.5px,
            transparent 0.5px
          ),
          radial-gradient(
            circle,
            rgba(255, 255, 255, 0.95) 1px,
            transparent 1px
          );
        background-size: 110px 130px, 190px 170px, 310px 290px;
        background-position: 0px 0px, 55px 80px, 25px 150px;
      "
    />

    <!-- Ground fill (lower 42%) -->
    <div
      class="absolute bottom-0 left-0 right-0 pointer-events-none"
      style="
        height: 42%;
        background: linear-gradient(
          to bottom,
          transparent 0%,
          #0a0119 20%,
          #060010 100%
        );
      "
    />

    <!-- Perspective floor grid -->
    <div
      class="absolute left-0 right-0 bottom-0 overflow-hidden pointer-events-none"
      style="height: 42%; perspective: 280px; perspective-origin: 50% 0%"
    >
      <div
        style="
          width: 100%;
          height: 100%;
          transform: rotateX(48deg);
          transform-origin: top center;
          background-image: linear-gradient(
              rgba(168, 85, 247, 0.45) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(168, 85, 247, 0.45) 1px,
              transparent 1px
            );
          background-size: 70px 55px;
          opacity: 0.22;
        "
      />
    </div>

    <!-- Horizon glow line -->
    <div
      class="absolute left-0 right-0 pointer-events-none"
      style="
        bottom: 41.6%;
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(192, 132, 252, 0.6) 15%,
          rgba(255, 255, 255, 0.95) 50%,
          rgba(192, 132, 252, 0.6) 85%,
          transparent 100%
        );
        box-shadow: 0 0 6px 2px rgba(168, 85, 247, 0.55),
          0 0 28px 6px rgba(139, 92, 246, 0.28);
      "
    />

    <!-- Arena floor rim glow -->
    <div
      class="absolute bottom-0 left-0 right-0 pointer-events-none"
      style="
        height: 180px;
        background: radial-gradient(
          ellipse 75% 100% at 50% 100%,
          rgba(139, 92, 246, 0.22) 0%,
          transparent 100%
        );
      "
    />

    <!-- Vignette -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="
        background: radial-gradient(
          ellipse 90% 90% at 50% 50%,
          transparent 50%,
          rgba(0, 0, 0, 0.55) 100%
        );
      "
    />

    <BattleScene
      v-if="playerMonster"
      class="relative z-10 flex-1"
      @victory="onVictory"
      @defeat="onDefeat"
    />
  </div>
</template>
