<template>
  <div class="montage">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="$router.go(-1)">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="montage-h-t">智能成片</div>
      <div style="width: 36px"></div>
    </div>
    <div class="montage-container">
      <div class="settings-panel" v-if="show_settings">
        <el-tooltip class="item" effect="dark" content="收起设置" placement="right">
          <div class="toggle-btn-open" @click="show_settings = false">
            <i class="el-icon-arrow-left" style="font-size: 16px;font-weight: bold;color: #ffffff"></i>
          </div>
        </el-tooltip>
        <div class="settings-content-area">
          <div class="panel-title">混剪设置</div>
          <div class="setting-require">自定义要求（选填）</div>
          <el-input type="textarea" :rows="3" placeholder="例如：镜头要切换快，多用特写镜头" v-model="requirement"></el-input>
        </div>
        <div class="settings-button-section">
          <el-button @click="generate"><i class="el-icon-bianjiqi btn-icon"></i>
            {{ already_generated? '重新生成' : '一键混剪' }}</el-button>
        </div>
      </div>
      <div style="width: 1px" v-if="!show_settings">
        <el-tooltip class="item" effect="dark" content="展开设置 " placement="right-end">
          <div class="toggle-btn-close" @click="show_settings = true">
            <i class="el-icon-arrow-right" style="font-size: 16px;font-weight: bold;color: #ffffff"></i>
          </div>
        </el-tooltip>
      </div>
      <div class="script-panel" :style="{ width: show_settings? 'calc(100% - 648px)' : 'calc(100% - 370px)' }">
        <div class="script-selection-area">
          <div class="panel-title">AI选用文案</div>
          <div class="script-list">
            <template v-if="!already_generated" style="width: 100%">
              <div v-for="(item, index) in copy_list" :key="index" class="script-item"
                   @mouseleave="item.isHover = false" @mouseenter="item.isHover = true">
                <div class="flex-center" style="width: 100%">
                  <div class="script-item-title" :title="item.title">{{item.title}}</div>
                  <div style="width: 16px">
                    <i class="el-icon-close close-icon" v-if="item.isHover" @click="removeCopy(index)"></i>
                  </div>
                </div>
                <div class="script-item-content" :title="item.content">{{item.content}}</div>
              </div>
            </template>
            <template v-else>
              <div v-for="(item, index) in copy_list" :key="index" class="script-item"
                   :class="{'active-item': activeIndex === index}"
                   @mouseleave="item.isHover = false" @mouseenter="item.isHover = true">
                <div class="flex-center" @click="itemClick(index)">
                  <div class="script-item-title" :title="item.title">{{item.title}}</div>
                  <div style="width: 16px">
                    <i class="el-icon-close close-icon" v-if="item.isHover" @click="removeCopy(index)"></i>
                  </div>
                  <i class="el-icon-arrow-right" style="color: #9ca3af;font-size: 15px;font-weight: bold;"
                     v-if="openIndex !== index"></i>
                  <i class="el-icon-arrow-down" style="color: #9ca3af;font-size: 15px;font-weight: bold;"
                     v-else></i>
                </div>
                <div class="script-item-content" :title="item.content"
                     @click="itemClick(index)">{{item.content}}</div>
                <div class="material-list" v-if="openIndex === index">
                    <div class="material-item" v-for="(item,index) in videos" :key="index">
                      <div class="material-item-img"></div>
                      <div class="material-item-title">{{ item.name }}</div>
                    </div>
                  </div>
              </div>
            </template>
          </div>
          <div class="export-section" v-if="already_generated">
            <el-button><i class="el-icon-fa-download" style="margin-right: 10px;"></i>导出视频</el-button>
          </div>
        </div>
      </div>
      <div class="preview-area">
        <div class="video-placeholder" v-if="activeIndex < 0">
          <i class="el-icon-film-c" style="font-size: 48px"></i>
          <div>视频预览区</div>
        </div>
        <div class="video-placeholder-preview" v-else>
          <video
            ref="videoRef"
            @ended="playNextVideo"
            @timeupdate="updateProgress"
            @loadedmetadata="updateDuration"
            controls
            autoplay
            preload="metadata"
            style="width: 280px; aspect-ratio: 9 / 16;"
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
  name: 'Montage',
  data() {
    return {
      requirement: '',
      copy_list: [],
      already_generated: false,
      show_settings: true,
      openIndex: null,
      activeIndex: -1,
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
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      isMuted: false,
      volume: 0.8
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    initData() {
      if (sessionStorage.getItem("copy_list")) {
        this.copy_list = JSON.parse(sessionStorage.getItem("copy_list")).map(item => ({
          ...item, isHover: false,
        }))
      }
    },
    generate() {
      this.already_generated = true
      this.activeIndex = 0
      this.$nextTick(() => {
        this.loadVideo(this.currentIndex);
      })
    },
    itemClick(index) {
      this.openIndex = this.openIndex === index ? null : index
      this.activeIndex = index
    },
    removeCopy(index) {
      this.copy_list.splice(index, 1)
      sessionStorage.setItem("copy_list", JSON.stringify(this.copy_list))
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
    updateProgress() {
      this.currentTime = this.$refs.videoRef.currentTime;
    },
    updateDuration() {
      this.duration = this.$refs.videoRef.duration;
    },

  }
}
</script>

<style scoped>
.montage {
  height: 100%;
  min-width: 1100px;
}

.back-btn {
  padding: 7px;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  color: #a2a8b3;
  background-color: #FFFFFF;
  margin: 0 0 8px;
}

.back-btn:hover {
  color: #1F2937 !important;
}

.montage-h-t {
  flex: 1;
  margin: 0 0 8px;
  font-weight: bold;
  display: flex;
  justify-content: center;
}

.montage-container {
  display: flex;
  gap: 24px;
  height: calc(100% - 50px);
}

.settings-panel {
  width: 280px;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: #ffffff;
  height: 100%;
}

.toggle-btn-open {
  position: fixed;
  top: 50%;
  left: calc(400px);
  transform: translateY(-50%);
  width: 20px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  box-shadow: rgba(102, 126, 234, 0.3) 0px 4px 20px;
  z-index: 10;
  backdrop-filter: blur(10px);
  background: linear-gradient(135deg, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 100%);
  border-width: initial;
  border-style: none;
  border-color: initial;
  border-image: initial;
  border-radius: 4px 12px 12px 4px;
  transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-btn-open:hover {
  left: calc(404px);
}

.toggle-btn-close {
  position: fixed;
  top: 50%;
  left: calc(100px);
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
  transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: rgba(16, 185, 129, 0.3) 0px 4px 20px;
  border-radius: 0px 12px 12px 0px;
  background: linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%);
}

.toggle-btn-close:hover {
  left: calc(104px);
}

.settings-content-area {
  height: calc(100% - 60px);
}

.settings-content-area >>> .el-textarea__inner {
  padding: 8px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #1f2937;
  background-color: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 6px;
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

.script-panel {
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

.script-list {
  flex: 1;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.script-item {
  width: 100%;
  padding: 12px;
  box-sizing: border-box;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  background-color: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
}

.active-item {
  border-color: #4338ca;
  background-color: #eef2ff;
}

.script-item-title {
  flex: 1;
  font-weight: 500;
  font-size: 14px;
  line-height: 28px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.script-item-content {
  width: 100%;
  font-size: 16px;
  line-height: 24px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.material-list {
  border-top: 1px solid #e5e7eb;
  margin-top: 12px;
  padding-top: 12px;
  display: flex;
  gap: 12px;
}

.material-item-img {
  width: 60px;
  aspect-ratio: 9 / 16;
  background-color: #e5e7eb;
  border-radius: 4px;
}

.material-item-title {
  width: 60px;
  text-align: center;
  margin-top: 4px;
  font-size: 12px;
  color: #4b5563;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.setting-require {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  margin-bottom: 4px;
}

.preview-area {
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