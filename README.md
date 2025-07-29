# offline-deployment

## 安装依赖
```
npm install
```

### 运行项目
```
npm run serve
```

### 打包
```
npm run build
```

### 打包electron桌面客户端应用
```
npm run electron:build
```

### 项目结构
```
offline-deployment/
├─ node_modules/
├─ public
│  ├─ dashboard
│  │  ├─ video.png
│  │  └─ videoActive.png
│  ├─ images
│  │  ├─ 4.jpg
│  │  └─ qrcode.png
│  ├─ video
│  │  ├─ forward.mp4
│  │  └─ reverse.mp4
│  ├─ figure.docx
│  ├─ figure.pdf
│  ├─ index.html
│  ├─ more.png
│  ├─ pause.png
│  ├─ pause-main.png
│  ├─ play.png
│  ├─ stop.png
│  ├─ timbre.docx
│  └─ timbre.pdf
├─ src
│  ├─ api
│  │  └─ api.js
│  ├─ assets
│  │  ├─ fonts
│  │  │  ├─ Alimama-DongFangDaKai.ttf
│  │  │  ├─ Alimama-FangYuanTi-VF.ttf
│  │  │  ├─ bailutongtongshouxieti.ttf
│  │  │  ├─ BangFont-WanKu-Regular.ttf
│  │  │  ├─ Douyin-Sans-Bold.otf
│  │  │  ├─ font.css
│  │  │  ├─ hongleixingshu.otf
│  │  │  ├─ LXGW-ZhenKai.ttf
│  │  │  ├─ S1jnyyy.ttf
│  │  │  ├─ S1xingkai-C-Regular.ttf
│  │  │  ├─ TW-Sung.ttf
│  │  │  ├─ XKNLT-Regular.ttf
│  │  │  ├─ YEFONTXiaoShiTou.ttf
│  │  │  ├─ 千图马克手写体.ttf
│  │  │  └─ 荆南波波黑-Bold.ttf
│  │  ├─ iconfont
│  │  │  ├─ demo.css
│  │  │  ├─ demo_index.html
│  │  │  ├─ iconfont.css
│  │  │  ├─ iconfont.js
│  │  │  ├─ iconfont.json
│  │  │  ├─ iconfont.ttf
│  │  │  ├─ iconfont.woff
│  │  │  └─ iconfont.woff2
│  ├─ mixins
│  │  ├─ EnhancedChoiceMixin.js
│  │  ├─ IPaginationMixin.js
│  │  └─ RightMenuMixin.js
│  ├─ router
│  │  └─ index.js
│  ├─ store
│  │  ├─ modules
│  │  │  └─ task.js
│  │  └─ index.js
│  ├─ view
│  │  ├─ ai
│  │  │  └─ index.vue
│  │  ├─ figures
│  │  │  └─ index.vue
│  │  ├─ shop
│  │  │  ├─ index.vue
│  │  ├─ system
│  │  │  ├─ agreement.vue
│  │  │  ├─ index.vue
│  │  ├─ video
│  │  │  ├─ duplicate.vue
│  │  │  ├─ home.vue
│  │  │  ├─ hot.vue
│  │  │  ├─ human.vue
│  │  │  ├─ list.vue
│  │  │  ├─ material.vue
│  │  │  ├─ montage.vue
│  │  │  ├─ segments.vue
│  │  │  ├─ smartGenerate.vue
│  │  │  ├─ syncCv.vue
│  │  └─ voice
│  │     └─ index.vue
│  ├─ dashboard.vue
│  ├─ App.vue
│  └─ main.js
├─ .eslintignore
├─ .gitignore
├─ babel.config.js
├─ electron-main.js 
├─ jsconfig.json
├─ package.json
├─ package-lock.json
├─ preload.js
├─ README.md
└─ vue.config.js
```
### 结构说明
- `src/api`: 接口请求模块
- `src/assets`: 静态资源目录
- `src/assets/fonts`: 字体资源目录
- `src/assets/iconfont`: 自定义图标资源目录
- `src/mixins`: 全局混入模块
- `src/router`: 路由配置模块
- `src/store`: vuex配置模块
- `src/view`: 页面组件模块
- `src/view/ai`: AI大模型菜单
- `src/view/figures`: 克隆形象菜单
- `src/view/shop`: 品牌店铺菜单
- `src/view/system`: 设置菜单
- `src/view/video`: 生成视频菜单
- `src/view/voice`: 克隆声音菜单
- `src/dashboard.vue`: 首页组件
- `src/App.vue`: 根组件
- `src/main.js`: 入口文件
- `electron-main.js`: electron主进程配置
- `preload.js`: electron渲染进程配置
- `vue.config.js`: vue-cli配置
- `package.json`: 项目依赖配置
- `package-lock.json`: 项目依赖锁定配置
- `README.md`: 项目说明文档

### 功能模块说明
#### AI大模型菜单
- 选择模型，开启模型，进入WebUI服务页面
#### 克隆形象菜单
  - 素材：
    - 上传素材：可批量上传，一次最多20个视频文件
    - 删除素材：可删除已选择的素材，单击单选、CTRL + A快捷键全选、鼠标左键拖动框选，右键弹出操作菜单
    - 预览、重命名、查看素材分析：右键素材选择对应的功能项
  - 形象：
    - 添加形象：选择数字人视频上传，上传成功后进行后台处理，克隆对应的形象
    - 删除、预览、重命名：右键形象选择对应的功能项
#### 克隆声音菜单
  - 系统音色：点击播放图标按钮、右键可试听系统音色
  - 克隆音色：
    - 上传音频：点击上传图标按钮、选择音频文件，上传成功后进行后台处理，克隆对应的声音
    - 删除、试听、重命名：右键声音选择对应的功能项
    - 也可点击播放图标按钮试听克隆音色
#### 生成视频菜单
  - 数字人口播：
    - 选择数字人形象
    - 设置视频播放完后拼接规则
    - 设置音色、背景音乐
    - 设置口播标题、口播内容字幕样式(可选择不生成字幕)
    - 生成文案
      - AI批量生成：填写文案要求、示例文案(可不填)，设置文案数量、生成个数(最多10)，选择AI模型，点击批量生成按钮
      - 手动添加文案：输入文案标题、文案内容，点击添加文案按钮
      - AI批量生成、手动添加的文案会在文案列表中显示，可删除文案，也可点击文案修改
    - 生成视频，点击生成按钮后会创建视频生成任务，后台会自动生成视频，在任务列表中会显示生成视频成功
  - 素材混剪：
    - 音画不同步
      - 选择素材：点击素材选择、CTRL + A快捷键全选、CTRL + Z反选、鼠标左键拖动框选；素材可通过输入框输入名称进行模糊查询筛选，也可通过选择标签进行筛选
      - 选择数字人并设置视频播放完后拼接规则(可不选)
      - 设置音色、背景音乐
      - 设置口播标题、口播内容字幕样式(可选择不生成字幕)
      - 生成文案
        - AI批量生成：填写文案要求、示例文案(可不填)，设置文案数量、生成个数(最多10)，选择AI模型，点击批量生成按钮
        - 手动添加文案：输入文案标题、文案内容，点击添加文案按钮
        - 生成无文案内容的文案：选择视频时长，生成数量，点击生成按钮
        - AI批量生成、手动添加、生成无文案内容的文案会在文案列表中显示，可删除文案，也可点击文案修改
      - 混剪视频，输入混剪要求(可不填)、设置人物形象出镜比例、设置背景音乐(默认背景音乐是前面步骤所选，可修改，可移除，无文案内容的文案必须设置背景音乐)，点击一键混剪按钮，混剪需要等待一段时间
      - 增删分镜：混剪完成后会在右侧生成预览视频，可通过增删分镜重新调整分镜效果
      - 导出视频：混剪完成后会出现导出视频按钮，点击按钮导出视频
      - 批量导出视频：不生成预览视频，混剪完成后自动导出视频，无需等待混剪完成
    - 音画同步
      - 选择素材：点击素材选择、CTRL + A快捷键全选、CTRL + Z反选、鼠标左键拖动框选；素材可通过输入框输入名称进行模糊查询筛选，也可通过选择标签进行筛选
      - 选择数字人并设置视频播放完后拼接规则(可不选)
      - 设置音色、背景音乐
      - 设置口播标题、口播内容字幕样式(可选择不生成字幕)
      - 混剪视频输入混剪要求(可不填)、设置人物形象出镜比例、填写文案要求、示例文案(可不填)，设置视频时长、文案生成个数(最多10)，选择AI模型，点击一键混剪按钮，混剪需要等待一段时间
      - 增删分镜：混剪完成后会在右侧生成预览视频，可通过增删分镜重新调整分镜效果
      - 导出视频：混剪完成后会出现导出视频按钮，点击按钮导出视频
  - 爆款复刻：
    - 上传爆款视频：可选择视频文件上传、也可通过抖音分享链接上传
    - 爆款视频复刻：选择包括视频后点击一键复刻按钮，其余设置同上素材混剪(不可添加、上传示例文案，会将爆款视频的文案当作示例文案参数传入)
      
#### 视频列表菜单
  - 展示正在生成中的视频、已生成的视频；已生成的视频可点击右下角功能菜单按钮进行删除、重命名、另存为操作
#### 品牌店铺菜单
  - 创建店铺信息：点击右上角创建店铺信息按钮，弹出对话框，输入店铺名称、主推产品、优势卖点、目标用户、店铺地址
  - 展示品牌店铺列表，可点击店铺信息右上角删除、编辑图标按钮进行操作
#### 设置菜单
  - 账户信息：展示当前设备剩余的Tokens数，可查看账单详情
  - 充值：点击充值按钮，弹出对话框，输入充值金额，生成支付二维码，扫码支付
  - 应用设置：设置视频缓存路径，生成视频后会默认下载缓存到该路径
  - 关于产品：展示产品说明、联系我们、法律条款
  - 联系我们：点击联系链接，弹出客服微信二维码，使用微信扫码添加客服微信
  - 法律条款：用户协议、隐私政策