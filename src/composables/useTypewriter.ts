import { ref, onBeforeUnmount } from "vue";

export function useTypewriter(speed: number = 30) {
  const displayedText = ref("");
  const isTyping = ref(false);
  let fullText = "";
  let charIndex = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  function start(text: string): Promise<void> {
    return new Promise((resolve) => {
      stop();
      fullText = text;
      charIndex = 0;
      displayedText.value = "";
      isTyping.value = true;

      timer = setInterval(() => {
        if (charIndex < fullText.length) {
          displayedText.value += fullText[charIndex];
          charIndex++;
        } else {
          stop();
          resolve();
        }
      }, speed);
    });
  }

  function skip() {
    stop();
    displayedText.value = fullText;
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    isTyping.value = false;
  }

  onBeforeUnmount(() => {
    stop();
  });

  return {
    displayedText,
    isTyping,
    start,
    skip,
    stop,
  };
}
