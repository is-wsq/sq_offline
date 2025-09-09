<template>
  <div class="chest">
    <div class="page-header">
      <h1 class="title1">AI八宝箱</h1>
      <p class="desc">探索丰富的AI工具，提升您的创作效率与质量。</p>
    </div>

    <div class="tools-grid">
      <div class="tools-grid-content">
        <div class="tool-card" v-for="tool in tools" :key="tool.id" @click="gotoTool(tool.path)">
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
  </div>
</template>

<script>
export default {
  name: "Chest",
  data() {
    return {
      tools: [
        {
          id: 1,
          title: '新闻热榜',
          desc: '基于热门新闻榜单，一键生成口播文案与视频，支持自定义内容创作',
          icon: 'el-icon-baokuan',
          background: '#FEF3C7',
          iconColor: '#D97706',
          path: 'http://live.tellai.tech:5000/#/'
        },
      ],
    };
  },
  methods: {
    gotoTool(path) {
      window.open(path);
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
  margin-bottom: 30px;
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

.tools-grid {
  margin-bottom: 40px;
}

.tools-grid-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding-top: 10px;
  box-sizing: border-box;
}

.tool-card {
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
