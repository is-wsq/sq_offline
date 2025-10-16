import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);
import LogIn from '../view/login/Login.vue';
import Register from '../view/login/Register.vue';
import ai from '../view/ai/index.vue';

// ai八宝箱
import Chest from '../view/chest/Index.vue';
import HotNews from '../view/chest/HotNews.vue';
import ECommerce from '../view/chest/ECommerce.vue';
import ReWriting from '../view/chest/ReWriting.vue';
import MotionTransfer from '../view/chest/MotionTransfer.vue';
import ActionImitation from '../view/chest/ActionImitation.vue';
import CharacterReplace from '../view/chest/CharacterReplace.vue';
import VideoWatermarkRemove from '../view/chest/VideoWatermarkRemove.vue';
import MultiplePose from '../view/chest/MultiplePose.vue';
import ImageWatermarkRemove from '../view/chest/ImageWatermarkRemove.vue';
import PhotoRestoration from '../view/chest/PhotoRestoration.vue';
import DualTimbreCloning from '../view/chest/DualTimbreCloning.vue';
import InteriorDesign from '../view/chest/InteriorDesign.vue';

import figures from '../view/figures/index.vue';
import imageToScript from '../view/figures/imageToScript.vue';
import scriptToImage from '../view/figures/scriptToImage.vue';
import imageToVideo from '../view/figures/imageToVideo.vue';
import voice from '../view/voice/index.vue';
import video from '../view/video/home.vue';
import human from '../view/video/human.vue';
import material from '../view/video/material.vue';
import smartGenerate from '../view/video/smartGenerate.vue';
import syncCv from '../view/video/syncCv.vue';
import duplicate from '../view/video/duplicate.vue';
import segments from '../view/video/segments.vue';
import remix from '../view/video/remix.vue';
import montage from '../view/video/montage.vue';
import hot from '../view/video/hot.vue';
import videoList from '../view/video/list.vue';
import system from '../view/system/index.vue';
import videoPlayer from "../view/system/videoPlayer.vue";
import ShopManagement from '../view/shop/index.vue';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: LogIn
    },
    {
        path: '/',
        redirect: '/login'  // 添加重定向规则
    },
    {
        path: '/ai',
        name: 'ai',
        component: ai
    },

    {
        path: '/chest',
        name: 'Chest',
        component: Chest
    },{
        path: '/chest/hotNews',
        name: 'HotNews',
        component: HotNews
    },{
        path: '/chest/eCommerce',
        name: 'ECommerce',
        component: ECommerce
    },{
        path: '/chest/reWriting',
        name: 'ReWriting',
        component: ReWriting
    },{
        path: '/chest/motionTransfer',
        name: 'MotionTransfer',
        component: MotionTransfer
    },{
        path: '/chest/actionImitation',
        name: 'ActionImitation',
        component: ActionImitation
    },{
        path: '/chest/characterReplace',
        name: 'CharacterReplace',
        component: CharacterReplace
    },{
        path: '/chest/watermarkRemove/video',
        name: 'VideoWatermarkRemove',
        component: VideoWatermarkRemove
    },{
        path: '/chest/multiplePose',
        name: 'MultiplePose',
        component: MultiplePose
    },{
        path: '/chest/watermarkRemove/image',
        name: 'ImageWatermarkRemove',
        component: ImageWatermarkRemove
    },{
        path: '/chest/photoRestoration',
        name: 'PhotoRestoration',
        component: PhotoRestoration
    },{
        path: '/chest/dualTimbreCloning',
        name: 'DualTimbreCloning',
        component: DualTimbreCloning
    },{
        path: '/chest/interiorDesign',
        name: 'InteriorDesign',
        component: InteriorDesign
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
        path: '/imageToVideo',
        name: 'imageToVideo',
        component: imageToVideo
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
        path: '/remix',
        name: 'remix',
        component: remix
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
        path: '/videoPlayer',
        name: 'videoPlayer',
        component: videoPlayer
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
