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
          <el-button @click="generate" :loading="!!loading"><i class="el-icon-bianjiqi btn-icon" v-if="!loading"></i>
            {{ !!loading? '生成中...' : already_generated? '重新生成' : '一键混剪' }}</el-button>
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
              <div v-for="(item, index) in montage_data" :key="index" class="script-item"
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
                    <div class="material-item" v-for="(material,index) in item.materials" :key="index">
<!--                      <el-image class="material-item-img" :src="material.picture.replace('127.0.0.1','120.86.188.249')"></el-image>-->
                      <el-image class="material-item-img" :src="material.picture"></el-image>
                      <div class="material-item-title" :title="material.name">{{ material.name }}</div>
                    </div>
                  </div>
              </div>
            </template>
          </div>
          <div class="export-section" v-if="already_generated">
            <el-button @click="export_video"><i class="el-icon-fa-download" style="margin-right: 10px;"></i>
              导出视频</el-button>
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
import {postAction} from "@/api/api";

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
      currentIndex: 0,
      isPlaying: false,

      material_list: [],
      mute_materials: [],
      sound: {},
      bgm: {},
      bg_volume: 0.5,
      with_subtitle: false,
      with_title: false,
      top_offset_ratio: 0,
      bottom_offset_ratio: 0,
      subtitleParams: {},
      subtitleNameParams: {},

      montage_data: [],
      loading: null,
    }
  },
  computed: {
    preview_video() {
      return this.montage_data.length > 0 ? this.montage_data[this.activeIndex].materials : []
    },
  },
  mounted() {
    this.initData()
  },
  methods: {
    initData() {
      this.copy_list = JSON.parse(sessionStorage.getItem("copy_list")).map(item => ({
        ...item, isHover: false,
      }))
      this.material_list = JSON.parse(sessionStorage.getItem('material_list')) || []
      this.mute_materials = JSON.parse(sessionStorage.getItem('mute_materials')) || []
      this.sound = JSON.parse(sessionStorage.getItem("setting_voice"))
      this.bgm = JSON.parse(sessionStorage.getItem('setting_bgm')) || {}
      this.top_offset_ratio = Number(sessionStorage.getItem('top_offset_ratio'))
      this.bottom_offset_ratio = Number(sessionStorage.getItem('bottom_offset_ratio'))

      this.withSubtitle = sessionStorage.getItem("with_subtitle") === 'true'
      this.withTitle = sessionStorage.getItem("with_title") === 'true'
      this.bg_volume = Number(sessionStorage.getItem("bg_volume")) || 0.5

      this.subtitleParams.fontsize = parseInt(sessionStorage.getItem("fontsize")) || 5
      this.subtitleParams.color = sessionStorage.getItem("color") || '#ffffff'
      this.subtitleParams.font = sessionStorage.getItem("font") || 'SJxingkai-C-Regular'
      this.subtitleParams.background_color = sessionStorage.getItem("background_color") || '#404040'
      this.subtitleParams.background_opacity = Number(sessionStorage.getItem("background_opacity")) || 0.6
      this.subtitleParams.stroke_color = sessionStorage.getItem("stroke_color") || '#000000'

      this.subtitleNameParams.name_fontsize = parseInt(sessionStorage.getItem("name_fontsize")) || 10
      this.subtitleNameParams.name_color = sessionStorage.getItem("name_color") || '#ffffff'
      this.subtitleNameParams.name_font = sessionStorage.getItem("name_font") || 'SJxingkai-C-Regular'
      this.subtitleNameParams.name_background_color = sessionStorage.getItem("name_background_color") || '#404040'
      this.subtitleNameParams.name_background_opacity = Number(sessionStorage.getItem("name_background_opacity")) || 0.6
      this.subtitleNameParams.name_stroke_color = sessionStorage.getItem("name_stroke_color") || '#000000'
    },
    setName() {
      let data = new Date();
      let year = data.getFullYear();
      let month = String(data.getMonth() + 1).padStart(2, "0");
      let day = String(data.getDate()).padStart(2, "0");
      let hours = String(data.getHours()).padStart(2, "0");
      let minutes = String(data.getMinutes()).padStart(2, "0");
      let seconds = String(data.getSeconds()).padStart(2, "0");
      let base = year + '-' + month + '-' + day + '_' + hours + '-' + minutes + '-' + seconds

      let result = [];
      for (let i = 1; i <= this.copy_list.length; i++) {
        result.push(base + '_' + i);
      }

      return result;
    },
    generate() {
      this.loading = this.$loading({
        lock: true,
        text: '一键混剪，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      let params = {
        material_list: this.material_list,
        text_list: this.copy_list.map(item => item.content),
        text_title_list: this.copy_list.map(item => item.title),
        user_request: this.requirement,
        timbre_id: this.sound.voice_id,
        with_subtitle: true
      }
      postAction('/figure/video_mix_edit',params, 3600000).then(res => {
        if (res.data.status === 'success') {
          this.montage_data = res.data.data
          this.already_generated = true
          this.activeIndex = 0
          this.currentIndex = 0
          this.loading.close();
          this.loading = null;
          this.$nextTick(() => {
            this.loadVideo(this.currentIndex);
          })
        } else {
          this.$alert(res.data.message, "混剪失败");
          this.loading.close();
          this.loading = null;
        }
      }).catch(error => {
        this.loading.close();
        this.loading = null;
        console.log(error)
      })
    },
    export_video() {
      let bool_list = this.material_list.map(item => this.mute_materials.includes(item))
      let name = this.setName()
      let params = {
        audio_file_id_list: this.montage_data.map(item => item.audio_file_id),
        text_list: this.montage_data.map(item => item.content),
        timestamp_path_list: this.montage_data.map(item => item.timestamp_path),
        material_list: this.montage_data.map(item => item.materials.map(material => material.id)),
        bool_list: bool_list,

        bgm_id: this.bgm.id,
        bg_volume: this.bg_volume,
        with_subtitle: true,
        with_title: true,
        filename_list: name,
        subtitle_params: {
          y_offset: this.bottom_offset_ratio,
          font: this.subtitleParams.font,
          fontsize: this.subtitleParams['fontsize'],
          color: this.subtitleParams.color,
          stroke_color: this.subtitleParams.stroke_color,
          use_background: true,
          background_color: this.subtitleParams.background_color,
          background_opacity: this.subtitleParams.background_opacity
        },
        title_params: {
          y_offset: this.top_offset_ratio,
          title_text_list: this.montage_data.map(item => item.title),
          font: this.subtitleNameParams.name_font,
          fontsize: this.subtitleNameParams.name_fontsize,
          color: this.subtitleNameParams.name_color,
          stroke_color: this.subtitleNameParams.name_stroke_color,
          use_background: true,
          background_color: this.subtitleNameParams.name_background_color,
          background_opacity: this.subtitleNameParams.name_background_opacity
        }
      }
      postAction('/figure/export_video',params).then(res => {
        if (res.data.status === "success") {
          this.$alert('已创建视频生成任务，视频生成成功后会自动下载到本地', "任务创建提醒");
          sessionStorage.removeItem('copy_list')
          setTimeout(() => {
            this.$router.push({path: '/videoList'})
          }, 500)
        } else {
          this.$notify({
            title: "创建失败",
            message: `创建视频生成任务失败，${res.data.message}`,
            duration: 0,
            type: "error",
          });
        }
      }).catch((error) => {
        this.$notify({
          title: "创建失败",
          message: `创建视频生成任务失败，${error}`,
          duration: 0,
          type: "error",
        });
      });
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
      if (index >= 0 && index < this.preview_video.length) {
        this.currentIndex = index;
        // this.$refs.videoRef.src = this.preview_video[index].filepath.replace('127.0.0.1', '120.86.188.249');
        this.$refs.videoRef.src = this.preview_video[index].filepath
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
      const nextIndex = (this.currentIndex + 1) % this.preview_video.length;
      this.loadVideo(nextIndex);
    },
  }
}
</script>

<style scoped>
.montage {
  height: 100%;
  min-width: 1100px;
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