/**
 * Audio composable — delegates to useSoundEffects (Web Audio API).
 * Kept for backward compatibility with MuteToggle and any future
 * Howler.js integration.
 */
import { useSoundEffects } from "@/composables/useSoundEffects";

export function useAudio() {
  const { isMuted, toggleMute } = useSoundEffects();

  return {
    isMuted,
    toggleMute,
  };
}
