<template>
  <div class="sync-cv">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="$router.go(-1)">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="sync-title">一键混剪 · 音画同步</div>
      <div style="width: 36px"></div>
    </div>
    <div class="sync-cv-container">
      <div class="left-panel" v-if="show_left_panel">
        <el-tooltip class="item" effect="dark" content="收起设置" placement="right">
          <div class="setting-close" @click="show_left_panel = false">
            <i class="el-icon-arrow-left" style="font-size: 16px;font-weight: bold;color: #ffffff"></i>
          </div>
        </el-tooltip>
        <div class="left-content-area">
          <div class="panel-title">分镜设置</div>
          <div class="panel-label">自定义要求（选填）</div>
          <el-input type="textarea" :rows="3" placeholder="例如：镜头要切换快，多用特写镜头..."
                    class="margin-b-12" v-model="requirement"></el-input>
          <div class="panel-title margin-t-8">文案设置</div>
          <div class="panel-label">文案要求</div>
          <el-input type="textarea" :rows="2" placeholder="例如：写一个关于猫咪的搞笑段子"
                    class="margin-b-12" v-model="copy_require"></el-input>
          <div class="panel-label">示例文案</div>
          <el-input type="textarea" :rows="2" placeholder="提供一个你喜欢的风格的例子"
                    class="margin-b-12" v-model="example_copy"></el-input>
          <div style="display: flex;gap: 12px" class="margin-b-12">
            <div style="flex: 1">
              <div class="panel-label">文案字数</div>
              <el-select v-model="copy_num" placeholder="请选择">
                <el-option label="100" value="100"></el-option>
                <el-option label="200" value="200"></el-option>
                <el-option label="300" value="300"></el-option>
              </el-select>
            </div>
            <div style="flex: 1">
              <div class="panel-label">文案数量</div>
              <el-input type="number" v-model="script_num"></el-input>
            </div>
          </div>
          <div class="panel-label">模型选择</div>
          <el-select v-model="ai_model" style="width: 100%" class="margin-b-12">
            <el-option label="本地大模型" value="local_model"></el-option>
            <el-option label="deepseek v3" value="deepseek_v3"></el-option>
          </el-select>
        </div>
        <div class="settings-button-section">
          <el-button @click="generate"><i class="el-icon-bianjiqi btn-icon"></i>
            {{ already_generated? '重新生成' : '一键混剪并同步' }}</el-button>
        </div>
      </div>

      <div class="left-panel-close" v-if="!show_left_panel">
        <el-tooltip class="item" effect="dark" content="展开设置 " placement="right-end">
          <div class="setting-open" @click="show_left_panel = true">
            <i class="el-icon-arrow-right" style="font-size: 16px;font-weight: bold;color: #ffffff"></i>
          </div>
        </el-tooltip>
      </div>

      <div class="center-panel" :style="{ width: show_left_panel? 'calc(100% - 648px)' : activeIndex !== -1? 'calc(100% - 733px)' : 'calc(100% - 370px)' }">
        <div class="script-selection-area">
          <div class="panel-title">AI选用文案</div>
          <div class="copy-list" v-if="copy_list.length > 0">
            <div class="copy-item" v-for="(item, index) in copy_list" :key="index"
                 :class="{'active-item': index === activeIndex}"
                 @mouseleave="item.isHover = false" @mouseenter="item.isHover = true">
              <el-collapse v-model="openIndex" accordion @change="collapseChange">
                <el-collapse-item :name="index">
                  <template slot="title">
                    <div style="padding-left: 12px">
                      <div class="flex-center">
                        <div class="copy-item-title">{{ item.title }}</div>
                        <div style="width: 16px">
                          <i class="el-icon-close close-icon" v-if="item.isHover" @click="removeCopy(index)"></i>
                        </div>
                      </div>
                      <div class="copy-item-desc">{{ item.content }}</div>
                    </div>
                  </template>
                  <div class="copy-item-materials">
                    <div class="copy-item-material" v-for="(material, index) in item.materials" :key="index">
                      <div class="copy-item-material-img"></div>
                      <div class="copy-item-material-name">{{ material.name }}</div>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
          <div class="copy-list-none" v-if="copy_list.length === 0">
            <i class="el-icon-document-list copy-list-none-icon"></i>
            <div class="copy-list-none-title">暂无文案</div>
            <div class="copy-list-none-desc">请使用左侧工具生成您的第一条文案</div>
          </div>
          <div class="export-section" v-if="already_generated">
            <el-button><i class="el-icon-fa-download" style="margin-right: 10px;"></i>导出视频</el-button>
          </div>
        </div>
      </div>

      <div class="storyboard-panel" v-if="!show_left_panel && activeIndex !== -1">
        <div class="panel-title margin-b-16">分镜文案详情</div>
        <div class="storyboard-content">
          <div class="storyboard-item" v-for="(item, index) in selectedCopy.materials" :key="index">
            <div class="storyboard-item-img"></div>
            <div class="storyboard-item-detail">{{ item.detail }}</div>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="video-placeholder" v-if="activeIndex < 0">
          <i class="el-icon-film-c" style="font-size: 48px"></i>
          <div>视频预览区</div>
        </div>
        <div class="video-placeholder-preview" v-else>
          <video
              ref="videoRef"
              @ended="playNextVideo"
              controls
              autoplay
              preload="metadata"
              style="width: 280px; aspect-ratio: 9 / 16;border-radius: 12px"
          >
            您的浏览器不支持HTML5视频播放。
          </video>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show_left_panel: true,
      requirement: '',
      already_generated: false,
      copy_require: '',
      example_copy: '',
      copy_num: 100,
      script_num: 1,
      ai_model: 'deepseek_v3',
      copy_list: [],
      copy_list_default: [
        {
          title: 'AI 随机生成标题 1',
          content: '算力的持续增强，我们可以预见一个更加智能、便捷、个性化的生活。然而，技术的进步也伴随着新的挑战，如何确保AI的公平性、透明度和安全性，如何处理人机协作关系，是我们必须深入思考的课题。拥抱变革，审慎前行，人类与AI共同演化的新篇章，正缓缓展开。这段文字旨在提供一个足够长的示例文本，以满足不同场景下的内容填充需求。在飞速发展的数字时代，人工智能（AI）正以前所未有的深度和广度重塑着我们的世界。从智能手机中的语音助手，到自动驾驶汽车的精准导航，再到医疗领域的辅助诊断，AI技术已经渗透到社会生活的方方面面。它不仅是提升生产效率的强大工具，更开启了人类探索未知、解决复杂问题的全新可能。未来，随着算法的不断优化和算力的持续增强，我们可以预见一个更加智能、便捷、个性化的生活。然而，技术...',
          materials: [
            { name: '咖啡拉花', detail: '算力的持续增强，我们可以预见一个更加智' },
            { name: '油画创作', detail: '能、便捷、个性化的生活。然而，技术的进' },
            { name: '时间流逝', detail: '步也伴随着新的挑战，如何确保AI的公平' },
            { name: '雨中舞者', detail: '性、透明度和安全性，如何处理人机协作关'  },
            { name: '咖啡拉花', detail: '系，是我们必须深入思考的课题。拥抱变革'  },
            { name: '油画创作', detail: '，审慎前行，人类与AI共同演化的新篇章'  },
            { name: '时间流逝', detail: '，正缓缓展开。这段文字旨在提供一个足够' },
            { name: '雨中舞者', detail: '长的示例文本，以满足不同场景下的内容填'  },
            { name: '咖啡拉花', detail: '充需求。在飞速发展的数字时代，人工智能'  },
            { name: '油画创作', detail: '（AI）正以前所未有的深度和广度重塑着'  },
            { name: '时间流逝', detail: '我们的世界。从智能手机中的语音助手，到'  },
            { name: '雨中舞者', detail: '自动驾驶汽车的精准导航，再到医疗领域的'  },
          ]
        },
        {
          title: 'AI 随机生成标题 1',
          isHover: false,
          content: '算力的持续增强，我们可以预见一个更加智能、便捷、个性化的生活。然而，技术的进步也伴随着新的挑战，如何确保AI的公平性、透明度和安全性，如何处理人机协作关系，是我们必须深入思考的课题。拥抱变革，审慎前行，人类与AI共同演化的新篇章，正缓缓展开。这段文字旨在提供一个足够长的示例文本，以满足不同场景下的内容填充需求。在飞速发展的数字时代，人工智能（AI）正以前所未有的深度和广度重塑着我们的世界。从智能手机中的语音助手，到自动驾驶汽车的精准导航，再到医疗领域的辅助诊断，AI技术已经渗透到社会生活的方方面面。它不仅是提升生产效率的强大工具，更开启了人类探索未知、解决复杂问题的全新可能。未来，随着算法的不断优化和算力的持续增强，我们可以预见一个更加智能、便捷、个性化的生活。然而，技术...',
          materials: [
            { name: '咖啡拉花' },{ name: '油画创作' },{ name: '时间流逝' },{ name: '雨中舞者' },{ name: '咖啡拉花' },{ name: '油画创作' },{ name: '时间流逝' },{ name: '雨中舞者' },{ name: '咖啡拉花' },{ name: '油画创作' },{ name: '时间流逝' },{ name: '雨中舞者' },
          ]
        },
        {
          title: 'AI 随机生成标题 1',
          isHover: false,
          content: '算力的持续增强，我们可以预见一个更加智能、便捷、个性化的生活。然而，技术的进步也伴随着新的挑战，如何确保AI的公平性、透明度和安全性，如何处理人机协作关系，是我们必须深入思考的课题。拥抱变革，审慎前行，人类与AI共同演化的新篇章，正缓缓展开。这段文字旨在提供一个足够长的示例文本，以满足不同场景下的内容填充需求。在飞速发展的数字时代，人工智能（AI）正以前所未有的深度和广度重塑着我们的世界。从智能手机中的语音助手，到自动驾驶汽车的精准导航，再到医疗领域的辅助诊断，AI技术已经渗透到社会生活的方方面面。它不仅是提升生产效率的强大工具，更开启了人类探索未知、解决复杂问题的全新可能。未来，随着算法的不断优化和算力的持续增强，我们可以预见一个更加智能、便捷、个性化的生活。然而，技术...',
          materials: [
            { name: '咖啡拉花' },{ name: '油画创作' },{ name: '时间流逝' },{ name: '雨中舞者' },{ name: '咖啡拉花' },{ name: '油画创作' },{ name: '时间流逝' },{ name: '雨中舞者' },{ name: '咖啡拉花' },{ name: '油画创作' },{ name: '时间流逝' },{ name: '雨中舞者' },
          ]
        },
      ],
      openIndex: null,
      activeIndex: -1,
      selectedCopy: null,

      videos: [
        {
          name: '示例视频1',
          url: 'http://127.0.0.1:8383/results/f2c35bcc-9773-40ca-b566-d5149f2e77cf-final.mp4'
        },
        {
          name: '示例视频2',
          url: 'http://127.0.0.1:8383/results/f4744f29-90f0-4258-8899-6018dc3ba9bb-final.mp4'
        },
        {
          name: '示例视频3',
          url: 'http://127.0.0.1:8383/results/96ba588b-800c-44e5-ae70-31821cda6db7-final.mp4'
        },
      ],
      currentIndex: 0,
      isPlaying: false,
    }
  },
  methods: {
    generate() {
      this.show_left_panel = false;
      this.already_generated = true;
      this.copy_list = this.copy_list_default
      this.openIndex = 0;
      this.activeIndex = 0;
      this.selectedCopy = this.copy_list[0]
      this.$nextTick(() => {
        this.loadVideo(this.currentIndex);
      })
    },
    collapseChange(val) {
      if (val !== '') {
        this.activeIndex = val
        this.selectedCopy = this.copy_list[val]
      }
    },

    removeCopy(index) {
      this.copy_list.splice(index, 1)
    },

    loadVideo(index) {
      if (index >= 0 && index < this.videos.length) {
        this.currentIndex = index;
        this.$refs.videoRef.src = this.videos[index].url;
        this.$refs.videoRef.load();
        this.playVideo();
      }
    },
    playVideo() {
      this.$refs.videoRef.play().then(() => {
        this.isPlaying = true;
      }).catch(error => {
        console.error('播放失败:', error);
        // 这里可以添加错误处理逻辑，如显示错误消息
      });
    },
    playNextVideo() {
      const nextIndex = (this.currentIndex + 1) % this.videos.length;
      this.loadVideo(nextIndex);
    },
  }
}
</script>

<style scoped>
.sync-cv {
  min-height: 700px;
  height: 100%;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.sync-title {
  flex: 1;
  margin: 0 0 8px;
  font-weight: bold;
  display: flex;
  justify-content: center;
}

.sync-cv-container {
  display: flex;
  gap: 24px;
  height: calc(100% - 50px);
}

.left-panel {
  width: 280px;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: #ffffff;
  height: 100%;
}

.left-panel-close {
  width: 1px;
  height: 100%;
}

.setting-close, .setting-open {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  z-index: 10;
  backdrop-filter: blur(10px);
  border-width: initial;
  border-style: none;
  border-color: initial;
  border-image: initial;
  border-radius: 0 12px 12px 0;
  transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.setting-close {
  box-shadow: rgba(102, 126, 234, 0.3) 0 4px 20px;
  background: linear-gradient(135deg, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 100%);
  left: calc(400px);
}

.setting-close:hover {
  left: calc(404px);
}

.setting-open {
  box-shadow: rgba(16, 185, 129, 0.3) 0 4px 20px;
  background: linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%);
  left: calc(100px);
}

.setting-open:hover {
  left: calc(104px);
}

.left-content-area {
  height: calc(100% - 60px);
}

.left-content-area >>> .el-textarea__inner {
  padding: 6px 12px;
  color: #1f2937;
  background-color: #f3f4f6;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
}

.left-content-area >>> .el-input__inner {
  background-color: #f3f4f6;
  border-radius: 6px;
  border: none;
  height: 30px;
  line-height: 30px;
  padding: 0 5px 0 15px;
}

.left-content-area >>> .el-input__icon{
  line-height: 30px;
}


.settings-button-section, .export-section {
  margin-top: 16px;
}

.settings-button-section >>> .el-button,
.export-section >>> .el-button {
  cursor: pointer;
  border: 1px solid #DCDFE6;
  color: white;
  padding: 12px 24px;
  font-size: 14px;
  border-radius: 8px;
  font-weight: 600;
  width: 100%;
  line-height: 18px;
}

.settings-button-section >>> .el-button {
  background-color: #4f46e5;
}

.export-section >>> .el-button {
  background-color: #059669;
}

.btn-icon {
  font-size: 18px;
  margin-right: 12px;
}

.center-panel {
  padding: 20px;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: #ffffff;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.script-selection-area {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.copy-list-none {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.copy-list-none-icon {
  font-size: 54px;
  color: #9ca3af;
}

.copy-list-none-title {
  font-size: 14px;
  color: #9ca3af;
  margin-top: 8px;
}

.copy-list-none-desc {
  font-size: 12px;
  color: #9ca3af;
}

.copy-list {
  flex: 1;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.copy-list >>> .el-collapse {
  border: none;
}

.copy-list >>> .el-collapse-item__wrap {
  background-color: transparent;
}

.copy-list >>> .el-collapse-item__header {
  height: auto;
  align-items: start;
  line-height: 24px;
  background-color: transparent;
  border: none;
}

.copy-list >>> .el-collapse-item__arrow {
  line-height: 24px;
  height: 24px;
  color: #9ca3b2;
  font-size: 14px;
  font-weight: bold;
}

.copy-item {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 12px 0;
  box-sizing: border-box;
  border: 1px solid #d1d5db;
}

.copy-item-title {
  font-weight: 500;
  font-size: 13px;
  color: #1f2937;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copy-item-desc {
  font-size: 15px;
  color: #1f2937;
  max-height: 100px;
  overflow-y: auto;
}

.copy-item-materials {
  margin-top: 12px;
  border-top: 1px solid #e5e7eb;
  padding: 12px 12px 0 12px;
  display: flex;
  gap: 12px;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.copy-item-material-img {
  background-color: #e5e7eb;
  width: 54px;
  height: 96px;
  border-radius: 6px;
}

.copy-item-material-name {
  margin-top: 4px;
  font-size: 12px;
  width: 54px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active-item {
  border-color: #4338ca;
  background-color: #eef2ff;
}

.close-icon {
  color: #b3b5b4;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
}

.close-icon:hover {
  color: #fc5633;
}

.panel-title {
  font-size: 15px;
  font-weight: bold;
  color: #111827;
  margin-bottom: 8px;
}

.panel-label {
  font-size: 12px;
  color: #4b5563;
  font-weight: 500;
  margin-bottom: 4px;
}

.storyboard-panel {
  width: 340px;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: #ffffff;
  height: 100%;
}

.storyboard-content {
  height: calc(100% - 30px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.storyboard-item {
  display: flex;
  gap: 12px;
}

.storyboard-item-img {
  background-color: #e5e7eb;
  width: 54px;
  height: 96px;
  border-radius: 6px;
}

.storyboard-item-detail {
  flex: 1;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
  height: 96px;
  overflow-y: auto;
}

.right-panel {
  width: 320px;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: #ffffff;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-placeholder {
  width: 100%;
  margin: 0 auto;
  aspect-ratio: 9 / 16;
  color: #6b7280;
  background-color: #e5e7eb;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-placeholder-preview {
  background-color: #e5e7eb;
  border-radius: 12px;
}
</style>