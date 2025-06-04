import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);
import LogIn from '../view/login/Login.vue';
import Register from '../view/login/Register.vue';
import ai from '../view/ai/index.vue';
import figures from '../view/figures/index.vue';
import voice from '../view/voice/index.vue';
import video from '../view/video/index.vue';
import videoList from '../view/video/list.vue';
import system from '../view/system/index.vue';
import agreement from '../view/system/agreement.vue';
import videoPlayer from "../view/system/videoPlayer.vue";
import shiftSelectAll from "../view/system/shiftSelectAll.vue";

const routes = [
    {
        path: '/',
        name: 'ai',
        component: ai
    },
    {
        path: '/figures',
        name: 'figures',
        component: figures
    },
    {
        path: '/voice',
        name: 'voice',
        component: voice
    },
    {
        path: '/video',
        name: 'video',
        component: video
    },
    {
        path: '/videoList',
        name: 'videoList',
        component: videoList
    },
    {
        path: '/system',
        name: 'system',
        component: system
    },
    {
        path: '/agreement',
        name: 'agreement',
        component: agreement
    },
    {
        path: '/videoPlayer',
        name: 'videoPlayer',
        component: videoPlayer
    },
    {
        path: '/shiftSelectAll',
        name: 'shiftSelectAll',
        component: shiftSelectAll
    },
    {
        path: '/login',
        name: 'Login',
        component: LogIn
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
];

const router = new Router({
    mode: 'hash',
    routes
});

export default router;
