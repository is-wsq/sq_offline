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
          <div style="position: relative;border: 1px solid #d1d5db;border-radius: 4px">
            <div class="highlight-content"
                 v-html="highlightedText"
                 :style="{height: replaceDivHeight + 'px'}"
                 ref="highlightDiv">
            </div>
            <el-input type="textarea"
                      :rows="4"
                      placeholder="例如：镜头要切换快，多用特写镜头"
                      v-model="requirement"
                      @input="onInput"
                      ref="inputRef"
                      class="input-layer"
                      @scroll="handleScroll">
            </el-input>
            <div v-if="showDropdown" class="dropdown" :style="dropdownStyle">
              <ul>
                <li v-for="(item, index) in mention_list" :key="index" @click="selectMention(item)"
                    @mouseleave="liLeave(item)" @mouseenter="liEnter(item)">
                  {{ item.name }}
                </li>
              </ul>
              <div class="li-video" v-if="hover_li">
                <video :src="hover_li.filepath" style="width: 100%; height: 100%;border-radius: 4px;"
                       loop muted autoplay></video>
              </div>
            </div>
          </div>
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
        <div class="video-placeholder-preview" v-if="activeIndex !== -1">
          <video
            ref="videoRef"
            preload="metadata"
            controls
            controlsList="noplaybackrate nodownload"
            @ended="playNextVideo"
            @play="mediaPlay"
            @pause="mediaPause"
            @volumechange="mediaVolumeChange"
            style="width: 280px; aspect-ratio: 9 / 16; border-radius: 12px"
          >
            您的浏览器不支持HTML5视频播放。
          </video>
          <audio ref="audioRef" controls class="audio-element" v-show="false">
            <source type="audio/mpeg">
            您的浏览器不支持音频播放
          </audio>
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
      mention_list: [],
      hover_li: null,
      lastInput: '',
      replaceDivHeight: 102,
      showDropdown: false,
      dropdownStyle: {
        position: 'absolute',
        top: '0px',
        left: '0px'
      },
      mentionRanges: [],

      sound: {},
      bgm: {},
      bg_volume: 0.5,

      with_subtitle: false,
      with_title: false,

      top_offset_ratio: 0,
      bottom_offset_ratio: 0,

      subtitleParams: {},
      subtitleNameParams: {},

      use_background: false,
      name_use_background: false,

      montage_data: [],
      loading: null,
      media_volume: 0.5,
      nextType: ''
    }
  },
  computed: {
    preview_video() {
      return this.montage_data.length > 0 ? this.montage_data[this.activeIndex].materials : []
    },
    highlightedText() {
      // 使用正则替换所有 @人名 为高亮样式
      let result = this.requirement;
      let names = this.mention_list.map(item => '@' + item.name);
      names.forEach(item => {
        const regex = new RegExp(`${item}`, 'g'); // 使用全局标志
        result = result.replace(regex, (match) => {
          return `<span style="color: #4c8df1">${match}</span>`
        });
      });
      result = result.replace(/\n/g, '<br>'); // 支持换行
      return result; // 返回最终结果
    },
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
    const inputEl = this.$refs.inputRef.$el.querySelector('textarea')
    inputEl.removeEventListener('scroll', this.handleScroll);
  },
  mounted() {
    this.initData()
    document.addEventListener('click', this.handleClickOutside);
    const inputEl = this.$refs.inputRef.$el.querySelector('textarea')
    this.replaceDivHeight = inputEl.clientHeight
    inputEl.addEventListener('scroll', this.handleScroll);
  },
  methods: {
    liLeave(item) {
      item.isHover = false
      this.hover_li = null
    },
    liEnter(item) {
      item.isHover = true
      this.hover_li = item
    },
    handleScroll(event) {
      const inputEl = this.$refs.inputRef.$el.querySelector('textarea');
      const highlightEl = this.$refs.highlightDiv;

      // 同步滚动位置
      highlightEl.scrollTop = inputEl.scrollTop;
      highlightEl.scrollLeft = inputEl.scrollLeft;
    },
    updateMentionRanges() {
      let result = []
      let names = this.mention_list.map(item => '@' + item.name);
      names.forEach(name => {
        let startIndex = 0;
        while ((startIndex = this.requirement.indexOf(name, startIndex)) !== -1) {
          result.push({
            start: startIndex + 1,
            end: startIndex + name.length,
            name: name
          });
          startIndex += name.length; // 移动索引避免死循环
        }
      });
      this.mentionRanges = result;
    },
    onInput() {
      let isDel = this.lastInput.length > this.requirement.length;
      this.lastInput = this.requirement;
      const inputEl = this.$refs.inputRef.$el.querySelector('textarea');
      const cursorPos = inputEl.selectionStart;
      if (isDel) { // 删除@内容
        for (let mention of this.mentionRanges) {
          const {start, end, name} = mention;
          if (cursorPos >= start && cursorPos < end) { //删除@内容
            this.requirement =
                this.requirement.slice(0, start - 1) + this.requirement.slice(end - 1);
          }
        }
      }

      // 更新提及范围数组
      this.updateMentionRanges()

      const textBeforeCursorUpdated = this.requirement.slice(0, cursorPos);
      const validMention = textBeforeCursorUpdated.charAt(textBeforeCursorUpdated.length - 1) === '@';
      if (validMention) {
        this.showDropdown = true;

        this.$nextTick(() => {
          const paddingLeft = parseFloat(getComputedStyle(inputEl).paddingLeft) || 0;

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          const computedStyle = getComputedStyle(inputEl);
          context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

          const textWidth = context.measureText(textBeforeCursorUpdated).width;
          const inputWidth = inputEl.clientWidth - 30;

          const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize);

          let offsetTop = Math.floor((paddingLeft + textWidth + 10) / inputWidth) + 1;
          offsetTop = Math.min(offsetTop, 4); // 限制最大显示数量
          let remainder = (paddingLeft + textWidth + 5) % inputWidth;

          this.dropdownStyle.top = `${window.scrollY + offsetTop * lineHeight}px`;
          this.dropdownStyle.left = `${remainder}px`;
        });
      } else {
        this.showDropdown = false;
      }
    },
    selectMention(item) {  //选择@
      const inputEl = this.$refs.inputRef.$el.querySelector('textarea');
      const cursorPos = inputEl.selectionStart;
      const atIndex = this.requirement.lastIndexOf('@', cursorPos - 1);
      if (atIndex !== -1) {
        this.requirement =
            this.requirement.slice(0, atIndex) + '@' + item.name + this.requirement.slice(cursorPos);
        this.showDropdown = false;
        this.lastInput = this.requirement;

        // 记录提及的范围
        this.updateMentionRanges()

        // 设置光标位置到提及内容的末尾
        inputEl.selectionStart = this.mentionRanges[this.mentionRanges.length - 1].end;
        inputEl.selectionEnd = this.mentionRanges[this.mentionRanges.length - 1].end;
      }
    },
    handleClickOutside(event) {
      if (!this.$refs.inputRef)
        return;
      const inputEl = this.$refs.inputRef.$el.querySelector('textarea');
      const dropdownEl = this.$refs.dropdownRef; // 假设选择框有一个引用

      // 检查点击是否发生在输入框或选择框内
      if (!inputEl.contains(event.target) && (!dropdownEl || !dropdownEl.contains(event.target))) {
        this.showDropdown = false;
      }
    },

    initData() {
      this.nextType = sessionStorage.getItem('next_type')

      if (this.nextType === 'hot_montage') {
        this.copy_list = JSON.parse(sessionStorage.getItem("hot_copy_list")).map(item => ({
          ...item, isHover: false,
        }))
      } else {
        this.copy_list = JSON.parse(sessionStorage.getItem("copy_list")).map(item => ({
          ...item, isHover: false,
        }))
      }

      this.material_list = JSON.parse(sessionStorage.getItem('material_list')) || []
      this.mute_materials = JSON.parse(sessionStorage.getItem('mute_materials')) || []
      let mention_list = JSON.parse(sessionStorage.getItem('mention_list')) || []
      this.mention_list = mention_list.map(item => ({...item, isHover: false}))

      this.sound = JSON.parse(sessionStorage.getItem("setting_voice"))
      this.bgm = JSON.parse(sessionStorage.getItem('setting_bgm')) || {}
      this.bg_volume = Number(sessionStorage.getItem("bg_volume")) || 0.5

      this.top_offset_ratio = Number(sessionStorage.getItem('top_offset_ratio')) || 0.25
      this.bottom_offset_ratio = Number(sessionStorage.getItem('bottom_offset_ratio')) || 0.75

      this.withSubtitle = sessionStorage.getItem("with_subtitle") === 'true'
      this.withTitle = sessionStorage.getItem("with_title") === 'true'

      this.use_background = sessionStorage.getItem("use_background") === 'true'
      this.name_use_background = sessionStorage.getItem("name_use_background") === 'true'

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
      let actualRequest = this.requirement
      let names = this.mention_list.map(item => '@' + item.name);
      names.forEach((item, index) => {
        actualRequest = actualRequest.replace(item, `@{${this.material_list[index]}}`)
      })
      let reference_segments = null
      if (this.nextType === 'hot_montage') {
        let hots = JSON.parse(sessionStorage.getItem("select_hots"))
        reference_segments = hots.segments.map(item => item.description)
      }
      let params = {
        material_list: this.material_list,
        text_list: this.copy_list.map(item => item.content),
        text_title_list: this.copy_list.map(item => item.title),
        user_request: actualRequest,
        bgm_id: this.bgm.id,
        bg_volume: this.bg_volume,
        timbre_id: this.sound.voice_id,
        with_subtitle: this.withSubtitle,
        reference_segments: reference_segments
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
            this.loadAudio()
          })
        } else {
          this.$alert(res.data.data, "混剪失败");
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
        with_subtitle: this.withSubtitle,
        with_title: this.withTitle,
        filename_list: name,
        subtitle_params: {
          y_offset: this.bottom_offset_ratio,
          font: this.subtitleParams.font,
          fontsize: this.subtitleParams['fontsize'],
          color: this.subtitleParams.color,
          stroke_color: this.subtitleParams.stroke_color,
          use_background: this.use_background,
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
          use_background: this.name_use_background,
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
      if (this.activeIndex !== index) {
        this.activeIndex = index
        if (this.isPlaying) {
          this.$refs.videoRef.pause()
          this.$refs.audioRef.pause()
          this.isPlaying = false
        }
        this.currentIndex = 0
        this.$nextTick(() => {
          this.loadVideo(0);
          this.loadAudio()
        })
      }
    },
    removeCopy(index) {
      if (this.already_generated) {
        this.montage_data.splice(index, 1)
        return
      }
      this.copy_list.splice(index, 1)
      sessionStorage.setItem("copy_list", JSON.stringify(this.copy_list))
    },
    loadAudio() {
      this.$refs.audioRef.src = this.montage_data[this.activeIndex].audio_file_path
      this.$refs.audioRef.volume = this.media_volume;
      this.$refs.audioRef.play()
    },
    loadVideo(index) {
      if (index >= 0 && index < this.preview_video.length) {
        this.currentIndex = index;
        this.$refs.videoRef.volume = this.media_volume;
        this.$refs.videoRef.src = this.preview_video[index].filepath
        if (this.mute_materials.includes(this.preview_video[index].id)) {
          this.$refs.videoRef.muted = true
        }
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
      if (this.currentIndex === this.preview_video.length - 1) {
        this.$refs.videoRef.src = this.preview_video[0].filepath
        this.isPlaying = false;
        return
      }
      const nextIndex = this.currentIndex + 1;
      this.loadVideo(nextIndex);
    },
    mediaPlay() {
      this.$refs.audioRef.play()
    },
    mediaPause() {
      this.$refs.audioRef.pause()
    },
    mediaVolumeChange() {
      this.$refs.audioRef.volume = this.$refs.videoRef.volume
      this.$refs.audioRef.muted = this.$refs.videoRef.muted
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
  padding: 19px;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: #ffffff;
  height: 100%;
}

.toggle-btn-open {
  position: fixed;
  top: 50%;
  left: calc(500px);
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
  left: calc(504px);
}

.toggle-btn-close {
  position: fixed;
  top: 50%;
  left: calc(200px);
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
  left: calc(204px);
}

.settings-content-area {
  height: calc(100% - 60px);
}

.settings-content-area >>> .el-textarea__inner {
  padding: 8px;
  font-size: 14px;
  font-family: "Helvetica Neue", Arial, sans-serif;
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
  background-color: #6366fe;
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
  flex-direction: column;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-placeholder-preview video::-webkit-media-controls-timeline {
  display: none !important;
}

.video-placeholder-preview video::-moz-controls-progressbar {
  display: none !important;
}

.video-placeholder-preview video::-ms-media-controls-timeline {
  display: none !important;
}

.li-video {
  height: 200px;
  background-color: #ffffff;
  padding: 3px;
  aspect-ratio: 9 / 16;
  border: 2px solid #DBEAFE;
  border-radius: 8px;
}

.dropdown {
  position: absolute;
  z-index: 999;
  display: flex;
  gap: 10px;
}

.dropdown ul {
  list-style: none;
  margin: 0;
  padding: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 180px;
  height: 200px;
  overflow: auto;
}

.dropdown li {
  padding: 10px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown li:hover {
  background-color: #DBEAFE;
}

.highlight-content {
  padding: 8px;
  box-sizing: border-box;
  border-radius: 4px;
  background-color: #f9f9f9;
  position: absolute;
  overflow-y: auto;
  overflow-x: hidden;
  top: 0;
  left: 0;
  right: 0;
  font-size: 14px;
  line-height: 1.5;
  pointer-events: none;
  z-index: 1;
  word-wrap: break-word;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.input-layer {
  position: relative;
  z-index: 2;
  background-color: transparent;
  color: transparent; /* 让文字看不见 */
  caret-color: black;
}

.input-layer >>> .el-textarea__inner {
  background-color: transparent;
  color: transparent; /* 让文字看不见 */
  border: none;
  font-size: 14px;
  font-family: "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  border-radius: 4px;
  box-shadow: none;
  resize: none;
  transition: border-color 0.2s ease-in-out;
}

.volume-control {
  margin-top: 20px;
  display: flex;
  align-items: center;
  width: 100%;
}

.volume-control >>> .el-button {
  padding: 7px 10px;
}

.volume-label {
  font-size: 13px;
  color: #4b5563;
  font-weight: 500;
  margin-left: 15px;
}

.volume-slider {
  flex: 1;
  margin: 0 20px;
}

.volume-slider >>> .el-slider__button {
  height: 10px;
  width: 10px;
}

.volume-slider >>> .el-slider__runway {
  height: 4px;
}
</style>