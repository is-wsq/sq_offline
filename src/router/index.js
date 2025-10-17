import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);
import LogIn from '../view/login/Login.vue';
import Register from '../view/login/Register.vue';
// ai大模型
import Ai from '../view/ai/index.vue';
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
import FrameHeadTail from '../view/chest/FrameHeadTail.vue';
import ImageLipSync from '../view/chest/ImageLipSync.vue';
import FontLogoCN from '../view/chest/FontLogoCN.vue';
import ContentRemoval from '../view/chest/ContentRemoval.vue';
// 克隆形象
import Figures from '../view/figures/index.vue';
import ImageToScript from '../view/figures/imageToScript.vue';
import ScriptToImage from '../view/figures/scriptToImage.vue';
import ImageToVideo from '../view/figures/imageToVideo.vue';
// 克隆音色
import Voice from '../view/voice/index.vue';
// 生成视频
import Video from '../view/video/home.vue';
import Human from '../view/video/human.vue';
import Material from '../view/video/material.vue';
import SmartGenerate from '../view/video/smartGenerate.vue';
import SyncCv from '../view/video/syncCv.vue';
import Duplicate from '../view/video/duplicate.vue';
import Segments from '../view/video/segments.vue';
import Remix from '../view/video/remix.vue';
import Montage from '../view/video/montage.vue';
import Hot from '../view/video/hot.vue';
// 视频列表
import VideoList from '../view/video/list.vue';
// 设置
import System from '../view/system/index.vue';
import VideoPlayer from "../view/system/videoPlayer.vue";
// 品牌店铺
import ShopManagement from '../view/shop/index.vue';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: LogIn,
        meta: {
            title: '登陆'
        }
    },{
        path: '/',
        redirect: '/login'
    },{
        path: '/register',
        name: 'Register',
        component: Register,
        meta: {
            title: '注册'
        }
    },{
        path: '/ai',
        name: 'Ai',
        component: Ai,
        meta: {
            title: 'AI大模型'
        }
    },{
        path: '/chest',
        name: 'Chest',
        component: Chest,
        meta: {
            title: 'AI八宝箱'
        }
    },{
        path: '/chest/hotNews',
        name: 'HotNews',
        component: HotNews,
        meta: {
            title: '新闻热榜'
        }
    },{
        path: '/chest/eCommerce',
        name: 'ECommerce',
        component: ECommerce,
        meta: {
            title: '电商带货短视频'
        }
    },{
        path: '/chest/reWriting',
        name: 'ReWriting',
        component: ReWriting,
        meta: {
            title: '万物洗稿'
        }
    },{
        path: '/chest/motionTransfer',
        name: 'MotionTransfer',
        component: MotionTransfer,
        meta: {
            title: '动作迁移'
        }
    },{
        path: '/chest/actionImitation',
        name: 'ActionImitation',
        component: ActionImitation,
        meta: {
            title: '姿势动作模仿'
        }
    },{
        path: '/chest/characterReplace',
        name: 'CharacterReplace',
        component: CharacterReplace,
        meta: {
            title: '人物形象替换'
        }
    },{
        path: '/chest/watermarkRemove/video',
        name: 'VideoWatermarkRemove',
        component: VideoWatermarkRemove,
        meta: {
            title: '视频水印去除'
        }
    },{
        path: '/chest/multiplePose',
        name: 'MultiplePose',
        component: MultiplePose,
        meta: {
            title: '多姿势图片'
        }
    },{
        path: '/chest/watermarkRemove/image',
        name: 'ImageWatermarkRemove',
        component: ImageWatermarkRemove,
        meta: {
            title: '图片水印去除'
        }
    },{
        path: '/chest/photoRestoration',
        name: 'PhotoRestoration',
        component: PhotoRestoration,
        meta: {
            title: '照片修复'
        }
    },{
        path: '/chest/dualTimbreCloning',
        name: 'DualTimbreCloning',
        component: DualTimbreCloning,
        meta: {
            title: '双人音色克隆'
        }
    },{
        path: '/chest/interiorDesign',
        name: 'InteriorDesign',
        component: InteriorDesign,
        meta: {
            title: '室内设计'
        }
    },{
        path: '/chest/frameHeadTail',
        name: 'FrameHeadTail',
        component: FrameHeadTail,
        meta: {
            title: '视频首尾帧'
        }
    },{
        path: '/chest/imageLipSync',
        name: 'ImageLipSync',
        component: ImageLipSync,
        meta: {
            title: '图片对嘴型'
        }
    },{
        path: '/chest/fontLogoCN',
        name: 'FontLogoCN',
        component: FontLogoCN,
        meta: {
            title: '中文字体LOGO'
        }
    },{
        path: '/chest/contentRemoval',
        name: 'ContentRemoval',
        component: ContentRemoval,
        meta: {
            title: '内容消除'
        }
    },{
        path: '/figures',
        name: 'Figures',
        component: Figures,
        meta: {
            title: '形象克隆'
        }
    },{
        path: '/imageToScript',
        name: 'ImageToScript',
        component: ImageToScript,
        meta: {
            title: '图生脚本'
        }
    },{
        path: '/scriptToImage',
        name: 'ScriptToImage',
        component: ScriptToImage,
        meta: {
            title: '脚本生图'
        }
    },{
        path: '/imageToVideo',
        name: 'ImageToVideo',
        component: ImageToVideo,
        meta: {
            title: '图生视频'
        }
    },{
        path: '/voice',
        name: 'Voice',
        component: Voice,
        meta: {
            title: '音色克隆'
        }
    },{
        path: '/video',
        name: 'Video',
        component: Video,
        meta: {
            title: '生成视频'
        }
    },{
        path: '/human',
        name: 'Human',
        component: Human,
        meta: {
            title: '选择数字人'
        }
    },{
        path: '/material',
        name: 'Material',
        component: Material,
        meta: {
            title: '选择素材'
        }
    },{
        path: '/smartGenerate',
        name: 'SmartGenerate',
        component: SmartGenerate,
        meta: {
            title: '口播文案生成'
        }
    },{
        path: '/syncCv',
        name: 'SyncCv',
        component: SyncCv,
        meta: {
            title: '一键混剪-音画同步'
        }
    },{
        path: '/duplicate',
        name: 'Duplicate',
        component: Duplicate,
        meta: {
            title: '爆款复刻-生成文案'
        }
    },{
        path: '/remix',
        name: 'Remix',
        component: Remix,
        meta: {
            title: '混剪复刻'
        }
    },{
        path: '/segments',
        name: 'Segments',
        component: Segments,
        meta: {
            title: '打磨复刻'
        }
    },{
        path: '/montage',
        name: 'Montage',
        component: Montage,
        meta: {
            title: '一键混剪-音画不同步'
        }
    },{
        path: '/hot',
        name: 'Hot',
        component: Hot,
        meta: {
            title: '选择爆款视频'
        }
    },{
        path: '/videoList',
        name: 'VideoList',
        component: VideoList,
        meta: {
            title: '视频列表'
        }
    },{
        path: '/system',
        name: 'System',
        component: System,
        meta: {
            title: '设置'
        }
    },{
        path: '/videoPlayer',
        name: 'VideoPlayer',
        component: VideoPlayer
    },{
        path: '/shop',
        name: 'shop',
        component: ShopManagement,
        meta: {
            title: '店铺管理'
        }
    },
];

const router = new Router({
    mode: 'hash',
    routes
});

export default router;
