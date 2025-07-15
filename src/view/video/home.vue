<template>
  <div class="video-home">
    <div class="page-header">
      <h1 class="title1">生成视频</h1>
      <p class="desc">选择一个创作模式，即刻开启您的AI创作之旅。</p>
    </div>

    <div class="figure-card">
      <div class="figure-card-content">
        <div class="figure-card-icon">
          <i class="el-icon-koboshuzr"></i>
        </div>
        <div class="figure-card-text">
          <div class="figure-card-title">数字人口播</div>
          <div class="figure-card-desc">上传文本或音频，选择您的数字分身，一键生成高质量的口播视频。</div>
        </div>
      </div>
      <div class="figure-card-btn">
        <el-button class="start-btn" @click="gotoPage('/human', 'human')">
          立即开始<i class="el-icon-right start-btn-icon"></i></el-button>
      </div>
    </div>

    <div class="features-grid-sub">
      <div class="feature-card-sub">
        <div class="feature-card-content jiandao">
          <i class="el-icon-jiandao"></i>
        </div>
        <div class="feature-title">AI混剪</div>
        <div class="feature-desc">提供两种强大的混剪模式，无论追求效率还是精度，都能满足您的创作需求。</div>
        <div class="card-actions">
          <button class="sub-option-button" @click="gotoPage('/material', 'montage')">
            <i class="el-icon-shuffle sub-icon"></i>
            <div class="sub-option-text-wrapper">
              <div class="title">一键混剪</div>
              <div class="desc">AI根据文案随机匹配素材，快速生成视频。</div>
            </div>
          </button>
          <button class="sub-option-button" @click="gotoPage('/material', 'storyboard')">
            <i class="el-icon-timeline sub-icon"></i>
            <div class="sub-option-text-wrapper">
              <div class="title">分镜打磨</div>
              <div class="desc">AI根据要求生成分镜脚本，并精准匹配画面。</div>
            </div>
          </button>
        </div>
      </div>
      <div class="feature-card-sub">
        <div class="feature-card-content baokuan">
          <i class="el-icon-baokuan"></i>
        </div>
        <div class="feature-title">爆款复刻</div>
        <div class="feature-desc">借鉴热门作品的成功经验，通过智能分析与内容替换，快速创作您的爆款视频。</div>
        <div class="card-actions">
          <button class="sub-option-button" @click="gotoPage('/hot', 'hot_montage')">
            <i class="el-icon-shuffle sub-icon"></i>
            <div class="sub-option-text-wrapper">
              <div class="title">一键混剪</div>
              <div class="desc">AI根据文案随机匹配素材，快速生成视频。</div>
            </div>
          </button>
          <button class="sub-option-button" @click="gotoPage('/hot', 'hot_storyboard')">
            <i class="el-icon-timeline sub-icon"></i>
            <div class="sub-option-text-wrapper">
              <div class="title">分镜打磨</div>
              <div class="desc">AI根据要求生成分镜脚本，并精准匹配画面。</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PageGenerateVideo",
  data() {
    return {};
  },
  methods: {
    gotoPage(path, type) {
      sessionStorage.setItem('next_type', type)
      sessionStorage.setItem('video_path', path)
      this.$router.push({path: path})
    }
  }
};
</script>

<style scoped>
.video-home {
  padding: 24px;
  height: 100%;
  min-width: 1000px;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 40px;
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

.figure-card {
  width: 800px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  padding: 40px 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 80%, #f093fb 100%);
  color: white;
  border-radius: 24px;
  border: none;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3), 0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  margin: 0 auto;
}

.figure-card:hover {
  transform: scale(1.05);
}

.figure-card-content {
  display: flex;
  align-items: center;
  gap: 28px;
  position: relative;
  z-index: 1;
}

.figure-card-icon {
  width: 64px;
  height: 64px;
  font-size: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.figure-card-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.figure-card-title {
  margin: 0 0 8px 0;
  font-size: 22px;
  font-weight: 700;
  color: white;
}

.figure-card-desc {
  margin: 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.figure-card-btn {
  position: relative;
  z-index: 1;
}

.figure-card-btn >>> .el-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.start-btn-icon {
  font-size: 24px;
  color: white;
  font-weight: 600;
  margin-left: 8px;
}

.features-grid-sub {
  width: 896px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin: 48px auto 0;
}

.feature-card-sub {
  background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%);
  border-radius: 24px;
  padding: 36px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.feature-card-sub:hover {
  transform: translateY(-6px) scale(1.01)
}

.feature-card-sub::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 100%;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 80%, #f093fb 100%);
  transform: translateX(-50%) scaleX(0);
  transform-origin: center;
  opacity: 0;
  transition: transform 0.5s ease, opacity 0.3s ease;
}

.feature-card-sub:hover::before {
  transform: translateX(-50%) scaleX(1);
  opacity: 1;
}


.feature-card-content {
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.jiandao {
  background-color: #d1fae5;
  color: #059669;
}

.baokuan {
  background-color: #FEF3C7;
  color: #D97706;
}

.feature-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #0f172a;
}

.feature-desc {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 24px 0;
}

.card-actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.sub-option-button {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  background-color: white;
  color: #0f172a;
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.sub-option-button .sub-icon {
  color: #64748b;
}

.sub-option-button:hover .sub-icon {
  color: #3B82F6;
}

.sub-option-button:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.6s ease;
}

/* 悬浮时：背景滑入 + 平移 + 边框 */
.sub-option-button:hover {
  background-color: #f8faff;
  transform: translateX(6px);
  border-color: #3B82F6;
  color: #3B82F6;
}

.sub-option-button:hover:before {
  left: 100%; /* 修改left值为100% */
}

/* 内容在上面，避免被遮挡 */
.sub-option-button > * {
  position: relative;
  z-index: 1;
}

.sub-icon {
  font-size: 24px;
  margin-top: 4px;
}

.sub-option-text-wrapper {
  flex: 1;
}

.title {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  transition: color 0.3s ease;
}
</style>