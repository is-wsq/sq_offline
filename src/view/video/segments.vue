<template>
  <div class="sync-cv">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="back">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="sync-title">打磨复刻</div>
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
          <div style="position: relative">
            <div class="highlight-content"
                 v-html="highlightedText"
                 :style="{height: replaceDivHeight + 'px'}"
                 ref="highlightDiv">
            </div>
            <el-input type="textarea"
                      :rows="4"
                      placeholder="例如：素材拼接要紧凑，色调统一偏暖"
                      v-model="requirement"
                      @compositionstart="onCompositionStart"
                      @compositionupdate="onCompositionUpdate"
                      @compositionend="onCompositionEnd"
                      @input="onInput"
                      ref="inputRef"
                      class="input-layer"
                      @change="saveSetting"
                      @scroll="handleScroll">
            </el-input>
            <div v-if="showDropdown" class="dropdown" :style="dropdownStyle">
              <ul>
                <li v-for="(item, index) in mention_list" :key="index" @click="selectMention(item)"
                    @mouseleave="liLeave(item)" @mouseenter="liEnter(item)" :title="item.name">
                  {{ item.name }}
                </li>
              </ul>
              <div class="li-video" v-if="hover_li">
                <video :src="hover_li.filepath" style="width: 100%; height: 100%;border-radius: 4px;"
                       loop muted autoplay></video>
              </div>
            </div>
          </div>
          <template v-if="selected_figure.id">
            <div class="panel-label margin-t-12">人物形象出镜比例</div>
            <div class="figure-ratio-slider">
              <el-slider v-model="figure_ratio" style="flex: 1" @change="saveFigureRatio"
                         :step="10" :format-tooltip="formatTooltip"></el-slider>
              <div class="figure-ratio-label">{{ figure_ratio + '%' }}</div>
            </div>
          </template>
          <div class="without_at" :style="{height: selected_figure.id? 'calc(100% - 200px)': 'calc(100% - 150px)'}">
            <div class="panel-title margin-t-8">文案设置</div>
            <div style="max-height: calc(100% - 35px);overflow-y: auto">
              <div class="panel-label">文案要求</div>
              <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }"
                        placeholder="例如：关于 店铺品类(如火锅店、服装店等)相关文案，主推 产品/服务(如招牌菜、爆款服装等)"
                        class="margin-b-12" v-model="copy_require" resize="none" @change="saveSetting"></el-input>
              <div class="panel-label">示例文案</div>
              <div class="flex-center margin-b-8" v-for="(text, index) in exampleTexts" :key="index">
                <div class="copy-item-example">{{ exampleTexts[index] }}</div>
              </div>
              <div style="display: flex;gap: 12px" class="margin-b-12">
                <div style="flex: 1">
                  <div class="panel-label">时长 (秒)</div>
                  <el-input type="number" v-model="video_time" :step="15" @change="saveSetting"></el-input>
                </div>
                <div style="flex: 1">
                  <div class="panel-label">文案数量</div>
                  <el-input type="number" v-model="script_num" min="1" max="10" @blur="validateNum"
                            @change="saveSetting"></el-input>
                </div>
              </div>
              <div class="panel-label">模型选择</div>
              <el-select v-model="ai_model" style="width: 100%" class="margin-b-12" @change="saveSetting">
                <el-option label="本地大模型" value="local_model"></el-option>
                <el-option label="deepseek v3" value="deepseek_v3"></el-option>
              </el-select>
            </div>
          </div>
        </div>
        <div class="settings-button-section">
          <el-button @click="generate"><i class="el-icon-bianjiqi btn-icon"></i>
            {{ already_generated ? '重新生成' : '一键混剪并同步' }}
          </el-button>
        </div>
      </div>

      <div class="left-panel-close" v-if="!show_left_panel">
        <el-tooltip class="item" effect="dark" content="展开设置 " placement="right-end">
          <div class="setting-open" @click="show_left_panel = true">
            <i class="el-icon-arrow-right" style="font-size: 16px;font-weight: bold;color: #ffffff"></i>
          </div>
        </el-tooltip>
      </div>

      <div class="center-panel"
           :style="{width: show_left_panel? 'calc(100% - 648px)' :  activeIndex !== -1? 'calc(100% - 733px)' : 'calc(100% - 370px)'}">
        <div class="script-selection-area">
          <div class="panel-title">AI选用文案</div>
          <div class="copy-list" v-if="copy_list.length > 0">
            <div class="copy-item" v-for="(item, index) in copy_list" :key="index"
                 :class="{'active-item': index === activeIndex}">
              <el-collapse v-model="openIndex" accordion @change="collapseChange">
                <el-collapse-item :name="index">
                  <template slot="title">
                    <div style="padding-left: 12px">
                      <div class="flex-center">
                        <div class="copy-item-title" :title="item.title">{{ item.title }}</div>
                        <div style="width: 16px">
                          <i class="el-icon-close close-icon" @click="removeCopy(index)"></i>
                        </div>
                      </div>
                      <div class="copy-item-desc">{{ item.content }}</div>
                    </div>
                  </template>
                  <div class="segment-groups">
                    <div class="segment-group-item" v-for="(group,group_index) in item.segment_group"
                         :key="group_index">
                      <div class="group-title" v-if="group.groupType !== 'digital_human'"
                           :style="{ width: (group.materials.length * 100 + 80) + 'px' }"
                           :title="group.contentSummary">
                        {{ group.contentSummary }}
                      </div>
                      <div class="group-title" v-if="group.groupType === 'digital_human'"
                           :style="{ width: ((group.materials.length - 1) * 100 + 80) + 'px' }"
                           :title="group.contentSummary">
                        {{ group.contentSummary }}
                      </div>
                      <div class="material-list" ref="materialListRef">
                        <div class="material-item" v-for="(material,material_index) in group.materials"
                             :key="material_index">
                          <el-popover placement="bottom" :ref="'popoverRef_' + material_index" trigger="click"
                                      popper-class="custom-popover-material" @show="popoverShow"
                                      v-if="group.groupType !== 'digital_human'">
                            <div class="shot-list">
                              <div v-for="(shot, shot_index) in mention_list" :key="shot_index"
                                   class="shot-name" :title="shot.name"
                                   @click="addShot(index,group_index,material_index,shot)"
                                   @mouseenter="liEnter(shot)" @mouseleave="liLeave(shot)">
                                {{ shot.name }}
                              </div>
                              <div class="li-video" style="position: absolute; top: 0; right: -132px" v-if="hover_li">
                                <video :src="hover_li.filepath" style="width: 100%; height: 100%;border-radius: 4px;"
                                       loop muted autoplay></video>
                              </div>
                            </div>
                            <div slot="reference" class="insert-shot-btn">
                              <div class="fa-plus">
                                <i class="el-icon-plus" style="font-weight: bold"></i>
                              </div>
                            </div>
                          </el-popover>
                          <div class="delete-shot-btn" v-if="group.groupType !== 'digital_human' && group.materials.length > 1">
                            <i class="el-icon-close" style="font-weight: bold"
                               @click="removeShot(index,group_index,material_index)"></i>
                          </div>
                          <el-image class="material-item-img" :src="material.picture"></el-image>
                          <div class="material-item-title" :title="material.name">{{ material.name }}</div>
                        </div>
                        <div class="material-item" v-if="group.groupType !== 'digital_human'">
                          <el-popover :ref="'pushRef_' + index" placement="bottom" width="200" trigger="click"
                                      popper-class="custom-popover-material1" @show="popoverShow(true)">
                            <div class="shot-list">
                              <div v-for="val in mention_list" :key="val.id"
                                   class="shot-name" :title="val.name"
                                   @click="pushShot(index,group_index,val)"
                                   @mouseleave="liLeave(val)"
                                   @mouseenter="liEnter(val)">
                                {{ val.name }}
                              </div>
                              <div class="li-video" style="position: absolute; top: 0; right: -145px" v-if="hover_li">
                                <video :src="hover_li.filepath" style="width: 100%; height: 100%;border-radius: 4px;"
                                       loop muted autoplay></video>
                              </div>
                            </div>
                            <div slot="reference" class="add-shot-btn">
                              <i class="el-icon-plus" style="font-weight: bold"></i>
                            </div>
                          </el-popover>
                        </div>
                      </div>
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
            <el-button @click="export_video"><i class="el-icon-fa-download" style="margin-right: 10px;"></i>导出视频
            </el-button>
          </div>
        </div>
      </div>

      <div class="storyboard-panel" v-if="!show_left_panel && activeIndex !== -1">
        <div class="panel-title margin-b-16">分镜文案详情</div>
        <div class="storyboard-content">
          <div class="storyboard-item" v-for="(group, index) in selectedCopy.segment_group" :key="index">
            <div class="shot-group-title" :title="group.contentSummary">{{ group.contentSummary }}</div>
            <div class="group-content-wrapper">
              <div class="details-shot-list">
                <div class="" v-for="(shot, shot_index) in group.materials" :key="shot_index">
                  <el-image class="storyboard-item-img" :src="shot.picture"></el-image>
                </div>
              </div>
              <div class="detail-script-text">{{ group.copy }}</div>
            </div>
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
              preload="metadata"
              controls
              controlsList="noplaybackrate nodownload"
              @play="mediaPlay"
              @pause="mediaPause"
              @ended="playNextVideo"
              @volumechange="mediaVolumeChange"
              style="width: 280px; aspect-ratio: 9 / 16;border-radius: 12px"
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
  data() {
    return {
      show_left_panel: true,
      requirement: '',
      figure_ratio: 30,
      selected_figure: {},

      /* initData 前面素材选择、样式设置所选参数 */
      material_list: [],
      mute_materials: [],
      mention_list: [],
      reverse: false,
      hover_li: null,
      sound: {},
      voice_mode: '',
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
      exampleTexts: [''],
      video_time: 15,
      script_num: 1,
      ai_model: 'deepseek_v3',
      copy_list: [],
      openIndex: null,
      activeIndex: -1,
      selectedCopy: null,

      currentIndex: 0,
      isPlaying: false,

      media_volume: 0.5,
      loading: null,
      segments_description: [],

      displayText: '',
      isComposing: false,
      composingText: '',
      compositionStart: 0,
      highlightedText: '',
      show_model: '',
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
    this.replaceDivHeight = inputEl.clientHeight + 2
    inputEl.addEventListener('scroll', this.handleScroll);
  },
  watch: {
    requirement(newVal) {
      if (!this.isComposing) {
        this.updateDisplayText();
      }
    }
  },
  computed: {
    audio_file_duration() {
      if (this.copy_list.length > 0) {
        return this.copy_list[this.activeIndex].audio_file_duration
      }
      return 0
    },
    preview_video() {
      if (this.copy_list.length > 0) {
        let segment_group = this.copy_list[this.activeIndex].segment_group
        return segment_group.reduce((acc, item) => {
          const materials_duration = item.materials.reduce((sum, material) => sum + material.duration, 0);
          return acc.concat(item.materials.map(material => ({
            id: material.id,
            video_type: material.video_type,
            filepath: material.filepath,
            group_duration: item.groupDuration || 0,
            materials_duration: materials_duration,
          })));
        }, [])
      }
      return []
    },
    base_playback_rate() {
      let segment_group = this.copy_list[this.activeIndex].segment_group
      const sum_segment_group = segment_group.reduce((sum, item) => sum + item.groupDuration, 0);
      return sum_segment_group / this.copy_list[this.activeIndex].audio_file_duration
    }
  },
  methods: {
    popoverShow(params) {
      this.$nextTick(() => {
        let popover = document.querySelector('.custom-popover-material');
        if (params) {
          popover = document.querySelector('.custom-popover-material1');
        }
        if (popover) {
          popover.style.borderRadius = '10px';
          popover.style.padding = '0 0 0 2px';
        }
      });
    },
    addShot(index, group_index, material_index, item) {
      this.$nextTick(() => {
        const popoverRefs = this.$refs[`popoverRef_${material_index}`];
        if (popoverRefs && popoverRefs.length > 0) {
          const popover = popoverRefs[0];
          popover.showPopper = false;
        } else {
          console.warn('未找到对应的输入框 ref', item.id);
        }
      });
      this.copy_list[index].segment_group[group_index].materials.splice(material_index, 0, item);
      this.currentIndex = 0
      this.$nextTick(() => {
        this.loadVideo(this.currentIndex);
        this.loadAudio()
      })
      sessionStorage.setItem("segments_copy_list", JSON.stringify(this.copy_list))
    },
    pushShot(index, group_index, val) {
      this.$nextTick(() => {
        const popoverRefs = this.$refs[`pushRef_${index}`];
        if (popoverRefs && popoverRefs.length > 0) {
          const popover = popoverRefs[0];
          popover.showPopper = false;
        } else {
          console.warn('未找到对应的输入框 ref', val.id);
        }
      });
      this.copy_list[index].segment_group[group_index].materials.push(val)
      this.currentIndex = 0
      this.$nextTick(() => {
        this.loadVideo(this.currentIndex);
        this.loadAudio()
      })
      sessionStorage.setItem("segments_copy_list", JSON.stringify(this.copy_list))
    },
    removeShot(index, group_index, shot_index) {
      this.$confirm('确认删除该分镜吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.copy_list[index].segment_group[group_index].materials.splice(shot_index, 1)
        if (this.copy_list[index].segment_group[group_index].materials.length !== 0) {
          this.currentIndex = 0
          this.$nextTick(() => {
            this.loadVideo(this.currentIndex);
            this.loadAudio()
          })
        }
        sessionStorage.setItem("segments_copy_list", JSON.stringify(this.copy_list))
      }).catch((err) => {
        this.$message({type: 'info', message: '已取消删除'});
      });
    },
    saveSetting() {
      this.validateNum()
      let segments_setting = {
        requirement: this.requirement,
        copy_require: this.copy_require,
        video_time: this.video_time,
        script_num: this.script_num,
        ai_model: this.ai_model,
      }
      sessionStorage.setItem('segments_setting', JSON.stringify(segments_setting))
    },
    onCompositionStart(e) {
      this.isComposing = true;
      this.compositionStart = e.target.selectionStart;
    },

    onCompositionUpdate(e) {
      this.composingText = e.data;
      this.updateDisplayText();
    },

    onCompositionEnd(e) {
      this.isComposing = false;
      this.composingText = '';
      this.requirement = e.target.value;
      this.updateDisplayText();
    },
    updateDisplayText() {
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

      let result = this.requirement;
      if (this.isComposing && this.composingText) {
        const before = result.substring(0, this.compositionStart);
        const after = result.substring(this.compositionStart + this.composingText.length);
        result = before + this.composingText + after;
      }
      let names = this.mention_list.map(item => '@' + item.name);
      names.forEach(item => {
        const regex = new RegExp(`${item}`, 'g'); // 使用全局标志
        result = result.replace(regex, (match) => {
          return `<span style="color: #4c8df1">${match}</span>`
        });
      });
      result = result.replace(/\n/g, '<br>'); // 支持换行
      this.highlightedText = result; // 返回最终结果

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
    validateNum() {
      let val = this.script_num
      if (val < 1) {
        this.script_num = 1
      } else if (val > 10) {
        this.script_num = 10
      } else {
        this.script_num = val
      }
    },
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
      if (this.isComposing) {
        return
      }
      this.updateDisplayText();
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
      this.figure_ratio = parseInt(sessionStorage.getItem('montage_figure_ratio')) || 30
      this.selected_figure = JSON.parse(sessionStorage.getItem('material_figure')) || {}

      this.copy_list = JSON.parse(sessionStorage.getItem("segments_copy_list")) || []
      if (this.copy_list.length > 0) {
        this.show_left_panel = false;
        this.already_generated = true;
        this.openIndex = 0;
        this.activeIndex = 0;
        this.currentIndex = 0
        this.selectedCopy = this.copy_list[0]
        this.$nextTick(() => {
          this.loadVideo(this.currentIndex);
          this.loadAudio()
        })
      }

      let segments_setting = JSON.parse(sessionStorage.getItem("segments_setting")) || {}
      this.requirement = segments_setting.requirement || ''
      this.copy_require = segments_setting.copy_require || ''
      this.video_time = parseInt(segments_setting.video_time) || 15
      this.script_num = parseInt(segments_setting.script_num) || 1
      this.ai_model = segments_setting.ai_model || 'deepseek_v3'

      sessionStorage.setItem('segments_setting', JSON.stringify(segments_setting))

      let hots = JSON.parse(sessionStorage.getItem("select_hots"))
      this.exampleTexts = []
      this.exampleTexts[0] = hots.segments.map(segment => segment.asr_text).join('');
      this.segments_description = hots.segments.map(item => item.description)

      // 选择的素材id列表、素材列表、静音素材列表
      this.material_list = JSON.parse(sessionStorage.getItem('material_list')) || []
      this.mute_materials = JSON.parse(sessionStorage.getItem('mute_materials')) || []
      let mention_list = JSON.parse(sessionStorage.getItem('mention_list')) || []
      this.mention_list = mention_list.map(item => ({...item, isHover: false}))
      this.reverse = sessionStorage.getItem("setting_reverse") === 'true'
      // 视频音色、背景音乐、背景音乐音量
      this.sound = JSON.parse(sessionStorage.getItem("setting_voice")) || {}
      this.voice_mode = sessionStorage.getItem("setting_mode") || 'common'
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
      this.subtitleParams.content_font_opacity = Number(sessionStorage.getItem("content_font_opacity")) || 1
      this.subtitleParams.font = sessionStorage.getItem("font") || 'SJxingkai-C-Regular'
      this.subtitleParams.background_color = sessionStorage.getItem("background_color") || '#404040'
      this.subtitleParams.background_opacity = Number(sessionStorage.getItem("background_opacity")) || 0.6
      this.subtitleParams.stroke_color = sessionStorage.getItem("stroke_color") || '#000000'
      // 字幕标题样式设置
      this.show_model = sessionStorage.getItem('show_model') || 'begin'
      this.subtitleNameParams.name_fontsize = parseInt(sessionStorage.getItem("name_fontsize")) || 10
      this.subtitleNameParams.name_color = sessionStorage.getItem("name_color") || '#ffffff'
      this.subtitleNameParams.title_font_opacity = Number(sessionStorage.getItem("title_font_opacity")) || 1
      this.subtitleNameParams.name_font = sessionStorage.getItem("name_font") || 'SJxingkai-C-Regular'
      this.subtitleNameParams.name_background_color = sessionStorage.getItem("name_background_color") || '#404040'
      this.subtitleNameParams.name_background_opacity = Number(sessionStorage.getItem("name_background_opacity")) || 0.6
      this.subtitleNameParams.name_stroke_color = sessionStorage.getItem("name_stroke_color") || '#000000'
    },
    saveFigureRatio() {
      sessionStorage.setItem('montage_figure_ratio', this.figure_ratio)
    },
    formatTooltip(val) {
      return val + '%';
    },
    generate() {
      if (this.copy_require.trim() === '') {
        this.$alert('文案要求不能为空，请先填写文案要求', '提示')
        return
      }
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
        mute_materials: this.mute_materials,
        user_request: actualRequest,
        bgm_id: this.bgm.id,
        bg_volume: this.bg_volume,
        timbre_id: this.sound.voice_id,
        voice_mode: this.voice_mode,
        with_subtitle: this.withSubtitle,
        reverse: this.reverse,
        figure_ratio: this.figure_ratio + '%',
        reference_segments: this.segments_description,
      }
      postAction('/figure/video_mix_edit_sync', params, 3600000).then(res => {
        if (res.data.status === 'success') {
          this.show_left_panel = false;
          this.already_generated = true;
          this.copy_list = res.data.data
          sessionStorage.setItem("segments_copy_list", JSON.stringify(this.copy_list))
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
          this.$alert(res.data.message, "混剪失败");
          this.loading.close();
          this.loading = null;
        }
      }).catch(error => {
        this.loading.close();
        this.loading = null;
        this.$alert(error, "混剪错误");
      })
    },
    collapseChange(val) {
      if (val !== '' && this.activeIndex !== val) {
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
      this.$confirm('确认删除该文案吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.copy_list.splice(index, 1)
        if (this.$refs.videoRef) {
          this.$refs.videoRef.pause()
          this.$refs.audioRef.pause()
          this.isPlaying = false
        }
        if (this.copy_list.length > 0) {
          this.already_generated = true;
          this.openIndex = 0;
          this.activeIndex = 0;
          this.currentIndex = 0
          this.selectedCopy = this.copy_list[0]
          this.$nextTick(() => {
            this.loadVideo(this.currentIndex);
            this.loadAudio()
          })
        } else {
          this.already_generated = false;
          this.selectedCopy = null;
          this.currentIndex = 0;
          this.openIndex = null
          this.activeIndex = -1
        }
        sessionStorage.setItem("segments_copy_list", JSON.stringify(this.copy_list))
      }).catch((err) => {
        this.$message({type: 'info', message: '已取消删除'});
      });
    },

    setName() {
      let data = new Date();
      let year = data.getFullYear();
      let month = String(data.getMonth() + 1).padStart(2, "0");
      let day = String(data.getDate()).padStart(2, "0");
      let hours = String(data.getHours()).padStart(2, "0");
      let minutes = String(data.getMinutes()).padStart(2, "0");
      let seconds = String(data.getSeconds()).padStart(2, "0");
      let base = month + '-' + day + '_' + hours + '-' + minutes + '-' + seconds

      let result = [];
      for (let i = 1; i <= this.copy_list.length; i++) {
        result.push(base + '_' + i);
      }
      return result;
    },
    export_video() {
      if (this.copy_list.length === 0) {
        this.$alert('请先使用左侧工具生成文案，您至少需要一条文案才能开始制作。', '提示')
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
        reverse: this.reverse,
        subtitle_params: {
          y_offset: this.bottom_offset_ratio,
          font: this.subtitleParams.font,
          fontsize: this.subtitleParams['fontsize'],
          color: this.subtitleParams.color,
          font_opacity: this.subtitleParams.content_font_opacity,
          stroke_color: this.subtitleParams.stroke_color,
          use_background: this.use_background,
          background_color: this.subtitleParams.background_color,
          background_opacity: this.subtitleParams.background_opacity
        },
        title_params: {
          y_offset: this.top_offset_ratio,
          show_model: this.show_model,
          font: this.subtitleNameParams.name_font,
          fontsize: this.subtitleNameParams.name_fontsize,
          color: this.subtitleNameParams.name_color,
          font_opacity: this.subtitleNameParams.title_font_opacity,
          stroke_color: this.subtitleNameParams.name_stroke_color,
          use_background: this.name_use_background,
          background_color: this.subtitleNameParams.name_background_color,
          background_opacity: this.subtitleNameParams.name_background_opacity
        }
      }
      postAction('/figure/export_video_sync', params).then(res => {
        if (res.data.status === "success") {
          this.$alert('已创建视频生成任务，视频生成成功后会自动下载到本地', "任务创建提醒");
          sessionStorage.clear()
          setTimeout(() => {
            this.$router.push({path: '/videoList'})
          }, 500)
        } else {
          this.$alert(res.data.message, '导出失败')
        }
      }).catch((error) => {
        this.$alert(error, '导出错误')
      });
    },
    loadAudio() {
      this.$refs.audioRef.src = this.copy_list[this.activeIndex].audio_file_path
      // this.$refs.audioRef.volume = this.media_volume;
      this.$refs.audioRef.play()
    },
    loadVideo(index) {
      if (index >= 0 && index < this.preview_video.length) {
        this.currentIndex = index;
        let preview = this.preview_video[index]
        this.$refs.videoRef.src = preview.filepath
        this.$refs.videoRef.load();
        // this.$refs.videoRef.volume = this.media_volume;
        this.$refs.videoRef.playbackRate = preview.materials_duration / preview.group_duration * this.base_playback_rate;
        if (this.mute_materials.includes(preview.id) || preview.video_type === 'figure') {
          this.$refs.videoRef.muted = true
        }
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
        this.currentIndex = 0;
        this.$refs.videoRef.src = this.preview_video[0].filepath
        this.$refs.videoRef.currentTime = 0
        this.$refs.audioRef.pause()
        this.$refs.audioRef.currentTime = 0
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
      // this.media_volume = this.$refs.videoRef.volume
      // this.$refs.audioRef.volume = this.$refs.videoRef.volume
      // this.$refs.audioRef.muted = this.$refs.videoRef.muted
    },
    mediaRateChange() {
      this.$refs.audioRef.playbackRate = this.$refs.videoRef.playbackRate
    },
    mediaTimeUpdate() {
      let audioDuration = this.$refs.audioRef.duration
      let videoCurrentTime = this.$refs.videoRef.currentTime
      if (isNaN(audioDuration)) {
        return;
      }
      if (videoCurrentTime < audioDuration) {
        this.$refs.audioRef.currentTime = videoCurrentTime
      }else {
        this.$refs.audioRef.currentTime = 0
        this.$refs.audioRef.pause()
      }
    },
    back() {
      sessionStorage.setItem('video_path', '/material')
      this.$router.push({path: '/material'})
    }
  }
}
</script>

<style scoped>
.sync-cv {
  min-height: 700px;
  height: 100%;
  min-width: 1280px;
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
  padding: 20px 10px;
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
  left: calc(500px);
}

.setting-close:hover {
  left: calc(504px);
}

.setting-open {
  box-shadow: rgba(16, 185, 129, 0.3) 0 4px 20px;
  background: linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%);
  left: calc(200px);
}

.setting-open:hover {
  left: calc(204px);
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
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.without_at >>> .el-textarea__inner:focus {
  outline: none;
  background: white;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.without_at >>> .el-input__inner {
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #DCDFE6;
  height: 30px;
  line-height: 30px;
  padding: 0 5px 0 15px;
}

.without_at >>> .el-input__icon {
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
  background-color: #6366fe;
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
  font-weight: bold;
  font-size: 15px;
  color: #1f2937;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copy-item-desc {
  font-size: 13px;
  color: #1f2937;
  max-height: 100px;
  overflow-y: auto;
}

.segment-groups {
  margin-top: 12px;
  display: flex;
  flex-direction: row;
  gap: 8px;
  overflow-x: auto;
  padding: 0 12px 12px 12px;
}

.segment-group-item {
  flex-shrink: 0;
  background-color: #f8fafc;
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.group-title {
  font-size: 13px;
  font-weight: 500;
  color: #4338ca;
  margin-bottom: 8px;
  width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.material-list {
  display: flex;
  gap: 20px;
}

.material-item {
  position: relative;
  width: 80px;
  display: flex;
  aspect-ratio: 9 / 16;
  border-radius: 5px;
  flex-shrink: 0;
}

.add-shot-btn {
  flex-shrink: 0;
  width: 80px;
  aspect-ratio: 9 / 16;
  border-radius: 5px;
  background-color: #f9fafb;
  border: 2px dashed #d1d5db;
  box-sizing: border-box;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.material-item:hover .insert-shot-btn,
.material-item:hover .delete-shot-btn {
  opacity: 1;
}

.insert-shot-btn {
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 178px;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
  z-index: 10;
  opacity: 0;
}

.insert-shot-btn::before {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 100%;
  background-color: #6366f1;
  border-radius: 1px;
}

.delete-shot-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background-color: #ef4444;
  color: white;
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
  z-index: 20;
}

.fa-plus {
  position: relative;
  background-color: #6366f1;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  font-size: 12px;
  box-shadow: 0 0 0 1px #f9fafb;
  transition: transform 0.2s ease;
}

.material-item-img {
  width: 100%;
  height: 100%;
  border-radius: 5px;
}

.material-item-title {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
  padding: 10px 2px;
  box-sizing: border-box;
  color: #FFFFFF;
  font-size: 12px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active-item {
  border-color: #4338ca;
  background-color: #eef2ff;
}

.copy-item:hover .close-icon {
  opacity: 1;
}

.close-icon {
  color: #b3b5b4;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  opacity: 0;
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

.copy-item-example {
  padding: 8px;
  font-size: 13px;
  color: #4f5153;
  background-color: #f9f9f9;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  max-height: 105px;
  width: 100%;
  overflow-y: auto;
  box-sizing: border-box;
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
  flex-direction: column;
  gap: 12px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.shot-group-title {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-content-wrapper {
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: stretch;
}

.details-shot-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

.detail-script-text {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.7;
  flex-grow: 1;
  background-color: #ffffff;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
}

.storyboard-item-img {
  background-color: #e5e7eb;
  width: 54px;
  height: 96px;
  border-radius: 4px;
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

.dropdown ul::-webkit-scrollbar {
  width: 5px !important;
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
  border: 1px solid #d1d5db;
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
  border: 1px solid #d1d5db;
  resize: none;
  transition: border-color 0.2s ease-in-out;
}

.input-layer >>> .el-textarea__inner:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

::v-deep >>> .el-popover {
  border-radius: 10px !important;
  padding: 0 !important;
}

.shot-list {
  width: 210px;
  height: 200px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 4px;
  background-color: #ffffff;
}

.shot-list::-webkit-scrollbar {
  width: 5px !important;
}

.shot-name {
  border-radius: 6px;
  padding: 10px;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
}

.shot-name:hover {
  background-color: #6366f1;
  color: #ffffff;
}

.figure-ratio-slider {
  padding-left: 2px;
  display: flex;
  gap: 25px;
}

.figure-ratio-slider >>> .el-slider__button {
  width: 13px;
  height: 13px;
  margin-top: 9px;
  border: 1px solid #409EFF;
  background-color: #0075ff;
}

.figure-ratio-slider >>> .el-slider__button-wrapper {
  height: 25px;
}

.figure-ratio-slider >>> .el-slider__runway {
  height: 5px;
  margin: 10px 0;
  border: 1px solid #b5b5b5;
  background-color: #efefef;
}

.figure-ratio-slider >>> .el-slider {
  height: 25px;
}

.figure-ratio-slider >>> .el-slider__bar {
  height: 5px;
}

.figure-ratio-label {
  width: 36px;
  font-size: 14px;
  color: #1e293b;
  font-weight: bold;
  line-height: 25px;
  text-align: end;
}
</style>