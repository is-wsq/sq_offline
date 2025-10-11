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
      <el-tooltip class="item" effect="dark" content="收起设置" placement="right" v-if="show_settings">
        <div class="toggle-btn-open" @click="closeSettings">
          <i class="el-icon-arrow-left" style="font-size: 16px;font-weight: bold;color: #ffffff"></i>
        </div>
      </el-tooltip>
      <div class="settings-panel" v-if="show_settings && mix_chats.length === 0">
        <div class="settings-content-area">
          <div class="panel-title">混剪设置</div>
          <div class="setting-require margin-t-8">自定义要求（选填）</div>
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
                      spellcheck="false"
                      ref="inputRef"
                      class="input-layer"
                      @change="saveSetting"
                      @scroll="handleScroll">
            </el-input>
            <div v-if="showDropdown" class="dropdown" :style="dropdownStyle">
              <ul ref="urRef">
                <li v-for="(item, index) in filtered_mention_list" :key="index" @click="selectMention(item)"
                    @mouseenter="liEnter(item)" :title="item.name" @mouseleave="liLeave"
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
            <div class="setting-require margin-t-12">数字人时长占比</div>
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
              {{ !!loading ? '生成中...' : montage_data.length > 0 ? '重新生成' : '一键混剪' }}
            </el-button>
          </div>
          <div class="batch-download">
            <el-button @click="centerDialogVisible = true"><i class="el-icon-arrow-down" style="font-size: 16px"></i>
            </el-button>
          </div>
        </div>
      </div>
      <div class="mix-chat-area" v-if="show_settings && mix_chats.length > 0">
        <div class="mix-chat-frame" ref="mixChatRef">
          <div v-for="(item, index) in mix_chats" :key="index"
               :class="{'historical-chat': lastNewChatIndex !== -1 && index < lastNewChatIndex}">
            <div v-if="item.role === 'user'" style="display: flex;justify-content: end;">
              <div class="mix-chat-user" v-html="highlightAt(item.content)" @click="handleMentionClick"></div>
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
                  <div class="mix-chat-system-label">混剪结果</div>
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
          </div>
          <div class="mix-loading-content" v-if="isGenerating">
            <div class="mix-avatar-area">奇</div>
            <template v-if="is_thinking">
              <div class="mix-chat-system-label">
                AI思考中
                <i class="el-icon-loading" style="font-size: 16px;margin-left: 4px"></i>
              </div>
            </template>
            <template v-else>
              <div class="mix-loading-area">
                <template v-if="is_pending">
                  <el-collapse>
                    <el-collapse-item>
                      <template slot="title">
                        <div class="mix-chat-system-label">AI思考过程</div>
                      </template>
                      <div class="ai-thinking-content">{{ thinking_text }}</div>
                    </el-collapse-item>
                  </el-collapse>
                  <div class="mix-chat-system-label">混剪结果</div>
                  <div class="mix-chat-system-content">
                    <div :style="progressStyle"></div>
                    <div class="mix-chat-system-content-icon" style="z-index: 10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24">
                        <path fill="currentColor" fill-rule="evenodd"
                              d="M13.113 2.266a.936.936 0 0 1 .797 1.057l-2.476 17.614a.936.936 0 0 1-1.854-.26l2.476-17.615a.936.936 0 0 1 1.057-.796M6.811 6.744a.936.936 0 0 1 0 1.324l-3.55 3.55 3.55 3.551a.936.936 0 1 1-1.324 1.324l-4.213-4.212a.936.936 0 0 1 0-1.325l4.213-4.212a.936.936 0 0 1 1.324 0m15.447 4.213c.357.356.365.93.025 1.297a6.05 6.05 0 0 0-2.377-1.001l-3.185-3.185a.936.936 0 1 1 1.324-1.324zm-3.47 10.491a.48.48 0 0 0 .48-.425c.225-1.341.423-2.03.849-2.457.425-.426 1.11-.624 2.445-.849a.485.485 0 0 0 .438-.48.48.48 0 0 0-.44-.48c-1.332-.227-2.018-.425-2.443-.851-.426-.427-.624-1.115-.849-2.455a.48.48 0 0 0-.48-.428.49.49 0 0 0-.481.426c-.226 1.341-.423 2.03-.85 2.457-.424.426-1.108.624-2.44.85a.48.48 0 0 0-.442.481c0 .26.199.448.439.48 1.335.225 2.02.418 2.444.842.426.425.623 1.114.849 2.466.04.24.23.423.482.423" clip-rule="evenodd">
                        </path>
                      </svg>
                    </div>
                    <div class="mix-chat-system-content-name" style="z-index: 10">
                      素材混剪中
                      <i class="el-icon-loading" style="font-size: 16px;margin-left: 4px"></i>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="flex-center">
                    <div class="mix-chat-system-label">AI思考过程</div>
                    <i class="el-icon-arrow-down loading-area-icon"></i>
                    <div style="flex: 1"></div>
                  </div>
                  <div class="loading-area-text">{{ thinking_text }}</div>
                </template>
              </div>
            </template>
          </div>
        </div>
        <div class="mix-chat-input">
          <template v-if="!isNewChat">
            <div class="create-chat-btn" @click="createNewChat">
              <i class="el-icon-edit-outline" style="margin-right: 5px"></i>
              发起新会话
            </div>
            <div class="chat-text-area">
              <div style="position: relative">
                <div class="chat-highlight-content"
                     v-html="chat_highlightedText"
                     :style="{height: chat_replaceDivHeight + 'px'}"
                     ref="chatHighlightDiv">
                </div>
                <el-input type="textarea" placeholder="请输入您的修改意见..." resize="none" v-model="mix_chatInput"
                          :rows="3" @keydown.native="enterSendChat" spellcheck="false" ref="textareaRef"
                          class="textarea-layer" @input="onInput" @compositionstart="onCompositionStart"
                          @compositionupdate="onCompositionUpdate" @compositionend="onCompositionEnd"
                          @scroll="handleChatScroll"></el-input>
                <div v-if="chat_showDropdown" class="dropdown" :style="chat_dropdownStyle">
                  <ul ref="urRef">
                    <li v-for="(item, index) in filtered_mention_list" :key="index" @click="selectChatMention(item)"
                        @mouseenter="liEnter(item)" :title="item.name" @mouseleave="liLeave"
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
              <div style="text-align: right;margin: 5px 8px">
                <el-tooltip class="item" effect="dark" content="发送(Enter)" placement="top">
                  <el-button type="primary" style="padding: 0 15px" @click="sendChat" :disabled="isGenerating">
                    <i class="el-icon-s-promotion" style="font-size: 16px;line-height: 24px"></i>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
            <div class="mix-send-placeholder">Shift + Enter 换行</div>
          </template>
          <template v-else>
            <div class="mix-chat-input-new">
              <div class="setting-require margin-t-8">自定义要求（选填）</div>
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
                          spellcheck="false"
                          ref="inputRef"
                          class="input-layer"
                          @change="saveSetting"
                          @scroll="handleScroll">
                </el-input>
                <div v-if="showDropdown" class="dropdown" :style="dropdownStyle">
                  <ul ref="urRef">
                    <li v-for="(item, index) in filtered_mention_list" :key="index" @click="selectMention(item)"
                        @mouseenter="liEnter(item)" :title="item.name" @mouseleave="liLeave"
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
                <div class="setting-require margin-t-12">数字人时长占比</div>
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
                  {{ !!loading ? '生成中...' : montage_data.length > 0 ? '重新生成' : '一键混剪' }}
                </el-button>
              </div>
              <div class="batch-download">
                <el-button @click="centerDialogVisible = true"><i class="el-icon-arrow-down" style="font-size: 16px"></i>
                </el-button>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div style="width: 1px" v-if="!show_settings">
        <el-tooltip class="item" effect="dark" content="展开设置 " placement="right-end">
          <div class="toggle-btn-close" @click="expandSettings">
            <i class="el-icon-arrow-right" style="font-size: 16px;font-weight: bold;color: #ffffff"></i>
          </div>
        </el-tooltip>
      </div>
      <div class="script-panel" :style="{ width: show_settings? 'calc(100% - 420px)' : 'calc(100% - 370px)' }">
        <div class="script-selection-area">
          <div class="flex-center" style="line-height: 50px">
            <div class="panel-title" style="flex: 1">AI选用文案</div>
            <div v-if="montage_data.length > 0 && !isGenerating">
              <template v-if="showChecked">
                <el-button type="primary" size="mini" class="delete-group-btn" @click="sureRemove">确认删除</el-button>
                <el-button class="delete-group-btn" size="mini" @click="showChecked = false">取消</el-button>
              </template>
              <el-button type="primary" size="mini" class="delete-group-btn" v-else @click="batchRemoveCopy">批量删除
              </el-button>
            </div>
          </div>
          <div class="script-list">
            <template v-if="montage_data.length === 0" style="width: 100%">
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
                <div class="groups" v-if="expandedIndex.includes(index)">
                  <div class="group" v-for="(group,group_index) in item.segment_group" :key="group_index">
                    <div class="group-title" v-if="group.groupType === 'digital_human' || isGenerating"
                         :style="{ width: ((group.materials.length - 1) * 100 + 80) + 'px' }"
                         :title="group.contentSummary">
                      {{ group.contentSummary }}
                    </div>
                    <div class="group-title" v-if="group.groupType !== 'digital_human' && !isGenerating"
                         :style="{ width: (group.materials.length * 100 + 80) + 'px' }"
                         :title="group.contentSummary">
                      {{ group.contentSummary }}
                    </div>
                    <div class="material-list" ref="materialListRef">
                      <div class="material-item" v-for="(material,material_index) in group.materials"
                           :key="material_index">
                        <el-popover placement="bottom" :ref="'popoverRef_' + material_index" trigger="click"
                                    v-if="group.groupType !== 'digital_human'"
                                    @show="popoverShow(index,group_index,material_index)" @hide="popoverHide">
                          <div class="shot-list" :ref="'shotRef_'+index+'_'+group_index+'_'+material_index">
                            <div v-for="(shot, shot_index) in mention_list" :key="shot_index"
                                 class="shot-name" :title="shot.name"
                                 :class="{'shot-name-active': activeShotIndex === shot_index}"
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
                                 class="shot-name" :title="val.name"
                                 :class="{'shot-name-active': activeShotIndex === val_index}"
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
            </template>
          </div>
          <div class="export-section" v-if="montage_data.length > 0 && !isGenerating">
            <el-button @click="export_video(false)">
              <i class="el-icon-fa-download" style="margin-right: 10px;"></i>
              导出视频
            </el-button>
          </div>
        </div>
      </div>
      <div class="preview-area" v-if="!show_settings">
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
import {ClearCacheMixin} from "@/mixins/ClearCacheMixin";

export default {
  name: 'Montage',
  mixins: [ClearCacheMixin],
  data() {
    return {
      mix_chats: [],
      mix_chatInput: '',
      conversation_id: null,
      lastGeneratedMixins: [],
      isGenerating: false,
      isNewChat: false,
      requirement: '',
      figure_ratio: 30,
      copy_list: [],
      selected_index: {},
      show_settings: true,
      showChecked: false,
      deleteCheckeds: [],
      activeIndex: -1,
      isPlaying: false,

      copy_request: '',

      material_list: [],
      mute_materials: [],
      reverse: false,
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

      bgm_options: [],
      audio: null,
      audioIndex: null,
      preview_video_url: '',
      preview_audio_url: '',

      centerDialogVisible: false,

      isComposing: false,
      composingText: '',
      compositionStart: 0,
      highlightedText: '',
      lastInput: '',
      replaceDivHeight: 102,
      showDropdown: false,
      dropdownStyle: {
        position: 'absolute',
        top: '0px',
        left: '0px'
      },
      mentionRanges: [],

      chat_isComposing: false,
      chat_composingText: '',
      chat_compositionStart: 0,
      chat_highlightedText: '',
      chat_lastInput: '',
      chat_replaceDivHeight: 73,
      chat_showDropdown: false,
      chat_dropdownStyle: {
        position: 'absolute',
        top: '0px',
        left: '0px'
      },
      chat_mentionRanges: [],

      show_model: '',
      selected_figure: {},
      filtered_mention_list: [],
      isSelecting: false,

      is_thinking: false,
      is_pending: false,
      thinking_text: '',
      controller: null,
      delayTimer: null,
      percent: 0,
    }
  },
  watch: {
    requirement(newVal) {
      if (!this.isComposing) {
        this.updateDisplayText();
      }
    },
    mix_chatInput(newVal) {
      if (!this.chat_isComposing) {
        this.updateDisplayChatText();
      }
    },
    mix_chats: {
      handler(newValue, oldValue) {
        sessionStorage.setItem('mix_chats', JSON.stringify(newValue))
      },
      deep: true
    },
    isGenerating: {
      handler(newValue, oldValue) {
        sessionStorage.setItem('mix_is_generating', newValue)
      },
      deep: true
    },
    is_pending: {
      handler(newValue, oldValue) {
        sessionStorage.setItem('mix_is_pending', newValue)
      },
      deep: true
    },
    percent: {
      handler(newValue, oldValue) {
        sessionStorage.setItem('mix_percent', newValue)
      },
      deep: true
    },
    isNewChat: {
      handler(newValue, oldValue) {
        sessionStorage.setItem('mix_is_newChat', JSON.stringify(newValue))
      },
      deep: true
    }
  },
  computed: {
    progressStyle() {
      return {
        position: 'absolute',
        left: 0,
        top: 0,
        width: `${this.percent}%`,
        height: '100%',
        zIndex: 9,
        background: `#dbdfff`,
        opacity: 0.5,
      };
    },
    expandedIndex() {
      if (!this.show_settings) {
        return [this.activeIndex]
      }
      let result = []
      for (let i = 0; i < this.montage_data.length; i++) {
        result.push(i)
      }
      return result
    },
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
    lastNewChatIndex() {
      for (let i = this.mix_chats.length - 1; i >= 0; i--) {
        if (this.mix_chats[i].role === 'new_chat') {
          return i;
        }
      }
      return -1;
    }
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleKeyDown);
    const inputEl = this.$refs.inputRef.$el.querySelector('textarea')
    inputEl.removeEventListener('scroll', this.handleScroll);
    if (this.$refs.textareaRef) {
      const chatEl = this.$refs.textareaRef.$el.querySelector('textarea')
      chatEl.removeEventListener('scroll', this.handleChatScroll);
    }
    this.clearDelayTimer();
  },
  mounted() {
    this.initData()
    this.queryBgm()
    document.addEventListener('click', this.handleClickOutside);
    document.addEventListener('keydown', this.handleKeyDown);
    const inputEl = this.$refs.inputRef.$el.querySelector('textarea')
    this.replaceDivHeight = inputEl.clientHeight + 2
    inputEl.addEventListener('scroll', this.handleScroll);
  },
  methods: {
    highlightAt(content) {
      let names = this.mention_list.map(item => '@' + item.name);

      function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }

      names.sort((a, b) => b.length - a.length);
      const pattern = names.map(name => escapeRegExp(name)).join('|');
      const regex = new RegExp(pattern, 'g');

      // 添加一个唯一标识类名，用于事件委托
      return content.replace(regex, (match) => {
        return `<span class="mention-tag" style="color: #4c8df1;cursor: pointer;" data-name="${match}">${match}</span>`;
      });
    },
    handleMentionClick(e) {
      if (e.target.classList.contains('mention-tag')) {
        const name = e.target.dataset.name;
        this.viewMaterial(name);
      }
    },
    viewMaterial(name) {
      let filepath = this.mention_list.find(item => item.name === name.replace('@','')).filepath;
      console.log(filepath);
    },
    closeSettings() {
      if (this.montage_data.length === 0) {
        this.show_settings = false
        return
      }
      this.itemClick(0)
    },
    expandSettings() {
      this.activeIndex = -1
      if (this.isPlaying) {
        this.$refs.videoRef.pause()
        this.$refs.audioRef.pause()
        this.isPlaying = false
      }
      this.show_settings = true
    },
    selectMixResult(result) {
      this.montage_data = result
      sessionStorage.setItem("montage_data", JSON.stringify(this.montage_data))
    },
    createNewChat() {
      if (this.isGenerating) {
        this.$alert('请等待生成结束后再发起新会话','提示')
        return
      }
      if (this.$refs.textareaRef) {
        const chatEl = this.$refs.textareaRef.$el.querySelector('textarea')
        chatEl.removeEventListener('scroll', this.handleChatScroll);
      }
      this.isNewChat = true
      this.conversation_id = null
      sessionStorage.removeItem('mix_conversation_id')
      this.mix_chats.push({ role: 'new_chat' })
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    clearDelayTimer() {
      if (this.delayTimer) {
        clearTimeout(this.delayTimer);
        this.delayTimer = null;
      }
    },
    async stream_query(params, url, version) {
      this.thinking_text = '';
      this.controller = new AbortController();
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {'Content-Type': 'application/json',},
          body: JSON.stringify(params),
          signal: this.controller.signal
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        if (!response.body) throw new Error('浏览器不支持ReadableStream');

        this.is_thinking = true

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let deltaAccumulator = '';
        let buffer = '';

        while (true) {
          const {done, value} = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, {stream: true});
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;
            const jsonString = line.slice(6).trim();
            if (jsonString === '[DONE]') continue;

            try {
              const data = JSON.parse(jsonString);
              if (data.type === 'conversation_info') {
                this.conversation_id = data.conversation_id;
                sessionStorage.setItem('mix_conversation_id', this.conversation_id)
              }
              if (data.type === 'reasoning' && typeof data.delta === 'string') {
                deltaAccumulator += data.delta;
                this.is_thinking = false
                this.thinking_text = deltaAccumulator;
                this.$nextTick(() => { this.scrollToBottom() })
                this.clearDelayTimer();
                this.delayTimer = setTimeout(() => {
                  this.is_pending = true;
                }, 2000);
              }
              if (data.type === 'progress') {
                this.percent = data.percent
              }
              if (data.type === 'final') {
                this.is_pending = false
                this.clearDelayTimer();
                this.isGenerating = false
                this.montage_data = data.data.data
                this.lastGeneratedMixins = data.data.data
                sessionStorage.setItem('last_generated_mixins', JSON.stringify(this.lastGeneratedMixins))
                sessionStorage.setItem("montage_data", JSON.stringify(this.montage_data))
                this.mix_chats.push({
                  role: 'system',
                  content: {
                    thinking: data.data.thinking,
                    data: data.data.data,
                    title: version ? `修改版本 V${version}`: '混剪结果'
                  }
                })
                this.$nextTick(() => { this.scrollToBottom() })
              }
            } catch (parseError) {
              console.error('解析 JSON 数据时出错:', parseError, '数据:', line);
            }
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('流式请求错误:', error);
          this.thinking_text += `<br><span style="color: red;">请求出错: ${error.message}</span>`;
        }
      } finally {
        this.controller = null;
      }
    },
    enterSendChat(event) {
      if (event.key === 'Enter' && !event.shiftKey && !this.chat_showDropdown) {
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
      let history_chat = this.mix_chats
      for (let i = this.mix_chats.length - 1; i >= 0; i--) {
        if (this.mix_chats[i].role === 'new_chat') {
          history_chat = this.mix_chats.slice(i + 1);
          break;
        }
      }
      this.mix_chats.push({ role: 'user', content: this.mix_chatInput });
      let actualRequest = this.mix_chatInput
      let names = this.mention_list.map(item => '@' + item.name);
      names.forEach((item, index) => {
        actualRequest = actualRequest.replace(item, `@{${this.material_list[index]}}`)
      })
      let version = history_chat.filter(item => item.role === 'user').length - 1
      let params = {
        data: this.lastGeneratedMixins,
        history_chat: history_chat,
        user_feedback: actualRequest,
        material_list: this.material_list,
        bool_list: this.mute_materials,
        conversation_id: this.conversation_id,
      }
      this.mix_chatInput = '';
      this.isGenerating = true
      this.$nextTick(() => { this.scrollToBottom() })
      this.stream_query(params, 'http://127.0.0.1:6006/figure/re_video_mix_edit_stream', version)
    },
    scrollToBottom() {
      if (this.$refs.mixChatRef) {
        this.$refs.mixChatRef.scrollTop = this.$refs.mixChatRef.scrollHeight
      }
    },
    popoverShow(index, g_index, m_index) {
      this.add_shot_popover = true
      this.v_index = index
      this.g_index = g_index
      this.m_index = m_index
    },
    popoverHide() {
      this.activeShotIndex = -1
      this.add_shot_popover = false
    },
    pushShow(index, g_index) {
      this.push_shot_popover = true
      this.v_index = index
      this.g_index = g_index
    },
    pushHide() {
      this.activeShotIndex = -1
      this.push_shot_popover = false
    },
    handleKeyDown(event) {
      if (this.showDropdown || this.chat_showDropdown) {
        if (event.key === 'ArrowUp' && this.selectedShotIndex > 0) {
          event.preventDefault();
          this.selectedShotIndex--;
          this.hover_li = this.filtered_mention_list[this.selectedShotIndex];
          if (this.selectedShotIndex > 4) {
            this.$refs.urRef.scrollTop = (this.selectedShotIndex - 4) * 36;
          } else {
            this.$refs.urRef.scrollTop = 0
          }
        } else if (event.key === 'ArrowDown' && this.selectedShotIndex < this.filtered_mention_list.length - 1) {
          event.preventDefault();
          this.selectedShotIndex++;
          this.hover_li = this.filtered_mention_list[this.selectedShotIndex];
          if (this.selectedShotIndex > 4) {
            this.$refs.urRef.scrollTop = (this.selectedShotIndex - 4) * 36;
          }
        } else if (event.key === 'Enter' && this.selectedShotIndex !== -1) {
          event.preventDefault();
          if (this.$refs.textareaRef) {
            this.selectChatMention(this.filtered_mention_list[this.selectedShotIndex])
          } else {
            this.selectMention(this.filtered_mention_list[this.selectedShotIndex]);
          }
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
          this.addShot(this.v_index, this.g_index, this.m_index, this.selectShot)
        }
      }
      if (this.push_shot_popover) {
        if (event.key === 'ArrowUp' && this.activeShotIndex > 0) {
          event.preventDefault();
          this.activeShotIndex--;
          this.selectShot = this.mention_list[this.activeShotIndex]
          if (this.activeShotIndex > 4) {
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
          this.pushShot(this.v_index, this.g_index, this.selectShot)
        }
      }
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
        } else {
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
      if (this.mix_chats.length > 0 && !this.isNewChat) {
        this.chat_isComposing = true;
        this.chat_compositionStart = e.target.selectionStart;
        return
      }
      this.isComposing = true;
      this.compositionStart = e.target.selectionStart;
    },

    onCompositionUpdate(e) {
      if (this.mix_chats.length > 0 && !this.isNewChat) {
        this.chat_composingText = e.data;
        this.updateDisplayChatText();
      } else {
        this.composingText = e.data;
        this.updateDisplayText();
      }
    },

    onCompositionEnd(e) {
      if (this.mix_chats.length > 0 && !this.isNewChat) {
        this.chat_isComposing = false;
        this.chat_composingText = '';
        this.mix_chatInput = e.target.value;
        this.updateDisplayChatText();
      } else {
        this.isComposing = false;
        this.composingText = '';
        this.requirement = e.target.value;
        this.updateDisplayText();
      }
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
    updateDisplayChatText() {
      let isDel = this.chat_lastInput.length > this.mix_chatInput.length;
      this.chat_lastInput = this.mix_chatInput;
      const inputEl = this.$refs.textareaRef.$el.querySelector('textarea');
      const cursorPos = inputEl.selectionStart;
      if (isDel) { // 删除@内容
        for (let mention of this.chat_mentionRanges) {
          const {start, end, name} = mention;
          if (cursorPos >= start && cursorPos < end) { //删除@内容
            this.mix_chatInput =
                this.mix_chatInput.slice(0, start - 1) + this.mix_chatInput.slice(end - 1);
          }
        }
      }

      // 更新提及范围数组
      this.updateChatMentionRanges()

      let result = this.mix_chatInput;
      if (this.chat_isComposing && this.chat_composingText) {
        const before = result.substring(0, this.chat_compositionStart);
        const after = result.substring(this.chat_compositionStart + this.chat_composingText.length);
        result = before + this.chat_composingText + after;
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
      this.chat_highlightedText = result;

      if (this.isSelecting) {
        return;
      }
      const atIndex = this.mix_chatInput.lastIndexOf('@', cursorPos - 1);
      let activeMention = false;

      if (atIndex !== -1) {
        const textBetweenAtAndCursor = this.mix_chatInput.substring(atIndex + 1, cursorPos);
        if (!/\s/.test(textBetweenAtAndCursor)) {
          activeMention = true;
        }
      }

      if (activeMention && !isDel) {
        const searchTerm = this.mix_chatInput.substring(atIndex + 1, cursorPos);

        this.filtered_mention_list = this.mention_list.filter(mention =>
            mention.name.toLowerCase().startsWith(searchTerm.toLowerCase())
        );
        this.chat_showDropdown = this.filtered_mention_list.length > 0;

        if (this.chat_showDropdown) {
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

            const textBeforeAt = this.mix_chatInput.substring(0, atIndex + 1);
            const textWidth = context.measureText(textBeforeAt).width;
            const inputWidth = inputEl.clientWidth - 30;
            const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize);

            let offsetTop = Math.floor((paddingLeft + textWidth + 10) / inputWidth) + 1;
            offsetTop = Math.min(offsetTop, 3);
            let remainder = (paddingLeft + textWidth + 5) % inputWidth;

            this.chat_dropdownStyle.top = `${window.scrollY + offsetTop * lineHeight - 223}px`;
            this.chat_dropdownStyle.left = `${remainder}px`;
          });
        } else {
          this.selectedShotIndex = -1;
          this.hover_li = null;
        }
      } else {
        this.chat_showDropdown = false;
        this.selectedShotIndex = -1;
        this.hover_li = null;
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
      this.montage_data[index].segment_group[group_index].materials.splice(material_index, 0, item);
      this.$nextTick(() => {
        this.concatVideo()
      })

      sessionStorage.setItem("montage_data", JSON.stringify(this.montage_data))
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

      sessionStorage.setItem("montage_data", JSON.stringify(this.montage_data))
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
        sessionStorage.setItem("montage_data", JSON.stringify(this.montage_data))
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
    handleChatScroll(event) {
      const inputEl = this.$refs.textareaRef.$el.querySelector('textarea');
      const highlightEl = this.$refs.chatHighlightDiv;
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
    updateChatMentionRanges() {
      let result = []
      let names = this.mention_list.map(item => '@' + item.name);
      names.forEach(name => {
        let startIndex = 0;
        while ((startIndex = this.mix_chatInput.indexOf(name, startIndex)) !== -1) {
          result.push({
            start: startIndex + 1,
            end: startIndex + name.length,
            name: name
          });
          startIndex += name.length; // 移动索引避免死循环
        }
      });
      this.chat_mentionRanges = result;
    },
    onInput() {
      if (this.mix_chats.length > 0 && !this.isNewChat) {
        if (this.chat_isComposing) {
          return
        }
        this.updateDisplayChatText()
        return;
      }
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
    selectChatMention(item) {  //选择@
      const inputEl = this.$refs.textareaRef.$el.querySelector('textarea');
      const cursorPos = inputEl.selectionStart;
      const atIndex = this.mix_chatInput.lastIndexOf('@', cursorPos - 1);
      if (atIndex !== -1) {
        this.isSelecting = true;
        const startPart = this.mix_chatInput.slice(0, atIndex);
        const endPart = this.mix_chatInput.slice(cursorPos);
        const mentionText = '@' + item.name + ' ';
        this.mix_chatInput = startPart + mentionText + endPart;

        this.chat_showDropdown = false;
        this.selectedShotIndex = -1;
        this.hover_li = null;
        this.chat_lastInput = this.mix_chatInput;
        this.updateChatMentionRanges()

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
      if (!this.$refs.inputRef && !this.$refs.textareaRef)
        return;
      let inputEl
      if (this.$refs.textareaRef) {
        inputEl = this.$refs.textareaRef.$el.querySelector('textarea');
      } else {
        inputEl = this.$refs.inputRef.$el.querySelector('textarea');
      }
      const dropdownEl = this.$refs.dropdownRef; // 假设选择框有一个引用

      // 检查点击是否发生在输入框或选择框内
      if (!inputEl.contains(event.target) && (!dropdownEl || !dropdownEl.contains(event.target))) {
        this.showDropdown = false;
        this.chat_showDropdown = false;
        this.selectedShotIndex = -1;
        this.hover_li = null;
      }
    },

    initData() {
      this.copy_list = JSON.parse(sessionStorage.getItem("copy_list")).map(item => ({
        ...item, isHover: false,
      }))
      this.montage_data = JSON.parse(sessionStorage.getItem("montage_data")) || []
      this.mix_chats = JSON.parse(sessionStorage.getItem('mix_chats')) || []
      this.isGenerating = sessionStorage.getItem('mix_is_generating') === 'true'
      this.is_pending = sessionStorage.getItem('mix_is_pending') === 'true'
      this.percent = parseInt(sessionStorage.getItem('mix_percent')) || 0
      this.isNewChat = sessionStorage.getItem('mix_is_newChat') === 'true'
      this.conversation_id = sessionStorage.getItem('mix_conversation_id')
      this.lastGeneratedMixins = JSON.parse(sessionStorage.getItem('last_generated_mixins')) || []
      this.$nextTick(() => {
        this.scrollToBottom()
        if (this.mix_chats.length > 0 && !this.isNewChat) {
          const chatEl = this.$refs.textareaRef.$el.querySelector('textarea')
          chatEl.addEventListener('scroll', this.handleChatScroll);
        }
      })

      let smart_generate_setting = JSON.parse(sessionStorage.getItem("smart_generate_setting")) || {}
      this.copy_request = smart_generate_setting.copy_require || ''

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
      for (let i = 1; i <= this.copy_list.length; i++) {
        result.push(base + '_' + i);
      }

      return result;
    },
    generate() {
      if (this.copy_list.some(item => item.duration && !item.bgm.id)) {
        this.$alert('混剪失败，请给无文案任务添加背景音乐后重试', '提示')
        return
      }
      let actualRequest = this.requirement
      let names = this.mention_list.map(item => '@' + item.name);
      names.forEach((item, index) => {
        actualRequest = actualRequest.replace(item, `@{${this.material_list[index]}}`)
      })
      let reference_segments = null

      this.isNewChat = false
      this.mix_chats.push({
        role: 'user',
        content: this.requirement || '挑选合适的视频素材即可',
      });
      this.isGenerating = true
      this.$nextTick(() => {
        this.scrollToBottom()
        const chatEl = this.$refs.textareaRef.$el.querySelector('textarea')
        chatEl.addEventListener('scroll', this.handleChatScroll);
      })
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
      this.stream_query(params, 'http://127.0.0.1:6006/figure/video_mix_edit_stream')
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
            this.clearCache()
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
            this.clearCache()
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

      sessionStorage.setItem('copy_list', JSON.stringify(this.copy_list))
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
      if (this.showChecked) {
        this.deleteCheckeds[index] = !this.deleteCheckeds[index]
        this.$forceUpdate()
        return
      }
      this.show_settings = false
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
        if (this.montage_data.length > 0) {
          this.montage_data.splice(index, 1)

          sessionStorage.setItem("montage_data", JSON.stringify(this.montage_data))
          if (this.$refs.videoRef) {
            this.$refs.videoRef.pause()
            this.$refs.audioRef.pause()
            this.isPlaying = false
          }
          if (this.montage_data.length > 0) {
            this.activeIndex = 0
            this.preview_video_url = this.montage_data[0].video_file_path
            this.preview_audio_url = this.montage_data[0].audio_file_path
            this.$nextTick(() => {
              this.loadVideo();
              this.loadAudio()
            })
          } else {
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
    batchRemoveCopy() {
      this.showChecked = true
      this.activeIndex = -1
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
        if (this.montage_data.length > 0) {
          this.montage_data = this.montage_data.filter((item, i) => !this.deleteCheckeds[i]);
          this.deleteCheckeds = []
          this.showChecked = false
          this.$forceUpdate()
          sessionStorage.setItem("montage_data", JSON.stringify(this.montage_data))
          if (this.$refs.videoRef) {
            this.$refs.videoRef.pause()
            this.$refs.audioRef.pause()
            this.isPlaying = false
          }
          if (this.montage_data.length > 0) {
            this.activeIndex = 0
            this.preview_video_url = this.montage_data[0].video_file_path
            this.preview_audio_url = this.montage_data[0].audio_file_path
            this.$nextTick(() => {
              this.loadVideo();
              this.loadAudio()
            })
          } else {
            this.activeIndex = -1
          }
          return
        }
        this.copy_list = this.copy_list.filter((item, i) => !this.deleteCheckeds[i]);
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
      if (this.isGenerating) {
        this.$message.warning('请等待当前混剪完成之后返回')
        return
      }
      this.clearCache()
      sessionStorage.setItem('video_path', '/smartGenerate')
      this.$router.push({path: '/smartGenerate'})
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
  position: relative;
}

.settings-panel {
  width: 396px;
  padding: 19px;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;
  height: 100%;
}

.toggle-btn-open {
  position: absolute;
  top: 50%;
  left: 396px;
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
  left: 400px;
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

.settings-content-area >>> .el-textarea__inner,
.mix-chat-input-new >>> .el-textarea__inner {
  padding: 8px;
  font-size: 14px;
  font-family: "Helvetica Neue", Arial, sans-serif;
  color: #1f2937;
  background-color: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 6px;
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
}

.delete-group-btn {
  padding: 8px !important;
  font-family: "Helvetica Neue", Arial, sans-serif;
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

.highlight-content, .chat-highlight-content {
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

.chat-highlight-content {
  padding: 5px 15px !important;
  border: none !important;
}

.input-layer, .textarea-layer {
  position: relative;
  z-index: 2;
  background-color: transparent;
  color: transparent; /* 让文字看不见 */
  caret-color: black;
}

.input-layer >>> .el-textarea__inner,
.textarea-layer >>> .el-textarea__inner {
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
}

.figure-ratio-slider >>> .el-slider__button-wrapper {
  height: 25px;
}

.figure-ratio-slider >>> .el-slider__runway {
  height: 5px;
  margin: 10px 0;
  border: 1px solid #e4e7ed;
  background-color: #f8fafc;
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

.mix-chat-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 400px;
  box-shadow: 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;
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
  display: flex;
  gap: 8px;
}

.mix-avatar-area {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
}

.mix-chat-system >>> .el-collapse,
.mix-loading-area >>> .el-collapse {
  border: none;
}

.mix-chat-system >>> .el-collapse-item__wrap,
.mix-loading-area >>> .el-collapse-item__wrap {
  background-color: transparent;
  border: none;
}

.mix-chat-system >>> .el-collapse-item__header,
.mix-loading-area >>> .el-collapse-item__header {
  height: 24px;
  line-height: 24px;
  background-color: transparent;
  border: none;
}

.mix-chat-system >>> .el-collapse-item__arrow,
.mix-loading-area >>> .el-collapse-item__arrow {
  margin: 0 10px;
  font-weight: bold;
}

.mix-chat-system >>> .el-collapse-item__content,
.mix-loading-area >>> .el-collapse-item__content {
  padding-bottom: 0;
}

.mix-chat-system-label {
  color: #3b82f6;
  font-weight: bold;
  font-size: 12px;
  line-height: 24px;
}

.mix-chat-system-content {
  margin-top: 8px;
  background: linear-gradient(to right, #f1eaff, #fff 45.34%);
  width: 225px;
  border: 1px solid #0003;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  padding: 8px 10px;
  box-sizing: border-box;
  position: relative;
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
  word-break: break-word;
  overflow-wrap: break-word;
}

.mix-loading-content {
  width: 300px;
  background-color: #eff6ff;
  padding: 10px;
  box-shadow: 0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border-radius: 8px;
  display: flex;
  gap: 8px;
}

.mix-loading-area {
  width: 260px;
}

.loading-area-icon {
  font-size: 13px;
  color: #303133;
  font-weight: bold;
  margin-left: 5px;
}

.loading-area-text {
  color: #4b5563;
  font-size: 13px;
  line-height: 20px;
  font-style: italic;
  word-break: break-word;
  overflow-wrap: break-word;
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
  margin: 4px;
  cursor: pointer;
}

.chat-text-area {
  background-color: #f9f9f9;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
}

.chat-text-area >>> .el-textarea__inner {
  background-color: transparent;
  border: none !important;
}

.chat-text-area:focus-within {
  outline: none;
  background: white;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.chat-text-area >>> .el-textarea__inner:focus {
  outline: none;
  background: transparent;
  box-shadow: none;
}

.mix-send-placeholder {
  color: #6b7280;
  font-size: 10px;
  text-align: right;
}
</style>