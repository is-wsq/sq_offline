<template>
  <div class="human">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="back">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="human-h-t">数字人选择</div>
      <div style="width: 36px"></div>
    </div>
    <div class="human-content">
      <div class="figure-left-panel">
        <div class="left-title">数字人库</div>
        <div class="filter-content">
          <el-input prefix-icon="el-icon-search" placeholder="输入数字人名称匹配搜索" clearable
                    class="filter-input" v-model="filter_text" @change="filterFigure"></el-input>
        </div>
        <div class="figure-list">
          <div v-for="item in filter_figures"
               :key="item.id"
               @click="selectFigure(item)">
            <el-image class="figure-img" :class="{'figure-img-selected': item.id === figure.id }"
                      :src="item.picture" fit="cover"></el-image>
            <div class="figure-name" :class="{'figure-title-selected': item.id === figure.id }"
                 :title="item.name">{{ item.name }}
            </div>
          </div>
        </div>
        <div style="padding: 0 15px" class="loop-group">
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
      </div>
      <div style="flex: 1">
        <div class="flex-center">
          <div style="flex: 1"></div>
          <div class="guide" style="margin-right: 15px" @click="guideVisible = true">
            <i class="el-icon-s-opportunity" style="margin-right: 4px;"></i>
            使用指南
          </div>
        </div>
        <div class="figure-preview">
          <div class="figure-preview-content">
            <div class="figure-preview-setting"
                 ref="container"
                 @mousemove="onMouseMove"
                 @mouseup="onMouseUp"
                 @mouseleave="onMouseUp">
              <el-image style="width: 100%;border-radius: 8px" :src="figure.picture"
                        fit="contain" v-if="figure.picture" draggable="false"></el-image>
              <div style="width: 360px;height: 640px" v-else></div>
              <div class="figure-preview-title"
                   ref="titleContainer"
                   :style="titleTextStyle"
                   v-if="withTitle"
                   @mousedown="onMouseDown('top', $event)">
                示例标题
              </div>
              <div class="figure-preview-text"
                   ref="contentContainer"
                   :style="textStyle"
                   v-if="withSubtitle"
                   @mousedown="onMouseDown('bottom', $event)">
                示例字幕
              </div>
            </div>
          </div>
        </div>
        <div class="figure-center-btn">
          <el-button type="primary" style="width: 176px;" @click="nextStep('/smartGenerate')">下一步：编辑文案
          </el-button>
        </div>
      </div>
      <div class="figure-right-panel">
        <div class="margin-b-12 font-weight">样式设置</div>
        <div class="style-card">
          <div class="style-card-item margin-b-16">
            <div class="margin-b-12 font-weight" style="font-size: 15px">音频</div>
            <div style="display: flex">
              <div class="right-label" style="margin-top: 5px">主播声音</div>
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
                        <div class="voice-icon" @click.stop="previewAudio(voice, index)" v-if="audioIndex !== index">
                          <i class="el-icon-play" style="font-size: 13px; color: #6286ed"></i>
                        </div>
                        <div class="voice-icon" @click.stop="stopAudio" v-else>
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
            <div class="right-label">背景声音</div>
            <div class="s-voice-content">
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
                             @click.stop="previewAudio(item, 10000 + index)"
                             v-if="audioIndex !== (10000 + index)">
                          <i :class="item.isPlay ? 'el-icon-pause' : 'el-icon-play'"
                             style="font-size: 13px; color: #6286ed">
                          </i>
                        </div>
                        <div class="voice-icon" @click.stop="stopAudio" v-else>
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
                <div class="right-label volume">音量</div>
                <div class="s-btn-volume">
                  <el-slider v-model="bg_volume" :step="0.1" style="width: 80px" :min="0.1" :max="1"
                             @change="saveBgmVolume('bg_volume')" :format-tooltip="formatTooltip"></el-slider>
                </div>
              </template>
            </div>
          </div>
          <div class="style-card-item margin-b-16">
            <el-collapse v-model="sub_expands">
              <el-collapse-item name="sub_title">
                <div slot="title">
                  <el-checkbox style="margin-right: 5px" v-model="withTitle" @change="switchTitle"></el-checkbox>口播标题
                </div>
                <div class="flex-center margin-b-12">
                  <div class="right-label" style="flex: 1">展示方式</div>
                  <el-radio v-model="show_model" label="begin" @input="saveShowModel">仅开头展示</el-radio>
                  <el-radio v-model="show_model" label="full" @input="saveShowModel">全程展示</el-radio>
                </div>
                <div class="flex-center margin-b-8">
                  <div class="right-label" style="flex: 1">预设样式</div>
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
                  <div class="right-label" style="flex: 1;display: flex;align-items: center">
                    <div style="margin-right: 10px">字体</div>
                    <el-select v-model="subtitleNameParams.name_font" placeholder="请选择" style="width: 180px"
                               @change="saveSubtitleNameParams('name_font')">
                      <el-option
                          v-for="item in fontFamily"
                          :key="item.id"
                          :label="item.name"
                          :value="item.font_id">
                        <div style="display: flex; align-items: center">
                          <img :src="item.img_path" style="width: 150px; height: 50px; margin-right: 8px;"/>
                          <span>{{ item.name }}</span>
                        </div>
                      </el-option>
                    </el-select>
                  </div>
                  <div class="right-label" style="display: flex;align-items: center">
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
                  <div class="right-label" style="flex: 1">字体颜色</div>
                  <el-popover
                      placement="left"
                      trigger="click">
                    <div style="margin: -12px">
                      <custom-color-picker ref="titleColorRef" :color="subtitleNameParams.name_color"
                                           @color-updated="handleNameColorUpdated"></custom-color-picker>
                    </div>
                    <div slot="reference" class="color-box" :style="{background: subtitleNameParams.name_color}"></div>
                  </el-popover>
                </div>
                <div class="flex-center margin-t-12 margin-b-8">
                  <div class="right-label" style="flex: 1">描边颜色</div>
                  <el-popover
                      placement="left"
                      trigger="click">
                    <div style="margin: -12px">
                      <custom-color-picker ref="titleStrokeRef" :color="subtitleNameParams.name_stroke_color"
                                           @color-updated="handleNameStrokeColorUpdated"></custom-color-picker>
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
                <div class="flex-center back-checkbox" :class="{'margin-b-16': name_background_setting}"
                     style="cursor: pointer"
                     @click="name_background_setting = !name_background_setting">
                  <el-checkbox v-model="name_use_background" @change="switchNameUseBackground" style="line-height: 13px;"></el-checkbox>
                  <div class="right-label" style="flex: 1;line-height: 22px;">背景</div>
                  <i class="el-icon-arrow-down" style="color: #374151" v-if="name_background_setting"></i>
                  <i class="el-icon-arrow-right" style="color: #374151" v-else></i>
                </div>
                <div class="flex-center margin-b-12 bg-color" v-if="name_background_setting">
                  <div class="right-label" style="margin-right: 12px">颜色</div>
                  <el-popover
                      placement="left"
                      trigger="click">
                    <div style="margin: -12px">
                      <custom-color-picker ref="titleBackgroundRef" :color="subtitleNameParams.name_background_color"
                                           @color-updated="handleNameBackgroundColorUpdated"></custom-color-picker>
                    </div>
                    <div slot="reference" class="color-box" :style="{background: subtitleNameParams.name_background_color}"></div>
                  </el-popover>
                  <div style="flex: 1"></div>
                </div>
                <div class="flex-center opacity" v-if="name_background_setting">
                  <div class="right-label" style="margin-right: 12px">不透明度</div>
                  <el-slider v-model="subtitleNameParams.name_background_opacity"
                             :step="0.01" style="flex: 1" :min="0" :max="1"
                             @input="saveSubtitleNameParams('name_background_opacity')"></el-slider>
                  <div class="right-label" style="margin-left: 8px;width: 40px">
                    {{ (subtitleNameParams.name_background_opacity * 100).toFixed(0) + '%' }}
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
          <div class="style-card-item">
            <el-collapse v-model="sub_expands">
              <el-collapse-item name="sub_content">
                <div slot="title">
                  <el-checkbox style="margin-right: 5px" v-model="withSubtitle" @change="switchSubtitle"></el-checkbox>口播内容
                </div>
                <div class="flex-center">
                  <div class="right-label" style="flex: 1;display: flex">预设样式</div>
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
                         border: activePresetId === item.id ? '1px solid #6286ed' : 'none'
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
                  <div class="right-label" style="flex: 1;display: flex;align-items: center">
                    <div style="margin-right: 10px">字体</div>
                    <el-select v-model="subtitleParams.font" placeholder="请选择" style="width: 180px"
                               @change="saveSubtitleParams('font')">
                      <el-option
                          v-for="item in fontFamily"
                          :key="item.font_id"
                          :label="item.name"
                          :value="item.font_id">
                        <div style="display: flex; align-items: center">
                          <img :src="item.img_path" style="width: 150px; height: 50px; margin-right: 8px;"/>
                          <span>{{ item.name }}</span>
                        </div>
                      </el-option>
                    </el-select>
                  </div>
                  <div class="right-label" style="display: flex;align-items: center">
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
                  <div class="right-label" style="flex: 1">字体颜色</div>
                  <el-popover
                      placement="left"
                      trigger="click">
                    <div style="margin: -12px">
                      <custom-color-picker ref="colorRef" :color="subtitleParams.color"
                                           @color-updated="handleColorUpdated"></custom-color-picker>
                    </div>
                    <div slot="reference" class="color-box" :style="{background: subtitleParams.color}"></div>
                  </el-popover>
                </div>
                <div class="flex-center margin-t-12 margin-b-8">
                  <div class="right-label" style="flex: 1">描边颜色</div>
                  <el-popover
                      placement="left"
                      trigger="click">
                    <div style="margin: -12px">
                      <custom-color-picker ref="strokeRef" :color="subtitleParams.stroke_color"
                                           @color-updated="handleStrokeColorUpdated"></custom-color-picker>
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
                <div class="flex-center back-checkbox" :class="{'margin-b-16': background_setting}" style="cursor: pointer"
                     @click="background_setting = !background_setting">
                  <el-checkbox v-model="use_background" @change="switchUseBackground" style="line-height: 13px;"></el-checkbox>
                  <div class="right-label" style="flex: 1;line-height: 22px;">背景</div>
                  <i class="el-icon-arrow-down" style="color: #374151" v-if="background_setting"></i>
                  <i class="el-icon-arrow-right" style="color: #374151" v-else></i>
                </div>
                <div class="flex-center margin-b-12 bg-color" v-if="background_setting">
                  <div class="right-label" style="margin-right: 12px">颜色</div>
                  <div class="custom-color-popover">
                    <el-popover
                        placement="left"
                        trigger="click">
                      <div style="margin: -12px">
                        <custom-color-picker ref="backgroundRef" :color="subtitleParams.background_color"
                                             @color-updated="handleBackgroundColorUpdated"></custom-color-picker>
                      </div>
                      <div slot="reference" class="color-box" :style="{background: subtitleParams.background_color}"></div>
                    </el-popover>
                  </div>
                  <div style="flex: 1"></div>
                </div>
                <div class="flex-center opacity" v-if="background_setting">
                  <div class="right-label" style="margin-right: 12px">不透明度</div>
                  <el-slider v-model="subtitleParams.background_opacity"
                             :step="0.01" style="flex: 1" :min="0" :max="1"
                             @input="saveSubtitleParams('background_opacity')"></el-slider>
                  <div class="right-label" style="margin-left: 8px;width: 40px">
                    {{ (subtitleParams.background_opacity * 100).toFixed(0) + '%' }}
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </div>
    </div>
    <el-dialog class="guide-dialog" :visible.sync="guideVisible" width="600px">
      <div slot="title" class="guide-dialog-title">使用指南</div>
      <div class="guide-dialog-body">
        <div class="guide-item">
          <div class="guide-index">1</div>
          <div style="flex: 1">选择数字人形象，并设置声音、音乐和字幕样式</div>
        </div>
        <div class="guide-item">
          <div class="guide-index">2</div>
          <div style="flex: 1">进入文案编辑页，可选择 AI 批量生成或手动添加文案</div>
        </div>
        <div class="guide-item">
          <div class="guide-index">3</div>
          <div style="flex: 1">在文案列表中，可以修改或删除已生成的文案。</div>
        </div>
        <div class="guide-item">
          <div class="guide-index">4</div>
          <div style="flex: 1">点击生成按钮，后台将自动完成视频制作。</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {getAction} from "@/api/api";
import {EnhancedChoiceMixin} from "@/mixins/EnhancedChoiceMixin";
import CustomColorPicker from "@/components/CustomColorPicker.vue";

export default {
  name: 'human',
  components: {CustomColorPicker},
  mixins: [EnhancedChoiceMixin],
  data() {
    return {
      sub_expands: [],
      showAllTitlePreset: false,
      showAllContentPreset: false,

      filter_text: '',
      figures: [],
      filter_figures: [],
      figure: {},

      reverse: false,

      withTitle: true,
      show_model: 'begin',
      subtitleNameParams: {
        name_background_opacity: 0.6,
        title_font_opacity: 1,
      },
      name_background_setting: false,
      withSubtitle: true,
      subtitleParams: {
        background_opacity: 0.6,
        content_font_opacity: 1
      },
      use_background: false,
      name_use_background: false,
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
      mode: 'common',  // 普通模式 common, 高级模式 advanced
      bgmList: [],
      bgm: {},
      bg_volume: 0.3,
      previousVolume: 0.3,
      audio: null,
      audioIndex: null,
      titleTextStyle: {},
      textStyle: {},
      contentHeight: 640,
      topRatio: 0.25,
      bottomRatio: 0.75,

      guideVisible: false,
    }
  },
  mounted() {
    this.mode = sessionStorage.getItem('figure_setting_mode') || 'common'
    this.queryFigures()
    this.querySounds();
    this.queryMiniMaxVoices();
    this.queryBgm();
    this.queryFontFamily();
    this.initParams()
  },
  beforeDestroy() {
    this.stopAudio()
  },
  methods: {
    filterFigure() {
      let filteredItems = this.figures;
      if (this.filter_text) {
        filteredItems = filteredItems.filter(item => item.name.includes(this.filter_text));
      }
      this.filter_figures = filteredItems;
    },
    formatTooltip(val) {
      return val * 100 + '%';
    },
    queryFigures() {
      let params = {
        video_type: 'figure'
      }
      getAction("/figure/query_success", params).then((res) => {
        if (res.data.status === "success") {
          let data = res.data.data.filter(item => item.status === "success")
          this.figures = data.map(item => ({...item, previewing: false}))
          this.filter_figures = this.figures
          let figure = JSON.parse(sessionStorage.getItem('figure')) || {}
          let validFiguresId = this.figures.map(item => item.id);
          this.figure = validFiguresId.includes(figure.id) ? figure : {}
        }
      }).catch((error) => {
        console.error("获取角色列表失败:", error);
      });
    },
    selectFigure(item) {
      this.figure = this.figure.id === item.id ? {} : item
      this.contentHeight = item.height / (item.width / 360)

      sessionStorage.setItem('figure', JSON.stringify(this.figure))
      sessionStorage.setItem('figure_content_height', this.contentHeight)

      this.$nextTick(() => {
        this.updateTextStyle()
        this.updateTitleTextStyle()
      })
    },
    initParams() {
      this.reverse = sessionStorage.getItem("figure_setting_reverse") === 'true'

      this.contentHeight = Number(sessionStorage.getItem('figure_content_height')) || 640
      this.topRatio = Number(sessionStorage.getItem('figure_top_offset_ratio')) || 0.25
      this.bottomRatio = Number(sessionStorage.getItem('figure_bottom_offset_ratio')) || 0.75

      this.withSubtitle = sessionStorage.getItem("figure_with_subtitle") === 'true'
      this.withTitle = sessionStorage.getItem("figure_with_title") === 'true'
      this.show_model = sessionStorage.getItem("figure_show_model") || 'begin'
      this.bg_volume = Number(sessionStorage.getItem("figure_bg_volume")) || 0.3

      this.sub_expands = [
        ...(this.withTitle ? ['sub_title'] : []),
        ...(this.withSubtitle ? ['sub_content'] : [])
      ];

      this.use_background = sessionStorage.getItem("figure_use_background") === 'true'
      this.name_use_background = sessionStorage.getItem("figure_name_use_background") === 'true'
      this.activePresetId = sessionStorage.getItem("figure_preset_id") || '1'
      this.subtitleParams.fontsize = parseInt(sessionStorage.getItem("figure_fontsize")) || 5
      this.subtitleParams.color = sessionStorage.getItem("figure_color") || '#ffffff'
      this.subtitleParams.font = sessionStorage.getItem("figure_font") || 'SJxingkai-C-Regular'
      this.subtitleParams.background_color = sessionStorage.getItem("figure_background_color") || '#404040'
      this.subtitleParams.background_opacity = Number(sessionStorage.getItem("figure_background_opacity")) || 0.6
      this.subtitleParams.content_font_opacity = Number(sessionStorage.getItem("figure_content_font_opacity")) || 1
      this.subtitleParams.stroke_color = sessionStorage.getItem("figure_stroke_color") || '#000000'

      if (this.$refs.strokeRef) {
        this.$refs.strokeRef.color_value = this.subtitleParams.stroke_color.replace('#','')
      }
      if (this.$refs.colorRef) {
        this.$refs.colorRef.color_value = this.subtitleParams.color.replace('#','')
      }
      if (this.$refs.backgroundRef) {
        this.$refs.backgroundRef.color_value = this.subtitleParams.background_color.replace('#','')
      }

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

      this.activeTitlePresetId = sessionStorage.getItem("figure_title_preset_id") || '1'
      this.subtitleNameParams.name_fontsize = parseInt(sessionStorage.getItem("figure_name_fontsize")) || 10
      this.subtitleNameParams.name_color = sessionStorage.getItem("figure_name_color") || '#ffffff'
      this.subtitleNameParams.name_font = sessionStorage.getItem("figure_name_font") || 'SJxingkai-C-Regular'
      this.subtitleNameParams.name_background_color = sessionStorage.getItem("figure_name_background_color") || '#404040'
      this.subtitleNameParams.name_background_opacity = Number(sessionStorage.getItem("figure_name_background_opacity")) || 0.6
      this.subtitleNameParams.title_font_opacity = Number(sessionStorage.getItem("figure_title_font_opacity")) || 1
      this.subtitleNameParams.name_stroke_color = sessionStorage.getItem("figure_name_stroke_color") || '#000000'

      if (this.$refs.titleStrokeRef) {
        this.$refs.titleStrokeRef.color_value = this.subtitleNameParams.name_stroke_color.replace('#','')
      }
      if (this.$refs.titleColorRef) {
        this.$refs.titleColorRef.color_value = this.subtitleNameParams.name_color.replace('#', '')
      }
      if (this.$refs.titleBackgroundRef) {
        this.$refs.titleBackgroundRef.color_value = this.subtitleNameParams.name_background_color.replace('#','')
      }

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
    querySounds() {
      getAction("/timbres/get_all_common_timbre").then((res) => {
        if (res.data.status === "success") {
          this.voices = res.data.data;
          if (this.voices.length > 0 && this.mode === 'common') {
            let sound = JSON.parse(sessionStorage.getItem("figure_setting_voice"))
            if (sound && this.voices.some(item => item.id === sound.id)) {
              this.sound = sound
            } else {
              this.sound = this.voices[0];
              sessionStorage.setItem("figure_setting_voice", JSON.stringify(this.sound))
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
            let sound = JSON.parse(sessionStorage.getItem("figure_setting_voice"))
            if (sound && this.minimax_voices.some(item => item.id === sound.id)) {
              this.sound = sound
            } else {
              this.sound = this.minimax_voices[0];
              sessionStorage.setItem("figure_setting_voice", JSON.stringify(this.sound))
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
          let bgm = JSON.parse(sessionStorage.getItem("figure_setting_bgm"))
          if (bgm && this.bgmList.some(item => item.id === bgm.id)) {
            this.bgm = bgm
          } else {
            this.bgm = this.bgmList[0]
            sessionStorage.setItem("figure_setting_bgm", JSON.stringify(this.bgm))
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
    saveReverse() {
      sessionStorage.setItem('figure_setting_reverse', this.reverse)
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
      sessionStorage.setItem("figure_setting_voice", JSON.stringify(this.sound))
      sessionStorage.setItem("figure_setting_mode", mode)
    },
    selectVoice(voice) {
      this.sound = voice
      sessionStorage.setItem("figure_setting_voice", JSON.stringify(voice))
      this.$nextTick(() => {
        this.$refs.voiceRef.showPopper = false
      })
    },
    selectBgm(item) {
      this.bgm = item
      sessionStorage.setItem("figure_setting_bgm", JSON.stringify(item))
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
      sessionStorage.setItem("figure_bg_volume", this.bg_volume)
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
      sessionStorage.setItem("figure_with_title", this.withTitle)
    },
    saveShowModel() {
      sessionStorage.setItem("figure_show_model", this.show_model)
    },
    selectTitlePreset(item) {
      this.activeTitlePresetId = item.id
      sessionStorage.setItem('figure_title_preset_id', item.id)
      this.subtitleNameParams.name_background_color = item.backgroundColor
      sessionStorage.setItem('figure_name_background_color', item.backgroundColor)
      this.subtitleNameParams.name_background_opacity = 0.6
      sessionStorage.setItem('figure_name_background_opacity', '0.6')
      this.subtitleNameParams.title_font_opacity = 1
      sessionStorage.setItem('figure_title_font_opacity', '1')
      this.subtitleNameParams.name_color = item.color
      sessionStorage.setItem('figure_name_color', item.color)
      // this.subtitleNameParams.name_font = item.fontFamily
      // sessionStorage.setItem('figure_name_font', item.fontFamily)
      // this.subtitleNameParams.name_fontsize = 10
      // sessionStorage.setItem('figure_name_fontsize', '10')
      this.subtitleNameParams.name_stroke_color = item.stroke
      sessionStorage.setItem('figure_name_stroke_color', item.stroke)

      if (this.$refs.titleStrokeRef) {
        this.$refs.titleStrokeRef.color_value = this.subtitleNameParams.name_stroke_color.replace('#','')
      }
      if (this.$refs.titleColorRef) {
        this.$refs.titleColorRef.color_value = this.subtitleNameParams.name_color.replace('#', '')
      }
      if (this.$refs.titleBackgroundRef) {
        this.$refs.titleBackgroundRef.color_value = this.subtitleNameParams.name_background_color.replace('#','')
      }
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

      sessionStorage.setItem('figure_top_offset_ratio', this.topRatio)
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
    saveSubtitleNameParams(key) {
      let value = this.subtitleNameParams[key]
      this.updateTitleTextStyle()
      sessionStorage.setItem('figure_' + key, value)
      this.activeTitlePresetId = '0'
      sessionStorage.setItem('figure_title_preset_id', '0')
      this.$forceUpdate()
    },
    switchUseBackground() {
      this.background_setting = this.use_background
      sessionStorage.setItem("figure_use_background", this.use_background)
      this.updateTextStyle()
    },
    switchNameUseBackground() {
      this.name_background_setting = this.name_use_background
      sessionStorage.setItem("figure_name_use_background", this.name_use_background)
      this.updateTitleTextStyle()
    },
    switchSubtitle() {
      const hasSubContent = this.sub_expands.includes('sub_content');
      if (this.withSubtitle && !hasSubContent) {
        this.sub_expands.push('sub_content');
      } else if (!this.withSubtitle && hasSubContent) {
        this.sub_expands.splice(this.sub_expands.indexOf('sub_content'), 1);
      }
      sessionStorage.setItem("figure_with_subtitle", this.withSubtitle)
    },
    selectPreset(item) {
      this.activePresetId = item.id
      sessionStorage.setItem('figure_preset_id', item.id)
      this.subtitleParams.background_color = item.backgroundColor
      sessionStorage.setItem('figure_background_color', item.backgroundColor)
      this.subtitleParams.background_opacity = 0.6
      sessionStorage.setItem('figure_background_opacity', '0.6')
      this.subtitleParams.content_font_opacity = 1
      sessionStorage.setItem('figure_content_font_opacity', '1')
      this.subtitleParams.color = item.color
      sessionStorage.setItem('figure_color', item.color)
      // this.subtitleParams.font = item.fontFamily
      // sessionStorage.setItem('figure_font', item.fontFamily)
      // this.subtitleParams['fontsize'] = 5
      // sessionStorage.setItem('figure_fontsize', '5')
      this.subtitleParams.stroke_color = item.stroke
      sessionStorage.setItem('figure_stroke_color', item.stroke)

      if (this.$refs.strokeRef) {
        this.$refs.strokeRef.color_value = this.subtitleParams.stroke_color.replace('#','')
      }
      if (this.$refs.colorRef) {
        this.$refs.colorRef.color_value = this.subtitleParams.color.replace('#','')
      }
      if (this.$refs.backgroundRef) {
        this.$refs.backgroundRef.color_value = this.subtitleParams.background_color.replace('#','')
      }
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
      sessionStorage.setItem('figure_bottom_offset_ratio', this.bottomRatio)
    },
    saveSubtitleParams(key) {
      let value = this.subtitleParams[key]
      this.updateTextStyle()
      sessionStorage.setItem('figure_' + key, value)
      this.activePresetId = '0'
      sessionStorage.setItem('figure_preset_id', '0')
      this.$forceUpdate()
    },
    nextStep(path) {
      if (!this.figure.id) {
        this.$alert('请先选择您的数字人分身', '提示')
        return
      }
      sessionStorage.setItem('script_type', 'figure')
      sessionStorage.setItem('video_path', path)
      sessionStorage.setItem("figure_bg_volume", this.bg_volume)
      this.$router.push({path: path})
    },
    back() {
      sessionStorage.setItem('video_path', '/video')
      this.$router.push({path: '/video'})
    }
  }
}
</script>

<style scoped>
.human {
  min-width: 1200px;
  min-height: 800px;
  height: 100%;
}

.human-h-t {
  flex: 1;
  margin: 0 0 8px;
  font-weight: bold;
  display: flex;
  justify-content: center;
}

.human-content {
  display: flex;
  height: calc(100% - 60px);
}

.figure-left-panel {
  flex: 1;
  box-sizing: border-box;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.left-title {
  line-height: 40px;
  font-weight: bold;
  margin-left: 15px;
}

.filter-content {
  text-align: center;
  padding: 10px 20px;
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

.filter-input {
  width: 100%;
  max-width: 400px;
}

.figure-list {
  max-height: calc(100% - 200px);
  display: grid;
  gap: 15px;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  grid-auto-rows: min-content;
  position: relative;
  cursor: pointer;
  padding: 15px;
  margin-bottom: 15px;
  overflow-y: auto;
}

.figure-img {
  width: 100%;
  max-width: 140px;
  aspect-ratio: 3 / 4;
  border-radius: 10px;
  box-sizing: border-box;
}

.figure-img:hover {
  transform: scale(1);
}

.figure-name {
  font-size: 15px;
  color: #1e1f20;
  width: 100%;
  max-width: 140px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.figure-img-selected {
  border: 2px solid #4c8df1;
}

.figure-title-selected {
  color: #4c8df1 !important;
}

.figure-preview {
  height: calc(100% - 90px);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
}

.figure-preview-content {
  width: 360px;
  height: 640px;
  background-color: #111827;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.figure-preview-setting {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
}

.figure-preview-title {
  position: absolute;
  width: 100%;
  text-align: center;
  padding: 0;
  cursor: move;
  user-select: none;
}

.figure-preview-text {
  position: absolute;
  width: 100%;
  text-align: center;
  padding: 0;
  cursor: move;
  user-select: none;
}

.figure-center-btn {
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: end;
}


.figure-right-panel {
  flex: 1;
  padding: 12px;
  box-sizing: border-box;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.style-card {
  height: calc(100% - 35px);
  overflow-y: auto;
}

.style-card-item {
  padding: 12px;
  box-sizing: border-box;
  background-color: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 6px;
}

.style-card-item >>> .el-radio__label {
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

.right-label {
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

.preset-style {
  width: 23px;
  height: 23px;
  line-height: 23px;
  border-radius: 3px;
  text-align: center;
  font-size: 20px;
  font-weight: 900;
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
}

.s-btn-volume >>> .el-slider__button-wrapper {
  height: 25px;
}

.s-btn-volume >>> .el-slider__runway {
  height: 5px;
  margin: 10px 0;
  border: 1px solid #e4e7ed;
  background-color: #f8fafc;
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

.el-select-dropdown__item {
  height: 52px;
  line-height: 52px;
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

.loop-group >>> .el-radio-group {
  display: flex;
}

.loop-group >>> .el-radio {
  display: flex;
}

.style-card-item >>> .el-collapse {
  border: none;
}

.style-card-item >>> .el-collapse-item__header {
  border-bottom: none;
  background-color: transparent;
  font-weight: bold;
  font-size: 15px;
  height: 20px;
  line-height: 20px;
}

.style-card-item >>> .el-collapse-item__wrap {
  background-color: transparent;
  border-bottom: none;
}

.style-card-item >>> .el-collapse-item__content {
  padding-top: 10px;
  padding-bottom: 0;
  font-size: 13px;
  color: #303133;
}

.preset-group {
  display: grid;
  gap: 7px;
  grid-template-columns: repeat(auto-fit, 40px);
  grid-auto-rows: min-content;
  overflow: auto;
  height: 67px;
  margin-bottom: 8px;
}

.show-all-preset {
  height: auto !important;
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

.guide-dialog >>> .el-dialog {
  border-radius: 10px;
}

.guide-dialog-title {
  padding: 20px 20px 10px;
  line-height: 24px;
  font-size: 18px;
  color: #303133;
  font-weight: 700;
}

.guide-dialog-body {
  padding: 10px 20px;
  max-height: calc(70vh - 120px);
  overflow-y: auto;
}

.guide-item {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.guide-index {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e5e7eb;
  line-height: 24px;
  text-align: center;
  font-size: 12px;
}

.guide-dialog >>> .el-dialog__header {
  padding: 0;
}

.guide-dialog >>> .el-dialog__close {
  color: #9ca3af;
  font-size: 24px;
}

.guide-dialog >>> .el-dialog__body {
  padding: 0;
}

.guide-dialog >>> .el-dialog__footer {
  padding: 0;
}
</style>