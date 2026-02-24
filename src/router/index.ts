import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "MonsterSelect",
      component: () => import("@/views/MonsterSelectView.vue"),
    },
    {
      path: "/battle",
      name: "BattleArena",
      component: () => import("@/views/BattleArenaView.vue"),
    },
    {
      path: "/result",
      name: "ResultScreen",
      component: () => import("@/views/ResultScreenView.vue"),
    },
    {
      // Catch-all redirect
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

export default router;
