<template>
  <div class="system">
    <div class="page-title">设置</div>
    <div class="page-content">
      <div class="section-title">应用设置</div>
      <div class="section-card" style="margin-bottom: 24px;">
        <div class="settings">
          <div class="setting-label">视频保存路径</div>
          <el-input v-model="downloadPath" placeholder="请选择视频下载保存路径" class="save_path" readonly/>
          <el-button @click="chooseFolder" icon="el-icon-folder-opened" style="border-radius: 8px">选择</el-button>
        </div>
      </div>
      <div class="section-title">关于产品</div>
      <div class="section-card">
        <div class="about-section">
          <div class="about-title">产品说明</div>
          <div class="about-text">
            "奇点"是一款集成了前沿AI技术的智能内容创作工具。我们致力于通过AI大模型、声音克隆、视频生成等功能，为您打破创意边界，赋能您的数字化内容生产。无论您是内容创作者、营销人员还是技术爱好者，奇点都将是您强大的创意伙伴。
          </div>
        </div>
        <div class="about-section">
          <div class="about-title">联系我们</div>
          <div class="about-text">
            遇到问题或有任何建议？请通过以下方式联系我们：
          </div>
          <a href="mailto:support@qidian-ai.com" class="link">support@qidian-ai.com</a>
        </div>
        <div class="about-title">法律条款</div>
        <div class="links-list">
          <a href="#" class="link">用户协议</a>
          <a href="#" class="link">隐私政策</a>
        </div>
      </div>
    </div>
    <div class="page-footer">
      <div class="footer-text">奇点 v2.1.0 - © 2025 奇点AI团队</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'system',
  data() {
    return {
      dialogVisible: false,
      downloadPath: ''
    }
  },
  mounted() {
    this.downloadPath = localStorage.getItem('downloadPath') || 'D:\\offline'
  },
  methods: {
    chooseFolder() {
      window.electronAPI.selectFolder().then((path) => {
        if (path) {
          this.downloadPath = path
          localStorage.setItem('downloadPath', path)
        }
      })
    },
  }
}
</script>

<style scoped>
.system {
  width: 100%;
  max-width: 1024px;
  margin: 0 auto;
}

.page-title {
  font-size: 32px;
  line-height: 1.5;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 24px;
}

.page-content {
  height: max(calc(100vh - 175px), 600px);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 16px;
}

.section-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 32px;
}

.settings {
  display: flex;
  gap: 16px;
  align-items: center;
}

.setting-label {
  font-weight: 500;
  color: #475569;
}

.save_path {
  flex: 1;
  max-width: 400px;
}

.settings >>> .el-input__inner {
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
}

.about-section {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 24px;
  margin-bottom: 24px;
}

.about-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.about-text {
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

.link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
  line-height: 1.6;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

.link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-footer {
  margin-top: 24px;
  text-align: center;
}

.footer-text {
  font-size: 14px;
  color: #94a3b8;
}
</style>