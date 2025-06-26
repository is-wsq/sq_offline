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
          <div style="position: relative;">
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
          <div class="without_at">
            <div class="panel-title margin-t-8">文案设置</div>
            <div style="max-height: 185px; overflow-y: auto" ref="scriptForm">
              <div class="panel-label">文案要求</div>
              <el-input type="textarea" :rows="2" placeholder="例如：写一个关于猫咪的搞笑段子"
                        class="margin-b-12" v-model="copy_require"></el-input>
              <div class="panel-label">示例文案（选填）</div>
              <div class="flex-center margin-b-8" v-for="(text, index) in exampleTexts" :key="index">
                <el-input type="textarea" :rows="2" placeholder="提供一个你喜欢的风格的例子"
                          v-model="exampleTexts[index]"></el-input>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeText(index)"></el-button>
              </div>
            </div>
            <div class="margin-b-12">
              <el-button size="mini" type="primary" @click="addExampleText">添加示例文案</el-button>
            </div>
            <div style="display: flex;gap: 12px" class="margin-b-12">
              <div style="flex: 1">
                <div class="panel-label">视频时长</div>
                <el-input type="number" v-model="video_time"></el-input>
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
                      <el-image class="copy-item-material-img" :src="material.picture"></el-image>
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
            <el-button @click="export_video"><i class="el-icon-fa-download" style="margin-right: 10px;"></i>导出视频</el-button>
          </div>
        </div>
      </div>

      <div class="storyboard-panel" v-if="!show_left_panel && activeIndex !== -1">
        <div class="panel-title margin-b-16">分镜文案详情</div>
        <div class="storyboard-content">
          <div class="storyboard-item" v-for="(item, index) in selectedCopy.materials" :key="index">
            <el-image class="storyboard-item-img" :src="item.picture"></el-image>
            <div class="storyboard-item-detail">{{ selectedCopy.script[index].copy }}</div>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="video-placeholder" v-if="activeIndex < 0">
          <i class="el-icon-film-c" style="font-size: 48px"></i>
          <div>视频预览区</div>
        </div>
        <div class="video-placeholder-preview" v-if="activeIndex !== -1">
          <video
              ref="videoRef"
              @ended="playNextVideo"
              preload="metadata"
              style="width: 280px; aspect-ratio: 9 / 16;border-radius: 12px"
          >
            您的浏览器不支持HTML5视频播放。
          </video>
          <audio ref="audioRef" controls class="audio-element" v-show="false">
            <source type="audio/mpeg">
            您的浏览器不支持音频播放
          </audio>
        </div>
        <div class="volume-control" v-if="activeIndex !== -1">
          <el-button-group>
            <el-button @click="playBoth"><i class="el-icon-video-play" style="font-size: 16px"></i></el-button>
            <el-button @click="pauseBoth"><i class="el-icon-video-pause" style="font-size: 16px"></i></el-button>
          </el-button-group>
          <div class="volume-label">音量</div>
          <div class="volume-slider">
            <el-slider v-model="media_volume" :step="0.1" :min="0" :max="1" @change="updateMediaVolume"></el-slider>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {postAction} from "@/api/api";

export default {
  data() {
    return {
      show_left_panel: true,
      requirement: '',

      /* initData 前面素材选择、样式设置所选参数 */
      material_list: [],
      mute_materials: [],
      mention_list: [],
      hover_li: null,
      sound: {},
      bgm: {},
      bg_volume: 0.5,
      top_offset_ratio: 0.25,
      bottom_offset_ratio: 0.75,
      withSubtitle: false,
      withTitle: false,
      use_background: false,
      name_use_background: false,
      subtitleParams: {},
      subtitleNameParams: {},
      /* --end-- */

      lastInput: '',
      replaceDivHeight: 102,
      showDropdown: false,
      dropdownStyle: {
        position: 'absolute',
        top: '0px',
        left: '0px'
      },
      mentionRanges: [],

      already_generated: false,
      copy_require: '',
      example_copy: '',
      exampleTexts: [''],
      video_time: 10,
      script_num: 1,
      ai_model: 'deepseek_v3',
      copy_list: [],
      openIndex: null,
      activeIndex: -1,
      selectedCopy: null,

      currentIndex: 0,
      isPlaying: false,

      loading: null,
      media_volume: 0.5,
    }
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
  computed: {
    preview_video() {
      return this.copy_list.length > 0 ? this.copy_list[this.activeIndex].materials : []
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
    addExampleText() {
      this.exampleTexts.push('');
      this.$nextTick(() => { //自动滚到到底部
        const scriptForm = this.$refs.scriptForm;
        scriptForm.scrollTop = scriptForm.scrollHeight;
      });
    },
    removeText(index) {
      this.exampleTexts.splice(index, 1);
    },
    initData() {
      // 选择的素材id列表、素材列表、静音素材列表
      this.material_list = JSON.parse(sessionStorage.getItem('material_list')) || []
      this.mute_materials = JSON.parse(sessionStorage.getItem('mute_materials')) || []
      let mention_list = JSON.parse(sessionStorage.getItem('mention_list')) || []
      this.mention_list = mention_list.map(item => ({...item, isHover: false}))
      // 视频音色、背景音乐、背景音乐音量
      this.sound = JSON.parse(sessionStorage.getItem("setting_voice")) || {}
      this.bgm = JSON.parse(sessionStorage.getItem('setting_bgm')) || {}
      this.bg_volume = Number(sessionStorage.getItem("bg_volume")) || 0.5
      // 字幕标题、内容位置
      this.top_offset_ratio = Number(sessionStorage.getItem('top_offset_ratio')) || 0.25
      this.bottom_offset_ratio = Number(sessionStorage.getItem('bottom_offset_ratio')) || 0.75
      // 是否开启字幕标题、内容
      this.withSubtitle = sessionStorage.getItem("with_subtitle") === 'true'
      this.withTitle = sessionStorage.getItem("with_title") === 'true'
      // 字幕标题、内容是否使用背景
      this.use_background = sessionStorage.getItem("use_background") === 'true'
      this.name_use_background = sessionStorage.getItem("name_use_background") === 'true'
      // 字幕内容样式设置
      this.subtitleParams.fontsize = parseInt(sessionStorage.getItem("fontsize")) || 5
      this.subtitleParams.color = sessionStorage.getItem("color") || '#ffffff'
      this.subtitleParams.font = sessionStorage.getItem("font") || 'SJxingkai-C-Regular'
      this.subtitleParams.background_color = sessionStorage.getItem("background_color") || '#404040'
      this.subtitleParams.background_opacity = Number(sessionStorage.getItem("background_opacity")) || 0.6
      this.subtitleParams.stroke_color = sessionStorage.getItem("stroke_color") || '#000000'
      // 字幕标题样式设置
      this.subtitleNameParams.name_fontsize = parseInt(sessionStorage.getItem("name_fontsize")) || 10
      this.subtitleNameParams.name_color = sessionStorage.getItem("name_color") || '#ffffff'
      this.subtitleNameParams.name_font = sessionStorage.getItem("name_font") || 'SJxingkai-C-Regular'
      this.subtitleNameParams.name_background_color = sessionStorage.getItem("name_background_color") || '#404040'
      this.subtitleNameParams.name_background_opacity = Number(sessionStorage.getItem("name_background_opacity")) || 0.6
      this.subtitleNameParams.name_stroke_color = sessionStorage.getItem("name_stroke_color") || '#000000'
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
      const cleanTexts = this.exampleTexts.map(text => text.trim()).filter(text => text !== '');
      let params = {
        requirements: this.copy_require,
        video_time: parseInt(this.video_time),
        example: cleanTexts,
        count: parseInt(this.script_num),
        material_list: this.material_list,
        user_request: this.requirement,
        timbre_id: this.sound.voice_id,
        with_subtitle: this.withSubtitle
      }
      postAction('/figure/video_mix_edit_sync', params, 3600000).then(res => {
        if (res.data.status === 'success') {
          this.show_left_panel = false;
          this.already_generated = true;
          this.copy_list = res.data.data
          this.openIndex = 0;
          this.activeIndex = 0;
          this.selectedCopy = this.copy_list[0]
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
    collapseChange(val) {
      if (val !== '') {
        this.activeIndex = val
        this.selectedCopy = this.copy_list[val]
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
      this.copy_list.splice(index, 1)
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
    export_video() {
      if (this.copy_list.length === 0) {
        this.$alert('文案列表为空，请先使用左侧工具生成', '提示')
        return
      }
      let bool_list = this.material_list.map(item => this.mute_materials.includes(item))

      let name = this.setName()
      let params = {
        data: this.copy_list,
        filename_list: name, //视频文件名
        bgm_id: this.bgm.id || '',
        bg_volume: this.bg_volume,// bgm的音量大小，不传默认是0.5
        with_subtitle: this.withSubtitle, // 是否要字幕
        with_title: this.withTitle,// 是否要字幕标题
        bool_list: bool_list,// 需要静音的素材id列表
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
          font: this.subtitleNameParams.name_font,
          fontsize: this.subtitleNameParams.name_fontsize,
          color: this.subtitleNameParams.name_color,
          stroke_color: this.subtitleNameParams.name_stroke_color,
          use_background: this.name_use_background,
          background_color: this.subtitleNameParams.name_background_color,
          background_opacity: this.subtitleNameParams.name_background_opacity
        }
      }
      postAction('/figure/export_video_sync',params).then(res => {
        if (res.data.status === "success") {
          this.$alert('已创建视频生成任务，视频生成成功后会自动下载到本地', "任务创建提醒");
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
    loadAudio() {
      this.$refs.audioRef.src = this.copy_list[this.activeIndex].audio_file_path
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

    playBoth() {
      if (this.isPlaying) {
        return
      }
      const video = this.$refs.videoRef;
      const audio = this.$refs.audioRef;
      // 同步播放
      Promise.all([
        video.play(),
        audio.play()
      ]).catch(error => {
        console.error('播放失败:', error);
      });
    },

    // 暂停视频和音频
    pauseBoth() {
      this.$refs.videoRef.pause();
      this.$refs.audioRef.pause();
    },

    updateMediaVolume() {
      this.$refs.videoRef.volume = this.media_volume;
      this.$refs.audioRef.volume = this.media_volume;
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

.without_at >>> .el-textarea__inner {
  padding: 8px;
  color: #1f2937;
  background-color: #f9f9f9;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
}

.without_at >>> .el-input__inner {
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #DCDFE6;
  height: 30px;
  line-height: 30px;
  padding: 0 5px 0 15px;
}

.without_at >>> .el-input__icon{
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
}

.input-layer {
  position: relative;
  z-index: 2;
  background-color: transparent;
  color: transparent; /* 让文字看不见 */
  caret-color: black;
}

.input-layer >>> .el-textarea__inner {
  padding: 8px;
  background-color: transparent;
  color: transparent; /* 让文字看不见 */
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