<template>
  <div class="sync-cv">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="back">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="sync-title">一键混剪 · 音画同步</div>
      <div style="width: 36px"></div>
    </div>
    <div class="sync-cv-container">
      <el-tooltip class="item" effect="dark" content="收起设置" placement="right" v-if="show_left_panel">
        <div class="setting-close" @click="closeSettings">
          <i class="el-icon-arrow-left" style="font-size: 16px;font-weight: bold;color: #ffffff"></i>
        </div>
      </el-tooltip>
      <div class="left-panel" v-if="show_left_panel && (sync_mix_chats.length === 0 || isNewChat)">
        <div class="left-content-area">
          <div class="panel-title">分镜设置</div>
          <div class="panel-label margin-t-8">自定义要求（选填）</div>
          <div style="position: relative;">
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
                      spellcheck="false"
                      ref="inputRef"
                      class="input-layer"
                      @change="saveSetting"
                      @scroll="handleScroll">
            </el-input>
            <div v-if="showDropdown" class="dropdown" :style="dropdownStyle">
              <ul ref="urRef">
                <li v-for="(item, index) in filtered_mention_list" :key="index" @click="selectMention(item)"
                    @mouseenter="liEnter(item)" @mouseleave="liLeave" :title="item.name"
                    @mouseover="liMouseover(index)" :class="{'li-active': selectedShotIndex === index}">
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
            <div style="max-height: calc(100% - 35px);overflow-y: auto;overflow-x: hidden" ref="scriptForm">
              <div class="panel-label">语言选择</div>
              <el-select v-model="language" placeholder="请选择" style="width: 100%" @change="saveSetting">
                <el-option label="中文" value="中文"></el-option>
                <el-option label="英文" value="英文"></el-option>
                <el-option label="日文" value="日文"></el-option>
                <el-option label="其他（需在文案要求指定语言类型）" value="其他"></el-option>
              </el-select>
              <div class="panel-label margin-t-12">文案要求</div>
              <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }"
                        placeholder="例如：关于 店铺品类(如火锅店、服装店等)相关文案，主推 产品/服务(如招牌菜、爆款服装等)"
                        class="margin-b-12" v-model="copy_require" resize="none" @change="saveSetting"></el-input>
              <div class="panel-label">示例文案（选填）</div>
              <div class="flex-center margin-b-12 example_textarea" v-for="(text, index) in exampleTexts" :key="index">
                <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }"
                          placeholder="提供一个你喜欢的风格的例子"
                          v-model="exampleTexts[index]" resize="none" @change="saveSetting"></el-input>
                <i class="el-icon-close example-close-icon" @click="removeText(index)" v-if="index !== 0"></i>
              </div>
              <div class="margin-b-12 add_example_btn">
                <el-button @click="addExampleText"><i class="el-icon-plus add_example_icon"></i>
                  添加示例文案
                </el-button>
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
            {{ copy_list.length > 0 ? '重新生成' : '一键混剪并同步' }}
          </el-button>
        </div>
      </div>
      <div class="mix-chat-area" v-if="show_left_panel && sync_mix_chats.length > 0 && !isNewChat">
        <div class="mix-chat-frame" ref="mixChatRef">
          <div v-for="(item, index) in sync_mix_chats" :key="index"
               :class="{'historical-chat': lastNewChatIndex !== -1 && index < lastNewChatIndex}">
            <div v-if="item.role === 'user'" style="display: flex;justify-content: end;">
              <div class="mix-chat-user">
                {{ item.content }}
              </div>
            </div>
            <div v-if="item.role === 'system'" class="mix-chat-system-area">
              <div class="mix-chat-system">
                <div class="mix-avatar-area">奇</div>
                <div style="flex: 1">
                  <el-collapse>
                    <el-collapse-item>
                      <template slot="title">
                        <div class="mix-chat-system-label">AI思考过程</div>
                      </template>
                      <div class="ai-thinking-content">{{ item.content.thinking }}</div>
                    </el-collapse-item>
                  </el-collapse>
                  <div class="mix-chat-system-label margin-t-12">混剪结果</div>
                  <div class="mix-chat-system-content" @click="selectMixResult(item.content.data)">
                    <div class="mix-chat-system-content-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24">
                        <path fill="currentColor" fill-rule="evenodd"
                              d="M13.113 2.266a.936.936 0 0 1 .797 1.057l-2.476 17.614a.936.936 0 0 1-1.854-.26l2.476-17.615a.936.936 0 0 1 1.057-.796M6.811 6.744a.936.936 0 0 1 0 1.324l-3.55 3.55 3.55 3.551a.936.936 0 1 1-1.324 1.324l-4.213-4.212a.936.936 0 0 1 0-1.325l4.213-4.212a.936.936 0 0 1 1.324 0m15.447 4.213c.357.356.365.93.025 1.297a6.05 6.05 0 0 0-2.377-1.001l-3.185-3.185a.936.936 0 1 1 1.324-1.324zm-3.47 10.491a.48.48 0 0 0 .48-.425c.225-1.341.423-2.03.849-2.457.425-.426 1.11-.624 2.445-.849a.485.485 0 0 0 .438-.48.48.48 0 0 0-.44-.48c-1.332-.227-2.018-.425-2.443-.851-.426-.427-.624-1.115-.849-2.455a.48.48 0 0 0-.48-.428.49.49 0 0 0-.481.426c-.226 1.341-.423 2.03-.85 2.457-.424.426-1.108.624-2.44.85a.48.48 0 0 0-.442.481c0 .26.199.448.439.48 1.335.225 2.02.418 2.444.842.426.425.623 1.114.849 2.466.04.24.23.423.482.423" clip-rule="evenodd">
                        </path>
                      </svg>
                    </div>
                    <div class="mix-chat-system-content-name">
                      {{ item.content.title }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="item.role === 'new_chat'">
              <el-divider>新会话</el-divider>
            </div>
            <div v-if="item.role === 'mix_error'" class="error-content">
              <div class="mix-avatar-area">奇</div>
              <div class="error-message">混剪失败，{{ item.content }}</div>
            </div>
            <div v-if="item.role === 'update_error'" class="error-content">
              <div class="mix-avatar-area">奇</div>
              <div class="error-message">
                修改失败，{{ item.content }}
                <!--<span style="color: #3b82f6;font-size: 14px;cursor: pointer;" @click="reUpdate">点击重新生成</span>-->
              </div>
            </div>
          </div>
          <div class="mix-loading-content" v-if="isGenerating">
            <div class="mix-avatar-area">奇</div>
            <div class="mix-loading-area flex-center"><i class="el-icon-loading"></i></div>
          </div>
        </div>
        <div class="mix-chat-input">
          <div class="create-chat-btn" @click="createNewChat">
            <i class="el-icon-edit-outline" style="margin-right: 5px"></i>
            发起新会话
          </div>
          <div class="flex-center">
            <el-input type="textarea" placeholder="请输入您的修改意见..." resize="none" v-model="mix_chatInput"
                      @keydown.native="enterSendChat"></el-input>
            <el-button type="primary" style="padding: 0 20px" @click="sendChat" :disabled="isGenerating">
              <i class="el-icon-s-promotion" style="font-size: 18px;line-height: 35px"></i>
            </el-button>
          </div>
          <div class="mix-send-placeholder">按Enter或发送按钮发送，Shift+Enter换行</div>
        </div>
      </div>

      <div class="left-panel-close" v-if="!show_left_panel">
        <el-tooltip class="item" effect="dark" content="展开设置 " placement="right-end">
          <div class="setting-open" @click="expandSettings">
            <i class="el-icon-arrow-right" style="font-size: 16px;font-weight: bold;color: #ffffff"></i>
          </div>
        </el-tooltip>
      </div>

      <div class="center-panel" :style="{ width: show_left_panel? 'calc(100% - 420px)' : 'calc(100% - 733px)' }">
        <div class="script-selection-area">
          <div class="flex-center" style="line-height: 40px;margin-bottom: 8px;">
            <div class="panel-title" style="flex: 1">AI选用文案</div>
            <div v-if="copy_list.length > 0 && !isGenerating">
              <template v-if="showChecked">
                <el-button type="primary" size="mini" class="delete-group-btn" @click="sureRemove">确认删除</el-button>
                <el-button class="delete-group-btn" size="mini" @click="showChecked = false">取消</el-button>
              </template>
              <el-button type="primary" size="mini" class="delete-group-btn" v-else @click="batchRemoveCopy">批量删除
              </el-button>
            </div>
          </div>
          <div class="copy-list" v-if="copy_list.length > 0">
            <div class="copy-item" v-for="(item, index) in copy_list" :key="index"
                 :class="{'active-item': index === activeIndex}">
              <div class="flex-center cursor-pointer" @click="collapseChange(index)">
                <div class="copy-item-title" :title="item.title">{{ item.title }}</div>
                <div style="width: 16px">
                  <i class="el-icon-close close-icon" @click="removeCopy(index)" v-if="!showChecked && !isGenerating"></i>
                  <div @click.stop="">
                    <el-checkbox v-model="deleteCheckeds[index]" v-if="showChecked"></el-checkbox>
                  </div>
                </div>
                <template v-if="!showChecked">
                  <i class="el-icon-arrow-right" style="color: #9ca3af;font-size: 15px;font-weight: bold;"
                     v-if="!expandedIndex.includes(index)"></i>
                  <i class="el-icon-arrow-down" style="color: #9ca3af;font-size: 15px;font-weight: bold;"
                     v-else></i>
                </template>
              </div>
              <div class="copy-item-desc cursor-pointer" @click="collapseChange(index)">
                {{ item.content }}
              </div>
              <div class="segment-groups" v-if="expandedIndex.includes(index)">
                <div class="segment-group-item" v-for="(group,group_index) in item.segment_group"
                     :key="group_index">
                  <div class="group-title" v-if="group.groupType !== 'digital_human' && !isGenerating"
                       :style="{ width: (group.materials.length * 100 + 80) + 'px' }"
                       :title="group.contentSummary">
                    {{ group.contentSummary }}
                  </div>
                  <div class="group-title" v-if="group.groupType === 'digital_human' || isGenerating"
                       :style="{ width: ((group.materials.length - 1) * 100 + 80) + 'px' }"
                       :title="group.contentSummary">
                    {{ group.contentSummary }}
                  </div>
                  <div class="material-list" ref="materialListRef">
                    <div class="material-item" v-for="(material,material_index) in group.materials"
                         :key="material_index">
                      <el-popover placement="bottom" :ref="'popoverRef_' + material_index" trigger="click"
                                  @show="popoverShow(index,group_index,material_index)" @hide="popoverHide"
                                  v-if="group.groupType !== 'digital_human'">
                        <div class="shot-list" :ref="'shotRef_'+index+'_'+group_index+'_'+material_index">
                          <div v-for="(shot, shot_index) in mention_list" :key="shot_index"
                               class="shot-name" :title="shot.name" :class="{'shot-name-active': activeShotIndex === shot_index}"
                               @click="addShot(index,group_index,material_index,shot)"
                               @mouseover="shotEnter(shot_index)" @mouseleave="shotLeave">
                            {{ shot.name }}
                          </div>
                          <div class="li-video" style="position: absolute; top: 0; right: -132px" v-if="selectShot">
                            <video :src="selectShot.filepath" style="width: 100%; height: 100%;border-radius: 4px;"
                                   loop muted autoplay></video>
                          </div>
                        </div>
                        <div slot="reference" class="insert-shot-btn" v-if="!isGenerating">
                          <div class="fa-plus">
                            <i class="el-icon-plus" style="font-weight: bold"></i>
                          </div>
                        </div>
                      </el-popover>
                      <div class="delete-shot-btn"
                           v-if="group.groupType !== 'digital_human' && group.materials.length > 1 && !isGenerating">
                        <i class="el-icon-close" style="font-weight: bold"
                           @click="removeShot(index,group_index,material_index)"></i>
                      </div>
                      <el-image class="material-item-img" :src="material.picture"></el-image>
                      <div class="material-item-title" :title="material.name">{{ material.name }}</div>
                    </div>
                    <div class="material-item" v-if="group.groupType !== 'digital_human' && !isGenerating">
                      <el-popover :ref="'pushRef_' + index" placement="bottom" trigger="click"
                                  @show="pushShow(index,group_index)" @hide="pushHide">
                        <div class="shot-list" :ref="'materialRef_' + index + '_' + group_index">
                          <div v-for="(val, val_index) in mention_list" :key="val.id"
                               class="shot-name" :title="val.name" :class="{'shot-name-active': activeShotIndex === val_index}"
                               @click="pushShot(index,group_index,val)"
                               @mouseover="shotEnter(val_index)" @mouseleave="shotLeave">
                            {{ val.name }}
                          </div>
                          <div class="li-video" style="position: absolute; top: 0; right: -145px" v-if="selectShot">
                            <video :src="selectShot.filepath" style="width: 100%; height: 100%;border-radius: 4px;"
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
          </div>
          <div class="copy-list-none" v-if="copy_list.length === 0">
            <i class="el-icon-document-list copy-list-none-icon"></i>
            <div class="copy-list-none-title">暂无文案</div>
            <div class="copy-list-none-desc">请使用左侧工具生成您的第一条文案</div>
          </div>
          <div class="export-section" v-if="copy_list.length > 0 && !isGenerating">
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

      <div class="right-panel" v-if="!show_left_panel">
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
import {ClearCacheMixin} from "@/mixins/ClearCacheMixin";

export default {
  name: 'SyncCv',
  mixins: [ClearCacheMixin],
  data() {
    return {
      sync_mix_chats: [],
      mix_chatInput: '',
      lastGeneratedMixins: [],
      isGenerating: false,
      isNewChat: false,

      show_left_panel: true,
      requirement: '',
      figure_ratio: 30,

      /* initData 前面素材选择、样式设置所选参数 */
      material_list: [],
      mute_materials: [],
      mention_list: [],
      hover_li: null,
      selectedShotIndex: -1,

      selectShot: null,
      activeShotIndex: -1,
      add_shot_popover: false,
      push_shot_popover: false,

      v_index: -1,  // 视频
      g_index: -1,  // 分镜组
      m_index: -1,  // 素材

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

      language: '中文',
      copy_require: '',
      exampleTexts: [''],
      video_time: 15,
      script_num: 1,
      ai_model: 'deepseek_v3',
      showChecked: false,
      deleteCheckeds: [],
      copy_list: [],
      openIndex: null,
      activeIndex: -1,
      selectedCopy: null,
      preview_video_url: '',
      preview_audio_url: '',
      isPlaying: false,

      loading: null,
      media_volume: 0.5,

      displayText: '',
      isComposing: false,
      composingText: '',
      compositionStart: 0,
      highlightedText: '',
      show_model: '',
      reverse: false,
      selected_figure: {},
      filtered_mention_list: [],
      isSelecting: false,
    }
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleKeyDown);
    const inputEl = this.$refs.inputRef.$el.querySelector('textarea')
    inputEl.removeEventListener('scroll', this.handleScroll);
  },
  mounted() {
    this.initData()
    document.addEventListener('click', this.handleClickOutside);
    document.addEventListener('keydown', this.handleKeyDown);
    const inputEl = this.$refs.inputRef.$el.querySelector('textarea')
    this.replaceDivHeight = inputEl.clientHeight + 2
    inputEl.addEventListener('scroll', this.handleScroll);
  },
  watch: {
    requirement(newVal) {
      if (!this.isComposing) {
        this.updateDisplayText();
      }
    },
    sync_mix_chats: {
      handler(newValue, oldValue) {
        sessionStorage.setItem('sync_mix_chats', JSON.stringify(newValue))
      },
      deep: true
    },
    isGenerating: {
      handler(newValue, oldValue) {
        sessionStorage.setItem('sync_mix_is_generating', newValue)
      },
      deep: true
    },
    isNewChat: {
      handler(newValue, oldValue) {
        sessionStorage.setItem('sync_mix_is_newChat', JSON.stringify(newValue))
      },
      deep: true
    }
  },
  computed: {
    expandedIndex() {
      if (!this.show_left_panel) {
        return [this.activeIndex]
      }
      let result = []
      for (let i = 0; i < this.copy_list.length; i++) {
        result.push(i)
      }
      return result
    },
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
          return acc.concat(item.materials);
        }, [])
      }
      return []
    },
    lastNewChatIndex() {
      for (let i = this.sync_mix_chats.length - 1; i >= 0; i--) {
        if (this.sync_mix_chats[i].role === 'new_chat') {
          return i;
        }
      }
      return -1;
    }
  },
  methods: {
    closeSettings() {
      if (this.copy_list.length === 0) {
        this.show_left_panel = false
        return
      }
      this.collapseChange(0)
    },
    expandSettings() {
      this.activeIndex = -1
      if (this.isPlaying) {
        this.$refs.videoRef.pause()
        this.$refs.audioRef.pause()
        this.isPlaying = false
      }
      this.show_left_panel = true
    },
    selectMixResult(result) {
      this.copy_list = result
      sessionStorage.setItem("sync_cv_copy_list", JSON.stringify(this.copy_list))
    },
    createNewChat() {
      if (this.isGenerating) {
        this.$alert('请等待生成结束后再发起新会话','提示')
        return
      }
      this.isNewChat = true
      this.sync_mix_chats.push({ role: 'new_chat' })
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    reUpdate() {
      this.sync_mix_chats = this.sync_mix_chats.filter(item => item.role !== 'update_error')
      let history_chats = this.sync_mix_chats
      for (let i = this.sync_mix_chats.length - 1; i >= 0; i--) {
        if (this.sync_mix_chats[i].role === 'new_chat') {
          history_chats = this.sync_mix_chats.slice(i + 1);
          break;
        }
      }
    },
    enterSendChat(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (this.isGenerating) {
          return;
        }
        this.sendChat();
      }
    },
    sendChat() {
      if (!this.mix_chatInput) {
        this.$alert('请先输入修改意见', '提示')
        return
      }
      let history_chat = this.sync_mix_chats
      for (let i = this.sync_mix_chats.length - 1; i >= 0; i--) {
        if (this.sync_mix_chats[i].role === 'new_chat') {
          history_chat = this.sync_mix_chats.slice(i + 1);
          break;
        }
      }
      this.sync_mix_chats.push({ role: 'user', content: this.mix_chatInput });
      let bool_list = this.material_list.map(item => this.mute_materials.includes(item))
      let version = history_chat.filter(item => item.role === 'user').length - 1
      let params = {
        data: this.lastGeneratedMixins,
        history_chat: history_chat,
        user_feedback: this.mix_chatInput,
        material_list: this.material_list,
        bool_list: this.mute_materials,
      }
      this.mix_chatInput = '';
      this.isGenerating = true
      this.$nextTick(() => {
        this.scrollToBottom()
      })
      postAction('/figure/re_video_mix_edit',params, 3600000).then(res => {
        if (res.data.status === "success") {
          this.isGenerating = false
          this.sync_mix_chats.push({
            role: 'system',
            content: {
              thinking: res.data.data.thinking,
              data: res.data.data.data,
              title: `修改版本 V${version}`
            }
          })
          this.$nextTick(() => {
            this.scrollToBottom()
          })
          this.copy_list = res.data.data.data
          this.lastGeneratedMixins = res.data.data.data
          sessionStorage.setItem('sync_last_generated_mixins', JSON.stringify(this.lastGeneratedMixins))
          sessionStorage.setItem("sync_cv_copy_list", JSON.stringify(this.copy_list))
        } else {
          this.isGenerating = false
          this.sync_mix_chats.push({
            role: 'update_error',
            content: res.data.message
          })
          this.$nextTick(() => {
            this.scrollToBottom()
          })
          this.$alert(res.data.message,'生成失败')
        }
      }).catch(error => {
        this.isGenerating = false
        this.sync_mix_chats.push({
          role: 'update_error',
          content: error
        })
        this.$nextTick(() => {
          this.scrollToBottom()
        })
        this.$alert(error,'生成错误')
      })
    },
    scrollToBottom() {
      if (this.$refs.mixChatRef) {
        this.$refs.mixChatRef.scrollTop = this.$refs.mixChatRef.scrollHeight
      }
    },
    popoverShow(index,g_index,m_index) {
      this.add_shot_popover = true
      this.v_index = index
      this.g_index = g_index
      this.m_index = m_index
    },
    popoverHide() {
      this.activeShotIndex = -1
      this.add_shot_popover = false
    },
    pushShow(index,g_index) {
      this.push_shot_popover = true
      this.v_index = index
      this.g_index = g_index
    },
    pushHide() {
      this.activeShotIndex = -1
      this.push_shot_popover = false
    },
    handleKeyDown(event) {
      if (this.showDropdown) {
        if (event.key === 'ArrowUp' && this.selectedShotIndex > 0) {
          event.preventDefault();
          this.selectedShotIndex--;
          this.hover_li = this.filtered_mention_list[this.selectedShotIndex];
          if (this.selectedShotIndex > 4) {
            this.$refs.urRef.scrollTop = (this.selectedShotIndex - 4) * 38;
          } else {
            this.$refs.urRef.scrollTop = 0
          }
        } else if (event.key === 'ArrowDown' && this.selectedShotIndex < this.filtered_mention_list.length - 1) {
          event.preventDefault();
          this.selectedShotIndex++;
          this.hover_li = this.filtered_mention_list[this.selectedShotIndex];
          if (this.selectedShotIndex > 4) {
            this.$refs.urRef.scrollTop = (this.selectedShotIndex - 4) * 38;
          }
        } else if (event.key === 'Enter' && this.selectedShotIndex !== -1) {
          event.preventDefault();
          this.selectMention(this.filtered_mention_list[this.selectedShotIndex]);
        }
      }
      if (this.add_shot_popover) {
        if (event.key === 'ArrowUp' && this.activeShotIndex > 0) {
          event.preventDefault();
          this.activeShotIndex--;
          this.selectShot = this.mention_list[this.activeShotIndex]
          if (this.activeShotIndex > 4) {
            this.$refs[`shotRef_${this.v_index}_${this.g_index}_${this.m_index}`][0].scrollTop = (this.activeShotIndex - 4) * 40;
          } else {
            this.$refs[`shotRef_${this.v_index}_${this.g_index}_${this.m_index}`][0].scrollTop = 0
          }
        } else if (event.key === 'ArrowDown' && this.activeShotIndex < this.mention_list.length - 1) {
          event.preventDefault();
          this.activeShotIndex++;
          this.selectShot = this.mention_list[this.activeShotIndex]
          if (this.activeShotIndex > 4) {
            this.$refs[`shotRef_${this.v_index}_${this.g_index}_${this.m_index}`][0].scrollTop = (this.activeShotIndex - 4) * 40;
          }
        } else if (event.key === 'Enter' && this.activeShotIndex !== -1) {
          event.preventDefault();
          this.addShot(this.v_index,this.g_index,this.m_index,this.selectShot)
        }
      }
      if (this.push_shot_popover) {
        if (event.key === 'ArrowUp' && this.activeShotIndex > 0) {
          event.preventDefault();
          this.activeShotIndex--;
          this.selectShot = this.mention_list[this.activeShotIndex]
          if (this.activeShotIndex > 4){
            this.$refs[`materialRef_${this.v_index}_${this.g_index}`][0].scrollTop = (this.activeShotIndex - 4) * 40;
          } else {
            this.$refs[`materialRef_${this.v_index}_${this.g_index}`][0].scrollTop = 0
          }
        } else if (event.key === 'ArrowDown' && this.activeShotIndex < this.mention_list.length - 1) {
          event.preventDefault();
          this.activeShotIndex++;
          this.selectShot = this.mention_list[this.activeShotIndex]
          if (this.activeShotIndex > 4) {
            this.$refs[`materialRef_${this.v_index}_${this.g_index}`][0].scrollTop = (this.activeShotIndex - 4) * 40;
          }
        } else if (event.key === 'Enter' && this.activeShotIndex !== -1) {
          event.preventDefault();
          this.pushShot(this.v_index,this.g_index,this.selectShot)
        }
      }
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
      this.$nextTick(() => {
        this.concatVideo()
      })
      sessionStorage.setItem("sync_cv_copy_list", JSON.stringify(this.copy_list))
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
      this.$nextTick(() => {
        this.concatVideo()
      })
      sessionStorage.setItem("sync_cv_copy_list", JSON.stringify(this.copy_list))
    },
    removeShot(index, group_index, shot_index) {
      this.$confirm('确认删除该分镜吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.copy_list[index].segment_group[group_index].materials.splice(shot_index, 1)
        if (this.copy_list[index].segment_group[group_index].materials.length !== 0) {
          this.$nextTick(() => {
            this.concatVideo()
          })
        }
        sessionStorage.setItem("sync_cv_copy_list", JSON.stringify(this.copy_list))
      }).catch((err) => {
        this.$message({type: 'info', message: '已取消删除'});
      });
    },
    saveSetting() {
      this.validateNum()
      let sync_setting = {
        language: this.language,
        requirement: this.requirement,
        copy_require: this.copy_require,
        exampleTexts: this.exampleTexts,
        video_time: this.video_time,
        script_num: this.script_num,
        ai_model: this.ai_model,
      }
      sessionStorage.setItem('sync_setting', JSON.stringify(sync_setting))
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

      function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }

      names.sort((a, b) => b.length - a.length);

      const pattern = names.map(name => escapeRegExp(name)).join('|');

      const regex = new RegExp(pattern, 'g');

      result = result.replace(regex, (match) => {
        return `<span style="color: #4c8df1">${match}</span>`;
      });

      result = result.replace(/\n/g, '<br>');
      this.highlightedText = result;

      if (this.isSelecting) {
        return;
      }
      const atIndex = this.requirement.lastIndexOf('@', cursorPos - 1);
      let activeMention = false;

      if (atIndex !== -1) {
        const textBetweenAtAndCursor = this.requirement.substring(atIndex + 1, cursorPos);
        if (!/\s/.test(textBetweenAtAndCursor)) {
          activeMention = true;
        }
      }

      if (activeMention) {
        const searchTerm = this.requirement.substring(atIndex + 1, cursorPos);

        this.filtered_mention_list = this.mention_list.filter(mention =>
            mention.name.toLowerCase().startsWith(searchTerm.toLowerCase())
        );

        this.showDropdown = this.filtered_mention_list.length > 0;

        if (this.showDropdown) {
          if (this.selectedShotIndex !== 0) {
            this.selectedShotIndex = 0;
            this.hover_li = this.filtered_mention_list[0];
          }
          this.$nextTick(() => {
            const paddingLeft = parseFloat(getComputedStyle(inputEl).paddingLeft) || 0;
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const computedStyle = getComputedStyle(inputEl);
            context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

            const textBeforeAt = this.requirement.substring(0, atIndex + 1);
            const textWidth = context.measureText(textBeforeAt).width;
            const inputWidth = inputEl.clientWidth - 30;
            const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize);

            let offsetTop = Math.floor((paddingLeft + textWidth + 10) / inputWidth) + 1;
            offsetTop = Math.min(offsetTop, 4);
            let remainder = (paddingLeft + textWidth + 5) % inputWidth;

            this.dropdownStyle.top = `${window.scrollY + offsetTop * lineHeight}px`;
            this.dropdownStyle.left = `${remainder}px`;
          });
        } else {
          this.selectedShotIndex = -1;
          this.hover_li = null;
        }
      } else {
        this.showDropdown = false;
        this.selectedShotIndex = -1;
        this.hover_li = null;
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
    liMouseover(index) {
      this.selectedShotIndex = index
    },
    liLeave(item) {
      this.selectedShotIndex = -1
      item.isHover = false
      this.hover_li = null
    },
    liEnter(item) {
      item.isHover = true
      this.hover_li = item
    },
    shotLeave() {
      this.activeShotIndex = -1
      this.selectShot = null
    },
    shotEnter(shotIndex) {
      this.activeShotIndex = shotIndex
      this.selectShot = this.mention_list[shotIndex]
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
        this.isSelecting = true;
        const startPart = this.requirement.slice(0, atIndex);
        const endPart = this.requirement.slice(cursorPos);
        const mentionText = '@' + item.name + ' ';
        this.requirement = startPart + mentionText + endPart;

        this.showDropdown = false;
        this.selectedShotIndex = -1;
        this.hover_li = null;
        this.lastInput = this.requirement;
        this.saveSetting();
        this.updateMentionRanges()

        this.$nextTick(() => {
          const newCursorPos = atIndex + mentionText.length;
          inputEl.focus();
          inputEl.selectionStart = newCursorPos;
          inputEl.selectionEnd = newCursorPos;
          this.isSelecting = false;
        });
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
        this.selectedShotIndex = -1;
        this.hover_li = null;
      }
    },
    addExampleText() {
      this.exampleTexts.push('');
      this.$nextTick(() => { //自动滚到到底部
        const scriptForm = this.$refs.scriptForm;
        scriptForm.scrollTop = scriptForm.scrollHeight;
      });
      this.saveSetting()
    },
    removeText(index) {
      this.exampleTexts.splice(index, 1);
      this.saveSetting()
    },
    initData() {
      this.figure_ratio = parseInt(sessionStorage.getItem('montage_figure_ratio')) || 30
      this.selected_figure = JSON.parse(sessionStorage.getItem('material_figure')) || {}

      this.copy_list = JSON.parse(sessionStorage.getItem("sync_cv_copy_list")) || []

      this.sync_mix_chats = JSON.parse(sessionStorage.getItem('sync_mix_chats')) || []
      this.isGenerating = sessionStorage.getItem('sync_mix_is_generating') === 'true'
      this.isNewChat = sessionStorage.getItem('sync_mix_is_newChat') === 'true'
      this.lastGeneratedMixins = JSON.parse(sessionStorage.getItem('sync_last_generated_mixins')) || []
      this.$nextTick(() => {
        this.scrollToBottom()
      })

      let sync_setting = JSON.parse(sessionStorage.getItem("sync_setting")) || {}
      this.language = sync_setting.language || '中文'
      this.requirement = sync_setting.requirement || ''
      this.copy_require = sync_setting.copy_require || ''
      this.exampleTexts = sync_setting.exampleTexts || ['']
      this.video_time = parseInt(sync_setting.video_time) || 15
      this.script_num = parseInt(sync_setting.script_num) || 1
      this.ai_model = sync_setting.ai_model || 'deepseek_v3'

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
        video_data: this.copy_list[this.activeIndex],
        video_list: list,
      }
      postAction('/figure/create_concatenated_video', params, 600000).then(res => {
        if (res.data.status === "success") {
          this.loading.close();
          this.loading = null;
          this.copy_list[this.activeIndex].video_file_path = res.data.data.result_path
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
    generate() {
      if (this.copy_require.trim() === '') {
        this.$alert('文案要求不能为空，请先填写文案要求', '提示')
        return
      }
      let actualRequest = this.requirement
      let names = this.mention_list.map(item => '@' + item.name);
      names.forEach((item, index) => {
        actualRequest = actualRequest.replace(item, `@{${this.material_list[index]}}`)
      })
      const cleanTexts = this.exampleTexts.map(text => text.trim()).filter(text => text !== '');

      this.isNewChat = false
      this.sync_mix_chats.push({
        role: 'user',
        content: this.requirement || '挑选合适的视频素材即可',
      });
      this.isGenerating = true
      this.$nextTick(() => {
        this.scrollToBottom()
      })

      let params = {
        language: this.language,
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
      }
      postAction('/figure/video_mix_edit_sync', params, 3600000).then(res => {
        if (res.data.status === 'success') {
          this.isGenerating = false
          this.sync_mix_chats.push({
            role: 'system',
            content: {
              thinking: res.data.data.thinking,
              data: res.data.data.data,
              title: '混剪结果'
            }
          })
          this.$nextTick(() => {
            this.scrollToBottom()
          })
          this.copy_list = res.data.data.data
          this.lastGeneratedMixins = res.data.data.data
          sessionStorage.setItem('sync_last_generated_mixins', JSON.stringify(this.lastGeneratedMixins))
          sessionStorage.setItem("sync_cv_copy_list", JSON.stringify(this.copy_list))
        } else {
          this.isGenerating = false
          this.mix_chats.push({
            role: 'mix_error',
            content: res.data.message
          })
          this.$nextTick(() => {
            this.scrollToBottom()
          })
          this.$alert(res.data.message, "混剪失败");
        }
      }).catch(error => {
        this.isGenerating = false
        this.mix_chats.push({
          role: 'mix_error',
          content: error
        })
        this.$alert(error, "混剪错误");
      })
    },
    collapseChange(index) {
      if (this.showChecked) {
        this.deleteCheckeds[index] = !this.deleteCheckeds[index]
        this.$forceUpdate()
        return
      }
      this.show_left_panel = false
      if (this.activeIndex !== index) {
        this.activeIndex = index
        this.selectedCopy = this.copy_list[index]
        if (this.isPlaying) {
          this.$refs.videoRef.pause()
          this.$refs.audioRef.pause()
          this.isPlaying = false
        }
        this.preview_video_url = this.copy_list[this.activeIndex].video_file_path
        this.preview_audio_url = this.copy_list[this.activeIndex].audio_file_path
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
        this.copy_list.splice(index, 1)
        if (this.$refs.videoRef) {
          this.$refs.videoRef.pause()
          this.$refs.audioRef.pause()
          this.isPlaying = false
        }
        if (this.copy_list.length > 0) {
          this.openIndex = 0;
          this.activeIndex = 0;
          this.selectedCopy = this.copy_list[0]
          this.preview_video_url = this.copy_list[0].video_file_path
          this.preview_audio_url = this.copy_list[0].audio_file_path
          this.$nextTick(() => {
            this.loadVideo();
            this.loadAudio()
          })
        }else {
          this.selectedCopy = null;
          this.openIndex = null
          this.activeIndex = -1
        }
        sessionStorage.setItem("sync_cv_copy_list", JSON.stringify(this.copy_list))
      }).catch((err) => {
        this.$message({type: 'info', message: '已取消删除'});
      });
    },

    batchRemoveCopy() {
      this.showChecked = true
      this.activeIndex = -1
      this.openIndex = null
      this.isPlaying = false
    },
    sureRemove() {
      if (this.deleteCheckeds.every(item => !item)) {
        this.$alert('请选择要删除的文案', '提示')
        return
      }
      this.$confirm('确认删除选择的文案吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.copy_list = this.copy_list.filter((item, i) => !this.deleteCheckeds[i]);
        this.deleteCheckeds = []
        this.showChecked = false
        this.$forceUpdate()
        if (this.$refs.videoRef) {
          this.$refs.videoRef.pause()
          this.$refs.audioRef.pause()
          this.isPlaying = false
        }
        if (this.copy_list.length > 0) {
          this.openIndex = 0;
          this.activeIndex = 0;
          this.selectedCopy = this.copy_list[0]
          this.preview_video_url = this.copy_list[0].video_file_path
          this.preview_audio_url = this.copy_list[0].audio_file_path
          this.$nextTick(() => {
            this.loadVideo();
            this.loadAudio()
          })
        }else {
          this.selectedCopy = null;
          this.openIndex = null
          this.activeIndex = -1
        }
        sessionStorage.setItem("sync_cv_copy_list", JSON.stringify(this.copy_list))
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
            this.clearCache()
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
      this.$refs.audioRef.src = this.preview_audio_url
      this.$refs.audioRef.play()
    },
    loadVideo() {
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
      if (this.isGenerating) {
        this.$message.warning('请等待当前混剪完成之后返回')
        return
      }
      this.clearCache()
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
  position: relative;
}

.left-panel {
  width: 396px;
  padding: 19px;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;
  height: 100%;
}

.left-panel-close {
  width: 1px;
  height: 100%;
}

.setting-close, .setting-open {
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
  position: absolute;
  box-shadow: rgba(102, 126, 234, 0.3) 0 4px 20px;
  background: linear-gradient(135deg, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 100%);
  left: 396px;
}

.setting-close:hover {
  left: 400px;
}

.setting-open {
  position: fixed;
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

.example_textarea {
  position: relative;
}

.example-close-icon {
  position: absolute;
  right: 8px;
  top: 8px;
  color: #9ca3af;
  font-size: 16px;
  cursor: pointer;
  font-weight: 600;
}

.example-close-icon:hover {
  color: #ef4444;
}

.example_textarea >>> .el-textarea__inner {
  padding-right: 30px !important;
}

.add_example_btn >>> .el-button {
  width: 100%;
  background-color: #eef2ff;
  color: #4338ca;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #c7d2fe;
}

.add_example_icon {
  font-size: 10px;
  font-weight: bold;
  line-height: 16px;
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

.settings-button-section {
  margin: 16px auto 0;
  display: flex;
  width: 280px;
}

.export-section {
  margin: 16px auto 0;
  width: 100%;
  max-width: 400px;
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
  padding: 12px 20px;
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
  padding: 12px;
  box-sizing: border-box;
  border: 1px solid #d1d5db;
}

.copy-item-title {
  flex: 1;
  line-height: 28px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
  font-size: 15px;
  color: #1f2937;
}

.copy-item-desc {
  font-size: 13px;
  line-height: 24px;
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
  padding-bottom: 12px;
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
  justify-content: center;
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

.li-active {
  background-color: #6366f1 !important;
  color: #ffffff !important;
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
  resize: none;
  border: 1px solid #d1d5db;
  transition: border-color 0.2s ease-in-out;
}

.input-layer >>> .el-textarea__inner:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.volume-control >>> .el-button {
  padding: 7px 10px;
}

.shot-list {
  width: 210px;
  height: 200px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 4px;
  margin: -12px;
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

.shot-name-active {
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

.delete-group-btn {
  padding: 8px !important;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.mix-chat-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 400px;
  box-shadow: 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;
  box-sizing: border-box;
  background-color: #FFFFFF;
  border-radius: 12px;
  overflow: hidden;
}

.mix-chat-frame {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
  overflow-y: auto;
}

.mix-chat-frame >>> .el-divider--horizontal {
  margin: 10px 0 !important;
}

.mix-chat-frame >>> .el-divider__text {
  color: #9ca3af;
}

.historical-chat {
  opacity: 0.5;
  /* pointer-events: none; */
  transition: opacity 0.3s ease-in-out;
}

.mix-chat-user {
  max-width: 85%;
  background-color: #dbeafe;
  padding: 10px;
  box-shadow: 0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border-radius: 8px;
  border-top-left-radius: 0 !important;
  color: #4B5563;
  font-size: 14px;
}

.mix-chat-system-area {
  max-width: 85%
}

.select-result-btn {
  width: 120px;
  font-size: 12px;
  color: #4B5563;
  margin-top: 4px;
  cursor: pointer;
  opacity: 0;
}

.mix-chat-system-area:hover .select-result-btn {
  opacity: 1;
}

.mix-chat-system {
  background-color: #eff6ff;
  padding: 10px;
  box-shadow: 0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border-radius: 8px;
  border-top-right-radius: 0 !important;
  display: flex;
  gap: 8px;
}

.mix-avatar-area {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
}

.mix-chat-system >>> .el-collapse {
  border: none;
}

.mix-chat-system >>> .el-collapse-item__wrap {
  background-color: transparent;
  border: none;
}

.mix-chat-system >>> .el-collapse-item__header {
  height: 32px;
  line-height: 32px;
  background-color: transparent;
  border: none;
}

.mix-chat-system >>> .el-collapse-item__arrow {
  margin: 0 10px;
  font-weight: bold;
}

.mix-chat-system >>> .el-collapse-item__content {
  padding-bottom: 0;
}

.mix-chat-system-label {
  color: #3b82f6;
  font-weight: bold;
  font-size: 12px;
  line-height: 16px;
}

.mix-chat-system-content {
  margin-top: 8px;
  background: linear-gradient(to right, #f7f3ff, #fff 45.34%);
  width: 100%;
  border: 1px solid #0003;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  padding: 10px;
  box-sizing: border-box;
}

.mix-chat-system-content:hover {
  box-shadow: 0 0 4px 0 #00000005, 0 6px 10px 0 #2f35401a;
}

.mix-chat-system-content-icon {
  font-size: 18px;
  color: #9952e1;
  padding: 9px;
  margin-bottom: -8px;
}

.mix-chat-system-content-name {
  flex: 1;
  font-size: 14px;
  color: #000000d9;
}

.ai-thinking-content {
  width: 255px;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  color: #4b5563;
  font-size: 13px;
  line-height: 20px;
  font-style: italic;
}

.error-content {
  max-width: 85%;
  width: fit-content;
  background-color: #eff6ff;
  padding: 10px;
  box-shadow: 0 0  #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border-radius: 8px;
  border-top-right-radius: 0 !important;
  display: flex;
  gap: 8px;
  align-items: center;
}

.error-message {
  flex: 1;
  color: #4B5563;
  font-size: 14px;
}

.mix-loading-content {
  width: 65px;
  background-color: #eff6ff;
  padding: 10px;
  box-shadow: 0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border-radius: 8px;
  border-top-right-radius: 0 !important;
  display: flex;
  gap: 8px;
}

.mix-loading-area {
  font-size: 20px;
  color: #4B5563;
}

.mix-chat-input {
  padding: 12px;
  background-color: #f3f4f6;
  border-top: 1px solid #e5e7eb;
}

.create-chat-btn {
  color: #4b5563;
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 8px;
  cursor: pointer;
}

.mix-send-placeholder {
  color: #6b7280;
  font-size: 12px;
  line-height: 16px;
  margin-top: 8px;
}
</style>