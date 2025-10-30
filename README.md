## 离线部署(offline-deployment)

### 技术栈

- 核心框架：`Vue 2.6.14`
- 状态管理：`Vuex 4.1.0`
- 路由：`vue-router 2.8.1`
- UI组件库：`Element UI 2.15.14`
- 其他工具：`Axios 1.7.9`，`Electron 33.2.1`

### 环境准备

- 安装 `Node.js`（版本要求：`20.14.0`，官网下载地址：https://nodejs.org/）
- 安装依赖管理工具：`npm`（`Node`自带）或 `yarn`（可选，需额外安装）

### 快速启动

- 克隆代码到本地 `git clone https://github.com/KPointFuture/offline-deployment.git`

- 进入项目目录 `cd offline-deployment`

- 安装依赖 `npm install  # 运行后会生成 node_modules 依赖文件夹`

  安装依赖出现冲突或警告时，可添加后缀`--legacy-peer-deps`解决，即运行 `npm install --legacy-peer-deps`

- 启动本地开发环境 `npm run serve`

- 打包生产环境代码 `npm run build  # 打包后代码在 dist 文件夹，部署前端项目到服务器时就要用上这个文件夹`

- 打包`Electron`程序 `npm run electron:build  # 打包后 Electron 程序在 build 文件夹`，注意：因为`Electron`打包exe针对的是`dist/index.html`目录下的文件，所有在每次打包`Electron`程序前，请务必先执行`npm run build`，以确保`Electron`程序运行的是最新的项目代码

### 项目目录结构

```plaintext
offline-deployment/
├── build/	
├── dist/  	
├── node_modules/	# 依赖文件夹
├── public/	# 公共资源目录			
├── src/
│   ├── main.js                  # 应用入口文件
│   ├── App.vue                  # 根组件
│   ├── router/
│   │   └── index.js             # 路由配置（定义所有页面路由映射）
│   ├── store/
│   │   ├── index.js             # Vuex 状态管理入口（整合模块）
│   │   └── modules/
│   │       └── generate.js      # 生成任务状态管理（语音、形象、视频任务）
│   ├── api/
│   │   └── index.js             # API 请求工具（封装 Axios 及各类请求方法）
│   ├── view/
│   │   ├── dashboard.vue        # 主仪表盘组件（被 App.vue 引入）
│   │   ├── login/
│   │   │   ├── Login.vue        # 登录页面
│   │   │   └── Register.vue     # 注册页面
│   │   ├── ai/
│   │   │   └── index.vue        # AI 大模型页面
│   │   ├── chest/
│   │   │   ├── Index.vue        # AI 八宝箱主页
│   │   │   ├── HotNews.vue      # 新闻热榜
│   │   │   ├── ECommerce.vue    # 电商带货短视频
│   │   │   ├── ReWriting.vue    # 万物洗稿
│   │   │   ├── MotionTransfer.vue  # 动作迁移
│   │   │   ├── ActionImitation.vue # 姿势动作模仿
│   │   │   ├── CharacterReplace.vue # 人物形象替换
│   │   │   ├── VideoWatermarkRemove.vue # 视频水印去除
│   │   │   ├── MultiplePose.vue # 多姿势图片
│   │   │   ├── ImageWatermarkRemove.vue # 图片水印去除
│   │   │   ├── PhotoRestoration.vue # 照片修复
│   │   │   ├── DualTimbreCloning.vue # 双人音色克隆
│   │   │   ├── InteriorDesign.vue # 室内设计
│   │   │   ├── FrameHeadTail.vue # 视频首尾帧
│   │   │   ├── ImageLipSync.vue # 图片对嘴型
│   │   │   ├── FontLogoCN.vue   # 中文字体LOGO
│   │   │   └── ContentRemoval.vue # 内容消除
│   │   ├── figures/
│   │   │   ├── index.vue        # 形象克隆主页面
│   │   │   ├── imageToScript.vue # 图生脚本
│   │   │   ├── scriptToImage.vue # 脚本生图
│   │   │   ├── imageToVideo.vue # 图生视频
│   │   │   └── 1.json           # 用于查看数据的 不用理会
│   │   ├── voice/
│   │   │   └── index.vue        # 音色克隆页面
│   │   ├── video/
│   │   │   ├── home.vue         # 生成视频主页
│   │   │   ├── human.vue        # 选择数字人
│   │   │   ├── material.vue     # 选择素材
│   │   │   ├── smartGenerate.vue # 口播文案生成
│   │   │   ├── syncCv.vue       # 一键混剪-音画同步
│   │   │   ├── duplicate.vue    # 爆款复刻-生成文案
│   │   │   ├── segments.vue     # 打磨复刻
│   │   │   ├── remix.vue        # 混剪复刻
│   │   │   ├── montage.vue      # 一键混剪-音画不同步
│   │   │   ├── hot.vue          # 选择爆款视频
│   │   │   └── list.vue         # 视频列表
│   │   ├── system/
│   │   │   └── index.vue  # 系统设置
│   │   └── shop/
│   │       └── index.vue        # 店铺管理页面
│   ├── assets/
│   │   ├── iconfont/			 # 自定义图标
│   │   └── fonts/				 # 自定义字体样式     
│   ├── utils/
│   │   └── storage.js           # 本地存储工具函数（如 localStorage 操作）
│   ├── components/
│   │   ├── CustomColorPicker.vue    # 自定义封装的颜色选择器组件
│   │   └── HelloWorld.vue       # 示例组件（初始化默认组件）
│   └── mixins/
│   │   ├── AgreementMixin.js    # 服务协议的混入
│   │   ├── ClearCacheMixin.js   # 清除缓存的混入
│   │   ├── EnhancedChoiceMixin.js # 鼠标框选操作的混入
│   │   ├── IPaginationMixin.js  # 分页的混入
│   │   └── RightMenuMixin.js    # 鼠标右键的混入
├── .eslintignore
├── .gitignore
├── babel.config.js
├── electron-main.js 	# electron主配置文件
├── jsconfig.json
├── package.json
├── package-lock.json
├── preload.js 	# electron 预加载文件
├── README.md
└── vue.config.js
```

### 组件详解（基于src目录）

#### App.vue

- 应用主组件，负责管理全局任务轮询

- 集成了 `dashboard.vue` 作为主视图
- 通过 `Vuex` 获取任务状态（`pendingVoiceTaskIds` 、`pendingVideoTaskIds`、`pendingFigureTaskIds`）
- 使用 `watch` 监听任务状态变化，自动启动 / 停止轮询
- 在组件销毁前清理所有定时器，防止内存泄漏
- 全局样式定义，包括滚动条、按钮样式等

```javascript
// 轮询控制逻辑
methods: {
  // 检查是否有正在进行的语音任务，有则轮询任务状态，无则停止轮询
  checkVoicePolling() {
    if (this.processVoice.length > 0 && !this.voicePollingTimer) {
      this.startVoicePolling();
    } else if (this.processVoice.length === 0 && this.voicePollingTimer) {
      this.stopVoicePolling();
    }
  },
  // 启动语音轮询（每3秒一次）
  startVoicePolling() {
    this.voicePollingTimer = setInterval(() => {
      this.$store.dispatch("generate/pollVoiceTasks");
    }, 3000);
  },
  // 停止语音轮询
  stopVoicePolling() {
    clearInterval(this.voicePollingTimer);
    this.voicePollingTimer = null;
  },
  // 视频和形象轮询方法结构类似...
}
```

#### main.js

- 应用入口文件，负责初始化 `Vue `实例
- 配置路由（`router`）、状态管理（`store`）
- 引入 `Element UI`
- 自定义图标、自定义字体

```javascript
import Vue from 'vue'
import App from './App.vue'
import router from './router'  // 引入路由配置
import './assets/iconfont/iconfont.css'  // 引入自定义图标
import './assets/fonts/font.css';  // 引入自定义字体

import store from './store';
Vue.prototype.$store = store;  // 注入状态管理

import ElementUI from 'element-ui';  // 引入Element UI
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

Vue.config.productionTip = false

// 初始化Vue实例
new Vue({
    router, // 注入路由
    render: h => h(App), // 挂载根组件App.vue
}).$mount('#app') // 挂载到HTML中的#app节点
```

#### router

##### index.js

- 路由配置文件，负责SPA（单页应用程序）中的路由跳转和状态管理
- 定义所有页面路由映射

```javascript
.....

const router = new Router({
    mode: 'hash', //设置 mode 为 hash ，它确保了路由跳转时不会发送请求给服务器，适合前端路由管理
    routes //将定义好的路由配置数组routes传入Router实例。
});

export default router;  //导出路由实例，以便在Vue应用中挂载和使用，实现页面间的导航和跳转
```

#### store

##### index.js

- Vuex 状态管理入口文件，整合 `generate`、`task`、`shop` 模块，统一管理应用状态

##### modules

###### generate.js

- 管理音色克隆、形象克隆、视频生成任务的轮询与状态更新
- 与 `App.vue` 的轮询逻辑联动

```javascript
......
/*
 * 轮询视频生成任务的方法
 */
async pollVideoTasks({ state, commit }) {
    const pendingTasks = state.videoTaskIds  // 从Vuex store的状态中获取当前正在处理（pending）的视频任务ID列表

    await getAction("/video_record/query").then(res => { // 发起API请求
        if (res.data.status ==='success') {
            let result = res.data.data  // 将本次请求的数据赋值给result
			
            // 更新store中的视频任务状态
            commit("SET_VIDEOS", res.data.data);
            commit('SET_VIDEO_TASK', result.filter(video => video.status === 'pending').map(item => item.id))
            
            // 检查特定任务的状态, 筛选出那些id在pendingTasks列表中的任务，也就是上次检查状态时是pending状态的数据
            let video_in_pending = result.filter(task => pendingTasks.includes(task.id))
            // 处理特定任务的状态变化
            video_in_pending.forEach(task => {
                if (task.status === 'success') {
                    // 如果本次检测任务的状态为success，通过Vue.prototype.$notify方法向用户显示一个成功的通知，持续时间为5秒
                    Vue.prototype.$notify({
                        title: "视频生成成功",
                        message: `${task.filename}视频生成任务已完成`,
                        type: "success",
                        duration: 5000
                    });
                    let downloadPath = localStorage.getItem('downloadPath') || 'C:\\offline'
                    window.electronAPI.downloadFile(task.video_path, downloadPath, task.filename)
                    Vue.prototype.$message.success(`视频已保存到${downloadPath}`)
                } else if (task.status === 'failed') {
                    // 如果本次检测任务的状态为failed，通过Vue.prototype.$notify方法向用户显示一个错误通知，无限期显示直到手动关闭
                    Vue.prototype.$notify({
                        title: "视频生成失败",
                        message: `${task.filename}视频生成任务失败,${task.message}`,
                        duration: 0,
                        type: "error",
                    })
                }
            })
        }else {
            Vue.prototype.$message.error(res.data.message);
        }
    }).catch(err => {
        console.log(err)
    })
},
    
// 音色克隆和形象克隆轮询方法逻辑类似...
...... 
```

#### api

##### index.js

- 封装 Axios 请求文件
- 统一处理 `user_id` ，避免在每个接口中重复编写
- 端口说明`6006`（核心API）、`9669`（充值/账单）、`11434`（Ollama/模型服务）、`8080`（WebUI）、`5008`（新闻热榜相关服务）

```javascript
import axios from 'axios';

// 创建一个 Axios 实例
const baseURL = 'http://127.0.0.1';
// const baseURL = 'http://192.168.1.25:6006';
// const baseURL = 'http://120.86.188.249:6006';

const default_port = 6006;  
const default_timeout = 60000

const createInstance = (timeout, port) => {
    return axios.create({
        baseURL: baseURL + ':' + port,
        timeout: timeout,
        headers: {'Content-Type': 'application/json'}
    })
}

let instance = createInstance();

// 请求拦截器
instance.interceptors.request.use(
    config => {
        // 这里可以添加请求头等配置
        // config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器
instance.interceptors.response.use(
    response => {
        return {
            status: response.status,
            data: response.data
        };
    },
    error => {
        // 这里可以处理响应错误
        console.log(error);
        return Promise.reject(error);
    }
);

// get请求
const getAction =
    (
        url,
        params = {},
        timeout = default_timeout,
        port = default_port
    ) => {
        instance = createInstance(timeout, port);
        params.user_id = sessionStorage.getItem('user_id');
        return instance.get(
            url,
            {params}
        );
    };

// post请求
const postAction =
    (
        url,
        data = {},
        timeout = default_timeout,
        port = default_port
    ) => {
        instance = createInstance(timeout, port);
        data.user_id = sessionStorage.getItem('user_id');
        return instance.post(
            url,
            data
        );
    };

// put请求
const putAction =
    (
        url,
        data = {},
        timeout = default_timeout,
        port = default_port
    ) => {
        instance = createInstance(timeout, port);
        data.user_id = sessionStorage.getItem('user_id');
        return instance.put(
            url,
            data
        );
    };

// delete请求
const delAction =
    (
        url,
        params = {},
        timeout = default_timeout,
        port = default_port
    ) => {
        instance = createInstance(timeout, port);
        params.user_id = sessionStorage.getItem('user_id');
        return instance.delete(
            url,
            {params}
        );
    };

//针对需要上传文件的post请求
const filePostAction =
    (
        url,
        formData,
        timeout = default_timeout,
        port = default_port
    ) => {
        instance = createInstance(timeout, port);
        formData.append('user_id', sessionStorage.getItem('user_id'));
        return instance.post(
            url,
            formData,
            {
                headers:
                    {'Content-Type': 'multipart/form-data'}
            }
        );
    };

export {
    getAction,
    postAction,
    putAction,
    delAction,
    filePostAction
};
```

#### assets

##### iconfont（自定义图标文件夹，不过多赘述）

##### fonts（自定义字体文件夹，不过多赘述）

#### utils

##### storage.js

- 封装本地存储（`localStorage`）操作，简化数据读写

```javascript
export const LocalStorage = {
    get(key) { // 从localStorage获取数据
        const value = localStorage.getItem(key)
        try {
            return JSON.parse(value)
        } catch (error) {
            return value
        }
    },

    set(key, value) { // 向localStorage存储数据
        localStorage.setItem(key, JSON.stringify(value))
    },

    remove(key) { // 删除localStorage中的数据
        localStorage.removeItem(key)
    },

    clear() { // 清除localStorage缓存
        localStorage.clear()
    }
}

// 使用方式
import { LocalStorage } from '@/utils/storage'// 在其他文件中引入

LocalStorage.set('key', value) // 使用  key是自定义键名  value是存入的数据

```

#### components

##### CustomColorPicker.vue

- 自定义封装的颜色选择器组件

- 在`human.vue `，`material.vue`均有引入使用

- 使用方式

  ```javascript
  <template>
    <div>
      <custom-color-picker ref="colorRef" :color="select_color"
                           @color-updated="handleColorUpdated"></custom-color-picker>
    </div>
  </template>
  
  <script>
  import CustomColorPicker from "@/components/CustomColorPicker.vue"; // 引入组件
  
  export default {
    components: {CustomColorPicker}, // 注册组件
    data() {
      return {
        select_color: "#000000" // 绑定的color值
      }
    },
    methods: {
      handleColorUpdated(color) {  // 选择颜色后的方法,color是选择的颜色
        this.select_color = color;
      }
    }
  }
  </script>
  
  <style scoped>
  
  </style>
  ```

#### mixins

##### AgreementMixin.js

- 服务协议的混入
- 在`system/index.vue 系统设置页面有引入使用`

```javascript
export const AgreementMixin = {
    data() {
        return {
            // 将服务协议内容，用markdown格式处理一遍
            timbre_agreement:
                '#### 声音复刻|用户协议\n' +
                '欢迎使用广东省奇点未来软件研发有限责任公司（“奇点未来”）提供的声音复刻服务（“本服务”）。\n' +
                '\n' +
                '为使用本服务，您应当阅读并遵守本《用户协议》（“本协议”）。\n' +
                '\n' +
                '#### 注意\n' +
                '在接受本协议之前，请您务必审慎阅读本协议的全部内容。您通过网页点击确认本协议或实际使用本服务即表示您确认：您具有与我们达成具有约束力的合同所需的民事权利能力和民事行为能力（如果您未满18周岁，请在监护人的陪同下阅读本协议，并在征得监护人的同意后使用本服务），且您接受并同意遵守本协议。\n' +
                '\n' +
                '如果您不同意或无法准确理解本协议的任何内容或奇点未来对条款的解释，请不要同意本协议或使用本服务。否则，表示您已充分理解本协议并同意接受本协议的约束。\n' +
                '\n' +
                '#### 1. 本服务的内容及功能\n' +
                '本服务是奇点未来向您提供的声音复刻服务，基于您录制并上传一定数量的发音、朗读数据，通过奇点未来所对接的复刻算法自动完成声音复刻，向您提供定制化音色，由您或您授权的第三方调用以应用于语音播报等场景。\n' +
                '\n' +
                '#### 2. 免责声明\n' +
                '2.1 奇点未来有权基于业务发展或法律法规变动等任何原因，随时对本服务的服务内容和/或服务提供方式进行变动，或者暂停或永久终止本服务的全部或部分（包括删除、转移您存储、发布在本服务的内容等）。奇点未来不对因上述情况导致的任何后果负责，不对用户或第三方承担任何责任。\n' +
                '\n' +
                '2.2 您应对奇点未来基于本协议提供的内容（包括但不限于生成数据）的使用、处理、分享等行为负责。您应对奇点未来提供的内容自行加以判断，并承担因使用该等内容而引起的所有风险，包括因对奇点未来生成数据的正确性、准确性、完整性、适用性、合法性、不侵权、实用性或满足特定目的的依赖而产生的一切风险，奇点未来无法且不会对您因前述风险而导致的任何损失或损害承担责任。\n' +
                '\n' +
                '2.3 本服务是按照现有技术和条件所能达到的现状提供的，奇点未来不就本服务的使用效果、特定场景的可用性及稳定性等做出任何承诺。奇点未来不对下列情况承担任何责任：\n' +
                '- 本服务中断或终止；\n' +
                '- 本服务无法满足您的需求；\n' +
                '- 非奇点未来过错导致的业务数据泄露；\n' +
                '- 您操作不当或您的计算机软件、系统、硬件、通信线路或其他第三方资源出现故障；\n' +
                '- 业务数据或本服务中任何资料本身的及其产生、传送、存储、使用过程中的延误、不准确、错误和遗漏；\n' +
                '- 不可抗力事件、基础运营商原因或网络安全事故造成的损失；\n' +
                '- 第三方对本服务的任何声明或行为；\n' +
                '- 您因使用第三方产品或服务而遭受的任何损害和损失；\n' +
                '- 您通过本协议约定之外的方式使用本服务；\n' +
                '- 其他不可归因于奇点未来的过错、或奇点未来无法控制或合理预见的情形。\n' +
                '\n' +
                '2.4 任何情况下，奇点未来均不对任何间接的、偶然的、特殊的或惩罚性的损害和损失（如利润、机会、第三方费用、商誉或损害等）承担责任，无论基于合同、保证、侵权或任何其他责任理论，不论是否知道或应当知道上述损失或损害的可能性。\n' +
                '\n' +
                '#### 3. 使用规则\n' +
                '#### 3.1 知识产权相关规则\n' +
                '3.1.1 为您使用本服务之目的，奇点未来授予您一项个人的、不可转让的、非排他性的、有限的、不可分许可且可撤销的使用许可，您可在单一台终端设备上使用本服务。\n' +
                '\n' +
                '3.1.2 除本协议另有约定外，本协议项下一方向对方提供的任何内容的知识产权均属于提供方或其合法权利人所有，除非一方或其合法权利人明确同意，另一方无权复制、传播、转让、散布、展示、出售、许可或提供他人使用。\n' +
                '\n' +
                '3.1.3 您应保证您在使用本服务过程中自行提供、发布、上传和处理的任何内容的知识产权归属您或已获得权利人合法授权，该等内容不得包含任何违反适用的法律或侵犯第三方合法权益的内容。\n' +
                '\n' +
                '3.1.4 本服务生成数据的所有权及其知识产权，均由奇点未来所有并享有相关收益，您仅能基于本协议约定之目的而进行合理使用。未经奇点未来书面授权，您不得将生成数据用于任何商业目的，亦不得将其许可给任何第三方。\n' +
                '\n' +
                '3.1.5 您不得复制、模仿、修改、翻译、改编、出租、出售、转许可、在信息网络上传播、发布或转让本服务（全部或部分）、本服务中包含的内容、奇点未来基于提供本服务向您提供的任何权限密钥、技术文档、API列表、使用系统、应用程序、开发者工具及其他技术工具，亦不得通过反向工程、反向汇编、反编译或试图以其他方式破坏、破译、尝试发现产品和服务的源代码。\n' +
                '\n' +
                '#### 3.2 用户行为规范\n' +
                '3.2.1 您使用本服务时应当遵守相关法律法规，履行信息网络安全义务，不得实施如下行为、发布或传输的内容不得涉及如下情形：\n' +
                '- 反对宪法确定的基本原则的；\n' +
                '- 危害国家安全，泄露国家秘密的，颠覆国家政权，破坏国家统一的；\n' +
                '- 损害国家荣誉和利益的；\n' +
                '- 歪曲、丑化、亵渎、否定英雄烈士事迹和精神，以侮辱、诽谤或者其他方式侵害英雄烈士的姓名、肖像、名誉、荣誉的；\n' +
                '- 宣扬恐怖主义、极端主义或者煽动实施恐怖活动、极端主义活动的；\n' +
                '- 煽动民族仇恨、民族歧视，破坏民族团结的；\n' +
                '- 煽动地域歧视、地域仇恨的；\n' +
                '- 破坏国家宗教政策，宣扬邪教和迷信的；\n' +
                '- 编造、散布谣言、虚假信息，扰乱经济秩序和社会秩序、破坏社会稳定的；\n' +
                '- 散布、传播淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；\n' +
                '- 危害网络安全、利用网络从事危害国家安全、荣誉和利益的；\n' +
                '- 侮辱或者诽谤他人，侵害他人名誉、隐私和其他合法权益的；\n' +
                '- 对他人进行暴力恐吓、威胁，实施人肉搜索的；\n' +
                '- 散布污言秽语，损害社会公序良俗的；\n' +
                '- 侵犯他人隐私权、名誉权、肖像权、知识产权等合法权益内容的；\n' +
                '- 过度营销信息及垃圾信息；\n' +
                '- 侵害未成年人合法权益或者损害未成年人身心健康的；\n' +
                '- 未经他人允许，偷拍、偷录他人，侵害他人合法权利的；\n' +
                '- 包含恐怖、暴力血腥、高危险性、危害表演者自身或他人身心健康内容的，包括但不限于任何暴力或（和）自残行为内容、任何威胁生命健康、利用管制物品等危险器械表演的危及自身或他人人身或（和）财产权利的内容、怂恿、诱导他人参与可能会造成人身伤害或导致死亡的危险或违法活动的内容；\n' +
                '- 其他违反法律法规、公共政策、社会治安及公序良俗、干扰本服务正常运营或侵犯其他用户或第三方合法权益内容的其他信息。\n' +
                '\n' +
                '3.2.2 您使用本服务时，须维护互联网秩序和安全，不得实施破坏互联网秩序和安全的行为，不得侵犯包括奇点未来及任何主体（他人）的合法权益，也不得为前述行为提供便利。\n' +
                '\n' +
                '3.2.3 本服务仅限于在中国大陆地区使用，因您擅自在其他国家或地区使用而引发的相应风险及后果均由您自行承担。\n' +
                '\n' +
                '3.2.4 本服务可能会利用设备终端的处理器和带宽等资源，并可能产生数据流量的费用，请您自行向运营商了解相关资费情况，并自行承担相关费用。\n' +
                '\n' +
                '3.2.5 您将包含本服务的终端设备借用或转售给他人时，应充分告知设备上本服务的存在和本协议的内容。转售设备产生的个人信息泄露和任何问题均由您自行承担。\n' +
                '\n' +
                '#### 3.3 检测及审查\n' +
                '3.3.1 为提高用户使用本服务的安全性，奇点未来可能通过技术检测、外部验证等手段对用户通过本服务上传的内容进行检测和审查，以预防、发现、调查欺诈、危害安全、违法违规的行为，以保护用户、奇点未来及关联公司、合作方、社会公众的合法权益。\n' +
                '\n' +
                '3.3.2 奇点未来的审查记录可作为用户违法的证据，奇点未来有权删除违法信息、封号、暂时或永久禁止使用本服务，并有权向用户追究责任和要求赔偿。\n' +
                '\n' +
                '#### 4. 业务数据\n' +
                '#### 4.1 业务数据采集及使用\n' +
                '4.1.1 您理解并同意，为了向您提供本服务，奇点未来会通过【您的终端设备】收集、传输、使用、加工、存储您及授权您使用其声音数据的人士的声音，从而实现本服务的功能。为此，您同意并授权奇点未来：\n' +
                '- 获取终端设备的麦克风权限；\n' +
                '- 进行环境噪音检测；\n' +
                '- 采集个人声音，内容限于朗读本服务提供的指定文本和用户自定义文本。\n' +
                '\n' +
                '4.1.2 您同意并授权奇点未来为提供本服务之目的采集、存储和使用包括声音数据等在内的业务数据，并将业务数据用于本服务的改进和优化。\n' +
                '\n' +
                '4.1.3 您通过本服务进行加工、存储、上传、下载、分发以及通过其他方式处理（“处理”）的数据，均为您的业务数据。奇点未来作为中立的技术服务提供者，只会严格执行您的指示处理您的业务数据。\n' +
                '\n' +
                '4.1.4 您应对业务数据的来源及内容负责，您应谨慎判断数据来源及内容的合法性。您应保证您有权使用本服务对该等数据进行处理，且前述处理活动均符合相关法律法规的要求，不存在任何违法违规、侵权或违反与第三方合同约定的情形，亦不会将数据用于违法违规目的，因您的业务数据内容及您的数据处理行为违反法律法规、部门规章或国家政策而造成的全部结果及责任均由您自行承担。如您的业务数据中包含了个人信息的，您应保证已经获得了个人信息主体的同意，并有权将其个人信息传输给奇点未来进行数据处理。\n' +
                '\n' +
                '4.1.5 除为了提供本服务所必须，或经您的授权外，奇点未来不会对您的业务数据进行任意使用，并在提供服务后的合理期限内删除您的业务数据或进行匿名化处理。\n' +
                '\n' +
                '4.1.6 业务数据中可能包含个人信息，奇点未来不会故意识别、提取、搜集或单独存储业务数据中可能包含的个人信息，也不会将业务数据中可能包含的个人信息和奇点未来掌握的其他数据进行关联或融合。\n' +
                '\n' +
                '4.1.7 在向您提供本服务过程中，奇点未来可能会收集或产生某些技术和运营数据，例如系统日志、账单数据、客服对话、留资信息等，奇点未来可利用该等数据优化和改善奇点未来的产品和服务。\n' +
                '\n' +
                '#### 4.2 业务数据的修改/删除\n' +
                '4.2.1 您有权自行使用本服务对业务数据进行删除或（和）更改等处理，就您对业务数据的删除或（和）更改等处理，您应谨慎操作并承担该等操作所产生的后果，以防止发生数据无法恢复的风险，奇点未来不对该等数据承担恢复的责任。\n' +
                '\n' +
                '4.2.2 不论本服务因何原因终止，您通过本服务上传或存储在本服务中的内容，奇点未来将为您保留一（1）个月（“保留期限”），保留期限届满后，奇点未来将自动清除该等数据，包括所有缓存或备份，不再保留您的任何业务数据和内容。\n' +
                '\n' +
                '#### 5. 个人信息及隐私政策\n' +
                '5.1 在您使用本服务时，奇点未来需要您提供如下个人信息并用于如下用途：性别，用于系统自动适配底层模型以实现声音复刻功能。\n' +
                '\n' +
                '5.2 奇点未来依照法律法规的规定，将在境内运营本服务过程中收集和产生的个人信息存储于中华人民共和国境内，不会将上述信息传输至境外。\n' +
                '\n' +
                '5.3 奇点未来将仅在为提供本服务之目的所必需的期间内保留您的个人信息。\n' +
                '\n' +
                '5.4 奇点未来依法保护您对于您信息的查阅、复制、更正、补充、删除以及撤回授权同意、注销账号（如有）、投诉举报等权利，以使您有能力保障您的隐私和信息安全。您可以查阅、复制、更正、补充、访问、修改、删除您主动提供的个人信息。\n' +
                '\n' +
                '5.5 奇点未来将严格按照法律法规的要求处理和管理您的个人信息。\n' +
                '\n' +
                '#### 6. 违约责任\n' +
                '6.1 如您违反本协议及相关的服务规则，奇点未来将有权采取包括但不限于以下一种或多种措施：1）在合理必要范围内，限制部分或全部功能的使用；2）暂停、中止服务；3）终止提供服务并终止本协议；4）要求您承担相应的违约责任。\n' +
                '\n' +
                '6.2 因您的违约行为引起的第三方投诉或索赔，您应当自行处理并承担全部责任。由此导致奇点未来向任何第三方赔偿或遭受相关国家机构处罚的，您还应当全额赔偿奇点未来因此遭受的全部损失，包括处理相关事宜而支出的合理费用。\n' +
                '\n' +
                '#### 7. 通知和送达\n' +
                '您同意并确认，奇点未来将通过官网的网页公告、系统通知、站内信、电子邮件、手机短信、即时通讯工具、邮政函件或快递等方式中的一种或多种方式向您发送与本服务有关的业务通知、服务提示、验证消息、营销信息等各种信息（包括但不限于更新后的服务规则、服务升级、机房裁撤、迁移、广告等）。您通过任何形式提供给奇点未来的联系地址、电话、电子邮件或（和）其他联系方式，均被视为有效送达的联系方式。此类通知将对您的权利义务产生重大影响，请您务必及时关注。前述信息在以下情况下视为已送达：\n' +
                '- 以网页公告等形式公布的，一经公布即生效（另有说明除外）；\n' +
                '- 以电子形式（包括系统通知、站内信、电子邮件、手机短信、即时通讯工具等）发送的，在发送成功后视为已送达；\n' +
                '- 以纸质载体发出的，以交邮后的第三（3）个自然日视为已送达。\n' +
                '\n' +
                '#### 8. 其他\n' +
                '8.1 奇点未来保留在不影响您在本协议下权利义务的前提下，将本协议的部分或全部权利及义务转让给奇点未来的关联公司或其他法律主体，或委托给具备相应资质的第三方，本协议对受让方或受托方同样具有法律约束力。在此情况下，奇点未来将提前通知您该等转让，而无需获得您的同意或确认。\n' +
                '\n' +
                '8.2 奇点未来依据国家政策法律变化、技术进步、产品功能变更等，有权对本协议及相关服务规则进行修订，奇点未来会将修改后的协议公布，前述修订内容一经正式公布，将作为本协议不可分割的组成部分，并与本协议具有同等效力。奇点未来承诺将会以合理的方式通知您，您也可以在相关页面中查询最新版本的协议及规则。如您对修订后的协议条款有异议，您可以选择停止使用本服务，如您继续使用，即视为您认可并接受修订后的协议条款。\n' +
                '\n' +
                '8.3 除非本协议上下文另有约定，本协议中的术语适用如下定义：\n' +
                '- “用户”指包括您在内的使用本服务的最终用户。\n' +
                '- “关联公司”指一方控制的实体、控制一方的实体，以及与一方共同受控制于同一实体的实体；此处的“控制”是指某实体支配另一实体主要商业行为或活动的权力，这种权力的形成可以是基于股权、投票权以及其他通常认为有支配力或重大的影响力的关系。\n' +
                '- “对本服务的使用”指包括但不限于安装、访问、显示、运行、试用、使用等的行为。\n' +
                '- “内容”指包括但不限于数据、文本、声音、图像、视频、文件、软件等各种形式的信息、资料和内容。\n' +
                '- “业务数据”指用户利用本服务而收集、传输、存储、处理的所有数据和内容，包括但不限于所有的文本、声音、图像或视频文件等。\n' +
                '- “生成数据”指奇点未来基于您的要求和指令，利用算法能力处理生成的相关数据。\n' +
                '- “不可抗力事件”指包括但不限于自然灾害、政府行为、法律的颁布或调整、罢工（任何一方内部劳资纠纷除外）、动乱等不能预见、不能避免并不能克服的客观情况。\n' +
                '\n' +
                '8.4 本协议的订立、效力、解释及争议解决均适用中华人民共和国大陆地区法律（不含中国香港、澳门、台湾地区）。\n' +
                '\n' +
                '8.5 因本协议或本协议项下事宜发生争议的，双方应本着友好态度共同协商解决，协商不成的，任一方有权将争议提交本协议签订地东莞市松山湖区有管辖权的人民法院诉讼解决。',
            // .... 其他协议类似
        }
    },
}
```

- 使用方式

  ```javascript
  <template>
    <div>
      <div v-html="timbre_agreement" class="agree-html">  //使用混入中的 timbre_agreement或其他定义的协议数据
        </div>
    </div>
  </template>
  
  <script>
  import {AgreementMixin} from "@/mixins/AgreementMixin"; // 引入混入
  
  export default {
    mixins: [AgreementMixin], // 注册
    data() {
      return {
        
      }
    },
    methods: {
      
    }
  }
  </script>
  
  <style scoped>
  .agree-html {
    max-height: calc(70vh - 100px);
    overflow-y: auto;
    will-change: transform;
  }
  </style>
  ```

##### ClearCacheMixin.js

- 清除页面缓存的混入
- 在AI八宝箱所有功能项、混剪四个模块相关页面均有引入
- 与`dashboard.vue` 中的 `<keep-alive>` 标签联动使用

```javascript
export const ClearCacheMixin = {
    data() {
        return {

        }
    },
    methods: {
        /**
         * 清除sessionStorage缓存，但保留登录状态

         */
        clearSessionCache() {
            let user_id = sessionStorage.getItem('user_id')
            let userInfo = sessionStorage.getItem('userInfo')
            sessionStorage.clear()
            sessionStorage.setItem('user_id', user_id);
            sessionStorage.setItem('userInfo', userInfo);
        },
        /**
         * 清除页面缓存
         * 
         * 使用方式 
         * 组件引入混入后 在该组件的每一个需要跳转页面的方法(即 this.$router.push())前添加 this.clearCache()清除缓存方法调用
         */
        clearCache() {
            console.log(this.$vnode)
            if (this.$vnode && this.$vnode.data.keepAlive) {
                if (this.$vnode.parent && this.$vnode.parent.componentInstance && this.$vnode.parent.componentInstance.cache) {
                    const key = this.$vnode.key || this.$vnode.componentOptions.Ctor.cid + (this.$vnode.componentOptions.tag ? `::${this.$vnode.componentOptions.tag}` : '');
                    const cache = this.$vnode.parent.componentInstance.cache;
                    const keys = this.$vnode.parent.componentInstance.keys;
                    if (cache[key]) {
                        delete cache[key];
                        const index = keys.indexOf(key);
                        if (index > -1) {
                            keys.splice(index, 1);
                        }
                    }
                }
            }
        },
        /**
         * 获取视频文件首帧，作为占位图片显示
         * 在AI八宝箱功能，如 人物形象替换 CharacterReplace.vue 等中需要上传视频的功能中有使用
         * 
         * 使用方式 
         * handleVideoChange(file, fileList) { // 上传视频后调用的方法
         *   this.getVideoCover(file.raw).then(coverUrl => {
         *     this.video_image = coverUrl  // 占位图片
         *   }).catch(err => {
         *     console.log(err)
         *   })
         *   this.videoFile = file
         * },
         */
        getVideoCover(file) {
            return new Promise((resolve, reject) => {
                const video = document.createElement('video');
                video.setAttribute('crossOrigin', 'anonymous'); // 处理跨域
                video.setAttribute('src', URL.createObjectURL(file));
                video.setAttribute('preload', 'auto');

                video.onloadeddata = () => {
                    const canvas = document.createElement('canvas');
                    const width = video.videoWidth;
                    const height = video.videoHeight;

                    canvas.width = width;
                    canvas.height = height;

                    canvas.getContext('2d').drawImage(video, 0, 0, width, height);

                    const coverUrl = canvas.toDataURL('image/jpeg');

                    URL.revokeObjectURL(video.src);
                    resolve(coverUrl);
                };

                video.onerror = (err) => {
                    this.$message.error('视频加载失败，请重新选择！');
                    reject(err);
                };
            });
        },
    }
}
```

##### EnhancedChoiceMixin.js

- 鼠标框选操作的混入
- 在`material.vue`素材选择组件中引入使用

```javascript
export const EnhancedChoiceMixin = {
    data() {
        return {
            lastClickedIndex: null,

            // 框选相关状态
            isSelecting: false,
            initialX: 0,     // 初始X坐标
            initialY: 0,     // 初始Y坐标
            selectionLeft: 0,  // 选框左边界
            selectionTop: 0,   // 选框上边界
            selectionWidth: 0, // 选框宽度
            selectionHeight: 0, // 选框高度
            initial_material_list: [],
            selectingThreshold: 50, // 框选最小移动阈值（像素）
            isVideoItemClick: false, // 标记是否为视频项点击
            shouldShowPopover: false,
            info_msg: ''
        }
    },
    methods: {
        onVideoItemMouseDown() {
            this.isVideoItemClick = true; // 初始化为点击
        },
        onMouseDown(type, event) {
            this.dragging = true;
            this.draggingType = type;
            this.startY = event.clientY;
        },
        onMouseMove(event) {
            if (!this.dragging) return;
            const deltaY = event.clientY - this.startY;
            this.startY = event.clientY;

            const containerHeight = this.$refs.container.clientHeight;
            const titleHeight = this.$refs.titleContainer?this.$refs.titleContainer.clientHeight:0;
            const contentHeight = this.$refs.contentContainer?this.$refs.contentContainer.clientHeight:0;
            let topOffset = this.topRatio * containerHeight
            let bottomOffset = this.bottomRatio * containerHeight

            if (this.draggingType === 'top') {
                let newTop = topOffset + deltaY;
                if (this.$refs.contentContainer) {
                    newTop = Math.max(0, Math.min(bottomOffset - titleHeight, newTop));
                }else {
                    newTop = Math.max(0, Math.min(containerHeight - titleHeight, newTop));
                }
                this.topRatio = Number((newTop / containerHeight).toFixed(2));
                this.updateTitleTextStyle()
            }

            if (this.draggingType === 'bottom') {
                let newBottom = bottomOffset + deltaY;
                if (this.$refs.titleContainer) {
                    newBottom = Math.max(topOffset + titleHeight,
                        Math.min(containerHeight - contentHeight, newBottom));
                } else {
                    newBottom = Math.max(titleHeight,Math.min(containerHeight - contentHeight, newBottom));
                }
                this.bottomRatio = Number((newBottom / containerHeight).toFixed(2));
                this.updateTextStyle()
            }
        },
        onMouseUp() {
            this.dragging = false;
        },
        startSelection(event) {
            if (event.button !== 0) {
                return
            }

            // 阻止默认行为和事件冒泡
            event.preventDefault()
            event.stopPropagation()

            // 记录初始位置
            const container = this.$refs.videoGrid
            const rect = this.$el.getBoundingClientRect()
            this.initialX = event.clientX - rect.left
            this.initialY = event.clientY - rect.top

            // 初始化选框位置和大小
            this.selectionLeft = this.initialX
            this.selectionTop = this.initialY
            this.selectionWidth = 0
            this.selectionHeight = 0

            this.isSelecting = true

            // 记录框选开始时的所有选中状态
            this.initial_material_list = [...this.material_list]
        },

        // 更新框选
        updateSelection(event) {
            if (!this.isSelecting) return

            const container = this.$refs.videoGrid
            const rect = this.$el.getBoundingClientRect()
            const currentX = event.clientX - rect.left
            const currentY = event.clientY - rect.top

            // 计算位移距离
            const distance = Math.sqrt(
                Math.pow(currentX - this.initialX, 2) +
                Math.pow(currentY - this.initialY, 2)
            );

            // 只有当移动超过阈值时，才认为是真正的框选
            if (distance >= this.selectingThreshold) {

                // 阻止点击事件
                event.preventDefault();
                event.stopPropagation();
                this.isVideoItemClick = false
                // 计算选框位置和大小（考虑任意方向）
                this.selectionLeft = Math.min(this.initialX, currentX)
                this.selectionTop = Math.min(this.initialY, currentY)
                this.selectionWidth = Math.abs(currentX - this.initialX)
                this.selectionHeight = Math.abs(currentY - this.initialY)

                // 更新选中项
                this.updateSelectedItems()
            }
        },

        // 结束框选
        endSelection() {
            if (!this.isSelecting) return

            this.isSelecting = false
            // 重置选框尺寸
            this.selectionWidth = 0
            this.selectionHeight = 0
            this.filterMaterials()
        },

        /**
         * 用于校验新加入的素材是否与已选素材的 size 和 store 属性一致
         * @param {object} newItem - 准备新加入选区的素材对象
         * @returns {boolean} - true 表示校验通过，false 表示不一致
         */
        checkConsistency(newItem) {
            if (this.material_list.length === 0) {
                return true;
            }

            const firstSelectedId = this.material_list[0];
            const referenceItem = this.filter_materials.find(m => m.id === firstSelectedId);

            // 检查 size 和 store 是否一致
            const isSizeConsistent = referenceItem.size === newItem.size;
            if (!isSizeConsistent) {
                this.info_msg = '检测到不同尺寸的素材，已结束框选，并自动过滤不同尺寸的素材'
                return false;
            }
            const isStoreConsistent = referenceItem.store_id === newItem.store_id;
            if (!isStoreConsistent) {
                this.info_msg = '检测到不同店铺的素材，已结束框选，并自动过滤不同店铺的素材'
                return false;
            }

            return true
        },

        // 更新选中项
        updateSelectedItems() {
            // 获取选框区域
            const selectionRect = {
                left: this.selectionLeft,
                top: this.selectionTop,
                right: this.selectionLeft + this.selectionWidth,
                bottom: this.selectionTop + this.selectionHeight
            }

            // 检查每个视频项是否在选框内
            for (const [index , el] of this.$refs.videoItems.entries()) {
                const domElement = el.$el || el;
                const rect = el.getBoundingClientRect()
                const containerRect = this.$el.getBoundingClientRect()

                // 计算相对于容器的位置
                const itemRect = {
                    left: rect.left - containerRect.left,
                    top: rect.top - containerRect.top,
                    right: rect.right - containerRect.left,
                    bottom: rect.bottom - containerRect.top
                }

                // 判断矩形是否重叠
                const isOverlapping =
                    itemRect.left < selectionRect.right &&
                    itemRect.right > selectionRect.left &&
                    itemRect.top < selectionRect.bottom &&
                    itemRect.bottom > selectionRect.top

                const id = domElement.dataset.id;
                const currentItem = this.filter_materials.find(m => m.id === id);

                if (isOverlapping && !this.material_list.includes(id)) {
                    if (this.checkConsistency(currentItem)) {
                        this.material_list.push(id);
                    } else {
                        this.$alert(this.info_msg,'提示')
                        this.endSelection();
                        return;
                    }
                }

                if (!isOverlapping && !this.initial_material_list.includes(id)) {
                    this.material_list = this.material_list.filter(item => item !== id)
                }
            }
            sessionStorage.setItem('material_list', JSON.stringify(this.material_list))
            this.contentHeight = 640
            if (this.mentionList.length > 0) {
                let material = this.mentionList[0]
                this.contentHeight = material.height / (material.width / 360)
            }
            sessionStorage.setItem('content_height', this.contentHeight)
            this.updateTextStyle()
            this.updateTitleTextStyle()
        }
    }
}
```

##### IPaginationMixin.js

- 分页的混入
- 在`system/index.vue `系统设置页面有引入使用
- 这个使用到的组件不多，看起来有点鸡肋，不过为了后期需要做分页查询功能的页面增加时方便，特地添加了这个混入

```javascript
export const IPaginationMixin = {
    data() {
        return {
            // 分页参数
            iPagination: {
                currentPage: 1,  // 当前页
                pageSize: 10,  // 每页显示条数
                pageSizes: [10, 20, 50, 100], // 每页显示条数选择器，可选10，20，50,100
                pagerCount: 5, // 总页数
                total: 0, // 数据总条数
            }
        }
    },
    methods: {

    }
}
```

##### RightMenuMixin.js

- 鼠标右键功能的混入
- 在`figure/index.vue` 形象克隆，`voice/index.vue ` 音色克隆引入使用

```javascript
export const RightMenuMixin = {
    data() {
        return {
            // 右键功能选项的 css 样式
            menuStyle: {
                position: 'fixed',
                top: '0',
                left: '0',
                border: '1px solid #eee',
                'border-radius': '6px',
                'background-color': '#fff',
                'z-index': 9999
            },
            rightMenuVisible: false, // 是否显示右键功能选项
            selectedItem: {} // 选择的功能项
        }
    },
    methods: {
        handleContextMenu(item, e) {
            e.preventDefault(); // 阻止事件冒泡
            if (this.selected_materials && !this.selected_materials.includes(item.id)) {
                this.selected_materials = [item.id]
            }
            this.rightMenuVisible = true;
            this.selectedItem = item
            this.selectedId = item.id
            this.downloadFilePath = item.video_path || ''
            this.downloadFileName = item.filename || ''
            // 在鼠标右键的位置显示
            this.menuStyle.left = Math.min(window.innerWidth - 173, e.clientX) + 'px'
            this.menuStyle.top = e.clientY + 'px'
            
            document.body.addEventListener("click", this.bodyClick); // 添加事件监听
        },
        /**
         * 除右键功能选项，其他位置的点击事件
         * 点击其他位置，隐藏右键功能选项并移除事件监听
         */
        bodyClick() {
            this.rightMenuVisible = false;
            this.selectedItem = {}
            document.body.removeEventListener("click", this.bodyClick);
        },
    }
}
```

#### view(组件文件夹)

##### ai (AI大模型菜单)

###### index.vue

- AI大模型服务，使用时，需要先开启模型服务
- AI大模型服务无法与其他本地数字人服务同时进行

```javascript
methods: {
    /**
     * 查询所有模型，默认选择第一个模型
     */
    queryModels() {
      getAction("/get_model_dict").then(res => {
        if (res.data.status === "success") {
          this.options = this.options.concat(res.data.options)
          this.model = this.options[0].value || ''
        }
      })
    },
    /**
     * 进入服务，先判断是否启动了模型
     */
    enterService() {
      if (this.modelOpen) {
        window.open("http://127.0.0.1:8080");
      } else {
        this.$message.error("请先开启模型服务");
      }
    },
    /**
     * 开启/关闭模型
     */
    switchChange(val) {
      if (val) {
        this.startService();
      } else {
        this.stopService();
      }
    },
    startWebui() {
      let params = {
        model: this.model,
      }
      postAction('start_webui', params).then(res => {
        console.log(res)
      }).catch(err => {
        this.$alert(err,'webui模型开启失败')
      })
    },
    startService() {
      this.modelOpen = false
      let params = {
        model: this.model,
        keep_alive: -1,
      };
      this.loading = this.$loading({
        lock: true,
        text: '模型服务启动中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      postAction("stop_docker_service").then((res) => {
        if (res.data.status === "success") {
          this.startWebui();
          if (this.model === 'doubao-1-5-thinking-pro-250415') {
            this.loading.close();
            this.loading = null;
            this.modelOpen = true;
            this.$message.success("模型加载成功");
            return
          }
          postAction("/api/generate", params, 60000, 11434).then((result) => {
            if (result.data.done) {
              this.modelOpen = true;
              this.$message.success("模型加载成功");
            } else {
              this.modelOpen = false;
              this.$alert(result.data.message,'模型加载失败');
            }
            this.loading.close();
            this.loading = null;
          }).catch(error => {
            this.loading.close();
            this.loading = null;
            this.modelOpen = false;
            this.$alert(error,'模型加载错误');
          });
        } else {
          this.modelOpen = false;
          this.loading.close();
          this.loading = null;
          this.$alert('当前后台有任务在进行中，请稍后再试','模型加载失败');
        }
      }).catch((err) => {
        this.modelOpen = false;
        this.loading.close();
        this.loading = null;
        this.$alert(err,'模型加载错误');
      });
    },
    stopService() {
      getAction("/api/ps", {}, 60000, 11434).then((res) => {
        if (res.data.models.length > 0) {
          let params = {
            model: res.data.models[0].model,
            keep_alive: 0,
          };
          this.modelOpen = true
          postAction("/api/generate", params, 60000, 11434).then((res) => {
            if (res.data.done) {
              this.modelOpen = false;
              this.$message.success("模型卸载成功");
            } else {
              this.modelOpen = true;
              this.$alert(res.data.message,'模型卸载失败');
            }
          }).catch((err) => {
            this.modelOpen = true;
            this.$alert(err,'模型卸载错误');
          });
        }
      })
   },
}
```

##### chest(AI八宝箱菜单)

###### Index.vue

- 引流工具、实战工具总入口

```javascript
methods: {
    gotoTool(path) {
      	sessionStorage.setItem('chest_path', path) // 记录跳转路由，需要在dashboard.vue中联动设置页面缓存信息
      	this.$router.push({path: path});
    },
}
```

###### ActionImitation.vue

- 一键模仿姿势 + 动作
- 姿势图像智能解析，动作实时模仿生成

```		javascript
  methods: {
    /*
     * 一键模仿姿势 + 动作方法
     */
    generate() {
      if (!this.originalFile.uid) {
        this.$alert('请上传视频后重试', '提示')
        return
      }
      if (!this.imitationFile.uid) {
        this.$alert('请上传图片后重试', '提示')
        return
      }
      this.loading = true

      const formData = new FormData();
      formData.append("original_image_file", this.originalFile.raw);
      formData.append('pose_image_file', this.imitationFile.raw);
      formData.append('max_resolution', this.resolutionRatio);

      filePostAction('/running_hub/imitate_person_pose', formData, 1800000).then(res => {
        if (res.data.status === 'success') {
          this.activeIndex = 0
          this.resultList = res.data.data.image_paths
          this.loading = false
        } else {
          this.loading = false
          this.$alert(`生成失败，${res.data.message}`, '提示')
        }
      }).catch(err => {
        this.loading = false
        this.$alert(`生成错误，${err}`, '提示')
      })
    },
    back() {
      sessionStorage.setItem('chest_path', '/chest')
      this.$router.push({ path: '/chest'})
    }
  }
```

###### CharacterReplace.vue

- 人物形象替换
- 智能替换目标人物形象，精准还原场景

```javascript
  methods: {
    /*
     * 视频上传后处理
     * 获取视频文件首帧作为占位显示，此处关联mixins/ClearCacheMixin.js中的getVideoCover方法
     */
    handleVideoChange(file, fileList) {
      this.getVideoCover(file.raw).then(coverUrl => {
        this.video_image = coverUrl
      }).catch(err => {
        console.log(err)
      })
      this.videoFile = file
    },
    /*
     * 人物形象替换方法
     */
    generate() {
      if (!this.videoFile.uid) {
        this.$alert('请上传视频后重试', '提示')
        return
      }
      if (!this.imageFile.uid) {
        this.$alert('请上传图片后重试', '提示')
        return
      }
      this.loading = true

      const formData = new FormData();
      formData.append("video_file", this.videoFile.raw);
      formData.append('image_file', this.imageFile.raw);
      formData.append('video_duration', this.duration);
      formData.append('prompt', this.promptInput);

      filePostAction("/running_hub/replace_video_person_workflow", formData, 1800000).then(res => {
        if (res.data.status === 'success') {
          this.result_video = res.data.data.video_path
          this.loading = false
        } else {
          this.loading = false
          this.$alert(`生成失败，${res.data.message}`, '提示')
        }
      }).catch(err => {
        this.loading = false
        this.$alert(`生成错误，${err}`, '提示')
      })
    },
    back() {
      sessionStorage.setItem('chest_path', '/chest')
      this.$router.push({ path: '/chest'})
    }
  }
```

###### ContentRemoval.vue

- 内容消除
- 图片内容消除，涂哪消哪，简单操作精准消除

```javascript
  methods: {
    /*
     * 重新设置涂抹画笔大小
     */
    lineWidthChange() {
      if (this.canvas) {
        this.canvas.freeDrawingBrush.width = this.lineWidth;
      }
    },
    /*
     * 打开编辑图片窗口
     */
    showDialog() {
      this.showDrawDialog = true
      this.$nextTick(async () => {
        if (!this.canvas) {
          await this.initCanvas();
        }
        this.loadImageToCanvas(this.image_path)
      })
    },
    /*
     * 确认涂抹，将涂抹后的图片保存，用于后续消除涂抹区域
     */
    async submitDraw() {
      const tempCanvas = this.generatePreview();

      const realFile = await new Promise((resolve) => {
        tempCanvas.toBlob(resolve, 'image/png');
      });
      this.image_path = URL.createObjectURL(realFile)
      this.imageFile = {
        uid: Date.now(),
        raw: realFile,
        name: 'example.png',
        url: this.image_path
      };
      this.handleCloseDrawDialog()
    },
    /*
     * 初始化Canvas
     */
    initCanvas() {
      // 如果已有canvas实例，先销毁
      if (this.canvas) {
        this.canvas.dispose();
      }
      this.canvas = new fabric.Canvas(this.$refs.editorCanvas, {
        backgroundColor: '#fff',
        isDrawingMode: true,
        selection: false
      });

      this.maskCanvas = document.createElement('canvas');
      this.maskCanvas.width = 600;
      this.maskCanvas.height = 600;

      this.updateBrushSettings();

      this.canvas.on('path:created', (event) => {
        this.updateMask(event.path);
        this.generatePreview();
      });

      this.canvas.clear();
    },

    calibrateCanvas() {
      if (!this.canvas) return;

      this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      this.canvas.calcOffset();
    },
	/*
     * 加载图片到Canvas
     */
    loadImageToCanvas(imageUrl) {
      this.canvas.clear();
      const maskCtx = this.maskCanvas.getContext('2d');
      maskCtx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
      fabric.Image.fromURL(imageUrl, (img) => {
        const scaleX = 600 / img.width;
        const scaleY = 600 / img.height;
        const scale = Math.min(scaleX, scaleY, 1); // 不放大图片

        img.scale(scale);
        img.set({
          left: (600 - img.width * scale) / 2,
          top: (600 - img.height * scale) / 2,
          selectable: false
        });

        this.imagePosition = {
          left: (600 - img.width * scale) / 2,
          top: (600 - img.height * scale) / 2,
          width: img.width * scale,
          height: img.height * scale
        };

        this.canvas.add(img);
        this.updateBrushSettings();
        this.calibrateCanvas();
      }, {
        crossOrigin: 'anonymous'
      });
    },
	/*
     * 处理图片，扣掉涂抹区域
     */
    updateMask(path) {
      if (!this.maskCanvas) return;

      const ctx = this.maskCanvas.getContext('2d');
      const pathData = path.path;
      ctx.beginPath();

      pathData.forEach((segment) => {
        const [command, ...params] = segment;
        switch (command) {
          case 'M':
            ctx.moveTo(params[0], params[1]);
            break;
          case 'L':
            ctx.lineTo(params[0], params[1]);
            break;
          case 'Q':
            ctx.quadraticCurveTo(params[0], params[1], params[2], params[3]);
            break;
          case 'C':
            ctx.bezierCurveTo(params[0], params[1], params[2], params[3], params[4], params[5]);
            break;
        }
      });

      ctx.lineWidth = this.lineWidth;
      ctx.strokeStyle = '#ffffff';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    },

    generatePreview() {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.imagePosition.width;
      tempCanvas.height = this.imagePosition.height;
      const tempCtx = tempCanvas.getContext('2d');

      tempCtx.drawImage(
          this.canvas.lowerCanvasEl,
          this.imagePosition.left,
          this.imagePosition.top,
          this.imagePosition.width,
          this.imagePosition.height,
          0,
          0,
          this.imagePosition.width,
          this.imagePosition.height
      );

      const maskData = this.maskCanvas.getContext('2d').getImageData(
          this.imagePosition.left,
          this.imagePosition.top,
          this.imagePosition.width,
          this.imagePosition.height
      );

      const imageData = tempCtx.getImageData(
          0, 0,
          this.imagePosition.width,
          this.imagePosition.height
      );

      const pixels = imageData.data;
      const maskPixels = maskData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        if (maskPixels[i] > 0) {
          pixels[i + 3] = 0;
        }
      }

      tempCtx.putImageData(imageData, 0, 0);
      return tempCanvas;
    },

    clearCanvas() {
      this.loadImageToCanvas(this.image_path)
    },

    restore() {
      this.loadImageToCanvas(this.originalImage)
    },
    handleCloseDrawDialog() {
      this.showDrawDialog = false
    },
    /*
     * 图片内容消除方法
     */
    generate() {
      if (!this.imageFile) {
        this.$alert('请上传图片后重试', '提示')
        return
      }
      this.loading = true

      const formData = new FormData();
      formData.append('image_file', this.imageFile.raw);

      filePostAction("/running_hub/image_content_removal", formData,1800000).then(res => {
        if (res.data.status === 'success') {
          this.activeIndex = 0
          this.resultList = res.data.data.image_path
          this.loading = false
        } else {
          this.loading = false
          this.$alert(`生成失败，${res.data.message}`, '提示')
        }
      }).catch(err => {
        this.loading = false
        this.$alert(`生成错误，${err}`, '提示')
      })
    },
    back() {
      sessionStorage.setItem('chest_path', '/chest')
      this.$router.push({ path: '/chest'})
    }
  }
```

###### DualTimbreCloning.vue

- 双人语音克隆
- 格式输入对话文案，音色选择与配音，对话音频快速制作

```javascript
methods: {
    /*
     * 双人语音克隆方法，上传音频克隆
     */
	generate_by_file() {
      if (!this.copyText) {
        this.$alert('请输入对话内容后重试', '提示')
        return
      }
      if (!this.audio1.uid) {
        this.$alert('请上传音频1后重试', '提示')
        return
      }
      if (!this.audio2.uid) {
        this.$alert('请上传音频2后重试', '提示')
        return
      }
      this.loading = true

      const formData = new FormData();
      formData.append("text", this.copyText);
      formData.append("audio1_file", this.audio1.raw);
      formData.append("audio2_file", this.audio2.raw);

      filePostAction("/running_hub/megatts3_dual_voice", formData,1800000).then(res => {
        if (res.data.status === 'success') {
          this.resultAudio = res.data.data.audio_path[0] || ''
          this.loading = false
        } else {
          this.loading = false
          this.$alert(`生成失败，${res.data.message}`, '提示')
        }
      }).catch(err => {
        this.loading = false
        this.$alert(`生成错误，${err}`, '提示')
      })
   },
   /*
    * 双人语音克隆方法，选择音色克隆
    */
   generate_by_timbre() {
      if (!this.copyText) {
        this.$alert('请输入对话内容后重试', '提示')
        return
      }
      this.loading = true

      let params = {
        text: this.copyText,
        timbre1_id: this.timbreInfo1.voice_id,
        timbre2_id: this.timbreInfo2.voice_id,
      }
      postAction('/running_hub/megatts3_dual_voice_by_timbre', params, 1800000).then(res => {
        if (res.data.status === 'success') {
          this.resultAudio = res.data.data.audio_path[0] || ''
          this.loading = false
        } else {
          this.loading = false
          this.$alert(`双人语音克隆失败，${res.data.message}`, '提示')
        }
      }).catch(err => {
        this.loading = false
        this.$alert(`双人语音克隆错误，${err}`, '提示')
      })
   },
}
```

###### ECommerce.vue

- 电商带货短视频制作
- 商品图智能识别与处理，文案与商品匹配生成，多音色选择与配音

```javascript
methods: {
    /*
     * 电商带货短视频制作方法
     */
    generate() {
      if (!this.imgFile.uid) {
        this.$alert('请上传图片后重试', '提示')
        return
      }
      if (!this.copywriting) {
        this.$alert('请输入口播文案后重试', '提示')
        return
      }
      this.loading = true

      const formData = new FormData();
      formData.append("image_file", this.imgFile.raw);
      formData.append('timbre_id', this.timbreInfo.voice_id);
      formData.append('voice_mode', this.mode);
      formData.append('copy', this.copywriting);
      formData.append('prompt', this.promptInput);

      filePostAction("/running_hub/e_ommerce", formData,1800000).then(res => {
        if (res.data.status === 'success') {
          this.videoUrl = res.data.data.video_path
          this.loading = false
        } else {
          this.loading = false
          this.$alert(`生成失败，${res.data.message}`, '提示')
        }
      }).catch(err => {
        this.loading = false
        this.$alert(`生成错误，${err}`, '提示')
      })
    },
}
```

###### FontLogoCN.vue  

- 中文字体logo
- 提交设计要求，一键生成专属 logo

```javascript
methods: {
    /*
     * 中文字体Logo设计方法
     */
    generate() {
      if (!this.design_requirements) {
        this.$alert('请填写设计要求后重试', '提示')
        return
      }
      this.loading = true
      let params = {
        prompt: this.design_requirements
      }
      postAction("/running_hub/chinese_font_logo", params, 1800000).then(res => {
        if (res.data.status === 'success') {
          this.activeIndex = 0
          this.resultList = res.data.data.image_path
          this.loading = false
        } else {
          this.loading = false
          this.$alert(`生成失败，${res.data.message}`, '提示')
        }
      }).catch(err => {
        this.loading = false
        this.$alert(`生成错误，${err}`, '提示')
      })
    },
}
```

###### FrameHeadTail.vue 

- 视频首尾帧
- 首尾帧输入，自定义特效功能，智能生成过渡特效视频

```javascript
methods: {
   /*
    * 视频首尾帧创作方法
    */
   generate() {
      if (!this.promptInput) {
        this.$alert('请输入提示词后重试', '提示')
        return
      }
      if (!this.firstFrameFile.uid) {
        this.$alert('请上传首帧后重试', '提示')
        return
      }
      if (!this.endFrameFile.uid) {
        this.$alert('请上传尾帧后重试', '提示')
        return
      }
      this.loading = true

      const formData = new FormData();
      formData.append('action_prompt', this.promptInput);
      formData.append('start_frame_file', this.firstFrameFile.raw);
      formData.append('end_frame_file', this.endFrameFile.raw);
      formData.append('duration_seconds', this.duration);

      filePostAction("/running_hub/video_first_last_frame_wan", formData,1800000).then(res => {
        if (res.data.status === 'success') {
          this.activeIndex = 0
          this.resultList = res.data.data.video_path.map(item => item.video_url)
          this.loading = false
        } else {
          this.loading = false
          this.$alert(`生成失败，${res.data.message}`, '提示')
        }
      }).catch(err => {
        this.loading = false
        this.$alert(`生成错误，${err}`, '提示')
      })
    },
}
```

###### HotNews.vue 

- 新闻热榜
- 热门新闻素材整合，多风格口播文案生成，视频快速制作与自定义

```javascript
methods: {
	/*
     * 关键字搜索新闻方法
     */
    searchNews() {
      if (this.search_text.trim() === '') {
        this.$alert('请输入关键字后重试', '提示');
        return;
      }
      this.resultVisible = true;
      this.search_loading = true;
      let params = {
        keyword: this.search_text
      }
      getAction('/news/online_search', params, 1800000, 5008).then(res => {
        if (res.data.status === 'success') {
          this.search_loading = false;
          this.search_result = res.data.data
          this.querySearchHistory()
        } else {
          this.search_loading = false;
          this.$alert(res.data.message, '提示')
        }
      }).catch(err => {
        this.search_loading = false;
        this.$alert(err, '提示')
      })
    },
    /*
     * 查询新闻榜单方法
     */
    queryHotNews() {
      getAction('/news/rank', {}, 60000, 5008).then(res => {
        if (res.data.status === 'success') {
          this.hot_news = res.data.data
        } else {
          this.$alert(res.data.message, '提示')
        }
      }).catch(err => {
        this.$alert(err, '提示')
      })
    },
    /*
     * 提取商品形象方法
     */
    async handleSubmitUpload() {
      if (this.img_list.length === 0) {
        this.$alert('请选择图片后重试', '提示');
        return;
      }
      let params = {
        image_base64_list: this.image_base64_list,
      }
      postAction('extract_product_info', params, 1800000, 5008).then(res => {
        if (res.data.status === 'success') {
          this.$message.success('商品信息提取成功！');
          this.imageDialogVisible = false;
          this.script_params.productInfo = res.data.data.product_info
        } else {
          this.$alert('提取失败' + res.data.message, '提示')
        }
      }).catch(err => {
        this.$alert('提取错误' + err, '提示')
      })
    },
    /*
     * 根据新闻详情生成口播文案方法
     */
    generateScript() {
      if (!this.hot_news_info) {
        this.$alert('请选择热榜新闻后重试', '提示');
        return;
      }
      let params = {
        ...this.script_params,
        news_id: this.hot_news_info.id,
        news_details: this.hot_news_info.details,
      }
      this.loading = true;
      this.loading_text = '口播文案生成中...';
      postAction('/copywriting/voice', params, 1800000, 5008).then(res => {
        if (res.data.status === 'success') {
          this.loading = false;
          this.oral_copy = res.data.data.script
          this.show_script = true
        } else {
          this.loading = false;
          this.$alert('生成失败' + res.data.message, '提示')
        }
      }).catch(err => {
        this.loading = false;
        this.$alert('生成失败' + err, '提示')
      })
    },
    /*
     * 生成口播视频方法
     */
    generateVideo() {
      if (!this.oral_title) {
        this.$alert('请输入口播视频标题后重试', '提示');
        return;
      }
      if (!this.oral_copy) {
        this.$alert('请输入口播视频文案后重试', '提示');
        return;
      }
      if (!this.select_figure.id) {
        this.$alert('请选择数字人形象后重试', '提示');
        return;
      }
      if (!this.timbres.id) {
        this.$alert('请选择音色后重试', '提示');
        return;
      }
      let params = {
        voice_id: this.timbres.voice_id,
        video_id: this.select_figure.video_id,
        voice_mode: this.mode,
        filename_list: [this.oral_title],
        text_list: [this.oral_copy],
        title_params: {
          title_text_list: [this.oral_title],
        },
      }
      postAction("/figure/generate_video_v2", params).then(res => {
        if (res.data.status === 'success') {
          this.$alert('已创建口播视频生成任务，视频生成成功后会自动下载到本地', "任务创建提醒");
          setTimeout(() => {
            this.clearCache()
            this.$router.push({path: '/videoList'})
          }, 500)
        } else {
          this.$alert(res.data.message, "生成视频任务创建失败")
        }
      }).catch(err => {
        this.$alert(err, "生成视频任务创建错误")
      })
    },
    back() {
      this.clearCache()
      sessionStorage.setItem('chest_path', '/chest')
      this.$router.push({ path: '/chest'})
    }
  }
```

###### ImageLipSync .vue 

- 图片对嘴型
- 选择形象、音色、输入文案，一键图片说话

```javascript
methods: {
    /*
     * 图片对嘴型方法，通过上传音频
     */
    generateByUpload() {
      if (!this.imageFile.uid) {
        this.$alert('请上传图片后重试', '提示')
        return
      }
      if (!this.voiceFile.uid) {
        this.$alert('请上传音频后重试', '提示')
        return
      }
      this.loading = true

      const formData = new FormData();
      formData.append('image_file', this.imageFile.raw);
      formData.append('audio_file', this.voiceFile.raw);
      formData.append('expand_ratio', this.movement_range);
      formData.append('min_resolution', this.resolution_ratio);

      filePostAction("/running_hub/photo_lip_sync", formData, 1800000).then(res => {
        if (res.data.status === 'success') {
          this.activeIndex = 0
          this.resultList = res.data.data.video_path.map(item => item.video_url)
          this.loading = false
        } else {
          this.loading = false
          this.$alert(`生成失败，${res.data.message}`, '提示')
        }
      }).catch(err => {
        this.loading = false
        this.$alert(`生成错误，${err}`, '提示')
      })
    },
    /*
     * 图片对嘴型方法，通过选择音色
     */
    generateByTimbre() {
      if (!this.imageFile.uid) {
        this.$alert('请上传图片后重试', '提示')
        return
      }
      if (!this.copywriting) {
        this.$alert('请输入文案后重试', '提示')
        return
      }
      this.loading = true

      const formData = new FormData();
      formData.append('image_file', this.imageFile.raw);
      formData.append('timbre_id', this.timbreInfo.voice_id);
      formData.append('voice_mode', this.mode);
      formData.append('copy', this.copywriting);
      formData.append('expand_ratio', this.movement_range);
      formData.append('min_resolution', this.resolution_ratio);

      filePostAction("/running_hub/photo_lip_sync_by_timbre", formData, 1800000).then(res => {
        if (res.data.status === 'success') {
          this.activeIndex = 0
          this.resultList = res.data.data.video_path.map(item => item.video_url)
          this.loading = false
        } else {
          this.loading = false
          this.$alert(`生成失败，${res.data.message}`, '提示')
        }
      }).catch(err => {
        this.loading = false
        this.$alert(`生成错误，${err}`, '提示')
      })
    },
}
```

###### ImageWatermarkRemove.vue 

- 图片水印去除
- 智能识别图像水印，一键极速擦除，无损文字

```javascript
methods: {
   /*
    * 图片水印去除方法
    */
   generate() {
      if (!this.imageFile.uid) {
        this.$alert('请上传图片后重试', '提示')
        return
      }
      this.loading = true

      const formData = new FormData();
      formData.append("image_file", this.imageFile.raw);

      filePostAction("/running_hub/fast_image_watermark_removal", formData, 1800000).then(res => {
        if (res.data.status === 'success') {
          this.resultList = res.data.data.image_paths
          this.loading = false
        } else {
          this.loading = false
          this.$alert(`生成失败，${res.data.message}`, '提示')
        }
      }).catch(err => {
        this.loading = false
        this.$alert(`生成错误，${err}`, '提示')
      })
    },
}
```

###### InteriorDesign.vue  

- SU一键室内效果图
- SU图、参考图智能借鉴，室内效果图极速制作呈现
- 版本更新lora（针对中古风/新中式/简单工装）针对该类型SU图片效果较好，输入SU图像（记得把边线隐藏效果较好，否侧可能出现黑色线条）
- SU转效果图：无需提示词，如需强调特殊材质，风格请在提示词栏用中文书写即可
- 线稿转效果图需填写提示词：将室内线稿图转为真实室内图像
- 白膜转效果图需填写提示词：将白膜图转为真实室内图像

```javascript
methods: {
    /*
     * su一键室内效果图方法
     */
    generate() {
      if (!this.suFile.uid) {
        this.$alert('请上传SU图片后重试', '提示')
        return
      }
      if (!this.referenceFile.uid) {
        this.$alert('请上传参考图片后重试', '提示')
        return
      }
      this.loading = true

      const formData = new FormData();
      formData.append("su_image_file", this.suFile.raw);
      formData.append("ref_image_file", this.referenceFile.raw);
      formData.append("style_transfer_mode", this.styleTransfer);
      formData.append("prompt", this.promptInput);
      formData.append("effect_mode", this.effect);

      filePostAction("/running_hub/su_interior_design_v2", formData, 1800000).then(res => {
        if (res.data.status === 'success') {
          this.resultList = res.data.data.image_paths
          this.loading = false
        } else {
          this.loading = false
          this.$alert(`生成失败，${res.data.message}`, '提示')
        }
      }).catch(err => {
        this.loading = false
        this.$alert(`生成错误，${err}`, '提示')
      })
    },
}
```

###### MotionTransfer.vue 

- 动作迁移二创人像
- 动作精准识别与捕捉，人像智能匹配与迁移，参数化视频创作

```javascript
methods: {
   /*
    * 动作迁移二创人像方法
    */
   generate() {
      if (!this.videoFile.uid) {
        this.$alert('请上传视频后重试', '提示')
        return
      }
      if (!this.imageFile.uid) {
        this.$alert('请上传图片后重试', '提示')
        return
      }
      this.loading = true

      const formData = new FormData();
      formData.append("video_file", this.videoFile.raw);
      formData.append('image_file', this.imageFile.raw);
      formData.append('video_duration', this.duration);
      formData.append('fps', this.fps);
      formData.append('prompt', this.promptInput);
      formData.append('long_side_size', this.long_size);

      filePostAction("/running_hub/action_transfer_portrait", formData,1800000).then(res => {
        if (res.data.status === 'success') {
          this.activeIndex = 0
          this.result_list = res.data.data.map(item => item.video_url)
          this.loading = false
        } else {
          this.loading = false
          this.$alert(`生成失败，${res.data.message}`, '提示')
        }
      }).catch(err => {
        this.loading = false
        this.$alert(`生成错误，${err}`, '提示')
      })
   },
}
```

###### MultiplePose.vue 

- 多姿势图生成
- 智能提取人物形象细节，一键生成多姿势图，9宫格照片极速完成

```javascript
methods: {
   /*
    * 多姿势图生成方法
    */
   generate() {
      if (!this.imageFile.uid) {
        this.$alert('请上传图片后重试', '提示')
        return
      }
      this.loading = true

      const formData = new FormData();
      formData.append("person_image_file", this.imageFile.raw);
      formData.append("max_resolution", this.resolutionRatio);

      filePostAction("/running_hub/consistent_multi_pose_images", formData,1800000).then(res => {
        if (res.data.status === 'success') {
          this.resultList = res.data.data.image_paths
          this.loading = false
        } else {
          this.loading = false
          this.$alert(`生成失败，${res.data.message}`, '提示')
        }
      }).catch(err => {
        this.loading = false
        this.$alert(`生成错误，${err}`, '提示')
      })
    },
}
```

###### PhotoRestoration.vue 

- 老照片修复
- 破旧照片智能识别处理，一键修复与润色

```javascript
methods: {
   /*
    * 老照片修复方法
    */
   generate() {
      if (!this.imageFile.uid) {
        this.$alert('请上传图片后重试', '提示')
        return
      }
      this.loading = true

      const formData = new FormData();
      formData.append("image_file", this.imageFile.raw);
      formData.append("instruction", this.promptInput);

      filePostAction("/running_hub/flux_kontex_old_photo_restoration", formData,1800000).then(res => {
        if (res.data.status === 'success') {
          this.resultList = res.data.data.image_paths
          this.loading = false
        } else {
          this.loading = false
          this.$alert(`生成失败，${res.data.message}`, '提示')
        }
      }).catch(err => {
        this.loading = false
        this.$alert(`生成错误，${err}`, '提示')
      })
    },
}
```

###### ReWriting.vue  

- 万物洗稿工作流
- 图像元素智能提取，背景迁移与融合，多场景适配洗稿

```javascript
methods: {
    /*
     * 洗稿方法
     */
    async generate() {
      if (!this.productFile.uid) {
        this.$alert('请上传产品图后重试', '提示')
        return
      }
      if (!this.exampleImg) {
        this.$alert('请上传参考图后重试', '提示')
        return
      }
      this.loading = true

      const tempCanvas = this.generatePreview();
      const blob = await new Promise((resolve) => {
        tempCanvas.toBlob(resolve, 'image/png');
      });
      const formData = new FormData();
      formData.append("white_image_file", this.productFile.raw)
      formData.append("black_image_file", blob)

      filePostAction("/running_hub/generate_all_rewrite_picture_workflow", formData, 1800000).then(res => {
        if (res.data.status === "success") {
          this.resultImg = res.data.data.image_path;
          this.$message.success('洗稿成功');
          this.loading = false
        } else {
          this.loading = false
          this.$alert('洗稿失败:'+ res.data.message, '提示');
        }
      }).catch(err => {
        this.loading = false
        console.error('洗稿错误:', err);
      });
    },
    /*
     * 下载洗稿结果
     */
    downloadResult() {
      fetch(this.resultImg).then(response => response.blob()).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const filename = this.resultImg.split('/').pop();
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }).catch(error => {
        console.error('下载图片失败:', error);
        this.$message.error('下载图片失败');
      });
    },
    /*
     * 初始化Canvas
     */
    initCanvas() {
      this.canvas = new fabric.Canvas(this.$refs.editorCanvas, {
        backgroundColor: '#f5f5f5',
        isDrawingMode: true,
        selection: false
      });

      // 初始化遮罩画布(不可见，用于记录涂抹区域)
      this.maskCanvas = document.createElement('canvas');
      this.maskCanvas.width = 800;
      this.maskCanvas.height = 400;

      this.updateBrushSettings();

      // 监听绘制事件，同步到遮罩画布
      this.canvas.on('path:created', (event) => {
        this.updateMask(event.path);
        this.generatePreview();
      });
    },

    calibrateCanvas() {
      if (!this.canvas) return;

      this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      this.canvas.calcOffset();
    },

    updateBrushSettings() {
      if (!this.canvas) return;

      this.canvas.freeDrawingBrush.color = '#353535';
      this.canvas.freeDrawingBrush.width = 20;
      this.canvas.freeDrawingBrush.lineCap = 'round';
      this.canvas.freeDrawingBrush.lineJoin = 'round';
    },
	/*
     * 加载图片到canvas
     */
    loadImageToCanvas(imageUrl) {
      this.canvas.clear();
      const maskCtx = this.maskCanvas.getContext('2d');
      maskCtx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
      fabric.Image.fromURL(imageUrl, (img) => {
        const scaleX = 800 / img.width;
        const scaleY = 400 / img.height;
        const scale = Math.min(scaleX, scaleY, 1); // 不放大图片

        img.scale(scale);

        img.set({
          left: (800 - img.width * scale) / 2,
          top: (400 - img.height * scale) / 2,
          selectable: false
        });

        this.imagePosition = {
          left: (800 - img.width * scale) / 2,
          top: (400 - img.height * scale) / 2,
          width: img.width * scale,
          height: img.height * scale
        };

        this.canvas.add(img);
        this.originalImage = img;
        this.hasImage = true;

        this.updateBrushSettings();

        this.calibrateCanvas();

      }, {
        crossOrigin: 'anonymous'
      });
    },
	/*
     * 更新遮罩(记录涂抹区域)
     */
    updateMask(path) {
      if (!this.maskCanvas) return;

      const ctx = this.maskCanvas.getContext('2d');
      const pathData = path.path;

      // 绘制路径到遮罩画布(用白色标记涂抹区域)
      ctx.beginPath();

      // 解析路径数据
      pathData.forEach((segment) => {
        const [command, ...params] = segment;

        switch (command) {
          case 'M': // 移动到
            ctx.moveTo(params[0], params[1]);
            break;
          case 'L': // 直线到
            ctx.lineTo(params[0], params[1]);
            break;
          case 'Q': // 二次贝塞尔曲线
            ctx.quadraticCurveTo(params[0], params[1], params[2], params[3]);
            break;
          case 'C': // 三次贝塞尔曲线
            ctx.bezierCurveTo(params[0], params[1], params[2], params[3], params[4], params[5]);
            break;
        }
      });

      // 设置线条样式并绘制
      ctx.lineWidth = 20;
      ctx.strokeStyle = '#ffffff'; // 白色标记涂抹区域
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    },

    generatePreview() {
      if (!this.originalImage) return;

      // 创建临时画布用于处理
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.imagePosition.width;
      tempCanvas.height = this.imagePosition.height;
      const tempCtx = tempCanvas.getContext('2d');

      // 1. 绘制原始图片区域
      tempCtx.drawImage(
          this.canvas.lowerCanvasEl,
          this.imagePosition.left,
          this.imagePosition.top,
          this.imagePosition.width,
          this.imagePosition.height,
          0,
          0,
          this.imagePosition.width,
          this.imagePosition.height
      );

      // 2. 获取遮罩数据
      const maskData = this.maskCanvas.getContext('2d').getImageData(
          this.imagePosition.left,
          this.imagePosition.top,
          this.imagePosition.width,
          this.imagePosition.height
      );

      // 3. 获取图像数据
      const imageData = tempCtx.getImageData(
          0, 0,
          this.imagePosition.width,
          this.imagePosition.height
      );

      // 4. 处理像素：涂抹区域(有白色标记)设为透明
      const pixels = imageData.data;
      const maskPixels = maskData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        // 如果遮罩该位置有颜色(涂抹过)，设置透明度为0
        if (maskPixels[i] > 0) { // 检查红色通道(白色的RGB值都为255)
          pixels[i + 3] = 0; // 设置alpha通道为0(完全透明)
        }
      }

      // 5. 将处理后的像素放回画布
      tempCtx.putImageData(imageData, 0, 0);

      return tempCanvas;
    },
}
```

###### VideoWatermarkRemove.vue

- 视频水印去除
- 视频移动水印去除即梦 、可灵、豆包、VEO3等通用版

```javascript
methods: {
    /*
     * 视频水印去除方法
     */
    generate() {
      if (!this.videoFile.uid) {
        this.$alert('请上传视频后重试', '提示')
        return
      }
      this.loading = true

      const formData = new FormData();
      formData.append("video_file", this.videoFile.raw);

      filePostAction("/running_hub/video_watermark_removal", formData,1800000).then(res => {
        if (res.data.status === 'success') {
          this.result_list = res.data.data.map(item => item.video_url)
          this.loading = false
        } else {
          this.loading = false
          this.$alert(`生成失败，${res.data.message}`, '提示')
        }
      }).catch(err => {
        this.loading = false
        this.$alert(`生成错误，${err}`, '提示')
      })
    },
}
```

##### figures(形象克隆菜单)

###### index.vue

- 形象克隆主页面，集成了形象库、素材库、图片库。

  - 形象库

    - 上传mp4、mov、MP4、MOV格式视频，进行形象克隆任务。
    - 克隆完成，右上角弹出提示信息(成功/失败均有)，与`store/modules/generate.js`联动
    - 右键形象，弹出功能选项菜单，可播放形象视频、重命名形象、删除形象，与`mixins/RightMenuMixin.js`联动

    ```javascript
    methods: {
       uploadError(file) { // 文件传递给后端失败的回调函数
          this.loading = false
          this.uploadFigureVisible = false
          let content = `创建${file.name}形象克隆任务失败`;
          this.$alert(content, "任务创建提醒");
       },
            
       uploadSuccess(res, file) { // 文件成功传递给后端的回调函数
          this.loading = false
          this.uploadFigureVisible = false
          if (res.status === "success") {
            let content = `已创建${file.name}形象克隆任务，形象克隆成功后会自动更新形象列表`;
            this.$alert(content, "任务创建提醒");
            this.$store.dispatch("generate/pollFigureTasks");
          } else {
            let content = `创建${file.name}形象克隆任务失败，${res.message}`;
            this.$alert(content, "任务创建提醒");
          }
       },
        
       /*
        * 确认上传的方法
        * this.$refs.figureUpload.submit()调用ElementUI的upload组件确认上传方法，将视频文件以及其他参数传给后端
        */    
       handleFigureSubmit() {
          let files = this.$refs.figureUpload.uploadFiles || []
          if (files.length === 0) {
            this.$alert('请选择一个视频文件作为数字人形象。','上传形象')
            return;
          }
          this.loading = true;
          this.$refs.figureUpload.submit()
       },
    }
    ```

  - 素材库

    - 上传视频素材、关联店铺信息进行素材分析任务，可批量上传，至多同时上传100个视频素材。
    - 克隆完成，右上角弹出提示信息(成功/失败均有)，与`store/modules/generate.js`联动
    - 右键素材，弹出功能选项菜单，可播放素材视频、重命名、删除以及查看素材分析详情，与`mixins/RightMenuMixin.js`联动
    - 支持鼠标左键框选，进行素材多选操作，联动右键素材删除功能(多选即为批量删除)

    ```javascript
    methods: {
       handleExceed(files, fileList) { // 在上传素材前校验文件数量，超出则弹出提示
          this.$alert(`当前限制选择 100 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`,'批量上传限制提醒');
       },
       handleSubmit() {
          if (this.materialList.length === 0) {
            this.$message.warning("请先选择文件！");
            return;
          }
          if (!this.uploadData.store_id) {
            this.$alert('请必须选择一个关联店铺！','上传素材')
            return;
          }
          const formData = new FormData();
          this.materialList.forEach((file) => {
            formData.append("file", file.raw); // 将文件添加到 FormData 中
          });
          if (this.uploadData.tag){
            formData.append('tag', this.uploadData.tag);
          }
          formData.append('store_id', this.uploadData.store_id);
          formData.append('lip_sync', true);
    
          this.loading = true
          filePostAction("/figure/clone_only", formData, 1800000).then((res) => {
            if (res.data.status === "success") {
              this.loading = false
              this.$store.dispatch("generate/pollFigureTasks");
              this.$message.success("上传成功");
              this.beforeUploadClose();
            }else {
              this.loading = false
              this.$alert(res.data.message, "上传失败");
            }
          }).catch((err) => {
            this.loading = false
            this.$alert(err, "上传错误");
          })
        },
    }
    ```
    
  - 图片库
  
    - 新增产品：上传产品图，输入产品名称，关联店铺，可批量上传，至多100张图。
    - 新增产品图：选择需要新增产品图的产品，点击"+"按钮，上传产品图
    - 删除产品：点击删除图标按钮，即可删除对应的产品
    - 点击产品图片，即可进入图片下一步操作"图生脚本" `imageToScript.vue`

    ```javascript
    methods: {
       handleSubmitUpload() {
          if (this.imagesList.length === 0) {
            this.$message.warning("请先选择文件！");
            return;
          }
          if (this.uploadImageData.name === '') {
            this.$message.warning("请输入产品名称！");
            return;
          }
          if (this.uploadImageData.store_id === '') {
            this.$message.warning("请选择关联店铺！");
            return;
          }
    
          const formData = new FormData();
          this.imagesList.forEach((file) => {
            formData.append("file", file.raw); // 将文件添加到 FormData 中
          });
          formData.append('group_name', this.uploadImageData.name);
          formData.append('store_id', this.uploadImageData.store_id);
    
          this.loading = true
          filePostAction("http://127.0.0.1:6006/picture/upload", formData,1800000).then((res) => {
            if (res.data.status === "success") {
              this.loading = false
              this.$message.success("上传成功");
              this.queryProducts()
              this.handleClear();
            }else {
              this.loading = false
              this.$alert(res.data.message, "上传失败");
            }
          }).catch((err) => {
            this.loading = false
            this.$alert(err, "上传错误");
          })
        },
    }
    ```

###### imageToScript.vue

- 图生脚本
- 根据上一步`figures/index.vue` 图片库选择的产品，填写产品核心卖点、选择营销亮点、生成脚本数量，生成视觉脚本
- 生成的脚本显示在聊天框内，可查看AI思考过程；对生成脚本不满意，可通过 chat 聊天方式输入修改意见重新生成
- 在聊天框内可选择生成的脚本到"选定脚本"区域，可对选择的脚本进行编辑、删除
- 选定脚本之后，点击"下一步：脚本生图"按钮，生成脚本对应产品图片，并进入下一步`scriptToImage.vue` 脚本生图页面

```javascript
methods: {
   generateScriptsByImage() {
      if (!this.sell_point) {
        this.$alert('请先输入产品核心卖点', '提示')
        return
      }
      this.isAlreadyGenerated = true // 控制显示聊天框
      this.isNewChat = false
      this.chats.push({ type: 'userMessage', content: this.sell_point }); // 往chat聊天中添加聊天记录
      this.isGenerating = true
      this.$nextTick(() => { this.scrollToBottom() }) // 自动将聊天滚动到最新内容
      let params = {
        selling_points: this.sell_point,  // 输入的核心卖点
        marketing_highlights: this.active_highlights, // 选择的营销亮点
        product_id: this.operateProductInfo.id, // figures/index.vue图片库选择的产品
        num_scripts: this.script_num, // 生成脚本数量
        user_id: sessionStorage.getItem('user_id'),
      }
      this.stream_query(params, 'http://127.0.0.1:6006/picture/generate_script_stream') // 流式接口输出聊天回答
   },
   /**
    * 该方法的主要功能是从后端获取流式生成的视觉脚本或其他相关信息，并实时更新到前端界面中。
    * 它能够处理流式响应中的不同数据类型，包括AI的思考过程和最终生成的脚本。	
    * 同时，该方法还支持请求的取消和错误处理，确保用户体验流畅且稳定。
    */
   async stream_query(params, url) {
      this.controller = new AbortController();
      try {
        // 发起fetch请求
        const response = await fetch(url, {
          method: 'POST',
          headers: {'Content-Type': 'application/json',},
          body: JSON.stringify(params),
          signal: this.controller.signal
        });
          
		// 检查响应状态
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        if (!response.body) throw new Error('浏览器不支持ReadableStream');
		
        // 创建读取器和解码器 创建一个ReadableStreamDefaultReader对象来读取响应体的流式数据，并创建一个TextDecoder对象将二进制数据解码为UTF-8文本。deltaAccumulator用于累积AI的思考过程，buffer用于缓存接收到的流式数据。
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let deltaAccumulator = '';
        let buffer = '';
		
        // 读取流式数据 使用一个无限循环来持续读取响应体的数据，直到所有数据都被读取完毕（done为true）。每次读取的数据被添加到buffer中，并根据换行符分割成多行。最后一行被保留在buffer中，处理剩余的不完整的行
        while (true) {
          const {done, value} = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, {stream: true});
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {  // 处理每一行数据
            if (line.trim() === '') continue;
            const jsonString = line.slice(6).trim();
            if (jsonString === '[DONE]') continue;

            try {
              const data = JSON.parse(jsonString);
              if (data.type === 'conversation_info') { // 如果类型为conversation_info，则保存conversation_id到组件数据和sessionStorage中
                this.conversation_id = data.conversation_id;
                sessionStorage.setItem('operate_conversation_id', this.conversation_id)
              }
              if (data.type === 'reasoning' && typeof data.delta === 'string') { //如果类型为reasoning，则将delta累加到deltaAccumulator中，更新thinking_text（AI思考过程），并滚动到聊天区域底部
                deltaAccumulator += data.delta;
                this.thinking_text = deltaAccumulator;
                this.$nextTick(() => { this.scrollToBottom() })
              }
              if (data.type === 'final') { // 如果类型为final，则表示所有脚本生成完毕，更新lastGeneratedScripts，将结果保存到sessionStorage，并将完整的答案消息推入聊天记录chats中，最后滚动到聊天区域底部
                this.isGenerating = false
                this.lastGeneratedScripts = data.data.scripts
                sessionStorage.setItem('last_generated_scripts', JSON.stringify(this.lastGeneratedScripts))
                this.chats.push({
                  type: 'answerMessage',
                  scripts: data.data.scripts,
                  thinking: data.data.thinking,
                })
                this.$nextTick(() => { this.scrollToBottom() })
              }
            } catch (parseError) {
              console.error('解析 JSON 数据时出错:', parseError, '数据:', line);
            }
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('流式请求错误:', error);
          this.thinking_text += `<br><span style="color: red;">请求出错: ${error.message}</span>`;
        }
      } finally {
        this.controller = null;
      }
   },
   /**
    * 下一步：脚本生图方法。
    * 根据选定的生图脚本、产品，生成图片。	
    */
   next() {
      this.loading = this.$loading({
        lock: true,
        text: '图片生成中，请稍等...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      let params = {
        product_id: this.operateProductInfo.id,
        scripts: this.scripts,
        size: "portrait"
      }
      postAction('/picture/generate_images_parallel', params, 600000).then(res => {
        if (res.data.status === 'success') {
          this.loading.close();
          this.loading = null;
          sessionStorage.setItem('image_scripts', JSON.stringify(res.data.data))

          sessionStorage.setItem('figure_path', '/scriptToImage')
          // 生成图片完成后跳转到 scriptToImage.vue 页面
          this.$router.push({path: '/scriptToImage'}) 
        } else {
          this.loading.close();
          this.loading = null;
          this.$alert(res.data.message, '提示')
        }
      }).catch(err => {
        this.loading.close();
        this.loading = null;
        this.$alert(err, '提示')
      })
    },
}
```

###### scriptToImage.vue

- 脚本生图，展示分镜脚本生成对应的视觉图片组
- 可进行文案编辑(分镜脚本修改)、重新生成视频图片、删除分镜脚本
- 鼠标悬浮视觉图片上，可选删除图片、下载图片、查看图片大图操作
- 点击右上角"生成素材分镜"按钮，根据当前视觉图片组，分镜脚本生成对应的素材分镜，并进入`imageToVideo.vue` 图生视频页面

```javascript
methods: {
   /*
    * 大图预览图片，弹窗预览
    */
   previewImage(image) { 
      this.previewImgUrl = image
      this.previewImgVisible = true
   },
   /*
    * 删除图片方法
    */
   deleteImage(index, image_index) {
      this.$confirm('确认删除该图片吗？','提示', {
        type: 'warning'
      }).then(() => {
        this.image_scripts[index].images.splice(image_index, 1)
        sessionStorage.setItem("image_scripts", JSON.stringify(this.image_scripts))
        this.$message.success('删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
   },
   /*
    * 下载图片方法
    */
   async downloadImage(image) { 
      fetch(image).then(response => response.blob()).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const filename = image.split('/').pop();
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(error => {
        console.error('下载图片失败:', error);
        this.$message.error('下载图片失败');
      });
   },
   /*
    * 生成素材分镜方法
    */
   generateVideo() {
      const hasEmptyImages = this.image_scripts.some(item => {
        return !item.images || item.images.length === 0;
      });
      if (hasEmptyImages) {
        this.$alert('生成素材失败，请先给每个分镜脚本生成图片后重新尝试！', '提示')
        return
      }
      this.loading = this.$loading({
        lock: true,
        text: '素材生成中，请稍等...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      let params = {
        scripts: this.image_scripts, // 包含分镜脚本以及对应的视觉图片组
        duration: 4,
      }
      postAction('/picture/generate_video', params, 600000).then(res => {
        if (res.data.status === 'success') {
          this.loading.close();
          this.loading = null;
          sessionStorage.setItem('video_scripts', JSON.stringify(res.data.data))
          sessionStorage.setItem('params_scripts', JSON.stringify(res.data.data))
          this.clearCache()
          sessionStorage.setItem('figure_path', '/imageToVideo')
          this.$router.push({path: '/imageToVideo'})
        } else {
          this.loading.close();
          this.loading = null;
          this.$alert(res.data.message, '生成素材失败')
        }
      }).catch(err => {
        this.loading.close();
        this.loading = null;
        this.$alert(err, '生成素材错误')
      })
    },
}
```

###### imageToVideo.vue

- 图生视频，展示分镜脚本以及视觉图片，生成对应的素材分镜
- 可进行重新生成素材分镜、删除素材分镜组
- 鼠标悬浮素材分镜上，可预览素材分镜、删除素材分镜、也可点击弹窗放大预览
- 点击右上角"保存到素材列表"按钮，根据当前素材分镜组，进行对应的素材分析，并进入`figures/index.vue` 形象克隆主页面

```javascript
methods: {
   /* 
    * 保存当前素材分镜到素材列表方法
    * 保存后清除页面缓存、清除sessionStorage缓存
    */
   saveAsMaterial() {
      let params_scripts = this.params_scripts.map(item => {
        return {
          ...item, 
          video_copy: item.video_copy || item.copy,
        }
      })
      let params = {
        store_id: this.productInfo.store_id, // 所选产品关联的店铺id
        scripts: params_scripts,
      }
      postAction('/figure/upload_generated_video_list',params).then(res => {
        if (res.data.status ==='success') {
          this.clearCache()
          this.removeCache()
          sessionStorage.setItem('classify_type', 'material')
          this.$router.push({path: '/figures'})
        } else {
          this.$alert(res.data.message,'保存为素材失败')
        }
      }).catch(err => {
        this.$alert(err,'保存为素材错误')
      })
   }, 
}
```

##### login(登录/注册模块)

###### Login.vue

- 用户登录功能，支持验证码登录、账号登录、微信登录三种登录方式

```javascript
methods: {
  /* 
   * 正则表达式校验手机号合法性方法
   */
  validatePhone(rule, value, callback) {
    let checkPhone = new RegExp(/^[1]([3-9])[0-9]{9}$/);

    if (value === '') {
      callback(new Error('请填写手机号'));
    } else if (!checkPhone.test(this.form.phone)) {
      callback(new Error('手机号格式不正确'));
    } else {
      callback();
    }
  },
  /*
   * 发送手机验证码的方法
   */
  onSMSSend() {
    if (!this.isSendSMSEnable) {
      return;
    }
    let checkPhone = new RegExp(/^[1]([3-9])[0-9]{9}$/);
    if (!this.form.phone || this.form.phone.length === 0) {
      this.$alert('请填写手机号', '提示');
      return
    }
    if (!checkPhone.test(this.form.phone)) {
      this.$alert('手机号输入错误，请修正后重试', '提示');
      return
    }
    let params = {
      phone: this.form.phone,
      usage: 'login',
    }
    postAction('/sms/send', params).then(res => {
      if (res.data.status === 'success') {
        this.smsCountDown = 60;
        this.startSMSTimer();
        this.$alert('短信验证码发送成功', '提示');
      } else {
        this.$alert('短信验证码发送失败：' + res.data.message, '提示');
      }
    }).catch(err => {
      console.log('短信验证码发送错误：' + err);
    })
  },
  /*
   * 短信验证码登录
   */
  handleSMSLogin() {
    let params = {
      phone: this.form.phone,
      code: this.form.sms,
      usage: 'login',
    }
    postAction('/sms/verify', params).then(res => {
      if (res.data.status === 'success') {
        this.message.success('登录成功');
        this.$router.push({path: '/ai'});
        sessionStorage.setItem('user_id', res.data.data.id);
        sessionStorage.setItem("userInfo", JSON.stringify(res.data.data))
      } else {
        this.$alert('登陆失败：' + res.data.message, '提示');
      }
    }).catch(err => {
      console.log('登陆错误：' + err);
    })
  },
  /*
   * 账号密码登录
   */
  handlePwdLogin() {
    let params = {
      phone: this.form.phone,
      password: this.form.password,
      usage: 'login',
    }
    postAction('/user/login', params).then(res => {
      if (res.data.status === 'success') {
        this.$message.success('登录成功');
        this.$router.push({path: '/ai'});
        sessionStorage.setItem('user_id', res.data.data.id);
        sessionStorage.setItem("userInfo", JSON.stringify(res.data.data))
      } else {
        this.$alert('登陆失败：' + res.data.message, '提示');
      }
    }).catch(err => {
      console.log('登陆错误：' + err);
    })
  },
  /*
   * 获取微信登录二维码方法
   * 注意，需要在public/index.html中引入微信登录依赖，才能使用new WxLogin()方法
   * <script src="https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js"></script>
   */
  getWxQrcode() {
    this.wxLoginVisible = true
    this.$nextTick(() => {
      this.wxLoginInstance = new WxLogin({
        id: "qrcode", // 二维码挂载的DOM节点ID
        appid: "wx7d381dcacd3804cf", // 替换为你申请的APPID
        scope: "snsapi_login",  // 微信登陆固定使用这个
        redirect_uri: encodeURIComponent("https://live.tellai.tech/"),  //扫码成功确认后的回调地址
        state: "randomState123", // 随机字符串，用于防止CSRF攻击
        style: "black", // 二维码样式（black/white）
        href: ""
      });
    })
  },
  /*
   * 获取链接中指定名称的参数
   */
  getQueryParam(name) {
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
    const r = window.location.search.substr(1).match(reg);
    return r ? decodeURIComponent(r[2]) : null;
  },
  /*
   * 扫码成功后的回调方法(实际执行微信登陆的方法)
   * 需要在mounted生命周期中调用这个方法
   */
  async handleWechatCallback() {
    const code = this.getQueryParam('code');
    if (!code) {
      return;
    }

    getAction('/user/wx/auth', { code: code }).then(res => {
      if (res.data.status === 'success') {
        this.$message.success('登录成功');
        sessionStorage.setItem('user_id', res.data.data.id);
        sessionStorage.setItem("userInfo", JSON.stringify(res.data.data))

        // 处理登录成功后浏览器链接地址依旧携带code参数问题
        const baseUrl = window.location.origin;
        const targetUrl = `${baseUrl}/#/ai`;
        window.history.replaceState(null, null, targetUrl);
        if (this.$route.path !== '/ai') {
          this.$router.push({path: '/ai'});
        }
      } else {
        this.$alert('登陆失败：' + res.data.message, '提示');
      }
    }).catch(err => {
      console.log('登陆错误：' + err);
    })
  },
  /*
   * 跳转到注册页面
   */
  createAccount() {
    this.$router.push({path: '/register'})
  }
}
```

###### Register.vue

- 用户注册功能，支持手机号注册，微信在扫码登录时即视为注册

```javascript
methods: {
   /*
    * 注册账号
    */
   createAccount() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          postAction('/user/register', this.form).then(res => {
            if (res.data.status === 'success') {
              this.form = {
                phone: '',
                password: '',
                sms: '',
              }
              this.$message.success('注册成功，请登录');
              this.$router.push({path: '/login'})
            } else {
              this.$alert('注册失败：' + res.data.message, '提示');
            }
          }).catch(err => {
            console.log('注册失败：' + err.message);
          })
        } else {
          this.$alert('表单校验错误，请修正后重试', '提示');
        }
      })
   },
   /*
    * 跳转到登录页面方法，为防止无意点击注册账号后无法回退问题
    */
   toLogin() {
      this.$router.push({path: '/login'})
   }
}
```

##### shop(品牌店铺菜单)

###### index.vue

- 品牌店铺主页面，与`figures/index.vue`形象克隆主页面 "素材库"、"图片库"关联
- 支持创建新店铺、修改店铺信息、删除店铺

```javascript
methods: {
   /*
    * 查询店铺信息方法
    * 数据库只用一个字段存储店铺所有信息，所以需要对该字段进行解析
    */
   queryShops() {
      getAction('/store/all').then(res => {
        if (res.data.status === 'success') {
          let store_data = res.data.data
          store_data.forEach(item => {
            let list = item.store_message.split('\n')
            let obj = {}
            for (let i = 0; i < list.length; i++) {
              let arr = list[i].split(':')
              obj[arr[0]] = arr[1]
            }
            item.mainProducts = obj['主推产品'] || ''
            item.sellingPoints = obj['优势卖点'] || ''
            item.targetAudience = obj['目标用户'] || ''
            item.shopAddress = obj['店铺地址'] || ''
          })
          this.shops = store_data
        } else {
          this.$message.error('获取店铺列表失败')
        }
      }).catch(err => {
        this.$message.error('获取店铺列表失败')
      })
   },
   /*
    * 删除店铺
    * 删除店铺，按逻辑来说，此店铺下的所有素材、产品、图片均需要清理，防止使用素材、产品时溯源店铺信息出错
    */
   handleDeleteShop(shopId) {
      this.$confirm('此操作将永久删除该店铺, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delAction('/store/delete', {store_id: shopId}).then(res => {
          if (res.data.status === 'success') {
            this.queryShops()
            this.$message.success('删除成功!')
          } else {
            this.$message.error('删除失败!')
          }
        }).catch(err => {
          this.$message.error('删除失败!')
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
   },
   /*
    * 新增店铺
    * 数据库只用一个字段存储店铺所有信息，所以需要对该字段进行处理
    */
   addShop(shop) {
      let store_message = `主推产品:${shop.mainProducts || ''}\n优势卖点:${shop.sellingPoints || ''}\n目标用户:${shop.targetAudience || ''}\n店铺地址:${shop.shopAddress || ''}`
      let params = {
        name: shop.name,
        store_message: store_message
      }
      postAction('/store/create', params).then(res => {
        if (res.data.status === 'success') {
          this.queryShops()
          this.$message.success('新店铺创建成功！')
        } else {
          this.$message.error('新店铺创建失败！')
        }
      }).catch(err => {
        this.$message.error('新店铺创建失败！')
      })
   },
   /*
    * 修改店铺信息
    */
   editShop(shop, msg = '修改店铺信息') {
      let store_message = `主推产品:${shop.mainProducts || ''}\n优势卖点:${shop.sellingPoints || ''}\n目标用户:${shop.targetAudience || ''}\n店铺地址:${shop.shopAddress || ''}`
      let params = {
        store_id: shop.id,
        name: shop.name,
        store_message: store_message
      }
      postAction('/store/update', params).then(res => {
        if (res.data.status === 'success') {
          this.queryShops()
          this.$message.success(msg + '成功！')
        } else {
          this.$message.error(msg + '失败！')
        }
      }).catch(err => {
        this.$message.error(msg + '失败！')
      })
   },
}
```

##### system(账户设置菜单)

###### index.vue

- 账户设置主页面，分为账户信息、应用设置、关于产品三个模块
  - 账户信息，
    - 查看剩余Token数
    - Token使用账单详情，关联`mixins/IPaginationMixin.js`
    - Token充值功能
  - 应用设置，可设置视频缓存路径，关联`store/modules/generate.js` 中的轮训视频生成任务方法，视频生成完成后会自动保存到当前设置的视频缓存路径中，该功能只能在Electron桌面端程序使用，无法在web端使用
  - 关于产品
    - 包含关于本产品的介绍
    - 如何联系我们，通过发送邮件到[support@qidian-ai.com](http://192.168.1.8:8080/#)，或点击邮箱弹出微信客服二维码，添加客服微信
    - 本产品的法律条款(即服务协议)，关联`mixins/AgreementMixin.js`

```javascript
mounted() {
   // 默认设置视频缓存路径为'C:\\offline',可自行修改
   this.downloadPath = localStorage.getItem('downloadPath') || 'C:\\offline'
   // 调用接口获取账户信息
   this.getInfo()
},
/*
 * 计算属性
 * 获取声音复刻协议、形象克隆协议、隐私政策、付费服务协议
 * 用markdown格式展示服务协议
 */
computed: {
   timbre_html() {
      return marked(this.timbre_agreement);
   },
   figure_html() {
      return marked(this.figure_agreement);
   },
   privacy_policy_html() {
      return marked(this.privacy_policy);
   },
   paid_service_html() {
      return marked(this.paid_service);
   },
},
methods: {
   /*
    * 获取账户信息方法
    */
   getInfo() {
      getAction("/get_remaining_tokens", {}, 60000, 9669).then((res) => {
        if (res.data.status === 'success') {
          this.info = res.data.data
          const remainingTokensRatio = this.info.remaining_tokens / this.info.total_tokens;
          this.percentage = Math.min(Math.max(remainingTokensRatio * 100, 0), 100);
        } else {
          this.$message.error(res.data.message)
        }
      }).catch(() => {
        this.$message.error('获取信息失败，请稍后再试')
      })
   },
   /*
    * 获取账单详情
    * 支持分页查询，在此处关联 mixins/IPaginationMixin.js
    */
   getBill() {
      let params = {
        pageSize: this.iPagination.pageSize,
        currentPage: this.iPagination.currentPage,
      }
      getAction('/get_api_call_log', params, 60000, 9669).then(res => {
        if (res.data.status === 'success') {
          this.bills = res.data.data.api_call_log_list || []
          this.iPagination.total = res.data.data.total || 0
        }else {
          this.$message.error(res.data.message)
        }
      }).catch(() => {
        this.$message.error('获取账单失败，请稍后再试')
      })
   },
   /*
    * 获取支付二维码方法
    * 在选择充值金额、支付方式后调用，目前只支持微信扫码支付
    * 在获取到支付二维码后，会进行 1 秒 1 次的频率轮训二维码状态，目的是为了确保支付完成后正确处理账户token余额的增加
    */
   loadQrCode() {
      if (this.rechargeForm.amount <= 0 || !this.rechargeForm.amount) {
        if (this.timer) {
          clearInterval(this.timer)
          this.timer = null
        }
        return
      }
      this.qr_loading = true
      let params = {
        amount: this.rechargeForm.amount,
        type: this.rechargeForm.paymentMethod,
      }
      postAction('/recharge_balance', params, 60000, 9669).then(res => {
        if (res.data.status === 'success') {
          this.codeInfo = res.data.data
          this.qr_loading = false
          if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
          }
          this.timer = setInterval(() => {
            this.queryQrCodeStatus()
          },1000)
        } else {
          this.$message.error(res.data.message)
        }
      }).catch((err) => {
        console.log(err)
        this.$message.error('支付二维码失败，请稍后再试')
      })
   },
   /*
    * 获取二维码状态方法
    * 包含 SUCCESS 支付成功、REFUND 转入退款以及 CLOSED 关闭订单三种状态
    * 在 SUCCESS 支付成功后会实时更新剩余token数
    */
   queryQrCodeStatus() {
      let params = {
        payment_id: this.codeInfo.payment_id,
      }
      postAction('/query_recharge_status', params, 60000, 9669).then(res => {
        if (res.data.status === 'success') {
          let status = res.data.data.trade_state
          switch (status) {
            case 'SUCCESS':  //支付成功
              this.getInfo()
              this.beforeClosePay()
              this.$message.success('充值成功')
              break
            case 'REFUND':   //转入退款
              this.beforeClosePay()
              break
            case 'CLOSED':   //关闭订单
              this.beforeClosePay()
              this.$alert('已关闭订单','充值提示')
              break
          }
        } else {
          if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
          }
          this.$message.error(res.data.message)
        }
      }).catch(() => {
        if (this.timer) {
          clearInterval(this.timer)
          this.timer = null
        }
        this.$message.error('获取二维码状态失败，请稍后再试')
      })
   },
   /*
    * 设置视频缓存路径方法
    * 在此次关联 store/modules/generate.js 中的轮训视频生成任务方法
    * 只支持在 Electron 客户端中使用，网页中无法正常使用
    */    
   chooseFolder() {
      window.electronAPI.selectFolder().then((path) => {
        if (path) {
          this.downloadPath = path
          localStorage.setItem('downloadPath', path)
        }
      })
   },
}
```

##### video(生成视频菜单 + 视频列表菜单)

###### home.vue

- 生成视频主页面，集成了数字人口播、智能成片（混剪-音画不同步）、混剪打磨（混剪-音画同步）、混剪复刻（复刻-音画不同步）、打磨复刻（复刻-音画同步）入口

```javascript
methods: {
   /*
    * 点击功能卡片事件执行的方法
    * type 用于区分进入了哪个功能的参数
    * path 功能页对应的 path 路径
    */ 
   gotoPage(path, type) {
      sessionStorage.setItem('next_type', type)
      sessionStorage.setItem('video_path', path)
      this.$router.push({path: path})
   }
}
```

###### human.vue 

- 数字人选择页面
  - 选择数字人，选择一个数字人形象，用于后续口播视频生成
  - 选择视频播放完成后拼接规则
  - 选择音色，可选高级音色、普通音色，高级音色需额外计费，作为数字人口播声音
  - 选择背景音乐，可选择口播视频的背景音乐，默认无
  - 设置口播标题样式，可选是否在视频中显示口播标题；口播标题展示方式；字体样式、字号、颜色、描边颜色，不透明度；口播标题是否添加背景，背景颜色和背景不透明度设置；也可在预览区域，拖动示例标题，设置字幕标题在口播视频的具体位置
  - 设置口播内容样式，同上
  - 拖动"示例标题"，"示例内容"设置字幕标题、字幕内容在口播视频中位置的方法，使用的是`mixins/EnhancedChoiceMixin.js` 中的`onMouseMove` 和`onMouseDown` 方法，具体实现逻辑见`mixins/EnhancedChoiceMixin.js`
  - 以上关于音频选择(音色、背景音乐)均支持试听
  - 配置完成后，点击"下一步：编辑文案"进入`smartGenerate.vue` 编辑文案页面

```javascript
methods: {
   /*
    * 查询数字人形象方法
    * 查询结果为用户在figures/index.vue形象克隆 - 形象库中克隆的形象
    */
   queryFigures() {
      let params = {
        video_type: 'figure'
      }
      getAction("/figure/query_success", params).then((res) => {
        if (res.data.status === "success") {
          let data = res.data.data.filter(item => item.status === "success")
          this.figures = data.map(item => ({...item, previewing: false}))
          this.filter_figures = this.figures
          let figure = JSON.parse(sessionStorage.getItem('figure')) || {}
          let validFiguresId = this.figures.map(item => item.id);
          this.figure = validFiguresId.includes(figure.id) ? figure : {}
        }
      }).catch((error) => {
        console.error("获取角色列表失败:", error);
      });
   },
   /*
    * 查询普通音色方法
    * 包含系统音色中的普通音色和用户自行克隆的音色
    */
   querySounds() {
      getAction("/timbres/get_all_common_timbre").then((res) => {
        if (res.data.status === "success") {
          this.voices = res.data.data;
          if (this.voices.length > 0 && this.mode === 'common') {
            let sound = JSON.parse(sessionStorage.getItem("figure_setting_voice"))
            if (sound && this.voices.some(item => item.id === sound.id)) {
              this.sound = sound
            } else {
              this.sound = this.voices[0];
              sessionStorage.setItem("figure_setting_voice", JSON.stringify(this.sound))
            }
          }
        } else {
          this.$message.error("获取声音列表失败。");
        }
      }).catch((error) => {
        console.error("获取声音列表失败:", error);
      });
   },
   /*
    * 查询高级音色方法
    * 系统音色中提供的高级音色
    */
   queryMiniMaxVoices() {
      getAction("/timbres/get_all_system_timbres",{voice_mode: 'advanced'}).then((res) => {
        if (res.data.status === "success") {
          this.minimax_voices = res.data.data
          if (this.minimax_voices.length > 0 && this.mode === 'advanced') {
            let sound = JSON.parse(sessionStorage.getItem("figure_setting_voice"))
            if (sound && this.minimax_voices.some(item => item.id === sound.id)) {
              this.sound = sound
            } else {
              this.sound = this.minimax_voices[0];
              sessionStorage.setItem("figure_setting_voice", JSON.stringify(this.sound))
            }
          }
        } else {
          this.$message.error("获取高级声音列表失败。");
        }
      }).catch((error) => {
        console.error("获取高级声音列表失败:", error);
      });
   },
   /*
    * 查询背景音乐方法
    * 系统有提供一些自带的背景音乐，也可在选择系统音色弹窗中自行上传背景音乐
    */
   queryBgm() {
      let bgmList = [{id: '', name: '无'}]
      getAction('/bgm/all').then(res => {
        if (res.data.status === 'success') {
          this.bgmList = bgmList.concat(res.data.data)
          let bgm = JSON.parse(sessionStorage.getItem("figure_setting_bgm"))
          if (bgm && this.bgmList.some(item => item.id === bgm.id)) {
            this.bgm = bgm
          } else {
            this.bgm = this.bgmList[0]
            sessionStorage.setItem("figure_setting_bgm", JSON.stringify(this.bgm))
          }
        } else {
          this.$message.error("获取背景音乐列表失败。");
        }
      }).catch((error) => {
        console.error("获取背景音乐列表失败:", error);
      })
   },
   /*
    * 获取字体样式方法
    * 系统默认提供，在assets/fonts中可查看具体字体样式文件
    */
   queryFontFamily() {
      getAction('/get_fonts').then(res => {
        if (res.data.status === 'success') {
          this.fontFamily = res.data.data
        }
      }).catch((error) => {
        console.error("获取字体样式列表失败:", error);
      });
   },
}
```

###### material.vue 

- 素材选择页面
  - 素材选择支持快捷键**Ctrl + A**全选，**Ctrl + Z**取消选择；支持通过标签，素材名称筛选。
  - 素材选择需要是同一店铺、同一分辨率的素材，在选择第一个素材时，后续可选素材将会根据第一个素材进行筛选隔离
  - 支持鼠标左键框选操作选择素材，关联 `mixins/EnhancedChoiceMixin.js` 混入`startSelection()、updateSelection()、endSelection()方法`
  - 支持使用**shift + 鼠标左键**范围选择
  - 支持选择数字人形象，用于后续混剪视频时，在最终视频加入数字人出镜
  - 其余音频设置(主播声音、背景音乐)，样式设置方式同 `human.vue` 数字人选择一致
  - 配置完成后，点击"下一步：编辑文案"进入`smartGenerate.vue` 编辑文案页面

```javascript
methods: {
   /*
    * 查询素材方法
    * 查询结果为用户在figures/index.vue形象克隆 - 素材库中上传进行分析的素材
    */
   queryMaterials() {
      getAction("/figure/query_success", {video_type: 'material'}).then((res) => {
        if (res.data.status === "success") {
          let data = res.data.data.filter(item => item.status === "success");
          if (data.length > 0) {
            // 获取素材的所有标签，用于筛选
            this.tags = [...new Set(
                data.flatMap(item => item.tag ? item.tag.split(/[,，]/).filter(Boolean) : [])
            )];
            // 获取素材的所有店铺，用于筛选
            this.storeIds = [...new Set(data.flatMap(item => item.store_id).filter(id => !!id))];

            setTimeout(() => {
              this.checkTagsOverflow()
            },50)

            // 查看是否有缓存选中的标签、店铺
            this.filter_active_tags = JSON.parse(sessionStorage.getItem('active_tags')) || []
            this.filter_active_store = JSON.parse(sessionStorage.getItem('active_store')) || []

            this.materials = data.map(item => ({
              ...item, previewing: false, size: item.height + '*' + item.width
            }))

            let validMaterialsId = this.materials.map(item => item.id);
            this.material_list = (JSON.parse(sessionStorage.getItem('material_list')) || [])
                .filter(id => validMaterialsId.includes(id)); //剔除已经删除掉的素材
            sessionStorage.setItem('material_list', JSON.stringify(this.material_list))

            this.filterMaterials()
          }
        }
      }).catch((error) => {
        console.error("获取素材列表失败:", error);
      });
   },
   /*
    * 监听键盘事件(快捷键Ctrl + A全选，Ctrl + Z取消选择)
    * event.preventDefault() 阻止事件冒泡
    * this.selectAllMaterials() 选择所有素材方法
    */
   handleKeyDown(event) {
      if (event.ctrlKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        this.selectAllMaterials();
      }
      if (event.ctrlKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        this.clearAllSelectMaterials()
        this.filterMaterials()
      }
   },
   /*
    * 鼠标左键点击选择事件
    */
   selectMaterial(item, event) {
      if (this.isSelecting || !this.isVideoItemClick) {
        event.stopPropagation()
        return
      }
      const isShiftKey = event.shiftKey // 点击时是否同时按下键盘shift键
      let index = this.filter_materials.indexOf(item)

      if (!isShiftKey) {
        this.selectResource(item)
        this.lastClickedIndex = index
        return
      }

      // Shift点击：处理范围选择
      if (this.lastClickedIndex !== null) {
        // 获取起始和结束索引
        const start = Math.min(this.lastClickedIndex, index)
        const end = Math.max(this.lastClickedIndex, index)

        // 选中范围内的所有项
        for (let i = start; i <= end; i++) {
          this.selectResource(this.filter_materials[i], true)
        }
      } else {
        // 第一次点击并且按住了Shift键，处理方式同普通点击
        this.selectResource(this.filter_materials[index])
      }

      this.lastClickedIndex = index
   },
   /*
    * 根据店铺id、尺寸筛选可选素材方法
    */    
   filterMaterials() {
      let filtered = this.materials;

      if (this.filter_text) { // 关键字筛选
        filtered = filtered.filter(item =>
            item.name.includes(this.filter_text) ||
            (item.tag && item.tag.split(/[,，]/).includes(this.filter_text))
        );
      }

      if (this.material_list.length > 0) { // 素材尺寸、店铺筛选
        let size = this.materials.find(item => item.id === this.material_list[0]).size
        let store_id = this.materials.find(item => item.id === this.material_list[0]).store_id
        // filtered = filtered.filter(item => item.size === size)
        filtered = filtered.filter(item => item.size === size && item.store_id === store_id)
      }

      if (!this.filter_active_tags.length && !this.filter_active_store.length) {
        this.filter_materials = filtered;
        return
      }

      const tag_filter = item => { // 标签筛选
        if (!item.tag) return false;
        const item_tags = item.tag.split(/[,，]/).map(tag => tag.trim());
        return item_tags.some(tag => this.filter_active_tags.includes(tag));
      };

      const store_filter = item => item.store_id && this.filter_active_store.includes(item.store_id);

      this.filter_materials = filtered.filter(item => {
        const has_tag_filter = this.filter_active_tags.length > 0;
        const has_store_filter = this.filter_active_store.length > 0;

        if (has_tag_filter && has_store_filter) {
          return tag_filter(item) || store_filter(item);
        }
        if (has_tag_filter)
          return tag_filter(item);

        return store_filter(item);
      });
   },
}
```

###### smartGenerate.vue 

- 口播文案生成页面，可通过chat聊天方式生成口播文案，也可进行相应的修改
- 若当前路由的上层路由是`/human`，也就是通过选择数字人页面(`human.vue`)"下一步：编辑文案"按钮进入当前页时，可在生成文案后生成数字人口播视频
- 若当前路由的上层路由是`/material`，也就是通过选择素材页面(`material.vue`)"下一步：编辑文案"按钮进入当前页时，可在生成文案后"下一步：智能成片"

```vue
<template>  
   ......
   // script_type === 'material'判断上层路由是否是素材页面 
   <div class="flex-center">
      <el-button type="primary" style="width: 176px" @click="nextStep"
                 v-if="script_type === 'material'">下一步：智能成片
      </el-button>
      <el-button type="primary" style="width: 176px" @click="verify" v-else>生成视频</el-button>
   </div>
</template>
```

```javascript
methods: {
   /*
    * 批量生成口播文案方法
    */ 
   batchGenerate() {
      if (this.copy_require.trim() === '') {
        this.$alert('文案要求不能为空，请先填写文案要求', '提示')
        return
      }
      this.isNewChat = false
      this.script_chat.push({
        type: 'userMessage',
        content: this.copy_require || '随意生成合适文案即可',
      });
      this.isGenerating = true
      this.$nextTick(() => { this.scrollToBottom() })

      const cleanTexts = this.exampleTexts.map(text => text.trim()).filter(text => text !== '');
      const store_id = this.script_type === 'material' ? this.mention_list[0].store_id : ''
      let params = {
        language: this.language,
        examples: cleanTexts,
        requirements: this.copy_require,
        num_of_words: parseInt(this.copy_num),
        script_count: parseInt(this.script_num),
        store_id: store_id,
      }
      postAction('/api/generate_script', params).then(res => {
        if (res.data.status === "success") {
          this.isGenerating = false
          this.lastGenerateScripts = res.data.data
          this.script_chat.push({
            type: 'answerMessage',
            scripts: res.data.data
          })
          this.$nextTick(() => { this.scrollToBottom() })
        } else {
          this.isGenerating = false
          this.$alert(res.data.message,'文案生成失败')
        }
      }).catch(err => {
        this.isGenerating = false
        this.$alert(err,'文案生成错误')
      })
   },
   /*
    * 修改生成的口播文案方法
    */ 
   sendChat() {
      if (this.chat_input.trim() === '') {
        this.$alert('请先输入修改意见', '提示')
        return
      }
      this.isNewChat = false
      this.script_chat.push({
        type: 'userMessage',
        content: this.chat_input || '随意生成合适文案即可',
      });
      this.isGenerating = true
      this.$nextTick(() => { this.scrollToBottom() })

      const store_id = this.script_type === 'material' ? this.mention_list[0].store_id : ''
      let params = {
        requirements: this.chat_input,
        num_of_words: parseInt(this.copy_num),
        store_id: store_id,
        conversation_id: this.conversation_id,
        scripts: this.lastGenerateScripts,
      }
      this.chat_input = ''
      postAction('/api/re_generate_script', params).then(res => {
        if (res.data.status === "success") {
          this.isGenerating = false
          this.lastGenerateScripts = res.data.data.scripts
          this.script_chat.push({
            type: 'answerMessage',
            scripts: res.data.data.scripts,
          })
          this.$nextTick(() => { this.scrollToBottom() })
        } else {
          this.isGenerating = false
          this.$alert(res.data.message,'文案生成失败')
        }
      }).catch(err => {
        this.isGenerating = false
        this.$alert(err,'文案生成错误')
      })
   },
   /*
    * 生成数字人口播视频方法
    */ 
   generateVideo() {
      if (this.copy_list.length === 0) {
        this.$alert('请先添加口播文案', "提示")
        return;
      }
      if (this.copy_list.some(item => item.title === "" || item.content === "")) {
        this.$alert('文案标题、内容不能为空', "提示");
        return
      }

      let name = this.setName()
      let params = {
        copy_request: this.copy_require,
        video_id: this.figure.video_id, // 形象id
        voice_id: this.sound.voice_id, // 音色id
        voice_mode: this.voice_mode, // 音色模式 普通/高级
        bgm_id: this.bgm.id, // 背景音色id
        bg_volume: this.bg_volume, // 背景音乐声音大小
        filename_list: name,
        reverse: this.reverse,
        text_list: this.copy_list.map(item => item.content), // 口播文案列表
        with_subtitle: this.withSubtitle, // 是否开启字幕内容
        with_title: this.withTitle, // 是否开启字幕标题
        subtitle_params: { // 字幕内容设置
          y_offset: this.bottom_offset_ratio,
          font: this.subtitleParams.font,
          fontsize: this.subtitleParams['fontsize'],
          color: this.subtitleParams.color,
          font_opacity: this.subtitleParams.content_font_opacity,
          stroke_color: this.subtitleParams.stroke_color,
          use_background: this.use_background,
          background_color: this.subtitleParams.background_color,
          background_opacity: this.subtitleParams.background_opacity
        },
        title_params: { // 字幕标题设置
          y_offset: this.top_offset_ratio,
          title_text_list: this.copy_list.map(item => item.title), // 口播文案标题列表
          show_model: this.show_model,
          font: this.subtitleNameParams.name_font,
          fontsize: this.subtitleNameParams.name_fontsize,
          color: this.subtitleNameParams.name_color,
          font_opacity: this.subtitleNameParams.title_font_opacity,
          stroke_color: this.subtitleNameParams.name_stroke_color,
          use_background: this.name_use_background,
          background_color: this.subtitleNameParams.name_background_color,
          background_opacity: this.subtitleNameParams.name_background_opacity
        },
      };
      postAction("/figure/generate_video_v2", params).then((res) => {
        if (res.data.status === "success") {
          this.$alert('已创建视频生成任务，视频生成成功后会自动下载到本地', "任务创建提醒");
          this.clearSessionCache()
          setTimeout(() => {
            this.clearCache()
            this.$router.push({path: '/videoList'})
          }, 500)
        } else {
          this.$alert(res.data.message, "生成视频任务创建失败")
        }
      }).catch((error) => {
        this.$alert(error, "生成视频任务创建错误")
      });
   },
}
```

###### montage.vue

- 智能成片，一键混剪-音画不同步页面
- 输入混剪要求，以chat聊天的方式进行混剪，混剪结果不满意，可在对话框中输入修改意见进行修改
- 混剪要求、chat聊天均提供@选择指定的素材
- 如有选数字人形象出镜，则可设置数字人出镜时长占总视频时长比例
- 等待混剪完成后，点击导出，即可将混剪结果导出到视频列表
- 可通过点击"一键混剪并导出"，无需等待混剪完成，全程后台运行

```javascript
methods: {
   /*
    * 混剪视频方法
    */ 
   generate() {
      if (this.copy_list.some(item => item.duration && !item.bgm.id)) {
        this.$alert('混剪失败，请给无文案任务添加背景音乐后重试', '提示')
        return
      }
      let actualRequest = this.requirement
      let names = this.mention_list.map(item => '@' + item.name);
      names.forEach((item, index) => {
        actualRequest = actualRequest.replace(item, `@{${this.material_list[index]}}`)
      })
      let reference_segments = null

      this.isNewChat = false
      this.mix_chats.push({
        role: 'user',
        content: this.requirement || '挑选合适的视频素材即可',
      });
      this.isGenerating = true
      this.$nextTick(() => {
        this.scrollToBottom()
        const chatEl = this.$refs.textareaRef.$el.querySelector('textarea')
        chatEl.addEventListener('scroll', this.handleChatScroll);
      })
      let params = {
        user_request: actualRequest,
        copy_request: this.copy_request,
        material_list: this.material_list,
        mute_materials: this.mute_materials,
        copy_list: this.copy_list,
        bg_volume: this.bg_volume,
        timbre_id: this.sound.voice_id,
        voice_mode: this.voice_mode,
        with_subtitle: this.withSubtitle,
        reverse: this.reverse,
        figure_ratio: this.figure_ratio + '%',
        reference_segments: reference_segments,
        user_id: sessionStorage.getItem('user_id')
      }
      this.stream_query(params, 'http://127.0.0.1:6006/figure/video_mix_edit_stream')
   },
   /*
    * 修改混剪结果方法
    */ 
   sendChat() {
      if (!this.mix_chatInput) {
        this.$alert('请先输入修改意见', '提示')
        return
      }
      let history_chat = this.mix_chats
      for (let i = this.mix_chats.length - 1; i >= 0; i--) {
        if (this.mix_chats[i].role === 'new_chat') {
          history_chat = this.mix_chats.slice(i + 1);
          break;
        }
      }
      this.mix_chats.push({ role: 'user', content: this.mix_chatInput });
      let actualRequest = this.mix_chatInput
      let names = this.mention_list.map(item => '@' + item.name);
      names.forEach((item, index) => {
        actualRequest = actualRequest.replace(item, `@{${this.material_list[index]}}`)
      })
      let version = history_chat.filter(item => item.role === 'user').length - 1
      let params = {
        data: this.lastGeneratedMixins,
        history_chat: history_chat,
        user_feedback: actualRequest,
        material_list: this.material_list,
        bool_list: this.mute_materials,
        conversation_id: this.conversation_id,
        user_id: sessionStorage.getItem('user_id')
      }
      this.mix_chatInput = '';
      this.isGenerating = true
      this.$nextTick(() => { this.scrollToBottom() })
      this.stream_query(params, 'http://127.0.0.1:6006/figure/re_video_mix_edit_stream', version)
   },
   /*
    * 流式输出混剪结果方法
    */ 
   async stream_query(params, url, version) {
      this.thinking_text = '';
      this.controller = new AbortController();
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {'Content-Type': 'application/json',},
          body: JSON.stringify(params),
          signal: this.controller.signal
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        if (!response.body) throw new Error('浏览器不支持ReadableStream');

        this.is_thinking = true

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let deltaAccumulator = '';
        let buffer = '';

        while (true) {
          const {done, value} = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, {stream: true});
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;
            const jsonString = line.slice(6).trim();
            if (jsonString === '[DONE]') continue;

            try {
              const data = JSON.parse(jsonString);
              if (data.type === 'conversation_info') {
                this.conversation_id = data.conversation_id;
                sessionStorage.setItem('mix_conversation_id', this.conversation_id)
              }
              if (data.type === 'reasoning' && typeof data.delta === 'string') {
                deltaAccumulator += data.delta;
                this.is_thinking = false
                this.thinking_text = deltaAccumulator;
                this.$nextTick(() => { this.scrollToBottom() })
                this.clearDelayTimer();
                this.delayTimer = setTimeout(() => {
                  this.is_pending = true;
                }, 2000);
              }
              if (data.type === 'progress') {
                this.percent = data.percent
              }
              if (data.type === 'final') {
                this.is_pending = false
                this.clearDelayTimer();
                this.isGenerating = false
                this.montage_data = data.data.data
                this.lastGeneratedMixins = data.data.data
                sessionStorage.setItem('last_generated_mixins', JSON.stringify(this.lastGeneratedMixins))
                sessionStorage.setItem("montage_data", JSON.stringify(this.montage_data))
                const jsons = data.data.data.map(item => {
                  const { duration, selling_point, audience } = item.details;
                  return `<span style="line-height: 16px">目标时长：${duration.toFixed(2)}s</span><br>
                          <span style="line-height: 16px">卖点：${selling_point}</span><br>
                          <span style="line-height: 16px">受众：${audience}</span>`;
                });
                this.mix_chats.push({
                  role: 'system',
                  content: {
                    thinking: data.data.thinking,
                    data: data.data.data,
                    jsons: jsons,
                    title: version ? `修改版本 V${version}`: '混剪结果'
                  }
                })
                this.$nextTick(() => { this.scrollToBottom() })
              }
            } catch (parseError) {
              console.error('解析 JSON 数据时出错:', parseError, '数据:', line);
            }
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('流式请求错误:', error);
          this.thinking_text += `<br><span style="color: red;">请求出错: ${error.message}</span>`;
        }
      } finally {
        this.controller = null;
      }
   },
   /*
    * 混剪结果导出视频方法
    */ 
   export_video(with_out_route) {
      let bool_list = this.material_list.map(item => this.mute_materials.includes(item))
      let name = this.setName()
      let params = {
        data: this.montage_data, // 混剪结果
        filename_list: name,
        bgm_id: this.bgm.id,
        bg_volume: this.bg_volume,
        with_subtitle: this.withSubtitle, // 是否开启字幕内容
        with_title: this.withTitle, // 是否开启字幕标题
        bool_list: bool_list, // 素材静音列表
        reverse: this.reverse,
        subtitle_params: { // 字幕内容设置 
          y_offset: this.bottom_offset_ratio,
          font: this.subtitleParams.font,
          fontsize: this.subtitleParams['fontsize'],
          color: this.subtitleParams.color,
          font_opacity: this.subtitleParams.content_font_opacity,
          stroke_color: this.subtitleParams.stroke_color,
          use_background: this.use_background,
          background_color: this.subtitleParams.background_color,
          background_opacity: this.subtitleParams.background_opacity
        },
        title_params: { // 字幕标题设置
          y_offset: this.top_offset_ratio,
          show_model: this.show_model,
          font: this.subtitleNameParams.name_font,
          font_opacity: this.subtitleNameParams.title_font_opacity,
          fontsize: this.subtitleNameParams.name_fontsize,
          color: this.subtitleNameParams.name_color,
          stroke_color: this.subtitleNameParams.name_stroke_color,
          use_background: this.name_use_background,
          background_color: this.subtitleNameParams.name_background_color,
          background_opacity: this.subtitleNameParams.name_background_opacity
        }
      }
      postAction('/figure/export_video_sync', params).then(res => {
        if (res.data.status === "success") {
          this.$alert('已创建视频生成任务，视频生成成功后会自动下载到本地', "任务创建提醒");
          if (with_out_route) {
            return
          }
          this.clearSessionCache()
          setTimeout(() => {
            this.clearCache()
            this.$router.push({path: '/videoList'})
          }, 500)
        } else {
          this.$alert(res.data.message, "导出失败");
        }
      }).catch((error) => {
        this.$alert(error, "导出错误");
      });
   },
   /*
    * 一键混剪并导出视频方法
    */ 
   batchExport() {
      if (this.copy_list.some(item => item.duration && !item.bgm.id)) {
        this.$alert('请给无文案任务添加背景音乐后重试', '提示')
        return
      }
      this.centerDialogVisible = false
      let actualRequest = this.requirement
      let names = this.mention_list.map(item => '@' + item.name);
      names.forEach((item, index) => {
        actualRequest = actualRequest.replace(item, `@{${this.material_list[index]}}`)
      })
      let reference_segments = null

      let bool_list = this.material_list.map(item => this.mute_materials.includes(item))
      let name = this.setName()
      let params = {
        user_request: actualRequest,
        material_list: this.material_list,
        mute_materials: this.mute_materials,
        copy_list: this.copy_list,
        bg_volume: this.bg_volume,
        timbre_id: this.sound.voice_id,
        voice_mode: this.voice_mode,
        with_subtitle: this.withSubtitle,
        reverse: this.reverse,
        figure_ratio: this.figure_ratio + '%',
        reference_segments: reference_segments,
        with_title: this.withTitle,
        bool_list: bool_list,
        filename_list: name,
        subtitle_params: {
          y_offset: this.bottom_offset_ratio,
          font: this.subtitleParams.font,
          fontsize: this.subtitleParams['fontsize'],
          color: this.subtitleParams.color,
          font_opacity: this.subtitleParams.content_font_opacity,
          stroke_color: this.subtitleParams.stroke_color,
          use_background: this.use_background,
          background_color: this.subtitleParams.background_color,
          background_opacity: this.subtitleParams.background_opacity
        },
        title_params: {
          y_offset: this.top_offset_ratio,
          show_model: this.show_model,
          font: this.subtitleNameParams.name_font,
          fontsize: this.subtitleNameParams.name_fontsize,
          color: this.subtitleNameParams.name_color,
          font_opacity: this.subtitleNameParams.title_font_opacity,
          stroke_color: this.subtitleNameParams.name_stroke_color,
          use_background: this.name_use_background,
          background_color: this.subtitleNameParams.name_background_color,
          background_opacity: this.subtitleNameParams.name_background_opacity
        }
      }
      postAction('/figure/export_video_sync_all', params, 3600000).then(res => {
        if (res.data.status === "success") {
          this.$alert('已创建视频生成任务，视频生成成功后会自动下载到本地', "任务创建提醒");
          this.clearSessionCache()
          setTimeout(() => {
            this.clearCache()
            this.$router.push({path: '/videoList'})
          }, 500)
        } else {
          this.$alert(res.data.message, "批量导出失败");
        }
      }).catch((error) => {
        this.$alert(error, "批量导出错误");
      });
   },
}
```

###### syncCv.vue 

- 一键混剪 · 音画同步页面
- 选择素材后，点击"下一步：一键混剪"进入一键混剪 · 音画同步页面
- 输入混剪要求、选择语言、输入文案要求、示例文案、视频时长以及文案数量，以chat聊天的方式进行混剪，混剪结果不满意，可在对话框中输入修改意见进行修改
- 混剪要求、chat聊天均提供@选择指定的素材
- 如有选数字人形象出镜，则可设置数字人出镜时长占总视频时长比例
- 等待混剪完成后，点击导出，即可将混剪结果导出到视频列表

```javascript
methods: {
   /*
    * 混剪视频方法
    */ 
   generate() {
      if (this.copy_require.trim() === '') {
        this.$alert('文案要求不能为空，请先填写文案要求', '提示')
        return
      }
      let actualRequest = this.requirement
      let names = this.mention_list.map(item => '@' + item.name);
      names.forEach((item, index) => {
        actualRequest = actualRequest.replace(item, `@{${this.material_list[index]}}`)
      })
      const cleanTexts = this.exampleTexts.map(text => text.trim()).filter(text => text !== '');

      this.isNewChat = false
      let mixContent = `混剪要求:${this.requirement ? this.requirement : '挑选合适的视频素材即可'}\n文案要求:${this.copy_require}`
      this.sync_mix_chats.push({
        role: 'user',
        content: mixContent,
      });
      this.isGenerating = true
      this.$nextTick(() => {
        this.scrollToBottom()
        const chatEl = this.$refs.textareaRef.$el.querySelector('textarea')
        chatEl.addEventListener('scroll', this.handleChatScroll);
      })

      let params = {
        language: this.language,
        requirements: this.copy_require,
        video_time: parseInt(this.video_time),
        example: cleanTexts,
        count: parseInt(this.script_num),
        material_list: this.material_list,
        mute_materials: this.mute_materials,
        user_request: actualRequest,
        bgm_id: this.bgm.id,
        bg_volume: this.bg_volume,
        timbre_id: this.sound.voice_id,
        voice_mode: this.voice_mode,
        with_subtitle: this.withSubtitle,
        reverse: this.reverse,
        figure_ratio: this.figure_ratio + '%',
        user_id: sessionStorage.getItem('user_id')
      }
      this.stream_query(params, 'http://127.0.0.1:6006/figure/video_mix_edit_sync_stream')
   },
   /*
    * 修改混剪结果方法
    */ 
   sendChat() {
      if (!this.mix_chatInput) {
        this.$alert('请先输入修改意见', '提示')
        return
      }
      let history_chat = this.sync_mix_chats
      for (let i = this.sync_mix_chats.length - 1; i >= 0; i--) {
        if (this.sync_mix_chats[i].role === 'new_chat') {
          history_chat = this.sync_mix_chats.slice(i + 1);
          break;
        }
      }
      this.sync_mix_chats.push({ role: 'user', content: this.mix_chatInput });
      let version = history_chat.filter(item => item.role === 'user').length - 1
      let actualRequest = this.mix_chatInput
      let names = this.mention_list.map(item => '@' + item.name);
      names.forEach((item, index) => {
        actualRequest = actualRequest.replace(item, `@{${this.material_list[index]}}`)
      })
      let params = {
        data: this.lastGeneratedMixins,
        history_chat: history_chat,
        user_feedback: actualRequest,
        material_list: this.material_list,
        bool_list: this.mute_materials,
        conversation_id: this.conversation_id,
        user_id: sessionStorage.getItem('user_id')
      }
      this.mix_chatInput = '';
      this.isGenerating = true
      this.$nextTick(() => { this.scrollToBottom() })
      this.stream_query(params, 'http://127.0.0.1:6006/figure/re_video_mix_edit_stream', version)
   },
   /*
    * 实际流式输出混剪结果方法
    */ 
   async stream_query(params, url, version) {
      this.thinking_text = '';
      this.controller = new AbortController();
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {'Content-Type': 'application/json',},
          body: JSON.stringify(params),
          signal: this.controller.signal
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        if (!response.body) throw new Error('浏览器不支持ReadableStream');

        this.is_thinking = true

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let deltaAccumulator = '';
        let buffer = '';

        while (true) {
          const {done, value} = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, {stream: true});
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;
            const jsonString = line.slice(6).trim();
            if (jsonString === '[DONE]') continue;

            try {
              const data = JSON.parse(jsonString);
              if (data.type === 'conversation_info') {
                this.conversation_id = data.conversation_id;
                sessionStorage.setItem('sync_mix_conversation_id', this.conversation_id)
              }
              if (data.type === 'reasoning' && typeof data.delta === 'string') {
                deltaAccumulator += data.delta;
                this.is_thinking = false
                this.thinking_text = deltaAccumulator;
                this.$nextTick(() => { this.scrollToBottom() })
                this.clearDelayTimer();
                this.delayTimer = setTimeout(() => {
                  this.is_pending = true;
                }, 2000);
              }
              if (data.type === 'progress') {
                this.percent = data.percent
              }
              if (data.type === 'final') {
                this.isGenerating = false
                this.is_pending = false
                this.clearDelayTimer()
                this.copy_list = data.data.data
                this.lastGeneratedMixins = data.data.data
                sessionStorage.setItem('sync_last_generated_mixins', JSON.stringify(this.lastGeneratedMixins))
                sessionStorage.setItem("sync_cv_copy_list", JSON.stringify(this.copy_list))
                const jsons = data.data.data.map(item => {
                  const { duration, selling_point, audience } = item.details;
                  return `<span style="line-height: 16px">目标时长：${duration.toFixed(2)}s</span><br>
                          <span style="line-height: 16px">卖点：${selling_point}</span><br>
                          <span style="line-height: 16px">受众：${audience}</span>`;
                });
                this.sync_mix_chats.push({
                  role: 'system',
                  content: {
                    thinking: data.data.thinking,
                    data: data.data.data,
                    jsons: jsons,
                    title: version ? `修改版本 V${version}`: '混剪结果'
                  }
                })
                this.$nextTick(() => { this.scrollToBottom() })
              }
            } catch (parseError) {
              console.error('解析 JSON 数据时出错:', parseError, '数据:', line);
            }
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('流式请求错误:', error);
          this.thinking_text += `<br><span style="color: red;">请求出错: ${error.message}</span>`;
        }
      } finally {
        this.controller = null;
      }
   },
   /*
    * 导出混剪结果到视频列表方法
    */ 
   export_video() {
      if (this.copy_list.length === 0) {
        this.$alert('请先使用左侧工具生成文案，您至少需要一条文案才能开始制作。', '提示')
        return
      }
      let bool_list = this.material_list.map(item => this.mute_materials.includes(item))

      let name = this.setName()
      let params = {
        data: this.copy_list,
        filename_list: name, //视频文件名
        bgm_id: this.bgm.id || '',
        bg_volume: this.bg_volume,// bgm的音量大小，不传默认是0.5
        with_subtitle: this.withSubtitle, // 是否要字幕
        with_title: this.withTitle,// 是否要字幕标题
        bool_list: bool_list,// 需要静音的素材id列表
        reverse: this.reverse,
        subtitle_params: {
          y_offset: this.bottom_offset_ratio,
          font: this.subtitleParams.font,
          fontsize: this.subtitleParams['fontsize'],
          color: this.subtitleParams.color,
          font_opacity: this.subtitleParams.content_font_opacity,
          stroke_color: this.subtitleParams.stroke_color,
          use_background: this.use_background,
          background_color: this.subtitleParams.background_color,
          background_opacity: this.subtitleParams.background_opacity
        },
        title_params: {
          y_offset: this.top_offset_ratio,
          show_model: this.show_model,
          font: this.subtitleNameParams.name_font,
          fontsize: this.subtitleNameParams.name_fontsize,
          color: this.subtitleNameParams.name_color,
          font_opacity: this.subtitleNameParams.title_font_opacity,
          stroke_color: this.subtitleNameParams.name_stroke_color,
          use_background: this.name_use_background,
          background_color: this.subtitleNameParams.name_background_color,
          background_opacity: this.subtitleNameParams.name_background_opacity
        }
      }
      postAction('/figure/export_video_sync', params).then(res => {
        if (res.data.status === "success") {
          this.$alert('已创建视频生成任务，视频生成成功后会自动下载到本地', "任务创建提醒");
          this.clearSessionCache()
          setTimeout(() => {
            this.clearCache()
            this.$router.push({path: '/videoList'})
          }, 500)
        } else {
          this.$alert(res.data.message, '导出失败')
        }
      }).catch((error) => {
        this.$alert(error, '导出错误')
      });
   },
}
```

###### hot.vue

- 选择爆款视频页面
- 提供两种爆款视频上传方式，抖音链接上传/本地视频上传
- 选择上传方式及对应的文件，选择复刻方式，分类以及标签，标签可不填(用于筛选)，点击确认上传，即可进行爆款视频分析
- 右键上传的爆款视频，可播放、重命名、删除以及查看分镜详情功能
- 选择需要复刻的爆款视频，进行下一步"一键复刻"，可选混剪复刻(音画不同步的复刻)和打磨复刻(音画同步的复刻)

```javascript
methods: {
   /*
    * 通过本地文件上传爆款视频
    */ 
   uploadByFile() {
      const formData = new FormData();
      this.hotFileList.forEach((file) => {
        formData.append("file", file.raw); // 将文件添加到 FormData 中
      });
      formData.append('withAsr', this.withAsr);
      formData.append('category', this.classify);
      formData.append('tag', this.uploadTag);

      filePostAction("/figure/add_hot_video", formData,1800000).then((res) => {
        if (res.data.status === "success") {
          this.loading = false
          this.$store.dispatch("generate/pollFigureTasks");
          this.$message.success("上传成功");
          this.beforeUploadClose();
        }else {
          this.loading = false
          this.$alert(res.data.message, "上传失败");
        }
      }).catch((err) => {
        this.loading = false
        this.$alert(err, "上传错误");
      })
   },
   /*
    * 通过抖音链接上传爆款视频
    */ 
   uploadByDyLink() {
      let params = {
        url: this.dy_link,
        tag: this.uploadTag,
        withAsr: this.withAsr,
        category: this.classify,
      }
      postAction('/figure/add_hot_video_by_link', params, 600000).then(res => {
        if (res.data.status === 'success') {
          this.$notify({
            title: "上传提示",
            message: `已创建爆款视频上传任务`,
            duration: 5000,
            type: "success",
          });
        } else {
          this.$notify({
            title: "上传提示",
            message: `创建爆款视频上传任务失败，${res.data.message}`,
            duration: 0,
            type: "error",
          });
        }
        this.loading = false
        this.uploadDialogVisible = false
        this.$store.dispatch("generate/pollFigureTasks");
      })
   },
}
```

###### duplicate.vue 

- 爆款复刻-生成文案页面，可通过chat聊天方式生成口播文案，也可进行相应的修改
- 选择要复刻的爆款视频，进入素材选择页面，选择素材，配置字幕信息等，下一步进入爆款复刻-生成文案页面
- 爆款复刻-生成文案页面会根据当前所选爆款视频，以及其复刻方式(无文案复刻/有文案复刻)自动添加示例文案、文案字数或视频时长参数，完善输入文案要求等参数，点击批量生成按钮，生成口播文案
- 选择口播文案后，点击"下一步：混剪复刻"按钮，进入混剪复刻页面

```javascript
methods: {
   /*
    * 批量生成文案方法
    * 根据爆款视频复刻方式，调用不同的接口进行文案生成
    * generate_script有文案复刻生成，generate_script_by_duration无文案复刻生成
    */ 
   batchGenerate() {
      if (this.copy_require.trim() === '') {
        this.$alert('文案要求不能为空，请先填写文案要求', '提示')
        return
      }
      this.isNewChat = false
      this.script_chat.push({
        type: 'userMessage',
        content: this.copy_require || '随意生成合适文案即可',
      });
      this.isGenerating = true
      this.$nextTick(() => { this.scrollToBottom() })
      let url = this.exampleTexts ? '/api/generate_script' : '/api/generate_script_by_duration'
      let params = {}
      if (this.exampleTexts) {
        let examples = []
        examples[0] = this.exampleTexts
        params = {
          language: this.language,
          examples: examples,
          requirements: this.copy_require,
          num_of_words: parseInt(this.copy_num),
          script_count: parseInt(this.script_num),
          store_id: this.mention_list[0].store_id,
        }
      }else {
        params = {
          language: this.language,
          requirements: this.copy_require,
          duration: parseInt(this.video_time),
          voice_id: this.voice.id,
          script_count: parseInt(this.script_num),
          store_id: this.mention_list[0].store_id,
        }
      }
      postAction(url, params).then(res => {
        if (res.data.status === "success") {
          this.isGenerating = false
          this.lastGenerateScripts = res.data.data
          this.script_chat.push({
            type: 'answerMessage',
            scripts: res.data.data
          })
          this.$nextTick(() => { this.scrollToBottom() })
        } else {
          this.isGenerating = false
          this.$alert(res.data.message,'文案生成失败')
        }
      }).catch(err => {
        this.isGenerating = false
        this.$alert(err,'文案生成错误')
      })
   },
   /*
    * 修改生成文案方法
    * 有文案复刻/无文案复刻均调用re_generate_script方法
    */ 
   sendChat() {
      if (this.chat_input.trim() === '') {
        this.$alert('请先输入修改意见', '提示')
        return
      }
      this.isNewChat = false
      this.script_chat.push({
        type: 'userMessage',
        content: this.chat_input || '随意生成合适文案即可',
      });
      this.isGenerating = true
      this.$nextTick(() => { this.scrollToBottom() })

      let params = {
        requirements: this.chat_input,
        num_of_words: this.exampleTexts ? parseInt(this.copy_num) : null,
        store_id: this.mention_list[0].store_id,
        conversation_id: this.conversation_id,
        scripts: this.lastGenerateScripts,
        duration: this.exampleTexts ? null : parseInt(this.video_time),
        voice_id: this.voice.id,
      }
      this.chat_input = ''
      postAction('/api/re_generate_script', params).then(res => {
        if (res.data.status === "success") {
          this.isGenerating = false
          this.lastGenerateScripts = res.data.data.scripts
          this.script_chat.push({
            type: 'answerMessage',
            scripts: res.data.data.scripts,
          })
          this.$nextTick(() => { this.scrollToBottom() })
        } else {
          this.isGenerating = false
          this.$alert(res.data.message,'文案生成失败')
        }
      }).catch(err => {
        this.isGenerating = false
        this.$alert(err,'文案生成错误')
      })
   },
}
```

###### remix.vue 

- 混剪复刻页面
- 输入混剪要求，以chat聊天的方式进行混剪，混剪结果不满意，可在对话框中输入修改意见进行修改
- 混剪要求、chat聊天均提供@选择指定的素材
- 如有选数字人形象出镜，则可设置数字人出镜时长占总视频时长比例
- 等待混剪完成后，点击导出，即可将混剪结果导出到视频列表
- 可通过点击"一键混剪并导出"，无需等待混剪完成，全程后台运行

```javascript
methods: {
   /*
    * 混剪视频方法
    */ 
   generate() {
      if (this.hot_copy_list.some(item => item.duration && !item.bgm.id)) {
        this.$alert('混剪失败，请给无文案任务添加背景音乐后重试', '提示')
        return
      }
      let actualRequest = this.requirement
      let names = this.mention_list.map(item => '@' + item.name);
      names.forEach((item, index) => {
        actualRequest = actualRequest.replace(item, `@{${this.material_list[index]}}`)
      })
      let hots = JSON.parse(sessionStorage.getItem("select_hots"))
      let reference_segments = hots.grouped_analysis_result.segmentGroups
      this.isNewChat = false
      this.mix_chats.push({
        role: 'user',
        content: this.requirement || '挑选合适的视频素材即可',
      });
      this.isGenerating = true
      this.$nextTick(() => {
        this.scrollToBottom()
        const chatEl = this.$refs.textareaRef.$el.querySelector('textarea')
        chatEl.addEventListener('scroll', this.handleChatScroll);
      })
      let params = {
        user_request: actualRequest,
        copy_request: this.copy_request,
        material_list: this.material_list,
        mute_materials: this.mute_materials,
        copy_list: this.hot_copy_list,
        bg_volume: this.bg_volume,
        timbre_id: this.sound.voice_id,
        voice_mode: this.voice_mode,
        with_subtitle: this.withSubtitle,
        reverse: this.reverse,
        figure_ratio: this.figure_ratio + '%',
        reference_segments: reference_segments,
        user_id: sessionStorage.getItem('user_id')
      }
      this.stream_query(params, 'http://127.0.0.1:6006/figure/video_mix_edit_stream')
   },
   /*
    * 修改混剪结果方法
    */ 
   sendChat() {
      if (!this.mix_chatInput) {
        this.$alert('请先输入修改意见', '提示')
        return
      }
      let history_chat = this.mix_chats
      for (let i = this.mix_chats.length - 1; i >= 0; i--) {
        if (this.mix_chats[i].role === 'new_chat') {
          history_chat = this.mix_chats.slice(i + 1);
          break;
        }
      }
      this.mix_chats.push({ role: 'user', content: this.mix_chatInput });
      let actualRequest = this.mix_chatInput
      let names = this.mention_list.map(item => '@' + item.name);
      names.forEach((item, index) => {
        actualRequest = actualRequest.replace(item, `@{${this.material_list[index]}}`)
      })
      let version = history_chat.filter(item => item.role === 'user').length - 1
      let hots = JSON.parse(sessionStorage.getItem("select_hots"))
      let reference_segments = hots.grouped_analysis_result.segmentGroups
      let params = {
        reference_segments: reference_segments,
        data: this.lastGeneratedMixins,
        history_chat: history_chat,
        user_feedback: actualRequest,
        material_list: this.material_list,
        bool_list: this.mute_materials,
        conversation_id: this.conversation_id,
        user_id: sessionStorage.getItem('user_id')
      }
      this.mix_chatInput = '';
      this.isGenerating = true
      this.$nextTick(() => { this.scrollToBottom() })
      this.stream_query(params, 'http://127.0.0.1:6006/figure/re_video_mix_edit_stream', version)
   },
   /*
    * 流式输出混剪结果方法
    */ 
   async stream_query(params, url, version) {
      this.thinking_text = '';
      this.controller = new AbortController();
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {'Content-Type': 'application/json',},
          body: JSON.stringify(params),
          signal: this.controller.signal
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        if (!response.body) throw new Error('浏览器不支持ReadableStream');

        this.is_thinking = true

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let deltaAccumulator = '';
        let buffer = '';

        while (true) {
          const {done, value} = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, {stream: true});
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;
            const jsonString = line.slice(6).trim();
            if (jsonString === '[DONE]') continue;

            try {
              const data = JSON.parse(jsonString);
              if (data.type === 'conversation_info') {
                this.conversation_id = data.conversation_id;
                sessionStorage.setItem('hot_mix_conversation_id', this.conversation_id)
              }
              if (data.type === 'reasoning' && typeof data.delta === 'string') {
                deltaAccumulator += data.delta;
                this.is_thinking = false
                this.thinking_text = deltaAccumulator;
                this.$nextTick(() => { this.scrollToBottom() })
                this.clearDelayTimer();
                this.delayTimer = setTimeout(() => {
                  this.is_pending = true;
                }, 2000);
              }
              if (data.type === 'progress') {
                this.percent = data.percent
              }
              if (data.type === 'final') {
                this.isGenerating = false
                this.is_pending = false
                this.clearDelayTimer();
                this.montage_data = data.data.data
                this.lastGeneratedMixins = data.data.data
                sessionStorage.setItem("hot_montage_data", JSON.stringify(this.montage_data))
                sessionStorage.setItem('hot_last_generated_mixins', JSON.stringify(this.lastGeneratedMixins))
                const jsons = data.data.data.map(item => {
                  const { duration, selling_point, audience } = item.details;
                  return `<span style="line-height: 16px">目标时长：${duration.toFixed(2)}s</span><br>
                          <span style="line-height: 16px">卖点：${selling_point}</span><br>
                          <span style="line-height: 16px">受众：${audience}</span>`;
                });
                this.mix_chats.push({
                  role: 'system',
                  content: {
                    thinking: data.data.thinking,
                    data: data.data.data,
                    jsons: jsons,
                    title: version ? `修改版本 V${version}`: '混剪结果'
                  }
                })
                this.$nextTick(() => { this.scrollToBottom() })
              }
            } catch (parseError) {
              console.error('解析 JSON 数据时出错:', parseError, '数据:', line);
            }
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('流式请求错误:', error);
          this.thinking_text += `<br><span style="color: red;">请求出错: ${error.message}</span>`;
        }
      } finally {
        this.controller = null;
      }
   },
   /*
    * 混剪结果导出视频方法
    */ 
   export_video(with_out_route) {
      let bool_list = this.material_list.map(item => this.mute_materials.includes(item))
      let name = this.setName()
      let params = {
        data: this.montage_data,
        filename_list: name,
        bgm_id: this.bgm.id,
        bg_volume: this.bg_volume,
        with_subtitle: this.withSubtitle,
        with_title: this.withTitle,
        bool_list: bool_list,
        reverse: this.reverse,
        subtitle_params: {
          y_offset: this.bottom_offset_ratio,
          font: this.subtitleParams.font,
          fontsize: this.subtitleParams['fontsize'],
          color: this.subtitleParams.color,
          font_opacity: this.subtitleParams.content_font_opacity,
          stroke_color: this.subtitleParams.stroke_color,
          use_background: this.use_background,
          background_color: this.subtitleParams.background_color,
          background_opacity: this.subtitleParams.background_opacity
        },
        title_params: {
          y_offset: this.top_offset_ratio,
          show_model: this.show_model,
          font: this.subtitleNameParams.name_font,
          font_opacity: this.subtitleNameParams.title_font_opacity,
          fontsize: this.subtitleNameParams.name_fontsize,
          color: this.subtitleNameParams.name_color,
          stroke_color: this.subtitleNameParams.name_stroke_color,
          use_background: this.name_use_background,
          background_color: this.subtitleNameParams.name_background_color,
          background_opacity: this.subtitleNameParams.name_background_opacity
        }
      }
      postAction('/figure/export_video_sync', params).then(res => {
        if (res.data.status === "success") {
          this.$alert('已创建视频生成任务，视频生成成功后会自动下载到本地', "任务创建提醒");
          if (with_out_route) {
            return
          }
          this.clearSessionCache()
          setTimeout(() => {
            this.clearCache()
            this.$router.push({path: '/videoList'})
          }, 500)
        } else {
          this.$alert(res.data.message, "导出失败");
        }
      }).catch((error) => {
        this.$alert(error, "导出错误");
      });
   },
   /*
    * 一键混剪并导出视频方法
    */ 
   batchExport() {
      if (this.hot_copy_list.some(item => item.duration && !item.bgm.id)) {
        this.$alert('请给无文案任务添加背景音乐后重试', '提示')
        return
      }
      this.centerDialogVisible = false
      let actualRequest = this.requirement
      let names = this.mention_list.map(item => '@' + item.name);
      names.forEach((item, index) => {
        actualRequest = actualRequest.replace(item, `@{${this.material_list[index]}}`)
      })

      let hots = JSON.parse(sessionStorage.getItem("select_hots"))
      let reference_segments = hots.grouped_analysis_result.segmentGroups

      let bool_list = this.material_list.map(item => this.mute_materials.includes(item))
      let name = this.setName()
      let params = {
        user_request: actualRequest,
        material_list: this.material_list,
        mute_materials: this.mute_materials,
        copy_list: this.hot_copy_list,
        bg_volume: this.bg_volume,
        timbre_id: this.sound.voice_id,
        voice_mode: this.voice_mode,
        with_subtitle: this.withSubtitle,
        reverse: this.reverse,
        figure_ratio: this.figure_ratio + '%',
        reference_segments: reference_segments,
        with_title: this.withTitle,
        bool_list: bool_list,
        filename_list: name,
        subtitle_params: {
          y_offset: this.bottom_offset_ratio,
          font: this.subtitleParams.font,
          fontsize: this.subtitleParams['fontsize'],
          color: this.subtitleParams.color,
          font_opacity: this.subtitleParams.content_font_opacity,
          stroke_color: this.subtitleParams.stroke_color,
          use_background: this.use_background,
          background_color: this.subtitleParams.background_color,
          background_opacity: this.subtitleParams.background_opacity
        },
        title_params: {
          y_offset: this.top_offset_ratio,
          show_model: this.show_model,
          font: this.subtitleNameParams.name_font,
          fontsize: this.subtitleNameParams.name_fontsize,
          color: this.subtitleNameParams.name_color,
          font_opacity: this.subtitleNameParams.title_font_opacity,
          stroke_color: this.subtitleNameParams.name_stroke_color,
          use_background: this.name_use_background,
          background_color: this.subtitleNameParams.name_background_color,
          background_opacity: this.subtitleNameParams.name_background_opacity
        }
      }
      postAction('/figure/export_video_sync_all', params, 3600000).then(res => {
        if (res.data.status === "success") {
          this.$alert('已创建视频生成任务，视频生成成功后会自动下载到本地', "任务创建提醒");
          this.clearSessionCache()
          setTimeout(() => {
            this.clearCache()
            this.$router.push({path: '/videoList'})
          }, 500)
        } else {
          this.$alert(res.data.message, "批量导出失败");
        }
      }).catch((error) => {
        this.$alert(error, "批量导出错误");
      });
   },
}
```

###### segments.vue 

- 打磨复刻页面
- 打磨复刻页面会根据当前所选爆款视频，以及其复刻方式(无文案复刻/有文案复刻)自动添加示例文案、文案字数或视频时长参数，完善输入文案要求等参数，点击一键混剪并同步按钮开始进行打磨复刻
- 混剪要求、chat聊天均提供@选择指定的素材
- 如有选数字人形象出镜，则可设置数字人出镜时长占总视频时长比例
- 等待混剪完成后，点击导出，即可将混剪结果导出到视频列表

```javascript
methods: {
   /*
    * 打磨复刻方法
    */ 
   generate() {
      if (this.copy_require.trim() === '') {
        this.$alert('文案要求不能为空，请先填写文案要求', '提示')
        return
      }
      let actualRequest = this.requirement
      let names = this.mention_list.map(item => '@' + item.name);
      names.forEach((item, index) => {
        actualRequest = actualRequest.replace(item, `@{${this.material_list[index]}}`)
      })
      let example = []
      example[0] = this.exampleTexts

      this.isNewChat = false
      let mixContent = `混剪要求:${this.requirement ? this.requirement : '挑选合适的视频素材即可'}\n文案要求:${this.copy_require}`
      this.segments_chats.push({
        role: 'user',
        content: mixContent,
      });
      this.isGenerating = true
      this.$nextTick(() => {
        this.scrollToBottom()
        const chatEl = this.$refs.textareaRef.$el.querySelector('textarea')
        chatEl.addEventListener('scroll', this.handleChatScroll);
      })

      let params = {
        language: this.language,
        requirements: this.copy_require,
        video_time: parseInt(this.video_time),
        example: example,
        count: parseInt(this.script_num),
        material_list: this.material_list,
        mute_materials: this.mute_materials,
        user_request: actualRequest,
        bgm_id: this.bgm.id,
        bg_volume: this.bg_volume,
        timbre_id: this.sound.voice_id,
        voice_mode: this.voice_mode,
        with_subtitle: this.withSubtitle,
        reverse: this.reverse,
        figure_ratio: this.figure_ratio + '%',
        reference_segments: this.reference_segments,
        user_id: sessionStorage.getItem('user_id')
      }
      this.stream_query(params, 'http://127.0.0.1:6006/figure/video_mix_edit_sync_stream')
   },
   /*
    * 修改打磨复刻结果方法
    */ 
   sendChat() {
      if (!this.mix_chatInput) {
        this.$alert('请先输入修改意见', '提示')
        return
      }
      let history_chat = this.segments_chats
      for (let i = this.segments_chats.length - 1; i >= 0; i--) {
        if (this.segments_chats[i].role === 'new_chat') {
          history_chat = this.segments_chats.slice(i + 1);
          break;
        }
      }
      this.segments_chats.push({ role: 'user', content: this.mix_chatInput });
      let version = history_chat.filter(item => item.role === 'user').length - 1
      let actualRequest = this.mix_chatInput
      let names = this.mention_list.map(item => '@' + item.name);
      names.forEach((item, index) => {
        actualRequest = actualRequest.replace(item, `@{${this.material_list[index]}}`)
      })
      let hots = JSON.parse(sessionStorage.getItem("select_hots"))
      let reference_segments = hots.grouped_analysis_result.segmentGroups
      let params = {
        reference_segments: reference_segments,
        data: this.lastGeneratedMixins,
        history_chat: history_chat,
        user_feedback: actualRequest,
        material_list: this.material_list,
        bool_list: this.mute_materials,
        conversation_id: this.conversation_id,
        user_id: sessionStorage.getItem('user_id')
      }
      this.mix_chatInput = '';
      this.isGenerating = true
      this.$nextTick(() => { this.scrollToBottom() })
      this.stream_query(params, 'http://127.0.0.1:6006/figure/re_video_mix_edit_stream', version)
   },
   /*
    * 流式输出打磨复刻结果方法
    */ 
   async stream_query(params, url, version) {
      this.thinking_text = '';
      this.controller = new AbortController();
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {'Content-Type': 'application/json',},
          body: JSON.stringify(params),
          signal: this.controller.signal
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        if (!response.body) throw new Error('浏览器不支持ReadableStream');

        this.is_thinking = true

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let deltaAccumulator = '';
        let buffer = '';

        while (true) {
          const {done, value} = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, {stream: true});
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;
            const jsonString = line.slice(6).trim();
            if (jsonString === '[DONE]') continue;

            try {
              const data = JSON.parse(jsonString);
              if (data.type === 'conversation_info') {
                this.conversation_id = data.conversation_id;
                sessionStorage.setItem('segments_mix_conversation_id', this.conversation_id)
              }
              if (data.type === 'reasoning' && typeof data.delta === 'string') {
                deltaAccumulator += data.delta;
                this.is_thinking = false
                this.thinking_text = deltaAccumulator;
                this.$nextTick(() => { this.scrollToBottom() })
                this.clearDelayTimer();
                this.delayTimer = setTimeout(() => {
                  this.is_pending = true;
                }, 2000);
              }
              if (data.type === 'progress') {
                this.percent = data.percent
              }
              if (data.type === 'final') {
                this.isGenerating = false
                this.is_pending = false
                this.clearDelayTimer()
                this.copy_list = data.data.data
                this.lastGeneratedMixins = data.data.data
                sessionStorage.setItem('segments_last_generated_mixins', JSON.stringify(this.lastGeneratedMixins))
                sessionStorage.setItem("segments_copy_list", JSON.stringify(this.copy_list))
                const jsons = data.data.data.map(item => {
                  const { duration, selling_point, audience } = item.details;
                  return `<span style="line-height: 16px">目标时长：${duration.toFixed(2)}s</span><br>
                          <span style="line-height: 16px">卖点：${selling_point}</span><br>
                          <span style="line-height: 16px">受众：${audience}</span>`;
                });
                this.segments_chats.push({
                  role: 'system',
                  content: {
                    thinking: data.data.thinking,
                    data: data.data.data,
                    jsons: jsons,
                    title: version ? `修改版本 V${version}`: '混剪结果'
                  }
                })
                this.$nextTick(() => { this.scrollToBottom() })
              }
            } catch (parseError) {
              console.error('解析 JSON 数据时出错:', parseError, '数据:', line);
            }
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('流式请求错误:', error);
          this.thinking_text += `<br><span style="color: red;">请求出错: ${error.message}</span>`;
        }
      } finally {
        this.controller = null;
      }
   },
   /*
    * 导出打磨复刻结果到视频列表方法
    */ 
   export_video() {
      if (this.copy_list.length === 0) {
        this.$alert('请先使用左侧工具生成文案，您至少需要一条文案才能开始制作。', '提示')
        return
      }
      let bool_list = this.material_list.map(item => this.mute_materials.includes(item))

      let name = this.setName()
      let params = {
        data: this.copy_list,
        filename_list: name, //视频文件名
        bgm_id: this.bgm.id || '',
        bg_volume: this.bg_volume,// bgm的音量大小，不传默认是0.5
        with_subtitle: this.withSubtitle, // 是否要字幕
        with_title: this.withTitle,// 是否要字幕标题
        bool_list: bool_list,// 需要静音的素材id列表
        reverse: this.reverse,
        subtitle_params: {
          y_offset: this.bottom_offset_ratio,
          font: this.subtitleParams.font,
          fontsize: this.subtitleParams['fontsize'],
          color: this.subtitleParams.color,
          font_opacity: this.subtitleParams.content_font_opacity,
          stroke_color: this.subtitleParams.stroke_color,
          use_background: this.use_background,
          background_color: this.subtitleParams.background_color,
          background_opacity: this.subtitleParams.background_opacity
        },
        title_params: {
          y_offset: this.top_offset_ratio,
          show_model: this.show_model,
          font: this.subtitleNameParams.name_font,
          fontsize: this.subtitleNameParams.name_fontsize,
          color: this.subtitleNameParams.name_color,
          font_opacity: this.subtitleNameParams.title_font_opacity,
          stroke_color: this.subtitleNameParams.name_stroke_color,
          use_background: this.name_use_background,
          background_color: this.subtitleNameParams.name_background_color,
          background_opacity: this.subtitleNameParams.name_background_opacity
        }
      }
      postAction('/figure/export_video_sync', params).then(res => {
        if (res.data.status === "success") {
          this.$alert('已创建视频生成任务，视频生成成功后会自动下载到本地', "任务创建提醒");
          this.clearSessionCache()
          setTimeout(() => {
            this.clearCache()
            this.$router.push({path: '/videoList'})
          }, 500)
        } else {
          this.$alert(res.data.message, '导出失败')
        }
      }).catch((error) => {
        this.$alert(error, '导出错误')
      });
   },
}
```

##### voice(克隆声音菜单)

###### index.vue

- 克隆声音主页面，根据音色类型(系统音色、克隆音色)进行上下结构设计
  - 系统音色，所有用户均可使用的音色，只可进行试听操作，系统音色又分为高级音色和普通音色，使用高级音色进行语音合成需调用云端接口并计费
  - 克隆音色，用户个人私有音色，通过用户自行上传克隆，支持试听、删除、重命名操作，目前只支持克隆普通音色

```javascript
methods: {
   /*
    * 获取系统音色方法
    */ 
   querySystemVoice() {
      getAction('/timbres/get_all_system_timbres').then(res => {
        if (res.data.status === 'success') {
          this.systemVoice = res.data.data
        }else {
          this.$message.error('查询系统音色失败')
        }
      }).catch(() => {
        this.$message.error('查询系统音色错误')
      })
   },
   /*
    * 试听音频方法
    * 当前有音频正在试听，先清除，后通过 new Audio(item.filepath) 创建指定音频试听
    */ 
   textAudio(item) {
      if (this.previewTimbreId) {
        this.audio.pause();
        this.audio = null
      }
      if (this.previewTimbreId === item.id) {
        this.previewTimbreId = '';
        return
      }
      this.previewTimbreId = item.id;
      this.audio = new Audio(item.filepath);
      this.audio.play();
      this.audio.onended = () => {
        this.previewTimbreId = '';
        this.audio = null;
      };
   },
   /*
    * 重命名克隆音色名称方法
    */ 
   sureRename() {
      let params = {
        timbre_id: this.soundId,
        name: this.form.name,
      };
      postAction("/timbres/update_name", params).then((res) => {
        if (res.data.status === "success") {
          this.$message.success("重命名成功。");
          this.$store.dispatch("generate/pollVoiceTasks");
        } else {
          this.$alert(res.data.message, "重命名失败")
        }
        this.renameDialogVisible = false;
      }).catch((err) => {
        this.$alert(err, "重命名错误")
      });
    },
    /*
     * 删除克隆音色方法
     */
    deleteItem(item) {
      this.$confirm('确认删除该音色吗？', '提示', {
        type: 'warning'
      }).then(() => {
        delAction(`/timbres/${item.id}`).then((res) => {
          if (res.data.status === "success") {
            this.$message.success("删除成功。");
            this.$store.dispatch("generate/pollVoiceTasks");
          } else {
            this.$alert(res.data.message, "删除失败")
          }
        }).catch((err) => {
          this.$alert(err, "删除错误")
        });
      }).catch((err) => {
        this.$message({type: 'info', message: '已取消删除'});
      });
   },
   
   /*
    * 克隆音色采用的是 Element UI 的 upload 上传组件
    * <el-upload
    *    action="http://127.0.0.1:6006/timbres/clone" // 上传接口
    *    :show-file-list="false"
    *    accept=".mp3, .wav"  // 文件类型
    *    :data="{ user_id: user_id }"
    *    :on-success="uploadSuccess" // 上传成功调用 uploadSuccess 方法
    *    :on-error="uploadError" // 上传成功调用 uploadError 方法
    *    :before-upload="beforeUpload">
    * </el-upload>
    */     
   uploadError(file) {
      let content = `创建${file.name}音色克隆任务失败`;
      this.$alert(content, "任务创建提醒");
   },
   uploadSuccess(res, file) {
      if (res.status === "success") {
        let content = `已创建${file.name}音色克隆任务，音色克隆成功后会自动更新音色列表`;
        this.$alert(content, "任务创建提醒");
        this.$store.dispatch("generate/pollVoiceTasks"); // 此处关联 store/modules/generate.js 的轮训音色克隆任务方法
      } else {
        let content = `创建${file.name}音色克隆任务失败，${res.data}`;
        this.$alert(content, "任务创建提醒");
      }
   },
}
```

### Electron配置文件详解

注意：在安装好`Electron`依赖之后，需要在`package.json`中配置你的程序图标、名称等

```javascript
  "build": {
    "appId": "com.example.offline-deployment",
    "productName": "offline-deployment",
    "directories": {
      "output": "build"
    },
    "files": [
      "dist/**/*",  // 实际运行的文件
      "electron-main.js", // electron主程序
      "preload.js" // electron预加载文件
    ],
    "win": {
      "target": [
        "nsis",
        "portable"
      ],
      "icon": "public/favicon.ico", // 图标
      "artifactName": "offline-deployment.${ext}" // 名称
    }
  },
```

#### electron-main.js

- electron主配置文件，承担着控制整个应用生命周期、管理窗口、处理系统级事件等核心职责

```javascript
const {app, BrowserWindow, ipcMain,dialog,ipcRenderer, screen  } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn  } = require('child_process')

let mainWindow;
let isMainInstance = false; // 新增标志位，标识是否为主实例

// 确保应用只能打开一个实例
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    // 如果获取锁失败，说明已经有实例在运行，则直接退出，不执行任何窗口操作
    app.quit();
} else {
    // 设置当前实例为主实例
    isMainInstance = true;

    // 当第二个实例启动时，聚焦到第一个实例的窗口
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // 当有人试图运行第二个实例时，我们将聚焦到主窗口
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
            mainWindow.show();
        }
    });

    app.on('ready', () => {
        const primaryDisplay = screen.getPrimaryDisplay();
        const {width, height} = primaryDisplay.workAreaSize;
        mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            frame: true,
            show: false,
            icon: path.join(__dirname, 'public/favicon.ico'),
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'), // 如果需要
                contextIsolation: true,
                enableRemoteModule: false,
            }
        });

        // mainWindow.removeMenu();

        // 加载 Vue 项目生成的 HTML 文件
        const indexPath = path.join(__dirname, 'dist', 'index.html');
        mainWindow.loadFile(indexPath);

        mainWindow.webContents.once('did-finish-load', () => {
            mainWindow.maximize()
            mainWindow.show()
        });

        mainWindow.on('close', (e) => {
            if (!isMainInstance) {
                // 如果不是主实例，不执行任何特殊操作，让窗口正常关闭
                return;
            }

            e.preventDefault();

            const {execSync} = require('child_process');
            let batPath;

            try {
                // 尝试访问D盘根目录
                execSync('dir D:\\', {stdio: 'ignore'});
                batPath = "D:\\offline\\stop_backend.bat";
            } catch (error) {
                batPath = "C:\\offline\\stop_backend.bat";
            }

            const batProcess = spawn('cmd.exe', ['/c', 'start', '', batPath]);

            batProcess.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });

            batProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
                mainWindow.removeAllListeners('close');
                mainWindow.close();
            });

            batProcess.on('close', (code) => {
                console.log(`子进程退出，代码：${code}`);
                mainWindow.removeAllListeners('close');
                mainWindow.close();
            });
        });
    });
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('dialog:selectFolder', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    })
    if (!result.canceled) {
        return result.filePaths[0]
    }
})
```

#### preload.js

- electron预加载文件，核心作用是**在渲染进程（Vue 页面）和主进程之间搭建安全的通信桥梁**

```javascript
const {contextBridge, ipcRenderer} = require('electron');

// 暴露方法给主程序
contextBridge.exposeInMainWorld('electronAPI', {
    // 选择文件夹的方法
    selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
    // 下载文件的方法
    downloadFile: (url, path, fileName) => ipcRenderer.send('download-video', { url, path, fileName }),
});
```



