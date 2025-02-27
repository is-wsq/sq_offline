import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);
import LogIn from '../view/login/Login.vue';
import Register from '../view/login/Register.vue';
import figures from '@/view/figures/index.vue';
import voice from '../view/voice/index.vue';
import video from '../view/video/index.vue';
import system from '../view/system/index.vue';

const routes = [
    {
        path: '/',
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
        path: '/system',
        name: 'system',
        component: system
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
    mode: 'history',
    routes
});

export default router;
