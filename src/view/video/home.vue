<template>
  <div class="video-home">
    <div class="page-header">
      <h1 class="title">生成视频</h1>
      <p class="desc">选择一个创作模式，即刻开启您的AI创作之旅。</p>
    </div>

    <div class="features-grid">
      <el-card
          v-for="(item, index) in featureList"
          :key="index"
          class="feature-card"
          shadow="hover"
      >
        <div class="feature-card-content">
          <div :class="['card-icon', item.iconClass]">
            <i :class="item.icon"></i>
          </div>

          <h2 class="feature-title">{{ item.title }}</h2>
          <p class="feature-desc">{{ item.description }}</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: "PageGenerateVideo",
  data() {
    return {
      pageTitle: "生成视频",
      pageDesc: "选择一个创作模式，即刻开启您的AI创作之旅。",
      featureList: [
        {
          title: "数字人口播",
          icon: "el-icon-koboshuzr",
          iconClass: "icon-digital-human",
          description: "上传文本或音频，选择您的数字分身，一键生成高质量的口播视频。"
        },
        {
          title: "AI 混剪",
          icon: "el-icon-jiandao",
          iconClass: "icon-ai-cut",
          description: "智能匹配素材、添加转场和配乐，仅需数秒即可生成富有节奏感的精彩短片。"
        },
        {
          title: "爆款复刻",
          icon: "el-icon-baokuan",
          iconClass: "icon-viral-remake",
          description: "粘贴热门视频链接进行分析，AI 自动学习其风格，助您轻松创作同款爆款。"
        }
      ]
    };
  },
  methods: {}
};
</script>

<style scoped>
.video-home {
  padding: 24px;
}

.page-header {
  margin-bottom: 40px;
}

.title {
  font-size: 36px;
  color: #1F2937;
  font-weight: 700;
  margin: 0 0 8px;
}

.desc {
  font-size: 18px;
  color: #6B7280;
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  max-height: calc(100vh - 220px);
  padding: 10px;
  overflow-y: auto;
}

.features-grid >>> .el-card__body {
  padding: 0 !important;
}

.feature-card {
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 32px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.07);
}

.card-icon {
  font-size: 20px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon-digital-human {
  background-color: #DBEAFE;
  color: #2563EB;
}

.icon-ai-cut {
  background-color: #D1FAE5;
  color: #059669;
}

.icon-viral-remake {
  background-color: #FEF3C7;
  color: #D97706;
}

.feature-title {
  font-size: 22px;
  color: #1F2937;
  margin: 0 0 12px;
}

.feature-desc {
  font-size: 15px;
  color: #6B7280;
  line-height: 1.6;
  margin: 0;
}
</style>