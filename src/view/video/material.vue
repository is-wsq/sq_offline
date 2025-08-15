<template>
  <div class="material"
       @mousedown="startSelection"
       @mousemove="updateSelection"
       @mouseup="endSelection"
       @mouseleave="endSelection">
    <!-- 选框元素 -->
    <div v-if="isSelecting" class="selection-box"
         :style="{
            left: `${selectionLeft}px`,
            top: `${selectionTop}px`,
            width: `${selectionWidth}px`,
            height: `${selectionHeight}px`
         }">
    </div>
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="back">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="material-h-t">素材选择</div>
      <div style="width: 36px"></div>
    </div>
    <div class="material-content">
      <div class="c-left">
        <div style="line-height: 40px;font-weight: bold;margin-left: 15px">素材库</div>
        <div class="library">
          <el-collapse v-model="activeName" accordion>
            <el-collapse-item title="素材(快捷键: Ctrl + A 全选, Ctrl + Z 取消选中)" name="1">
              <div class="filter-content" @mousedown.stop="">
                <el-input prefix-icon="el-icon-search" placeholder="输入素材名称、标签匹配搜索" clearable
                          class="filter-input" v-model="filter_text" @change="filterMaterials"></el-input>
              </div>
              <div style="display: flex;flex-direction: column;height: calc(100vh - 280px)">
                <div style="display: flex">
                  <div class="tags" :class="{'show-tags': showFullTags }">
                    <el-tag v-for="(tag, index) in tags" :key="index" size="small" class="tag"
                            :class="{ 'tag-active': activeTags.includes(tag) }" @click="selectTag(tag)">
                      {{ tag }}
                    </el-tag>
                  </div>
                  <i class="el-icon-arrow-right full-tags-icon" slot="reference"
                     v-if="!showFullTags" @click="showFullTags = true"></i>
                  <i class="el-icon-arrow-down full-tags-icon" slot="reference"
                     v-else @click="showFullTags = false"></i>
                </div>
                <div class="m-card" ref="videoGrid">
                  <div class="m-item" v-for="item in filter_materials" :key="item.id"
                       @mousedown="onVideoItemMouseDown"
                       @click="selectMaterial(item, $event)"
                       ref="videoItems">
                    <el-image class="m-item-img" :class="{'m-img-selected': material_list.includes(item.id) }"
                              :src="item.picture" fit="cover" lazy :scroll-container="$refs.videoGrid"></el-image>
                    <div class="flex-center">
                      <div class="m-item-title" :class="{'m-title-selected': material_list.includes(item.id) }"
                           :title="item.name">{{ item.name }}
                      </div>
                      <i class="el-icon-shengyin_fill"
                         style="font-size: 16px; color: #6286ed;"
                         @click.stop="addMute(item.id)"
                         v-if="!mute_materials.includes(item.id)">
                      </i>
                      <i class="el-icon-jingyin_fill"
                         style="font-size: 16px; color: #6286ed;"
                         @click.stop="removeMute(item.id)"
                         v-else>
                      </i>
                    </div>
                  </div>
                </div>
              </div>
            </el-collapse-item>
            <el-collapse-item name="2">
              <template slot="title">
                <el-checkbox style="margin-right: 5px" v-model="defaultSelectFigure" @change="handleFigureSelect"></el-checkbox>数字人
              </template>
              <div class="filter-content" @mousedown.stop="">
                <el-input prefix-icon="el-icon-search" placeholder="输入素材名称、标签匹配搜索" clearable
                          class="filter-input" v-model="figure_filter_text" @change="filterFigure"></el-input>
              </div>
              <div style="max-height: calc(100vh - 320px);display: flex">
                <div class="m-card">
                  <div class="m-item" v-for="item in filter_figures" :key="item.id" @click="selectFigure(item)">
                    <el-image class="m-item-img" :class="{'m-img-selected': item.id === figure.id }"
                              :src="item.picture" fit="cover"></el-image>
                    <div style="display: flex">
                      <div class="m-item-title" :class="{'m-title-selected': item.id === figure.id }"
                           :title="item.name">{{ item.name }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="loop-group">
                <div class="font-weight" style="font-size: 14px;line-height: 25px;margin-bottom: 4px">
                  视频播放完后拼接规则
                </div>
                <el-radio-group v-model="reverse" @input="saveReverse">
                  <el-radio :label="false">
                    从头循环播放
                    <el-popover placement="right" trigger="hover">
                      <video style="width: 160px" :src="require('/public/video/forward.mp4')" loop muted autoplay></video>
                      <i slot="reference" class="el-icon-question" style="color: #909399"></i>
                    </el-popover>
                  </el-radio>
                  <el-radio :label="true">
                    倒放内容拼接
                    <el-popover placement="right" trigger="hover">
                      <video style="width: 160px" :src="require('/public/video/reverse.mp4')" loop muted autoplay></video>
                      <i slot="reference" class="el-icon-question" style="color: #909399"></i>
                    </el-popover>
                  </el-radio>
                </el-radio-group>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
      <div class="c-center">
        <div class="c-center-preview">
          <div class="c-center-preview-content">
            <div class="c-preview-setting"
                 ref="container"
                 @mousemove="onMouseMove"
                 @mousedown.stop=""
                 @mouseup="onMouseUp"
                 @mouseleave="onMouseUp">
              <el-image style="width: 100%;border-radius: 8px" :src="mentionList[0].picture"
                        fit="contain" v-if="mentionList[0]"></el-image>
              <div style="width: 360px;height: 640px" v-else></div>
              <div class="c-preview-title"
                   ref="titleContainer"
                   :style="titleTextStyle"
                   v-if="withTitle"
                   @mousedown="onMouseDown('top', $event)">
                示例标题
              </div>
              <div class="c-preview-content"
                   ref="contentContainer"
                   :style="textStyle"
                   v-if="withSubtitle"
                   @mousedown="onMouseDown('bottom', $event)">
                示例字幕
              </div>
            </div>
          </div>
        </div>
        <div class="c-center-btn">
          <el-button type="primary" class="next-btn" @click="nextStep">
            {{ nextType.includes('montage') ? '下一步：编辑文案' : '下一步：一键混剪' }}
          </el-button>
        </div>
      </div>
      <div class="c-right" @mousedown.stop="">
        <div class="margin-b-12 font-weight">样式设置</div>
        <div class="s-card" ref="styleCard">
          <div class="s-card-item margin-b-16">
            <div class="margin-b-12 font-weight" style="font-size: 15px">音频</div>
            <div style="display: flex" @mousedown.stop="">
              <div class="s-voice-title" style="margin-top: 5px">主播声音</div>
              <el-popover ref="modePopoverRef" placement="bottom-start" trigger="click">
                <div class="mode-popover-item" @click="saveMode('common')">
                  普通模式
                  <i class="el-icon-check mode-select" v-if="mode === 'common'"></i>
                </div>
                <div class="mode-popover-item" @click="saveMode('advanced')">
                  高级模式
                  <i class="el-icon-check mode-select" v-if="mode === 'advanced'"></i>
                </div>
                <div slot="reference" class="mode-switch">
                  {{ mode === 'common' ? '普通模式' : '高级模式' }}
                  <i class="el-icon-arrow-down"></i>
                </div>
              </el-popover>
              <div class="mode-info" v-if="mode === 'advanced'">
                <i class="el-icon-info" style="font-size: 16px;margin-right: 5px"></i>
                高级模式将调用云端接口并计费
              </div>
            </div>
            <div class="s-voice-content margin-b-16">
              <div class="s-voice-btn">
                <i class="el-icon-play" @click="previewAudio(sound, -1)" v-if="audioIndex !== -1"></i>
                <i class="el-icon-pause" @click="stopAudio" v-else></i>
              </div>
              <el-popover ref="voiceRef" placement="bottom" trigger="click" @hide="stopAudio" style="flex: 1">
                <div class="popover-content">
                  <el-row>
                    <el-col :span="12" v-for="(voice, index) in mode === 'common'? voices : minimax_voices" :key="voice.id">
                      <div class="voice-item" :class="{ active: voice.id === sound.id }" @click="selectVoice(voice)">
                        <div class="voice-icon" @click="previewAudio(voice, index)" v-if="audioIndex !== index">
                          <i class="el-icon-play" style="font-size: 13px; color: #6286ed"></i>
                        </div>
                        <div class="voice-icon" @click="stopAudio" v-else>
                          <i class="el-icon-pause" style="font-size: 13px; color: #6286ed"></i>
                        </div>
                        <div class="voice-name" :title="voice.name">{{ voice.name }}</div>
                      </div>
                    </el-col>
                  </el-row>
                </div>
                <div class="s-voice-name" slot="reference" :title="sound.name">{{ sound.name }}</div>
              </el-popover>
            </div>
            <div class="s-voice-title">背景声音</div>
            <div class="s-voice-content" @mousedown.stop="">
              <div class="s-voice-btn">
                <i class="el-icon-play" @click="previewBGM" v-if="audioIndex !== -2"></i>
                <i class="el-icon-pause" @click="stopAudio" v-else></i>
              </div>
              <el-popover ref="bgmRef" placement="bottom" trigger="click" @hide="stopAudio" style="flex: 1">
                <div class="popover-content">
                  <el-row>
                    <el-col :span="12">
                      <div class="voice-item">
                        <el-upload
                            action="http://127.0.0.1:6006/bgm/upload"
                            :show-file-list="false"
                            accept=".mp3, .wav"
                            :on-success="bgmUploadSuccess">
                          <div style="display: flex;align-items: center;height: 80px;">
                            <div class="voice-icon" style="background-color: pink !important">
                              <i class="el-icon-plus" style="font-size: 15px; color: red"></i>
                            </div>
                            <div class="voice-name" style="text-align: left">上传背景音乐</div>
                          </div>
                        </el-upload>
                      </div>
                    </el-col>
                    <el-col :span="12" v-for="(item, index) in bgmList" :key="item.id">
                      <div class="voice-item" :class="{ active: item.id === bgm.id }" @click="selectBgm(item)">
                        <div class="voice-icon"
                             @click="previewAudio(item, 10000 + index)"
                             v-if="audioIndex !== (10000 + index)">
                          <i :class="item.isPlay ? 'el-icon-pause' : 'el-icon-play'"
                             style="font-size: 13px; color: #6286ed">
                          </i>
                        </div>
                        <div class="voice-icon" @click="stopAudio" v-else>
                          <i class="el-icon-pause" style="font-size: 13px; color: #6286ed"></i>
                        </div>
                        <div class="voice-name" :title="item.name">{{ item.name }}</div>
                      </div>
                    </el-col>
                  </el-row>
                </div>
                <div class="s-voice-name" slot="reference" :title="bgm.name">{{ bgm.name }}</div>
              </el-popover>
              <template v-if="bgm.id">
                <div class="s-voice-title volume">音量</div>
                <div class="s-btn-volume">
                  <el-slider v-model="bg_volume" :step="0.1" style="width: 80px" :min="0.1" :max="1"
                             @change="saveBgmVolume('bg_volume')" :format-tooltip="formatTooltip"></el-slider>
                </div>
              </template>
            </div>
          </div>
          <div class="s-card-item margin-b-16">
            <el-collapse v-model="sub_expands">
              <el-collapse-item name="sub_title">
                <div slot="title">
                  <el-checkbox style="margin-right: 5px" v-model="withTitle" @change="switchTitle"></el-checkbox>口播标题
                </div>
                <div class="flex-center margin-b-12">
                  <div class="s-voice-title" style="flex: 1">展示方式</div>
                  <el-radio v-model="show_model" label="begin" @input="saveShowModel">仅开头展示</el-radio>
                  <el-radio v-model="show_model" label="full" @input="saveShowModel">全程展示</el-radio>
                </div>
                <div class="flex-center margin-b-8">
                  <div class="s-voice-title" style="flex: 1">预设样式</div>
                </div>
                <div style="position: relative;padding-bottom: 10px">
                  <div class="preset-group" :class="{'show-all-preset': showAllTitlePreset}">
                    <div class="preset-style"
                         v-for="item in titlePresets"
                         :key="item.id"
                         @click="selectTitlePreset(item)"
                         :style="{
                     backgroundColor: item.backgroundColor,
                     color: item.color,
                     '-webkit-text-stroke': '0.5px' + item.stroke,
                     border: activeTitlePresetId === item.id ? '2px solid #00c1cd' : 'none'
                   }">
                      T
                    </div>
                  </div>
                  <div v-if="!showAllTitlePreset" class="preset-full-mask" title="点击展开"
                       @click="showAllTitlePreset = true">
                    <i class="el-icon-caret-bottom" style="color: #b3b3b3;font-size: 17px"></i>
                  </div>
                  <div v-if="showAllTitlePreset" class="preset-not-full-mask" title="点击收起"
                       @click="showAllTitlePreset = false">
                    <i class="el-icon-caret-top" style="color: #b3b3b3;font-size: 17px"></i>
                  </div>
                </div>
                <div class="flex-center margin-t-8">
                  <div class="s-voice-title" style="flex: 1;display: flex;align-items: center">
                    <div style="margin-right: 10px">字体</div>
                    <el-select v-model="subtitleNameParams.name_font" placeholder="请选择" style="width: 180px"
                               @change="saveSubtitleNameParams('name_font')" class="font-select">
                      <el-option
                          v-for="item in fontFamily"
                          :key="item.id"
                          :label="item.name"
                          :value="item.font_id"
                          style="line-height: 52px;height: 52px">
                        <div style="display: flex; align-items: center">
                          <img :src="item.img_path" style="width: 150px; height: 50px; margin-right: 8px;"/>
                          <span>{{ item.name }}</span>
                        </div>
                      </el-option>
                    </el-select>
                  </div>
                  <div class="s-voice-title" style="display: flex;align-items: center">
                    <div>字号</div>
                    <el-input-number class="input-number"
                                     v-model="subtitleNameParams.name_fontsize"
                                     controls-position="right"
                                     :min="5"
                                     :max="50"
                                     @change="saveSubtitleNameParams('name_fontsize')"
                                     style="margin-left: 10px;width: 80px !important;">
                    </el-input-number>
                  </div>
                </div>
                <div class="flex-center margin-t-8">
                  <div class="s-voice-title" style="flex: 1">字体颜色</div>
                  <el-popover
                      placement="left"
                      trigger="click">
                    <div style="margin: -12px">
                      <custom-color-picker :color="subtitleNameParams.name_color" @color-updated="handleNameColorUpdated"></custom-color-picker>
                    </div>
                    <div slot="reference" class="color-box" :style="{background: subtitleNameParams.name_color}"></div>
                  </el-popover>
                </div>
                <div class="flex-center margin-t-12 margin-b-8">
                  <div class="s-voice-title" style="flex: 1">描边颜色</div>
                  <el-popover
                      placement="left"
                      trigger="click">
                    <div style="margin: -12px">
                      <custom-color-picker :color="subtitleNameParams.name_stroke_color" @color-updated="handleNameStrokeColorUpdated"></custom-color-picker>
                    </div>
                    <div slot="reference" class="color-box" :style="{background: subtitleNameParams.name_stroke_color}"></div>
                  </el-popover>
                </div>
                <div class="flex-center opacity margin-t-8">
                  <div class="s-voice-title" style="margin-right: 12px">字体不透明度</div>
                  <el-slider v-model="subtitleNameParams.title_font_opacity"
                             :step="0.01" style="flex: 1" :min="0" :max="1"
                             @input="saveSubtitleNameParams('title_font_opacity')">
                  </el-slider>
                  <div class="s-voice-title" style="margin-left: 8px;width: 40px">
                    {{ (subtitleNameParams.title_font_opacity * 100).toFixed(0) + '%' }}
                  </div>
                </div>
                <div class="flex-center back-checkbox"
                     :class="{'margin-b-16': name_background_setting}"
                     style="cursor: pointer"
                     @click="name_background_setting = !name_background_setting">
                  <el-checkbox v-model="name_use_background" @change="switchNameUseBackground" style="line-height: 13px;"></el-checkbox>
                  <div class="s-voice-title" style="flex: 1;line-height: 22px;">背景</div>
                  <i class="el-icon-arrow-down" style="color: #374151" v-if="name_background_setting"></i>
                  <i class="el-icon-arrow-right" style="color: #374151" v-else></i>
                </div>
                <div class="flex-center margin-b-12 bg-color" v-if="name_background_setting">
                  <div class="s-voice-title" style="margin-right: 12px">颜色</div>
                  <el-popover
                      placement="left"
                      trigger="click">
                    <div style="margin: -12px">
                      <custom-color-picker :color="subtitleNameParams.name_background_color" @color-updated="handleNameBackgroundColorUpdated"></custom-color-picker>
                    </div>
                    <div slot="reference" class="color-box" :style="{background: subtitleNameParams.name_background_color}"></div>
                  </el-popover>
                  <div style="flex: 1"></div>
                </div>
                <div class="flex-center opacity" v-if="name_background_setting">
                  <div class="s-voice-title" style="margin-right: 12px">不透明度</div>
                  <el-slider v-model="subtitleNameParams.name_background_opacity"
                             :step="0.01" style="flex: 1" :min="0" :max="1"
                             @input="saveSubtitleNameParams('name_background_opacity')">
                  </el-slider>
                  <div class="s-voice-title" style="margin-left: 8px;width: 40px">
                    {{ (subtitleNameParams.name_background_opacity * 100).toFixed(0) + '%' }}
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
          <div class="s-card-item">
            <el-collapse v-model="sub_expands">
              <el-collapse-item name="sub_content">
                <div slot="title">
                  <el-checkbox style="margin-right: 5px" v-model="withSubtitle" @change="switchSubtitle"></el-checkbox>口播内容
                </div>
                <div class="flex-center">
                  <div class="s-voice-title" style="flex: 1;display: flex">预设样式</div>
                </div>
                <div style="position: relative;padding-bottom: 10px">
                  <div class="preset-group" :class="{'show-all-preset': showAllContentPreset}">
                    <div class="preset-style"
                         v-for="item in titlePresets"
                         :key="item.id"
                         @click="selectPreset(item)"
                         :style="{
                         backgroundColor: item.backgroundColor,
                         color: item.color,
                         '-webkit-text-stroke': '0.5px' + item.stroke,
                         border: activePresetId === item.id ? '2px solid #00c1cd' : 'none'
                       }">
                      T
                    </div>
                  </div>
                  <div v-if="!showAllContentPreset" class="preset-full-mask" title="点击展开"
                       @click="showAllContentPreset = true">
                    <i class="el-icon-caret-bottom" style="color: #b3b3b3;font-size: 17px"></i>
                  </div>
                  <div v-if="showAllContentPreset" class="preset-not-full-mask" title="点击收起"
                       @click="showAllContentPreset = false">
                    <i class="el-icon-caret-top" style="color: #b3b3b3;font-size: 17px"></i>
                  </div>
                </div>
                <div class="flex-center margin-t-8">
                  <div class="s-voice-title" style="flex: 1;display: flex;align-items: center">
                    <div style="margin-right: 10px">字体</div>
                    <el-select v-model="subtitleParams.font" placeholder="请选择" style="width: 180px"
                               @change="saveSubtitleParams('font')" popper-class="font-select">
                      <el-option
                          v-for="item in fontFamily"
                          :key="item.font_id"
                          :label="item.name"
                          :value="item.font_id"
                          style="line-height: 52px;height: 52px">
                        <div style="display: flex; align-items: center">
                          <img :src="item.img_path" style="width: 150px; height: 50px; margin-right: 8px;"/>
                          <span>{{ item.name }}</span>
                        </div>
                      </el-option>
                    </el-select>
                  </div>
                  <div class="s-voice-title" style="display: flex;align-items: center">
                    <div>字号</div>
                    <el-input-number class="input-number"
                                     v-model="subtitleParams.fontsize"
                                     controls-position="right"
                                     :min="5"
                                     :max="50"
                                     @change="saveSubtitleParams('fontsize')"
                                     style="margin-left: 10px;width: 80px !important;">
                    </el-input-number>
                  </div>
                </div>
                <div class="flex-center margin-t-8">
                  <div class="s-voice-title" style="flex: 1">字体颜色</div>
                  <el-popover
                      placement="left"
                      trigger="click">
                    <div style="margin: -12px">
                      <custom-color-picker :color="subtitleParams.color" @color-updated="handleColorUpdated"></custom-color-picker>
                    </div>
                    <div slot="reference" class="color-box" :style="{background: subtitleParams.color}"></div>
                  </el-popover>
                </div>
                <div class="flex-center margin-t-12 margin-b-8">
                  <div class="s-voice-title" style="flex: 1">描边颜色</div>
                  <el-popover
                      placement="left"
                      trigger="click">
                    <div style="margin: -12px">
                      <custom-color-picker :color="subtitleParams.stroke_color" @color-updated="handleStrokeColorUpdated"></custom-color-picker>
                    </div>
                    <div slot="reference" class="color-box" :style="{background: subtitleParams.stroke_color}"></div>
                  </el-popover>
                </div>
                <div class="flex-center opacity margin-t-8">
                  <div class="s-voice-title" style="margin-right: 12px">字体不透明度</div>
                  <el-slider v-model="subtitleParams.content_font_opacity"
                             :step="0.01" style="flex: 1" :min="0" :max="1"
                             @input="saveSubtitleParams('content_font_opacity')">
                  </el-slider>
                  <div class="s-voice-title" style="margin-left: 8px;width: 40px">
                    {{ (subtitleParams.content_font_opacity * 100).toFixed(0) + '%' }}
                  </div>
                </div>
                <div class="flex-center back-checkbox"
                     :class="{'margin-b-16': background_setting}"
                     style="cursor: pointer"
                     @click="background_setting = !background_setting">
                  <el-checkbox v-model="use_background" @change="switchUseBackground" style="line-height: 13px;"></el-checkbox>
                  <div class="s-voice-title" style="flex: 1;line-height: 22px;">背景</div>
                  <i class="el-icon-arrow-down" style="color: #374151" v-if="background_setting"></i>
                  <i class="el-icon-arrow-right" style="color: #374151" v-else></i>
                </div>
                <div class="flex-center margin-b-12 bg-color" v-if="background_setting">
                  <div class="s-voice-title" style="margin-right: 12px">颜色</div>
                  <el-popover
                      placement="left"
                      trigger="click">
                    <div style="margin: -12px">
                      <custom-color-picker :color="subtitleParams.background_color" @color-updated="handleBackgroundColorUpdated"></custom-color-picker>
                    </div>
                    <div slot="reference" class="color-box" :style="{background: subtitleParams.background_color}"></div>
                  </el-popover>
                  <div style="flex: 1"></div>
                </div>
                <div class="flex-center opacity" v-if="background_setting">
                  <div class="s-voice-title" style="margin-right: 12px">不透明度</div>
                  <el-slider v-model="subtitleParams.background_opacity"
                             :step="0.01" style="flex: 1" :min="0" :max="1"
                             @input="saveSubtitleParams('background_opacity')">
                  </el-slider>
                  <div class="s-voice-title" style="margin-left: 8px;width: 40px">
                    {{ (subtitleParams.background_opacity * 100).toFixed(0) + '%' }}
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {getAction} from "@/api/api";
import {EnhancedChoiceMixin} from "@/mixins/EnhancedChoiceMixin";
import Video from "@/view/video/index.vue";
import CustomColorPicker from "@/components/CustomColorPicker.vue";

export default {
  name: 'Material',
  components: {CustomColorPicker, Video},
  mixins: [EnhancedChoiceMixin],
  data() {
    return {
      sub_expands: [],
      mode: 'common',
      activeName: '1',
      figure_filter_text: '',
      figures: [],
      filter_figures: [],
      figure: {},
      defaultSelectFigure: false,
      reverse: false,

      filter_text: '',

      tags: [],
      activeTags: ['全部'],
      select_tags: [],
      showFullTags: false,

      materials: [],
      filter_materials: [],
      material_list: [],
      mute_materials: [],
      withTitle: true,
      show_model: 'begin',
      subtitleNameParams: {
        name_background_opacity: 0.6,
        title_font_opacity: 1,
      },
      name_use_background: false,
      name_background_setting: false,
      withSubtitle: true,
      subtitleParams: {
        background_opacity: 0.6,
        content_font_opacity: 1
      },
      use_background: false,
      background_setting: false,
      titlePresets: [
        {
          id: '1',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: '#404040',
          stroke: '#000000',
          color: '#ffffff'
        },
        {
          id: '2',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: '#404040',
          stroke: '#ffffff',
          color: '#000000'
        },
        {
          id: '3',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: '#404040',
          stroke: '#000000',
          color: '#ffde00'
        },
        {
          id: '4',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: '#404040',
          stroke: '#fe8a80',
          color: '#ffffff'
        },
        {
          id: '5',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: '#c8c8c8',
          stroke: '#000000',
          color: '#b7dcf6'
        },
        {
          id: '6',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: '#c8c8c8',
          stroke: '#ff619d',
          color: '#ffd9e8'
        },
        {
          id: '7',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: '#c8c8c8',
          stroke: '#469df3',
          color: '#c0f1f5'
        },
        {
          id: '8',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: '#c8c8c8',
          stroke: '#3c5c37',
          color: '#c3cf47'
        },
        {
          id: '9',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: '#c8c8c8',
          stroke: '#465773',
          color: '#90c2cd'
        },
        {
          id: '10',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: '#c8c8c8',
          stroke: '#ff1837',
          color: '#ffffff'
        },
        {
          id: '11',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: '#c8c8c8',
          stroke: '#ffffff',
          color: '#ab4a37'
        },
        {
          id: '12',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: '#c8c8c8',
          stroke: '#4a4238',
          color: '#f9f3c4'
        },
        {
          id: '13',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: '#c8c8c8',
          stroke: '#a74f59',
          color: '#ffd9c6'
        }
      ],
      activeTitlePresetId: '1',
      activePresetId: '1',
      fontFamily: [],
      voices: [],
      minimax_voices: [],
      sound: {},
      bgmList: [],
      bgm: {},
      bg_volume: 0.3,
      previousVolume: 0.3,
      audio: null,
      audioIndex: null,
      titleTextStyle: {},
      textStyle: {},
      dragging: false,
      draggingType: '',
      startY: 0,
      contentHeight: 640,
      topRatio: 0.25,
      bottomRatio: 0.75,

      nextType: 'montage',
      showAllTitlePreset: false,
      showAllContentPreset: false,

      resizeObserver: null
    }
  },
  watch: {
    filter_materials() {
      this.$nextTick(() => {
        const scrollContainer = this.$refs.videoGrid;
        if (scrollContainer) {
          scrollContainer.dispatchEvent(new Event('scroll'));
        }
      });
    }
  },
  computed: {
    mentionList() {
      return this.materials.filter(item => this.material_list.includes(item.id))
          .sort((a, b) => this.material_list.indexOf(a.id) - this.material_list.indexOf(b.id))
    },
  },
  mounted() {
    this.queryMaterials();
    this.queryFigures();
    this.mode = sessionStorage.getItem('setting_mode') || 'common'
    this.querySounds();
    this.queryMiniMaxVoices()
    this.queryBgm();
    this.queryFontFamily();
    this.initParams()
    window.addEventListener('keydown', this.handleKeyDown);
    this.$nextTick(() => {
      const container = this.$refs.videoGrid;
      if (container) {
        this.resizeObserver = new ResizeObserver(() => {
          container.dispatchEvent(new Event('scroll'));
        });
        this.resizeObserver.observe(container);
      }
    });
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    if (this.resizeObserver && this.$refs.videoGrid) {
      this.resizeObserver.unobserve(this.$refs.videoGrid);
      this.resizeObserver.disconnect();
    }
  },
  methods: {
    handleKeyDown(event) {
      if (event.ctrlKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        this.selectAllMaterials();
      }
      if (event.ctrlKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        this.clearAllSelectMaterials()
        this.filterMaterials()
      }
    },
    clearAllSelectMaterials() {
      this.material_list = []
      sessionStorage.setItem('material_list', JSON.stringify(this.material_list))
    },
    selectAllMaterials() {
      if (this.material_list.length === 0) {
        this.$alert('全选操作只针对于同尺寸、同店铺的素材，请先选择至少一个素材后使用', 'Ctrl + A 全选')
        return;
      }
      this.material_list = this.filter_materials.map(item => item.id)
      sessionStorage.setItem('material_list', JSON.stringify(this.material_list))
    },
    popoverShow() {
      this.$nextTick(() => {
        let popover = document.querySelector('.full-popover');
        if (popover) {
          popover.style.marginTop = '0';
        }
      });
    },
    selectTag(tag) {
      if (tag === '全部') {
        this.activeTags = ['全部'];
      } else {
        if (this.activeTags.includes('全部')) {
          this.activeTags = [tag];
        } else if (this.activeTags.includes(tag)) {
          this.activeTags = this.activeTags.filter(t => t !== tag);
          if (this.activeTags.length === 0) this.activeTags = ['全部'];
        } else {
          this.activeTags.push(tag);
        }
      }
      sessionStorage.setItem('active_tags', JSON.stringify(this.activeTags));
      this.filterMaterials();
    },
    filterFigure() {
      let filteredItems = this.figures;
      if (this.figure_filter_text) {
        filteredItems = filteredItems.filter(item => item.name.includes(this.figure_filter_text));
      }
      this.filter_figures = filteredItems;
    },
    selectFigure(item) {
      this.figure = this.figure.id === item.id ? {} : item
      this.defaultSelectFigure = !!this.figure.id;
      sessionStorage.setItem('material_figure', JSON.stringify(this.figure))
    },
    handleFigureSelect() {
      this.activeName = '2'
      if (this.defaultSelectFigure) {
        this.figure = this.filter_figures.length > 0? this.filter_figures[0] : {}
      } else {
        this.figure = {}
      }
      sessionStorage.setItem('material_figure', JSON.stringify(this.figure))
    },
    formatTooltip(val) {
      return val * 100 + '%';
    },
    addMute(id) {
      this.mute_materials.push(id)
      sessionStorage.setItem("mute_materials", JSON.stringify(this.mute_materials))
    },
    removeMute(id) {
      this.mute_materials = this.mute_materials.filter(item => item !== id)
      sessionStorage.setItem("mute_materials", JSON.stringify(this.mute_materials))
    },
    initParams() {
      this.nextType = sessionStorage.getItem('next_type') || 'montage'

      // this.material_list = JSON.parse(sessionStorage.getItem('material_list')) || []
      this.mute_materials = JSON.parse(sessionStorage.getItem('mute_materials')) || []

      this.reverse = sessionStorage.getItem("setting_reverse") === 'true'

      this.contentHeight = Number(sessionStorage.getItem('content_height')) || 640
      this.topRatio = Number(sessionStorage.getItem('top_offset_ratio')) || 0.25
      this.bottomRatio = Number(sessionStorage.getItem('bottom_offset_ratio')) || 0.75

      this.withSubtitle = sessionStorage.getItem("with_subtitle") === 'true'
      this.withTitle = sessionStorage.getItem("with_title") === 'true'

      this.sub_expands = [
        ...(this.withTitle ? ['sub_title'] : []),
        ...(this.withSubtitle ? ['sub_content'] : [])
      ];

      this.show_model = sessionStorage.getItem("show_model") || 'begin'
      this.bg_volume = Number(sessionStorage.getItem("bg_volume")) || 0.3

      this.use_background = sessionStorage.getItem("use_background") === 'true'
      this.name_use_background = sessionStorage.getItem("name_use_background") === 'true'
      this.activePresetId = sessionStorage.getItem("preset_id") || '1'
      this.subtitleParams.fontsize = parseInt(sessionStorage.getItem("fontsize")) || 5
      this.subtitleParams.color = sessionStorage.getItem("color") || '#ffffff'
      this.subtitleParams.font = sessionStorage.getItem("font") || 'SJxingkai-C-Regular'
      this.subtitleParams.background_color = sessionStorage.getItem("background_color") || '#404040'
      this.subtitleParams.background_opacity = Number(sessionStorage.getItem("background_opacity")) || 0.6
      this.subtitleParams.content_font_opacity = Number(sessionStorage.getItem("content_font_opacity")) || 1
      this.subtitleParams.stroke_color = sessionStorage.getItem("stroke_color") || '#000000'

      let rgb_color = this.hexToRgb(this.subtitleParams.background_color)
      let rgba_color = `rgba(${rgb_color.replace('rgb(', '')
          .replace(')', '')}, ${this.subtitleParams.background_opacity})`

      let text_rgb_color = this.hexToRgb(this.subtitleParams.color)
      let text_rgba_color = `rgba(${text_rgb_color.replace('rgb(', '')
          .replace(')', '')}, ${this.subtitleParams.content_font_opacity})`

      this.textStyle = {
        backgroundColor: this.use_background ? rgba_color : '',
        color: text_rgba_color,
        fontFamily: this.subtitleParams.font,
        lineHeight: 1,
        '-webkit-text-stroke': `0.5px ${this.subtitleParams.stroke_color}`,
        fontSize: (360 * this.subtitleParams['fontsize'] / 100) + 'px',
        top: this.bottomRatio * this.contentHeight + 'px'
      }

      this.activeTitlePresetId = sessionStorage.getItem("title_preset_id") || '1'
      this.subtitleNameParams.name_fontsize = parseInt(sessionStorage.getItem("name_fontsize")) || 10
      this.subtitleNameParams.name_color = sessionStorage.getItem("name_color") || '#ffffff'
      this.subtitleNameParams.name_font = sessionStorage.getItem("name_font") || 'SJxingkai-C-Regular'
      this.subtitleNameParams.name_background_color = sessionStorage.getItem("name_background_color") || '#404040'
      this.subtitleNameParams.name_background_opacity = Number(sessionStorage.getItem("name_background_opacity")) || 0.6
      this.subtitleNameParams.title_font_opacity = Number(sessionStorage.getItem("title_font_opacity")) || 1
      this.subtitleNameParams.name_stroke_color = sessionStorage.getItem("name_stroke_color") || '#000000'

      let name_rgb_color = this.hexToRgb(this.subtitleNameParams.name_background_color)
      let name_rgba_color = `rgba(${name_rgb_color.replace('rgb(', '')
          .replace(')', '')}, ${this.subtitleNameParams.name_background_opacity})`

      let font_rgb_color = this.hexToRgb(this.subtitleNameParams.name_color)
      let font_rgba_color = `rgba(${font_rgb_color.replace('rgb(', '')
          .replace(')', '')}, ${this.subtitleNameParams.title_font_opacity})`

      this.titleTextStyle = {
        backgroundColor: this.name_use_background ? name_rgba_color : '',
        color: font_rgba_color,
        fontFamily: this.subtitleNameParams.name_font,
        lineHeight: 1,
        '-webkit-text-stroke': `0.5px ${this.subtitleNameParams.name_stroke_color}`,
        fontSize: (360 * this.subtitleNameParams.name_fontsize / 100) + 'px',
        top: this.topRatio * this.contentHeight + 'px'
      }
    },
    saveReverse() {
      sessionStorage.setItem('setting_reverse', this.reverse)
    },
    queryMaterials() {
      getAction("/figure/query_success", {video_type: 'material'}).then((res) => {
        if (res.data.status === "success") {
          let data = res.data.data.filter(item => item.status === "success");
          if (data.length > 0) {
            this.tags = ['全部', ...new Set(
                data.flatMap(item => item.tag ? item.tag.split(/[,，]/).filter(Boolean) : [])
            )];

            this.activeTags = JSON.parse(sessionStorage.getItem('active_tags')) || ['全部']

            this.materials = data.map(item => ({
              ...item, previewing: false, size: item.height + '*' + item.width
            }))

            let validMaterialsId = this.materials.map(item => item.id);
            this.material_list = (JSON.parse(sessionStorage.getItem('material_list')) || [])
                .filter(id => validMaterialsId.includes(id)); //剔除已经删除掉的素材
            sessionStorage.setItem('material_list', JSON.stringify(this.material_list))

            this.filterMaterials()
          }
        }
      }).catch((error) => {
        console.error("获取角色列表失败:", error);
      });
    },
    queryFigures() {
      getAction("/figure/query_success", {video_type: 'figure'}).then((res) => {
        if (res.data.status === "success") {
          let data = res.data.data.filter(item => item.status === "success")
          this.figures = data.map(item => ({...item, previewing: false}))
          this.filter_figures = this.figures
          let figure = JSON.parse(sessionStorage.getItem('material_figure')) || {}
          let validFiguresId = this.figures.map(item => item.id);
          this.figure = validFiguresId.includes(figure.id) ? figure : {}
          this.defaultSelectFigure = !!this.figure.id
        }
      }).catch((error) => {
        console.error("获取角色列表失败:", error);
      });
    },
    querySounds() {
      getAction("/timbres/get_all_common_timbre").then((res) => {
        if (res.data.status === "success") {
          this.voices = res.data.data;
          if (this.voices.length > 0 && this.mode === 'common') {
            let sound = JSON.parse(sessionStorage.getItem("setting_voice"))
            if (sound && this.voices.some(item => item.id === sound.id)) {
              this.sound = sound
            } else {
              this.sound = this.voices[0];
              sessionStorage.setItem("setting_voice", JSON.stringify(this.sound))
            }
          }
        } else {
          this.$message.error("获取声音列表失败。");
        }
      }).catch((error) => {
        console.error("获取声音列表失败:", error);
      });
    },
    queryMiniMaxVoices() {
      getAction("/timbres/get_all_system_timbres",{voice_mode: 'advanced'}).then((res) => {
        if (res.data.status === "success") {
          this.minimax_voices = res.data.data
          if (this.minimax_voices.length > 0 && this.mode === 'advanced') {
            let sound = JSON.parse(sessionStorage.getItem("setting_voice"))
            if (sound && this.minimax_voices.some(item => item.id === sound.id)) {
              this.sound = sound
            } else {
              this.sound = this.minimax_voices[0];
              sessionStorage.setItem("setting_voice", JSON.stringify(this.sound))
            }
          }
        } else {
          this.$message.error("获取高级声音列表失败。");
        }
      }).catch((error) => {
        console.error("获取高级声音列表失败:", error);
      });
    },
    queryBgm() {
      let bgmList = [{id: '', name: '无'}]
      getAction('/bgm/all').then(res => {
        if (res.data.status === 'success') {
          this.bgmList = bgmList.concat(res.data.data)
          let bgm = JSON.parse(sessionStorage.getItem("setting_bgm"))
          if (bgm && this.bgmList.some(item => item.id === bgm.id)) {
            this.bgm = bgm
          } else {
            this.bgm = this.bgmList[0]
            sessionStorage.setItem("setting_bgm", JSON.stringify(this.bgm))
          }
        } else {
          this.$message.error("获取背景音乐列表失败。");
        }
      }).catch((error) => {
        console.error("获取背景音乐列表失败:", error);
      })
    },
    queryFontFamily() {
      getAction('/get_fonts').then(res => {
        if (res.data.status === 'success') {
          this.fontFamily = res.data.data
        }
      }).catch((error) => {
        console.error("获取字体样式列表失败:", error);
      });
    },
    filterMaterials() {
      let filtered = this.materials;

      if (this.filter_text) { // 关键字筛选
        filtered = filtered.filter(item =>
            item.name.includes(this.filter_text) ||
            (item.tag && item.tag.split(/[,，]/).includes(this.filter_text))
        );
      }

      if (this.material_list.length > 0) { // 素材尺寸、店铺筛选
        let size = this.materials.find(item => item.id === this.material_list[0]).size
        let store_id = this.materials.find(item => item.id === this.material_list[0]).store_id
        filtered = filtered.filter(item => item.size === size && item.store_id === store_id)
      }

      if (this.activeTags[0] !== '全部') {
        filtered = filtered.filter(item => {
          if (!item.tag) return false;
          const itemTags = item.tag.split(/[,，]/).map(tag => tag.trim());
          return itemTags.some(tag => this.activeTags.includes(tag));
        })
      }

      this.filter_materials = filtered;
    },
    selectMaterial(item, event) {
      if (this.isSelecting || !this.isVideoItemClick) {
        event.stopPropagation()
        return
      }
      const isShiftKey = event.shiftKey
      let index = this.filter_materials.indexOf(item)

      if (!isShiftKey) {
        this.selectResource(item)
        this.lastClickedIndex = index
        return
      }

      // Shift点击：处理范围选择
      if (this.lastClickedIndex !== null) {
        // 获取起始和结束索引
        const start = Math.min(this.lastClickedIndex, index)
        const end = Math.max(this.lastClickedIndex, index)

        // 选中范围内的所有项
        for (let i = start; i <= end; i++) {
          this.selectResource(this.filter_materials[i], true)
        }
      } else {
        // 第一次点击并且按住了Shift键，处理方式同普通点击
        this.selectResource(this.filter_materials[index])
      }

      this.lastClickedIndex = index
    },
    selectResource(item, shiftSelect = false) {
      if (!this.material_list.includes(item.id)) {
        this.material_list.push(item.id)
      } else {
        if (shiftSelect) {
          return
        }
        this.material_list.splice(this.material_list.indexOf(item.id), 1)
        if (this.material_list.length === 0) {
          this.lastClickedIndex = null
        }
      }
      this.contentHeight = 640
      if (this.mentionList.length > 0) {
        let material = this.mentionList[0]
        this.contentHeight = material.height / (material.width / 360)
      }
      // this.topRatio = 0.25
      // this.bottomRatio = 0.75
      this.filterMaterials()
      this.updateTextStyle()
      this.updateTitleTextStyle()
      sessionStorage.setItem('material_list', JSON.stringify(this.material_list))
      sessionStorage.setItem('content_height', this.contentHeight)
    },
    saveMode(mode) {
      if (this.mode === mode) {
        return
      }
      this.mode = mode
      if (this.mode === 'common') {
        this.sound = this.voices[0]
      }else {
        this.sound = this.minimax_voices[0]
      }
      this.$refs.modePopoverRef.showPopper = false
      sessionStorage.setItem("setting_voice", JSON.stringify(this.sound))
      sessionStorage.setItem('setting_mode', mode)
    },
    selectVoice(voice) {
      this.sound = voice
      sessionStorage.setItem("setting_voice", JSON.stringify(voice))
      this.$nextTick(() => {
        this.$refs.voiceRef.showPopper = false
      })
    },
    selectBgm(item) {
      this.bgm = item
      sessionStorage.setItem("setting_bgm", JSON.stringify(item))
      this.$nextTick(() => {
        this.$refs.bgmRef.showPopper = false
      })
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
    bgmUploadSuccess(res, file) {
      if (res.status === "success") {
        this.$notify({
          title: "上传提示",
          message: `${file.name}背景音乐上传成功`,
          duration: 20000,
          type: "success",
        });
        this.queryBgm()
      } else {
        this.$notify({
          title: "上传提示",
          message: `${file.name}背景音乐上传失败，${res.data}`,
          duration: 0,
          type: "error",
        });
      }
    },
    saveBgmVolume() {
      if (this.bg_volume !== this.previousVolume) {
        this.previewBGM();
        this.previousVolume = this.bg_volume;
      }
      sessionStorage.setItem("bg_volume", this.bg_volume)
    },
    previewBGM() {
      if (this.bgm.id === '') {
        this.$message.warning("无音频预览");
        return;
      }
      this.stopAudio();

      setTimeout(() => {
        this.audio = new Audio(this.bgm.filepath);
        this.audio.volume = this.bg_volume;
        this.audio.play();
        this.audioIndex = -2;
        this.audio.onended = () => {
          this.audio = null;
          this.audioIndex = null;
        };
      }, 100);
    },
    switchTitle() {
      const hasSubTitle = this.sub_expands.includes('sub_title');
      if (this.withTitle && !hasSubTitle) {
        this.sub_expands.push('sub_title');
      } else if (!this.withTitle && hasSubTitle) {
        this.sub_expands.splice(this.sub_expands.indexOf('sub_title'), 1);
      }
      sessionStorage.setItem("with_title", this.withTitle)
    },
    saveShowModel() {
      sessionStorage.setItem("show_model", this.show_model)
    },
    selectTitlePreset(item) {
      this.activeTitlePresetId = item.id
      sessionStorage.setItem('title_preset_id', item.id)
      this.subtitleNameParams.name_background_color = item.backgroundColor
      sessionStorage.setItem('name_background_color', item.backgroundColor)
      this.subtitleNameParams.name_background_opacity = 0.6
      sessionStorage.setItem('name_background_opacity', '0.6')
      this.subtitleNameParams.title_font_opacity = 1
      sessionStorage.setItem('title_font_opacity', '1')
      this.subtitleNameParams.name_color = item.color
      sessionStorage.setItem('name_color', item.color)
      this.subtitleNameParams.name_font = item.fontFamily
      sessionStorage.setItem('name_font', item.fontFamily)
      this.subtitleNameParams.name_fontsize = 10
      sessionStorage.setItem('name_fontsize', '10')
      this.subtitleNameParams.name_stroke_color = item.stroke
      sessionStorage.setItem('name_stroke_color', item.stroke)
      this.updateTitleTextStyle()
    },
    hexToRgb(hex) { //16进制颜色转RGB格式
      hex = hex.replace('#', '');
      let bigint = parseInt(hex, 16);
      let r = (bigint >> 16) & 255;
      let g = (bigint >> 8) & 255;
      let b = bigint & 255;
      return `rgb(${r}, ${g}, ${b})`;
    },
    updateTitleTextStyle() {
      let rgb_color = this.hexToRgb(this.subtitleNameParams.name_background_color)
      let rgba_color = `rgba(${rgb_color.replace('rgb(', '')
          .replace(')', '')}, ${this.subtitleNameParams.name_background_opacity})`

      let font_rgb_color = this.hexToRgb(this.subtitleNameParams.name_color)
      let font_rgba_color = `rgba(${font_rgb_color.replace('rgb(', '')
          .replace(')', '')}, ${this.subtitleNameParams.title_font_opacity})`

      this.titleTextStyle = {
        backgroundColor: this.name_use_background ? rgba_color : '',
        color: font_rgba_color,
        fontFamily: this.subtitleNameParams.name_font,
        lineHeight: 1,
        '-webkit-text-stroke': `0.5px ${this.subtitleNameParams.name_stroke_color}`,
        fontSize: (360 * this.subtitleNameParams.name_fontsize / 100) + 'px',
        top: this.topRatio * this.contentHeight + 'px'
      }

      sessionStorage.setItem('top_offset_ratio', this.topRatio)
    },
    saveSubtitleNameParams(key) {
      let value = this.subtitleNameParams[key]
      this.updateTitleTextStyle()
      sessionStorage.setItem(key, value)
      this.activeTitlePresetId = '0'
      sessionStorage.setItem('title_preset_id', '0')
      this.$forceUpdate()
    },
    switchUseBackground() {
      this.background_setting = this.use_background
      sessionStorage.setItem("use_background", this.use_background)
      this.$nextTick(() => {
        const container = this.$refs.styleCard
        container.scrollTop = container.scrollHeight
      })
      this.updateTextStyle()
    },
    switchNameUseBackground() {
      this.name_background_setting = this.name_use_background
      sessionStorage.setItem("name_use_background", this.name_use_background)
      this.updateTitleTextStyle()
    },
    switchSubtitle() {
      const hasSubContent = this.sub_expands.includes('sub_content');
      if (this.withSubtitle && !hasSubContent) {
        this.sub_expands.push('sub_content');
      } else if (!this.withSubtitle && hasSubContent) {
        this.sub_expands.splice(this.sub_expands.indexOf('sub_content'), 1);
      }
      const container = this.$refs.styleCard
      container.scrollTop = container.scrollHeight
      sessionStorage.setItem("with_subtitle", this.withSubtitle)
    },
    selectPreset(item) {
      this.activePresetId = item.id
      sessionStorage.setItem('preset_id', item.id)
      this.subtitleParams.background_color = item.backgroundColor
      sessionStorage.setItem('background_color', item.backgroundColor)
      this.subtitleParams.background_opacity = 0.6
      sessionStorage.setItem('background_opacity', '0.6')
      this.subtitleNameParams.content_font_opacity = 1
      sessionStorage.setItem('content_font_opacity', '1')
      this.subtitleParams.color = item.color
      sessionStorage.setItem('color', item.color)
      this.subtitleParams.font = item.fontFamily
      sessionStorage.setItem('font', item.fontFamily)
      this.subtitleParams['fontsize'] = 5
      sessionStorage.setItem('fontsize', '5')
      this.subtitleParams.stroke_color = item.stroke
      sessionStorage.setItem('stroke_color', item.stroke)
      this.updateTextStyle()
    },
    updateTextStyle() {
      let rgb_color = this.hexToRgb(this.subtitleParams.background_color)
      let rgba_color = `rgba(${rgb_color.replace('rgb(', '')
          .replace(')', '')}, ${this.subtitleParams.background_opacity})`

      let text_rgb_color = this.hexToRgb(this.subtitleParams.color)
      let text_rgba_color = `rgba(${text_rgb_color.replace('rgb(', '')
          .replace(')', '')}, ${this.subtitleParams.content_font_opacity})`

      this.textStyle = {
        backgroundColor: this.use_background ? rgba_color : '',
        color: text_rgba_color,
        fontFamily: this.subtitleParams.font,
        lineHeight: 1,
        '-webkit-text-stroke': `0.5px ${this.subtitleParams.stroke_color}`,
        fontSize: (360 * this.subtitleParams['fontsize'] / 100) + 'px',
        top: this.bottomRatio * this.contentHeight + 'px'
      }

      sessionStorage.setItem('bottom_offset_ratio', this.bottomRatio)
    },
    handleNameColorUpdated(newColor) {
      this.subtitleNameParams.name_color = newColor
      this.saveSubtitleNameParams('name_color')
      this.$forceUpdate()
    },
    handleNameStrokeColorUpdated(newColor) {
      this.subtitleNameParams.name_stroke_color = newColor
      this.saveSubtitleNameParams('name_stroke_color')
      this.$forceUpdate()
    },
    handleNameBackgroundColorUpdated(newColor) {
      this.subtitleNameParams.name_background_color = newColor
      this.saveSubtitleNameParams('name_background_color')
      this.$forceUpdate()
    },
    handleColorUpdated(newColor) {
      this.subtitleParams.color = newColor
      this.saveSubtitleParams('color')
      this.$forceUpdate()
    },
    handleStrokeColorUpdated(newColor) {
      this.subtitleParams.stroke_color = newColor
      this.saveSubtitleParams('stroke_color')
      this.$forceUpdate()
    },
    handleBackgroundColorUpdated(newColor) {
      this.subtitleParams.background_color = newColor
      this.saveSubtitleParams('background_color')
      this.$forceUpdate()
    },
    saveSubtitleParams(key) {
      let value = this.subtitleParams[key]
      this.updateTextStyle()
      sessionStorage.setItem(key, value)
      this.activePresetId = '0'
      sessionStorage.setItem('preset_id', '0')
      this.$forceUpdate()
    },
    nextStep() {
      if (this.material_list.length === 0) {
        this.$alert('请至少选择一个素材才能进行下一步的混剪操作。', '提示')
        return
      }
      if (this.figure.id) {
        let material_list = this.material_list
        material_list.push(this.figure.id)
        sessionStorage.setItem('material_list', JSON.stringify(material_list))
      }
      sessionStorage.setItem('script_type', 'material')
      sessionStorage.setItem("bg_volume", this.bg_volume)
      sessionStorage.setItem('mention_list', JSON.stringify(this.mentionList))
      let path = ''
      switch (this.nextType) {
        case "montage":
          path = '/smartGenerate'
          break;
        case "hot_montage":
          path = '/duplicate'
          break;
        case "storyboard":
          path = '/syncCv'
          break;
        case "hot_storyboard":
          path = '/segments'
          break;
      }
      sessionStorage.setItem('video_path', path)
      this.$router.push({path: path})
    },
    back() {
      let path = this.nextType.includes('hot_') ? '/hot' : '/video'
      sessionStorage.setItem('video_path', path)
      this.$router.push({path: path})
    },
  }
}
</script>

<style scoped>
.material {
  min-width: 1250px;
  min-height: 700px;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
}

.material-h-t {
  flex: 1;
  margin: 0 0 8px;
  font-weight: bold;
  display: flex;
  justify-content: center;
}

.material-content {
  display: flex;
  gap: 15px;
  height: calc(100% - 60px);
}

.c-left {
  flex: 1;
  box-sizing: border-box;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.selection-box {
  position: absolute;
  border: 1px dashed #409eff;
  background-color: rgba(64, 158, 255, 0.1);
  pointer-events: none;
  z-index: 20;
  transition: all 0.1s ease;
}

.library {
  height: calc(100% - 40px);
  padding: 0 15px;
  box-sizing: border-box;
}

.library >>> .el-collapse {
  border-top: none;
}

.library >>> .el-collapse-item__header {
  font-weight: bold;
  font-size: 14px;
  height: 35px;
  line-height: 35px;
}

.library >>> .el-collapse-item__content {
  padding-bottom: 0;
}

.filter-content {
  text-align: center;
  padding: 5px 0;
  display: flex;
}

.filter-content >>> .el-input__icon {
  line-height: 30px;
}

.filter-content >>> .el-input__inner {
  height: 30px;
  line-height: 30px;
  border-radius: 15px;
  background-color: #f9fafb;
  font-size: 12px;
}

.filter-content >>> .el-select__tags {
  padding-left: 5px;
}

.filter-input {
  flex: 1;
}

.m-card {
  flex: 1;
  display: grid;
  gap: 15px;
  background-color: #FFFFFF;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  grid-auto-rows: min-content;
  position: relative;
  cursor: pointer;
  margin-top: 5px;
  overflow-y: auto;
  overflow-x: hidden;
}

.m-item {
  max-width: 140px;
}

.m-item-img {
  width: 100%;
  max-width: 140px;
  aspect-ratio: 3 / 4;
  border-radius: 10px;
  box-sizing: border-box;
}

.m-img-selected {
  border: 2px solid #4c8df1;
}

.m-title-selected {
  color: #4c8df1 !important;
}

.m-item-title {
  font-size: 15px;
  color: #1e1f20;
  width: 100%;
  max-width: 120px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.c-center {
  width: 360px;
}

.c-center-preview {
  height: calc(100% - 60px);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
}

.c-center-preview-content {
  width: 360px;
  height: 640px;
  background-color: #111827;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.c-preview-setting {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
}

.c-preview-title {
  position: absolute;
  width: 100%;
  text-align: center;
  padding: 0;
  cursor: move;
  user-select: none;
}

.c-preview-content {
  position: absolute;
  width: 100%;
  text-align: center;
  padding: 0;
  cursor: move;
  user-select: none;
}

.c-center-btn {
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: end;
}

.next-btn {
  width: 176px;
}

.c-right {
  flex: 1;
  padding: 12px;
  box-sizing: border-box;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.s-card {
  height: calc(100% - 35px);
  overflow-y: auto;
}

.s-card-item {
  padding: 12px;
  box-sizing: border-box;
  background-color: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 6px;
}

.s-card-item >>> .el-radio__label {
  font-size: 12px;
}

.back-checkbox >>> .el-checkbox__inner {
  width: 14px;
  height: 14px;
  border-radius: 4px;
}

.back-checkbox >>> .el-checkbox__input {
  height: 14px;
}

.s-voice-title {
  font-size: 12px;
  color: #374151;
}

.color-box {
  width: 22px;
  height: 22px;
  border-radius: 3px;
  border: 1px solid #c8c8c8;
  cursor: pointer;
}

.color-value {
  font-size: 12px;
  color: #374151;
  width: 55px;
  text-align: end;
}

.mode-switch {
  background-color: #f3f4f6;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: 16px;
}

.mode-popover-item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 20px;
  line-height: 20px;
}

.mode-popover-item:hover {
  background-color: #f5f7fa;
}

.mode-select {
  color: #409EFF;
  font-weight: bold;
  font-size: 14px;
  margin-left: auto;
}

.mode-info {
  margin-left: 10px;
  font-size: 12px;
  display: flex;
  align-items: center;
  color: #909399;
}

.opacity >>> .el-slider__button {
  height: 18px;
  width: 4px;
  border-radius: 2px;
  border: none;
  background-color: #E4E7ED;
}

.opacity >>> .el-slider__button-wrapper {
  height: 33px;
}

.opacity >>> .el-slider__runway {
  height: 3px;
}

.opacity >>> .el-slider__bar {
  height: 3px;
}

.preset-group {
  display: grid;
  gap: 7px;
  grid-template-columns: repeat(auto-fit, 40px);
  grid-auto-rows: min-content;
  overflow: auto;
  max-height: 67px;
  margin-bottom: 8px;
}

.show-all-preset {
  height: auto !important;
  max-height: 1000px;
}

.preset-style {
  width: 40px;
  height: 40px;
  line-height: 40px;
  border-radius: 8px;
  text-align: center;
  font-size: 22px;
  font-weight: 900;
  cursor: pointer;
  box-sizing: border-box;
}

.preset-full-mask {
  position: absolute;
  bottom: 0;
  height: 40px;
  width: 100%;
  z-index: 10;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(249, 249, 249, 1));
  display: flex;
  justify-content: center;
  align-items: end;
  cursor: pointer;
}

.preset-not-full-mask {
  position: absolute;
  bottom: 0;
  width: 100%;
  z-index: 10;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(249, 249, 249, 1));
  display: flex;
  justify-content: center;
  align-items: end;
  cursor: pointer;
}

.volume {
  margin: 0 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.s-voice-content {
  padding: 8px;
  border-radius: 6px;
  margin-top: 4px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
}

.s-voice-btn {
  aspect-ratio: 1 / 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  color: #6286ed;
  cursor: pointer;
}

.popover-content {
  width: 350px;
  height: 250px;
  border-radius: 10px;
  overflow: auto;
}

.voice-item {
  height: 80px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.active {
  background-color: #e0e7fb;
}

.voice-icon {
  width: 42px;
  height: 37px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #c7d4f8;
  border-radius: 10px;
}

.voice-name {
  width: 100px;
  margin-left: 10px;
  font-size: 14px;
  color: #101010;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.s-voice-name {
  background-color: #f3f4f6;
  padding: 4px 4px 4px 8px;
  box-sizing: border-box;
  font-size: 12px;
  height: 22px;
  border-radius: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.s-btn-volume {
  margin-right: 5px;
}

.s-btn-volume >>> .el-slider__button {
  width: 13px;
  height: 13px;
  margin-top: 9px;
  border: 1px solid #409EFF;
  background-color: #0075ff;
}

.s-btn-volume >>> .el-slider__button-wrapper {
  height: 25px;
}

.s-btn-volume >>> .el-slider__runway {
  height: 5px;
  margin: 10px 0;
  border: 1px solid #b5b5b5;
  background-color: #efefef;
}

.s-btn-volume >>> .el-slider {
  height: 25px;
}

.s-btn-volume >>> .el-slider__bar {
  height: 5px;
}

.el-select >>> .el-input__inner {
  height: 30px;
  line-height: 30px;
  padding-right: 35px !important;
}

.el-select >>> .el-input__icon {
  line-height: 30px;
}

.input-number >>> .el-input__inner {
  height: 30px;
  line-height: 30px;
  padding-right: 35px !important;
}

.input-number >>> .el-input-number {
  width: 80px
}

.input-number >>> .el-input-number__decrease {
  width: 20px;
  height: 15px !important;
  line-height: 15px !important;
  bottom: 5px !important;
}

.input-number >>> .el-input-number__increase {
  width: 20px;
  height: 14px !important;
  line-height: 14px !important;
  top: 5px !important;
}

.input-number >>> .el-input__icon {
  line-height: 30px;
}

.tags {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 5px;
  margin-top: 5px;
  height: 20px;
}

.show-tags {
  height: auto !important;
}

.tag {
  background-color: #F5F5F5;
  color: #525252;
  border-radius: 14px;
  border: 1px solid #F5F5F5;
  cursor: pointer;
  height: 28px;
  line-height: 28px;
  padding-left: 12px;
  padding-right: 12px;
}

.tag-active {
  background-color: #3b82f6 !important;
  color: #FFFFFF !important;
}

.full-tags-icon {
  line-height: 35px;
  font-size: 14px;
  margin-left: 10px;
  cursor: pointer;
}

.full-tags {
  min-width: 400px;
  max-width: 540px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

::v-deep .el-switch__label {
  font-weight: bold;
  line-height: 24px;
}

::v-deep .el-switch__core {
  height: 18px;
  margin-top: 5px;
}

::v-deep .el-switch__core:after {
  width: 14px;
  height: 14px;
}

::v-deep .el-collapse-item__wrap {
  border-bottom: none;
}

.loop-group >>> .el-radio-group {
  display: flex;
}

.loop-group >>> .el-radio {
  display: flex;
}

.s-card-item >>> .el-collapse {
  border: none;
}

.s-card-item >>> .el-collapse-item__header {
  border-bottom: none;
  background-color: transparent;
  font-weight: bold;
  font-size: 15px;
  height: 20px;
  line-height: 20px;
}

.s-card-item >>> .el-collapse-item__wrap {
  background-color: transparent;
}

.s-card-item >>> .el-collapse-item__content {
  padding-top: 10px;
  padding-bottom: 0;
  font-size: 13px;
  color: #303133;
}
</style>