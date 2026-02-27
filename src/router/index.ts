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
      path: "/gauntlet",
      name: "GauntletArena",
      component: () => import("@/views/GauntletView.vue"),
    },
    {
      path: "/result",
      name: "ResultScreen",
      component: () => import("@/views/ResultScreenView.vue"),
    },
    {
      path: "/team-select",
      name: "TeamSelect",
      component: () => import("@/views/TeamSelectView.vue"),
    },
    {
      path: "/team-battle",
      name: "TeamBattleArena",
      component: () => import("@/views/TeamBattleArenaView.vue"),
    },
    {
      path: "/team-result",
      name: "TeamResult",
      component: () => import("@/views/TeamResultView.vue"),
    },
    {
      // Catch-all redirect
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

export default router;
