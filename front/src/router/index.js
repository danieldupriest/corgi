import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../components/Home.vue";
import Upload from "../components/contacts/Upload";
import Config from "../components/contacts/Config";

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
    },
    {
        path: "/contacts/upload",
        name: "Upload",
        component: Upload,
    },
    {
        path: "/contacts/config/:file",
        name: "Config",
        component: Config,
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
