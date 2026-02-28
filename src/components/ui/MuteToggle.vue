<script setup lang="ts">
import { useAudio } from "@/composables/useAudio";

const { isMuted, toggleMute } = useAudio();
</script>

<template>
  <button
    class="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200 hover:scale-110 cursor-pointer"
    :title="isMuted ? 'Unmute' : 'Mute'"
    @click="toggleMute"
  >
    <font-awesome-icon
      :icon="['fas', isMuted ? 'volume-xmark' : 'volume-high']"
      class="text-sm"
    />
  </button>
</template>
