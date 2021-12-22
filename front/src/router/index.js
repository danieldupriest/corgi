import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../components/Home.vue";
import ListContacts from "../components/contacts/List";
import Upload from "../components/contacts/Upload";
import Config from "../components/contacts/Config";
import Merge from "../components/contacts/Merge";

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
    },
    {
        path: "/contacts",
        name: "Contacts",
        component: ListContacts,
    },
    {
        path: "/contacts/upload",
        name: "Upload",
        component: Upload,
    },
    {
        path: "/contacts/upload/:mergeId/config",
        name: "Config",
        component: Config,
    },
    {
        path: "/contacts/upload/:mergeId/merge",
        name: "Merge",
        component: Merge,
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
