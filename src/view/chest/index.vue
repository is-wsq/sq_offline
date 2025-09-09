<template>
  <div class="ai-toolbox">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="title1">AI八宝箱</h1>
      <p class="desc">探索丰富的AI工具，提升您的创作效率与质量</p>
    </div>

    <!-- 工具分类标签 -->
    <div class="tool-tabs">
      <div
          v-for="tab in toolTabs"
          :key="tab.id"
          :class="['tab-item', { 'active': activeTab === tab.id }]"
          @click="activeTab = tab.id"
      >
        {{ tab.name }}
      </div>
    </div>

    <!-- 工具卡片网格 -->
    <div class="tools-grid">
      <!-- 基础工具 -->
      <div v-if="activeTab === 'basic'" class="tools-grid-content">
        <div class="tool-card" v-for="tool in basicTools" :key="tool.id" @click="gotoTool(tool.path, tool.type)">
          <div class="tool-icon" :style="{ backgroundColor: tool.color }">
            <i :class="tool.icon"></i>
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

      <!-- 高级功能 -->
      <div v-if="activeTab === 'advanced'" class="tools-grid-content">
        <div class="tool-card" v-for="tool in advancedTools" :key="tool.id" @click="gotoTool(tool.path, tool.type)">
          <div class="tool-icon" :style="{ backgroundColor: tool.color }">
            <i :class="tool.icon"></i>
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

      <!-- 热门推荐 -->
      <div v-if="activeTab === 'popular'" class="tools-grid-content">
        <div class="tool-card featured" @click="gotoTool(featuredTool.path, featuredTool.type)">
          <div class="featured-badge">热门推荐</div>
          <div class="tool-icon featured-icon" :style="{ backgroundColor: featuredTool.color }">
            <i :class="featuredTool.icon"></i>
          </div>
          <div class="tool-info featured-info">
            <h3 class="tool-title">{{ featuredTool.title }}</h3>
            <p class="tool-desc">{{ featuredTool.desc }}</p>
            <div class="featured-stats">
              <span class="stat-item"><i class="el-icon-user"></i> {{ featuredTool.usageCount }}+ 用户使用</span>
              <span class="stat-item"><i class="el-icon-star"></i> {{ featuredTool.rating }} 评分</span>
            </div>
          </div>
          <div class="tool-action">
            <i class="el-icon-right"></i>
          </div>
        </div>

        <div class="tool-card" v-for="tool in popularTools" :key="tool.id" @click="gotoTool(tool.path, tool.type)">
          <div class="tool-icon" :style="{ backgroundColor: tool.color }">
            <i :class="tool.icon"></i>
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

    <!-- 使用指南卡片 -->
    <div class="guide-card">
      <div class="guide-icon">
        <i class="el-icon-lightbulb"></i>
      </div>
      <div class="guide-content">
        <h3 class="guide-title">如何高效使用AI工具？</h3>
        <p class="guide-text">观看视频教程了解各工具的最佳实践，提升您的创作效率</p>
        <button class="guide-button" @click="gotoGuide()">
          查看教程 <i class="el-icon-play-circle"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AiToolbox",
  data() {
    return {
      // 工具分类标签
      toolTabs: [
        { id: 'basic', name: '基础工具' },
        { id: 'advanced', name: '高级功能' },
        { id: 'popular', name: '热门推荐' }
      ],
      activeTab: 'basic',

      // 基础工具列表
      basicTools: [
        {
          id: 1,
          title: '智能字幕生成',
          desc: '自动识别语音内容，生成多语言字幕并匹配时间轴',
          icon: 'el-icon-font',
          color: '#dbeafe',
          iconColor: '#3b82f6',
          path: '/tools/subtitle',
          type: 'subtitle_generator'
        },
        {
          id: 2,
          title: '视频压缩',
          desc: '智能压缩视频体积，保持画质同时大幅减小文件大小',
          icon: 'el-icon-compress',
          color: '#def7ec',
          iconColor: '#10b981',
          path: '/tools/compress',
          type: 'video_compressor'
        },
        {
          id: 3,
          title: '格式转换',
          desc: '支持多种音视频格式互转，保持最佳质量输出',
          icon: 'el-icon-exchange',
          color: '#fee2e2',
          iconColor: '#ef4444',
          path: '/tools/convert',
          type: 'format_converter'
        },
        {
          id: 4,
          title: '视频裁剪',
          desc: '简单高效的视频裁剪工具，精准控制裁剪区域和时长',
          icon: 'el-icon-crop',
          color: '#fef3c7',
          iconColor: '#f59e0b',
          path: '/tools/crop',
          type: 'video_cropper'
        }
      ],

      // 高级功能列表
      advancedTools: [
        {
          id: 5,
          title: '智能特效添加',
          desc: 'AI自动识别场景内容，推荐并添加合适的特效和转场',
          icon: 'el-icon-magic-stick',
          color: '#e0e7ff',
          iconColor: '#6366f1',
          path: '/tools/effects',
          type: 'ai_effects'
        },
        {
          id: 6,
          title: '风格迁移',
          desc: '将视频转换为不同艺术风格，如油画、素描、卡通等效果',
          icon: 'el-icon-picture',
          color: '#fce7f3',
          iconColor: '#ec4899',
          path: '/tools/style',
          type: 'style_transfer'
        },
        {
          id: 7,
          title: '智能配音',
          desc: '文本转语音，提供多种音色选择，支持情感调节',
          icon: 'el-icon-microphone',
          color: '#d1fae5',
          iconColor: '#059669',
          path: '/tools/voice',
          type: 'ai_voiceover'
        },
        {
          id: 8,
          title: '内容分析',
          desc: 'AI分析视频内容，生成标签、摘要和优化建议',
          icon: 'el-icon-data-analysis',
          color: '#e6fffa',
          iconColor: '#06b6d4',
          path: '/tools/analysis',
          type: 'content_analysis'
        }
      ],

      // 热门推荐工具
      featuredTool: {
        id: 9,
        title: '一键智能剪辑',
        desc: 'AI自动分析素材，根据内容主题生成专业级剪辑视频',
        icon: 'el-icon-magic-stick',
        color: '#ede9fe',
        iconColor: '#8b5cf6',
        path: '/tools/autoedit',
        type: 'auto_editor',
        usageCount: '10万',
        rating: '4.9'
      },

      popularTools: [
        {
          id: 10,
          title: '智能字幕生成',
          desc: '自动识别语音内容，生成多语言字幕并匹配时间轴',
          icon: 'el-icon-font',
          color: '#dbeafe',
          iconColor: '#3b82f6',
          path: '/tools/subtitle',
          type: 'subtitle_generator'
        },
        {
          id: 11,
          title: '智能配音',
          desc: '文本转语音，提供多种音色选择，支持情感调节',
          icon: 'el-icon-microphone',
          color: '#d1fae5',
          iconColor: '#059669',
          path: '/tools/voice',
          type: 'ai_voiceover'
        }
      ]
    };
  },
  methods: {
    // 跳转到工具页面
    gotoTool(path, type) {
      sessionStorage.setItem('tool_type', type);
      this.$router.push({ path: path });
    },

    // 跳转到使用指南
    gotoGuide() {
      this.$router.push({ path: '/guide/toolbox' });
    }
  }
};
</script>

<style scoped>
.ai-toolbox {
  padding: 24px;
  height: 100%;
  min-width: 1000px;
  box-sizing: border-box;
  background-color: #f8fafc;
}

/* 页面头部样式 */
.page-header {
  margin-bottom: 32px;
  text-align: center;
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
  font-size: 18px;
  color: #6B7280;
  margin: 0;
}

/* 标签页样式 */
.tool-tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.tab-item {
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.tab-item:hover {
  color: #3b82f6;
  transform: translateY(-2px);
}

.tab-item.active {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* 工具网格样式 */
.tools-grid {
  margin-bottom: 40px;
}

.tools-grid-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

/* 工具卡片样式 */
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

/* 特色工具卡片 */
.tool-card.featured {
  border: 2px solid #8b5cf6;
  position: relative;
}

.featured-badge {
  position: absolute;
  top: -10px;
  right: 20px;
  background-color: #8b5cf6;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
}

.featured-stats {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 12px;
  color: #64748b;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 工具图标样式 */
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

/* 工具信息样式 */
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

/* 工具操作图标 */
.tool-action {
  margin-top: 4px;
  color: #94a3b8;
  transition: color 0.3s ease;
}

.tool-card:hover .tool-action {
  color: #3b82f6;
}

/* 使用指南卡片 */
.guide-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 20px;
  padding: 32px;
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 24px;
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.guide-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background-color: rgba(59, 130, 246, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.guide-icon i {
  font-size: 28px;
  color: #3b82f6;
}

.guide-content {
  flex: 1;
}

.guide-title {
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.guide-text {
  font-size: 15px;
  color: #64748b;
  margin: 0 0 16px 0;
  max-width: 700px;
}

.guide-button {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.guide-button:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .ai-toolbox {
    min-width: auto;
    padding: 16px;
  }

  .tools-grid-content {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .guide-card {
    flex-direction: column;
    text-align: center;
  }

  .guide-button {
    margin: 0 auto;
  }

  .title1 {
    font-size: 24px;
  }

  .desc {
    font-size: 16px;
  }
}
</style>
