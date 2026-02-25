import { createApp } from "vue";
import { createPinia } from "pinia";

// Font Awesome
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faFire,
  faWater,
  faBolt,
  faMountain,
  faSnowflake,
  faGhost,
  faWind,
  faLeaf,
  faBrain,
  faGears,
  faSun,
  faBiohazard,
  faShieldHalved,
  faHandFist,
  faWandSparkles,
  faPersonRunning,
  faVolumeHigh,
  faVolumeXmark,
  faTrophy,
  faSkull,
  faExclamationCircle,
  faStar,
  faHeart,
  faRotateRight,
  faChevronRight,
  faCheck,
  faHandPointer,
  faScroll,
  faCircleInfo,
  faCircleMinus,
  faCircleXmark,
  faTriangleExclamation,
  faArrowUp,
  faCoins,
  faLock,
  faLockOpen,
  faBookOpen,
  faXmark,
  faCircleNotch,
  faPaw,
} from "@fortawesome/free-solid-svg-icons";

import router from "./router";
import App from "./App.vue";
import "./style.css";

// Register Font Awesome icons
library.add(
  faFire,
  faWater,
  faBolt,
  faMountain,
  faSnowflake,
  faGhost,
  faWind,
  faLeaf,
  faBrain,
  faGears,
  faSun,
  faBiohazard,
  faShieldHalved,
  faHandFist,
  faWandSparkles,
  faPersonRunning,
  faVolumeHigh,
  faVolumeXmark,
  faTrophy,
  faSkull,
  faExclamationCircle,
  faStar,
  faHeart,
  faRotateRight,
  faChevronRight,
  faCheck,
  faHandPointer,
  faScroll,
  faCircleInfo,
  faCircleMinus,
  faCircleXmark,
  faTriangleExclamation,
  faArrowUp,
  faCoins,
  faLock,
  faLockOpen,
  faBookOpen,
  faXmark,
  faCircleNotch,
  faPaw,
);

const app = createApp(App);

// Register global component
app.component("font-awesome-icon", FontAwesomeIcon);

app.use(createPinia());
app.use(router);

app.mount("#app");
