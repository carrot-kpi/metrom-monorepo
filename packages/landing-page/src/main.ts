import "@fontsource-variable/inter";
import "@metrom-xyz/ui/index.css";

import "./main.css";

import { createApp } from "vue";
import App from "./App.vue";
import { i18n } from "./i18n";

const app = createApp(App, {});

app.use(i18n);

app.mount("#app");
