import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);
import LogIn from '../view/login/Login.vue';
import Register from '../view/login/Register.vue';
import ai from '../view/ai/index.vue';
import figures from '../view/figures/index.vue';
import imageToScript from '../view/figures/imageToScript.vue';
import scriptToImage from '../view/figures/scriptToImage.vue';
import voice from '../view/voice/index.vue';
import video from '../view/video/home.vue';
import human from '../view/video/human.vue';
import material from '../view/video/material.vue';
import smartGenerate from '../view/video/smartGenerate.vue';
import syncCv from '../view/video/syncCv.vue';
import duplicate from '../view/video/duplicate.vue';
import segments from '../view/video/segments.vue';
import montage from '../view/video/montage.vue';
import hot from '../view/video/hot.vue';
import videoList from '../view/video/list.vue';
import system from '../view/system/index.vue';
import agreement from '../view/system/agreement.vue';
import videoPlayer from "../view/system/videoPlayer.vue";
import ShopManagement from '../view/shop/index.vue';

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
        path: '/imageToScript',
        name: 'imageToScript',
        component: imageToScript
    },
    {
        path: '/scriptToImage',
        name: 'scriptToImage',
        component: scriptToImage
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
        path: '/human',
        name: 'human',
        component: human
    },
    {
        path: '/material',
        name: 'material',
        component: material
    },
    {
        path: '/smartGenerate',
        name: 'smartGenerate',
        component: smartGenerate
    },
    {
        path: '/syncCv',
        name: 'syncCv',
        component: syncCv
    },
    {
        path: '/duplicate',
        name: 'duplicate',
        component: duplicate
    },
    {
        path: '/segments',
        name: 'segments',
        component: segments
    },
    {
        path: '/montage',
        name: 'montage',
        component: montage
    },
    {
        path: '/hot',
        name: 'hot',
        component: hot
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
        path: '/login',
        name: 'Login',
        component: LogIn
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
    {
        path: '/shop',
        name: 'shop',
        component: ShopManagement
    },
];

const router = new Router({
    mode: 'hash',
    routes
});

export default router;
