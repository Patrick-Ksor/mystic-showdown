<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import MuteToggle from "@/components/ui/MuteToggle.vue";
import TrainerHUD from "@/components/ui/TrainerHUD.vue";

const route = useRoute();
const hiddenRoutes = ["/battle", "/gauntlet"];
const showTrainerHUD = computed(() => !hiddenRoutes.includes(route.path));
</script>

<template>
  <div class="min-h-screen bg-[#0a0a14]">
    <TrainerHUD v-if="showTrainerHUD" />
    <MuteToggle />
    <RouterView v-slot="{ Component }">
      <Transition
        mode="out-in"
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>
</template>
