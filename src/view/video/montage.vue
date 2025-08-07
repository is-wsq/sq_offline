<template>
  <div class="montage">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="back">
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
                      @input="onInput"
                      @compositionstart="onCompositionStart"
                      @compositionupdate="onCompositionUpdate"
                      @compositionend="onCompositionEnd"
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
            <div class="setting-require margin-t-12">人物形象出镜比例</div>
            <div class="figure-ratio-slider">
              <el-slider v-model="figure_ratio" style="flex: 1" @change="saveFigureRatio"
                         :step="10" :format-tooltip="formatTooltip"></el-slider>
              <div class="figure-ratio-label">{{ figure_ratio + '%' }}</div>
            </div>
          </template>
        </div>

        <div class="settings-button-section">
          <div class="generate-btn">
            <el-button @click="generate" :loading="!!loading"><i class="el-icon-bianjiqi btn-icon" v-if="!loading"></i>
              {{ !!loading ? '生成中...' : already_generated ? '重新生成' : '一键混剪' }}
            </el-button>
          </div>
          <div class="batch-download">
            <el-button @click="centerDialogVisible = true"><i class="el-icon-arrow-down" style="font-size: 16px"></i>
            </el-button>
          </div>
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
                   :class="{ 'script-item-active': selected_index === index}" @click="selectItem(index)">
                <div class="flex-center margin-b-8" style="width: 100%">
                  <div class="script-item-title" :title="item.title">{{ item.title }}</div>
                  <div class="script-item-btn">
                    <el-popover :ref="'popover_'+ index" placement="bottom" trigger="click" @hide="stopAudio"
                                v-if="!item.bgm.id">
                      <div class="bgm-popover-content">
                        <el-row>
                          <el-col :span="12" v-for="(bgm, bgm_index) in bgm_options" :key="bgm.id">
                            <div class="bgm-item" @click="selectBgm(bgm, index)">
                              <div class="bgm-icon"
                                   @click.stop="previewAudio(bgm, 10000 + bgm_index)"
                                   v-if="audioIndex !== (10000 + bgm_index)">
                                <i :class="bgm.isPlay ? 'el-icon-pause' : 'el-icon-play'"
                                   style="font-size: 13px; color: #6286ed">
                                </i>
                              </div>
                              <div class="bgm-icon" @click.stop="stopAudio" v-else>
                                <i class="el-icon-pause" style="font-size: 13px; color: #6286ed"></i>
                              </div>
                              <div class="bgm-name" :title="bgm.name">{{ bgm.name }}</div>
                            </div>
                          </el-col>
                        </el-row>
                      </div>
                      <el-button slot="reference"><i class="el-icon-plus" style="font-weight: bold"></i>
                        添加音乐
                      </el-button>
                    </el-popover>
                    <div class="music-topbar" v-else>
                      <i class="el-icon-music" style="line-height: 21px"></i>
                      <div class="music-name" :title="item.bgm.name">{{ item.bgm.name }}</div>
                      <el-popover :ref="'popover_'+ index" placement="bottom" trigger="click" @hide="stopAudio">
                        <div class="bgm-popover-content">
                          <el-row>
                            <el-col :span="12" v-for="(bgm, bgm_index) in bgm_options" :key="bgm.id">
                              <div class="bgm-item" :class="{ 'bgm-selected': bgm.id === item.bgm.id }"
                                   @click="selectBgm(bgm, index)">
                                <div class="bgm-icon"
                                     @click.stop="previewAudio(bgm, 10000 + bgm_index)"
                                     v-if="audioIndex !== (10000 + bgm_index)">
                                  <i :class="bgm.isPlay ? 'el-icon-pause' : 'el-icon-play'"
                                     style="font-size: 13px; color: #6286ed">
                                  </i>
                                </div>
                                <div class="bgm-icon" @click.stop="stopAudio" v-else>
                                  <i class="el-icon-pause" style="font-size: 13px; color: #6286ed"></i>
                                </div>
                                <div class="bgm-name" :title="bgm.name">{{ bgm.name }}</div>
                              </div>
                            </el-col>
                          </el-row>
                        </div>
                        <span class="music-edit" data-action="music" data-id="2" slot="reference">修改</span>
                      </el-popover>
                    </div>
                  </div>
                </div>
                <div class="script-item-content" :title="item.content" v-if="item.content">
                  {{ item.content }}
                </div>
                <div class="script-item-content" style="display: flex;gap: 2px;" v-else>
                  <i class="el-icon-wuneirong" style="line-height: 21px"></i>
                  <div style="line-height: 21px">无文案</div>
                  <div style="margin: 0 5px;line-height: 18px">|</div>
                  <i class="el-icon-time" style="line-height: 21px"></i>
                  <div style="line-height: 21px">{{ item.duration + 's' }}</div>
                </div>
              </div>
            </template>
            <template v-else style="width: 100%">
              <div v-for="(item, index) in montage_data" :key="index" class="script-item"
                   :class="{'script-item-active': activeIndex === index}">
                <div class="flex-center" @click="itemClick(index)">
                  <div class="script-item-title" :title="item.title">{{ item.title }}</div>
                  <div style="width: 16px">
                    <i class="el-icon-close close-icon" @click="removeCopy(index)"></i>
                  </div>
                  <i class="el-icon-arrow-right" style="color: #9ca3af;font-size: 15px;font-weight: bold;"
                     v-if="activeIndex !== index"></i>
                  <i class="el-icon-arrow-down" style="color: #9ca3af;font-size: 15px;font-weight: bold;"
                     v-else></i>
                </div>
                <div class="script-item-content" :title="item.content" v-if="item.content" @click="itemClick(index)">
                  {{ item.content }}
                </div>
                <div class="script-item-content" style="display: flex;gap: 2px" v-else @click="itemClick(index)">
                  <i class="el-icon-wuneirong" style="line-height: 21px"></i>
                  <div style="line-height: 21px">无文案</div>
                  <div style="margin: 0 5px;line-height: 18px">|</div>
                  <i class="el-icon-time" style="line-height: 21px"></i>
                  <div style="line-height: 21px">{{ item.duration + 's' }}</div>
                </div>
                <div class="groups" v-if="activeIndex === index">
                  <div class="group" v-for="(group,group_index) in item.segment_group" :key="group_index">
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
                                    popper-class="custom-popover-style" @show="popoverShow"
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
                                    popper-class="custom-popover-style1" @show="popoverShow(true)">
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
              </div>
            </template>
          </div>
          <div class="export-section" v-if="already_generated">
            <el-button @click="export_video(false)"><i class="el-icon-fa-download" style="margin-right: 10px;"></i>
              导出视频
            </el-button>
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
              controlsList="nodownload"
              @play="mediaPlay"
              @pause="mediaPause"
              @volumechange="mediaVolumeChange"
              @ratechange="mediaRateChange"
              @timeupdate="mediaTimeUpdate"
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
      <el-dialog :visible.sync="centerDialogVisible" width="480px" center :show-close="false" top="calc(50vh - 150px)">
        <div class="download-hint">
          <div class="batch-export-icon">
            <i class="el-icon-fa-download"></i>
          </div>
          <div class="batch-export-title">确认批量导出</div>
          <div class="batch-export-desc">
            将直接生成所有文案的视频并导出，无需预览。
            <br>
            此过程可能需要较长时间，是否继续？
          </div>
          <div class="batch-export-actions">
            <div class="cancel-btn">
              <el-button @click="centerDialogVisible = false">取消</el-button>
            </div>
            <div class="confirm-btn">
              <el-button @click="batchExport">确认导出</el-button>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {getAction, postAction} from "@/api/api";

export default {
  name: 'Montage',
  data() {
    return {
      requirement: '',
      figure_ratio: 30,
      copy_list: [],
      selected_index: {},
      already_generated: false,
      show_settings: true,
      activeIndex: -1,
      isPlaying: false,

      copy_request: '',

      material_list: [],
      mute_materials: [],
      reverse: false,
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
      voice_mode: '',
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
      action_montage_data: [],
      loading: null,
      media_volume: 0.5,
      nextType: '',

      bgm_options: [],
      audio: null,
      audioIndex: null,
      preview_video_url: '',
      preview_audio_url: '',

      centerDialogVisible: false,

      displayText: '',
      isComposing: false,
      composingText: '',
      compositionStart: 0,
      highlightedText: '',
      show_model: '',
      selected_figure: {}
    }
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
      if (this.montage_data.length > 0) {
        return this.montage_data[this.activeIndex].audio_file_duration
      }
      return 0
    },
    preview_video() {
      if (this.montage_data.length > 0) {
        let segment_group = this.montage_data[this.activeIndex].segment_group
        return segment_group.reduce((acc, item) => {
          return acc.concat(item.materials);
        }, [])
      }
      return []
    },
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
    const inputEl = this.$refs.inputRef.$el.querySelector('textarea')
    inputEl.removeEventListener('scroll', this.handleScroll);
  },
  mounted() {
    this.initData()
    this.queryBgm()
    document.addEventListener('click', this.handleClickOutside);
    const inputEl = this.$refs.inputRef.$el.querySelector('textarea')
    this.replaceDivHeight = inputEl.clientHeight + 2
    inputEl.addEventListener('scroll', this.handleScroll);
  },
  methods: {
    concatVideo() {
      this.loading = this.$loading({
        lock: true,
        text: '正在合成预览视频，耗时不会太长，请稍等...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      const list = this.preview_video.map(item => ({
        path: item.filepath, muted: this.mute_materials.includes(item.id) || item.video_type === 'figure'
      }))
      let params = {
        audio_file_duration: this.audio_file_duration,
        video_data: this.montage_data[this.activeIndex],
        video_list: list,
      }
      postAction('/figure/create_concatenated_video', params, 600000).then(res => {
        if (res.data.status === "success") {
          this.loading.close();
          this.loading = null;
          this.montage_data[this.activeIndex].video_file_path = res.data.data.result_path
          this.preview_video_url = res.data.data.result_path
          this.$nextTick(() => {
            this.loadVideo();
            this.loadAudio()
          })
        }else {
          this.loading.close();
          this.loading = null;
          this.$message.error("视频拼接失败。");
        }
      }).catch((error) => {
        this.loading.close();
        this.loading = null;
        console.error("视频拼接错误:", error);
      })
    },

    saveSetting() {
      sessionStorage.setItem('montage_setting_requirement', this.requirement)
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
    popoverShow(params) {
      this.$nextTick(() => {
        let popover = document.querySelector('.custom-popover-style');
        if (params) {
          popover = document.querySelector('.custom-popover-style1');
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
      this.montage_data[index].segment_group[group_index].materials.splice(material_index, 0, item);
      this.$nextTick(() => {
        this.concatVideo()
      })
      if (this.nextType === 'hot_montage') {
        sessionStorage.setItem("hot_montage_data", JSON.stringify(this.montage_data))
      } else {
        sessionStorage.setItem("montage_data", JSON.stringify(this.montage_data))
      }
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
      this.montage_data[index].segment_group[group_index].materials.push(val)
      this.$nextTick(() => {
        this.concatVideo()
      })
      if (this.nextType === 'hot_montage') {
        sessionStorage.setItem("hot_montage_data", JSON.stringify(this.montage_data))
      } else {
        sessionStorage.setItem("montage_data", JSON.stringify(this.montage_data))
      }
    },
    removeShot(index, group_index, shot_index) {
      this.$confirm('确认删除该分镜吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.montage_data[index].segment_group[group_index].materials.splice(shot_index, 1)
        if (this.montage_data[index].segment_group[group_index].materials.length !== 0) {
          this.$nextTick(() => {
            this.concatVideo()
          })
        }
        if (this.nextType === 'hot_montage') {
          sessionStorage.setItem("hot_montage_data", JSON.stringify(this.montage_data))
        } else {
          sessionStorage.setItem("montage_data", JSON.stringify(this.montage_data))
        }
      }).catch((err) => {
        this.$message({type: 'info', message: '已取消删除'});
      });
    },
    queryBgm() {
      let bgm_options = [{id: '', name: '无'}]
      getAction('/bgm/all').then(res => {
        if (res.data.status === 'success') {
          this.bgm_options = bgm_options.concat(res.data.data)
        } else {
          this.$message.error("获取背景音乐列表失败。");
        }
      }).catch((error) => {
        console.error("获取背景音乐列表失败:", error);
      })
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
      this.nextType = sessionStorage.getItem('next_type')

      if (this.nextType === 'hot_montage') {
        this.copy_list = JSON.parse(sessionStorage.getItem("hot_copy_list")).map(item => ({
          ...item, isHover: false,
        }))
        this.montage_data = JSON.parse(sessionStorage.getItem("hot_montage_data")) || []

        let duplicate_setting = JSON.parse(sessionStorage.getItem("duplicate_setting")) || {}
        this.copy_request = duplicate_setting.copy_require || ''
      } else {
        this.copy_list = JSON.parse(sessionStorage.getItem("copy_list")).map(item => ({
          ...item, isHover: false,
        }))
        this.montage_data = JSON.parse(sessionStorage.getItem("montage_data")) || []

        let smart_generate_setting = JSON.parse(sessionStorage.getItem("smart_generate_setting")) || {}
        this.copy_request = smart_generate_setting.copy_require || ''
      }

      this.already_generated = this.montage_data.length > 0
      if (this.montage_data.length > 0) {
        this.already_generated = true
        this.activeIndex = 0
        this.preview_video_url = this.montage_data[0].video_file_path
        this.preview_audio_url = this.montage_data[0].audio_file_path
        this.$nextTick(() => {
          this.loadVideo();
          this.loadAudio()
        })
      }

      this.selected_figure = JSON.parse(sessionStorage.getItem('material_figure')) || {}

      this.requirement = sessionStorage.getItem('montage_setting_requirement') || ''
      this.figure_ratio = parseInt(sessionStorage.getItem('montage_figure_ratio')) || 30

      this.material_list = JSON.parse(sessionStorage.getItem('material_list')) || []
      this.mute_materials = JSON.parse(sessionStorage.getItem('mute_materials')) || []
      let mention_list = JSON.parse(sessionStorage.getItem('mention_list')) || []
      this.mention_list = mention_list.map(item => ({...item, isHover: false}))
      this.reverse = sessionStorage.getItem("setting_reverse") === 'true'

      this.sound = JSON.parse(sessionStorage.getItem("setting_voice"))
      this.voice_mode = sessionStorage.getItem("setting_mode") || 'common'
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
      this.subtitleParams.content_font_opacity = Number(sessionStorage.getItem("content_font_opacity")) || 1
      this.subtitleParams.font = sessionStorage.getItem("font") || 'SJxingkai-C-Regular'
      this.subtitleParams.background_color = sessionStorage.getItem("background_color") || '#404040'
      this.subtitleParams.background_opacity = Number(sessionStorage.getItem("background_opacity")) || 0.6
      this.subtitleParams.stroke_color = sessionStorage.getItem("stroke_color") || '#000000'

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
      for (let i = 1; i <= this.montage_data.length; i++) {
        result.push(base + '_' + i);
      }

      return result;
    },
    generate() {
      if (this.copy_list.some(item => item.duration && !item.bgm.id)) {
        this.$alert('混剪失败，请给无文案任务添加背景音乐后重试', '提示')
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
      let reference_segments = null
      if (this.nextType === 'hot_montage') {
        let hots = JSON.parse(sessionStorage.getItem("select_hots"))
        reference_segments = hots.segments.map(item => item.description)
      }
      let params = {
        user_request: actualRequest,
        copy_request: this.copy_request,
        material_list: this.material_list,
        mute_materials: this.mute_materials,
        copy_list: this.copy_list,
        bg_volume: this.bg_volume,
        timbre_id: this.sound.voice_id,
        voice_mode: this.voice_mode,
        with_subtitle: this.withSubtitle,
        reverse: this.reverse,
        figure_ratio: this.figure_ratio + '%',
        reference_segments: reference_segments
      }
      postAction('/figure/video_mix_edit', params, 3600000).then(res => {
        if (res.data.status === 'success') {
          this.montage_data = res.data.data
          this.already_generated = true
          if (this.nextType === 'hot_montage') {
            sessionStorage.setItem("hot_montage_data", JSON.stringify(this.montage_data))
          } else {
            sessionStorage.setItem("montage_data", JSON.stringify(this.montage_data))
          }
          this.activeIndex = 0
          this.loading.close();
          this.loading = null;
          this.preview_video_url = this.montage_data[0].video_file_path
          this.preview_audio_url = this.montage_data[0].audio_file_path
          this.$nextTick(() => {
            this.loadVideo();
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
        console.log(error)
      })
    },
    export_video(with_out_route) {
      let bool_list = this.material_list.map(item => this.mute_materials.includes(item))
      let name = this.setName()
      let params = {
        data: this.montage_data,
        filename_list: name,
        bgm_id: this.bgm.id,
        bg_volume: this.bg_volume,
        with_subtitle: this.withSubtitle,
        with_title: this.withTitle,
        bool_list: bool_list,
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
          font_opacity: this.subtitleNameParams.title_font_opacity,
          fontsize: this.subtitleNameParams.name_fontsize,
          color: this.subtitleNameParams.name_color,
          stroke_color: this.subtitleNameParams.name_stroke_color,
          use_background: this.name_use_background,
          background_color: this.subtitleNameParams.name_background_color,
          background_opacity: this.subtitleNameParams.name_background_opacity
        }
      }
      postAction('/figure/export_video_sync', params).then(res => {
        if (res.data.status === "success") {
          this.$alert('已创建视频生成任务，视频生成成功后会自动下载到本地', "任务创建提醒");
          if (with_out_route) {
            return
          }
          sessionStorage.clear()
          setTimeout(() => {
            this.$router.push({path: '/videoList'})
          }, 500)
        } else {
          this.$alert(res.data.message, "导出失败");
        }
      }).catch((error) => {
        this.$alert(error, "导出错误");
      });
    },
    batchExport() {
      if (this.copy_list.some(item => item.duration && !item.bgm.id)) {
        this.$alert('请给无文案任务添加背景音乐后重试', '提示')
        return
      }
      this.centerDialogVisible = false
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
      let bool_list = this.material_list.map(item => this.mute_materials.includes(item))
      let name = this.setName()
      let params = {
        user_request: actualRequest,
        material_list: this.material_list,
        mute_materials: this.mute_materials,
        copy_list: this.copy_list,
        bg_volume: this.bg_volume,
        timbre_id: this.sound.voice_id,
        voice_mode: this.voice_mode,
        with_subtitle: this.withSubtitle,
        reverse: this.reverse,
        figure_ratio: this.figure_ratio + '%',
        reference_segments: reference_segments,
        with_title: this.withTitle,
        bool_list: bool_list,
        filename_list: name,
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
      postAction('/figure/export_video_sync_all', params, 3600000).then(res => {
        if (res.data.status === "success") {
          this.$alert('已创建视频生成任务，视频生成成功后会自动下载到本地', "任务创建提醒");
          sessionStorage.clear()
          setTimeout(() => {
            this.$router.push({path: '/videoList'})
          }, 500)
        } else {
          this.$alert(res.data.message, "批量导出失败");
        }
      }).catch((error) => {
        this.$alert(error, "批量导出错误");
      });
    },
    selectItem(index) {
      this.selected_index = index
    },
    selectBgm(item, index) {
      this.stopAudio()
      this.copy_list[index].bgm = item
      this.$nextTick(() => {
        const popoverRefs = this.$refs[`popover_${index}`];
        if (popoverRefs && popoverRefs.length > 0) {
          const popover = popoverRefs[0];
          popover.showPopper = false;
        } else {
          console.warn('未找到对应的输入框 ref', item.id);
        }
      });
      this.$forceUpdate()

      if (this.nextType === 'hot_montage') {
        sessionStorage.setItem('hot_copy_list', JSON.stringify(this.copy_list))
      } else {
        sessionStorage.setItem('copy_list', JSON.stringify(this.copy_list))
      }
    },
    previewAudio(voice, index) {
      if (voice.id === '') {
        this.$message.warning("无音频预览");
        return;
      }
      this.stopAudio();

      setTimeout(() => {
        this.audio = new Audio(voice.filepath);
        this.audio.play();
        this.audioIndex = index;
        this.audio.onended = () => {
          this.audio = null;
          this.audioIndex = null;
        };
      }, 100);
    },
    stopAudio() {
      if (this.audio) {
        this.audio.pause();
        this.audio = null;
        this.audioIndex = null;
      }
    },

    itemClick(index) {
      if (this.activeIndex !== index) {
        this.activeIndex = index
        if (this.isPlaying) {
          this.$refs.videoRef.pause()
          this.$refs.audioRef.pause()
          this.isPlaying = false
        }
        this.preview_video_url = this.montage_data[index].video_file_path
        this.preview_audio_url = this.montage_data[index].audio_file_path
        this.$nextTick(() => {
          this.loadVideo();
          this.loadAudio()
        })
      }
    },
    removeCopy(index) {
      this.$confirm('确认删除该文案吗？', '提示', {
        type: 'warning'
      }).then(() => {
        if (this.already_generated) {
          this.montage_data.splice(index, 1)
          if (this.nextType === 'hot_montage') {
            sessionStorage.setItem("hot_montage_data", JSON.stringify(this.montage_data))
          } else {
            sessionStorage.setItem("montage_data", JSON.stringify(this.montage_data))
          }
          if (this.$refs.videoRef) {
            this.$refs.videoRef.pause()
            this.$refs.audioRef.pause()
            this.isPlaying = false
          }
          if (this.montage_data.length > 0) {
            this.already_generated = true
            this.activeIndex = 0
            this.preview_video_url = this.montage_data[0].video_file_path
            this.preview_audio_url = this.montage_data[0].audio_file_path
            this.$nextTick(() => {
              this.loadVideo();
              this.loadAudio()
            })
          }else {
            this.already_generated = false
            this.activeIndex = -1
          }
          return
        }
        this.copy_list.splice(index, 1)
        sessionStorage.setItem("copy_list", JSON.stringify(this.copy_list))
      }).catch((err) => {
        this.$message({type: 'info', message: '已取消删除'});
      });
    },
    loadAudio() {
      this.$refs.audioRef.currentTime = 0
      this.$refs.audioRef.src = this.preview_audio_url
      this.$refs.audioRef.play()
    },
    loadVideo() {
      this.$refs.videoRef.volume = this.media_volume;
      this.$refs.videoRef.src = this.preview_video_url
      this.$refs.videoRef.load();
      this.playVideo();
    },
    playVideo() {
      this.$refs.videoRef.play().then(() => {
        this.isPlaying = true;
      }).catch(error => {
        console.error('播放失败:', error);
        // 这里可以添加错误处理逻辑，如显示错误消息
      });
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
      } else {
        this.$refs.audioRef.currentTime = 0
        this.$refs.audioRef.pause()
      }
    },
    back() {
      let path = this.nextType === 'hot_montage' ? '/duplicate' : '/smartGenerate'
      sessionStorage.setItem('video_path', path)
      this.$router.push({path: path})
    }
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

.settings-button-section {
  margin-top: 16px;
  display: flex;
  width: 100%;
}

.export-section {
  margin-top: 16px;
}

.generate-btn {
  flex: 1;
}

.generate-btn >>> .el-button {
  width: 100%;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border: none;
  padding: 12px 24px;;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 8px 0 0 8px;
}

.batch-download >>> .el-button {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border: none;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  padding: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 0 8px 8px 0;
}

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
  font-size: 16px;
  margin-right: 4px;
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
  padding-top: 10px;
}

.script-item-active {
  background: linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%) !important;
  border-color: #8b5cf6 !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(139, 92, 246, 0.15) !important;
}

.script-item {
  width: 100%;
  box-sizing: border-box;
  color: #1f2937;
  cursor: pointer;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
  position: relative;
}

.script-item:hover {
  transform: translateY(-4px);
}

.active-item {
  border-color: #4338ca;
  background-color: #eef2ff;
}

.script-item-title {
  flex: 1;
  line-height: 28px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1e293b;
  font-size: 16px;
  font-weight: 600;
}

.script-item-btn {
  width: 170px;
  display: flex;
  justify-content: flex-end;
}

.script-item-btn >>> .el-button {
  color: #2563eb;
  font-size: 13px;
  font-weight: 500;
  background: #dbeafe;
  border-radius: 6px;
  padding: 4px 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  border: none;
  outline: none;
  transition: background 0.2s;
}

.script-item-btn >>> .el-button:hover {
  background: #bfdbfe;
}

.music-topbar {
  color: #7c3aed;
  font-size: 13px;
  font-weight: 500;
  background: #f3e8ff;
  border-radius: 6px;
  padding: 2px 10px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.music-name {
  max-width: 95px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-edit {
  color: #7c3aed;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
}

.script-item:hover .close-icon {
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

.script-item-content {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
}

.groups {
  margin-top: 12px;
  display: flex;
  flex-direction: row;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 12px;
}

.group {
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
  padding: 4px;
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
  border-radius: 8px;
  color: #606266;
  font-size: 14px;
}

.dropdown li:hover {
  background-color: #6366f1;
  color: #ffffff;
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
  border: 1px solid #d1d5db;
  font-size: 14px;
  font-family: "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  border-radius: 4px;
  box-shadow: none;
  resize: none;
  transition: border-color 0.2s ease-in-out;
}

.input-layer >>> .el-textarea__inner:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.bgm-popover-content {
  width: 350px;
  height: 250px;
  border-radius: 10px;
  overflow: auto;
}

.bgm-selected {
  background-color: #e0e7fb;
}

.bgm-item {
  height: 80px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.bgm-icon {
  width: 42px;
  height: 37px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #c7d4f8;
  border-radius: 10px;
}

.bgm-name {
  width: 100px;
  margin-left: 10px;
  font-size: 14px;
  color: #101010;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.montage >>> .el-popover {
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

.montage >>> .el-dialog {
  border-radius: 16px;
}

.montage >>> .el-dialog__header {
  padding: 0;
}

.montage >>> .el-dialog__body {
  padding: 32px;
}

.download-hint {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.batch-export-icon {
  color: #8b5cf6;
  font-size: 48px;
  line-height: 72px;
  margin-bottom: 16px;
}

.batch-export-title {
  color: #1e293b;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 30px;
}

.batch-export-desc {
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 24px;
  text-align: center;
}

.batch-export-actions {
  display: flex;
  gap: 12px;
}

.batch-export-actions >>> .el-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 14px;
}

.cancel-btn >>> .el-button {
  background: #f1f5f9;
  color: #64748b;
}

.cancel-btn >>> .el-button:hover {
  background: #e2e8f0;
  color: #475569;
}

.confirm-btn >>> .el-button {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
}

.confirm-btn >>> .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25), 0 4px 12px rgba(139, 92, 246, 0.25);
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