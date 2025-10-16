<template>
  <div class="chest">
    <div class="page-header">
      <h1 class="title1">AI八宝箱</h1>
      <div class="desc">探索丰富的AI工具，提升您的创作效率与质量。</div>
    </div>
    <div class="flex-center margin-b-4">
      <div class="classify-name">引流工具</div>
      <div class="classify-desc">高效吸引目标用户，提升流量转化的实用工具</div>
    </div>
    <div class="classify-box margin-b-16">
      <div class="tools-grid-content">
        <div class="tool-card" v-for="tool in drainages" :key="tool.id" @click="gotoTool(tool.path)">
          <div class="tool-icon" :style="{ backgroundColor: tool.background }">
            <i :class="tool.icon" :style="{ color: tool.iconColor }"></i>
          </div>
          <div class="tool-info">
            <h3 class="tool-title">{{ tool.title }}</h3>
            <p class="tool-desc">{{ tool.desc }}</p>
          </div>
          <div class="tool-action">
            <i class="el-icon-right"></i>
          </div>
        </div>
      </div>
    </div>
    <div class="flex-center margin-b-4">
      <div class="classify-name">实战工具</div>
      <div class="classify-desc">专业实战操作中不可或缺的高效辅助工具</div>
    </div>
    <div class="tools-grid-content">
      <div class="tool-card" v-for="tool in combats" :key="tool.id" @click="gotoTool(tool.path)">
        <div class="tool-icon" :style="{ backgroundColor: tool.background }">
          <i :class="tool.icon" :style="{ color: tool.iconColor }"></i>
        </div>
        <div class="tool-info">
          <h3 class="tool-title">{{ tool.title }}</h3>
          <p class="tool-desc">{{ tool.desc }}</p>
        </div>
        <div class="tool-action">
          <i class="el-icon-right"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Chest",
  data() {
    return {
      bg_colors: ['#E6F7FF','#FFF7E6','#FFE6F7','#E6FFF7','#F7E6FF','#E6F7F7','#FFF7F7','#F7FFF7','#F7F7E6','#F7F7FF',
                  '#E6E6F7','#F7E6E6','#E6F7E6','#F7F7F7','#E6E6E6','#FFF0F0','#F0FFF0','#FFFFF0','#F0F8FF','#FAF0E6'],
      icon_colors: ['#20A0FF','#FF9900','#F5222D','#36CFC9','#722ED1','#00BFA5','#FF4D4F','#52C41A','#FAAD14','#9254DE',
                    '#597EF7','#FF7A45','#13C2C2','#8C8C8C','#2F54EB','#FF1493','#00FF7F','#FFFF00','#4169E1','#D2B48C'],
      drainages: [
        {
          id: 1,
          title: '电商带货短视频',
          desc: '商品图智能识别与处理，文案与商品匹配生成，多音色选择与配音',
          icon: 'el-icon-zbdh',
          background: '#E6F7FF',
          iconColor: '#20A0FF',
          path: '/eCommerce'
        },
        {
          id: 2,
          title: '动作迁移',
          desc: '动作精准识别与捕捉，人像智能匹配与迁移，参数化视频创作',
          icon: 'el-icon-exportconfig',
          background: '#FFF7E6',
          iconColor: '#FF9900',
          path: '/motionTransfer'
        },
        {
          id: 3,
          title: '姿势动作模仿',
          desc: '姿势图像智能解析，动作实时模仿与生成，一键式操作流程',
          icon: 'el-icon-imitate',
          background: '#FFE6F7',
          iconColor: '#F5222D',
          path: '/actionImitation'
        },
        {
          id: 4,
          title: '人物形象替换',
          desc: '智能替换目标人物形象，精准还原场景，一键式操作流程',
          icon: 'el-icon-replace',
          background: '#E6FFF7',
          iconColor: '#36CFC9',
          path: '/characterReplace'
        },
        {
          id: 5,
          title: '多姿势图生成',
          desc: '智能提取人物形象细节，一键生成多姿势图，9宫格照片极速完成',
          icon: 'el-icon-multipose',
          background: '#F7E6FF',
          iconColor: '#722ED1',
          path: '/multiplePose'
        },
        {
          id: 6,
          title: '双人语音克隆',
          desc: '格式输入对话文案，音色选择与配音，对话音频快速制作',
          icon: 'el-icon-dualTimbre',
          background: '#F7FFF7',
          iconColor: '#52C41A',
          path: '/chest/dualTimbreCloning'
        },
        {
          id: 7,
          title: 'SU一键室内效果图',
          desc: 'SU图、参考图智能借鉴，室内效果图极速制作呈现',
          icon: 'el-icon-interior',
          background: '#F7F7E6',
          iconColor: '#FAAD14',
          path: '/chest/interiorDesign'
        },
      ],
      combats: [
        {
          id: 'a',
          title: '新闻热榜',
          desc: '热门新闻素材整合，多风格口播文案生成，视频快速制作与自定义',
          icon: 'el-icon-baokuan',
          background: '#FEF3C7',
          iconColor: '#D97706',
          path: '/hotNews'
        },
        {
          id: 'b',
          title: '万物洗稿工作流',
          desc: '图像元素智能提取，背景迁移与融合，多场景适配洗稿',
          icon: 'el-icon-xigao',
          background: '#d1e8ff',
          iconColor: '#3b82f6',
          path: '/reWriting'
        },
        {
          id: 'c',
          title: '视频水印移除',
          desc: '视频移动水印去除即梦 、可灵、豆包、VEO3等通用版',
          icon: 'el-icon-logoremove',
          background: '#d9d9d9',
          iconColor: '#616161',
          path: '/logoRemove'
        },
        {
          id: 'd',
          title: '图像水印擦除',
          desc: '智能识别图像水印，一键极速擦除，无损文字',
          icon: 'el-icon-a-07',
          background: '#E6F7F7',
          iconColor: '#00BFA5',
          path: '/chest/watermarkRemove/image'
        },
        {
          id: 'e',
          title: '老照片修复',
          desc: '破旧照片智能识别处理，一键修复与润色',
          icon: 'el-icon-photoRestoration',
          background: '#FFF7F7',
          iconColor: '#FF4D4F',
          path: '/chest/photoRestoration'
        },
      ],
    };
  },
  methods: {
    gotoTool(path) {
      // window.open(path);
      sessionStorage.setItem('chest_path', path)
      this.$router.push({path: path});
    },
  }
};
</script>

<style scoped>
.chest {
  padding: 24px;
  height: 100%;
  min-width: 1000px;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 20px;
}

.title1 {
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  transition: color 0.3s ease;
}

.classify-name {
  font-weight: 800;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.classify-desc {
  flex: 1;
  font-size: 13px;
  color: #64748b;
  padding-top: 4px;
  margin-left: 10px;
  transition: color 0.3s ease;
}

.tools-grid-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  padding-top: 10px;
  max-height: calc(50vh - 125px);
  overflow-y: auto;
  box-sizing: border-box;
}

.tool-card {
  border: 1px solid #f8fafc;
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.tool-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 20px rgba(59, 130, 246, 0.1);
}

.tool-card:hover::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}

.tool-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.tool-icon i {
  font-size: 24px;
}

.tool-info {
  flex: 1;
}

.tool-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.tool-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

.tool-action {
  margin-top: 4px;
  color: #94a3b8;
  transition: color 0.3s ease;
}

.tool-card:hover .tool-action {
  color: #3b82f6;
}
</style>