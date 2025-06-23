<template>
  <div class="human">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="$router.go(-1)">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="human-h-t">数字人选择</div>
      <div style="width: 36px"></div>
    </div>
    <div class="human-content">
      <div class="figure-left-panel">
        <div class="left-title">数字人库</div>
        <div class="figure-list">
          <div v-for="item in figures"
               :key="item.id"
               @click="selectFigure(item)">
<!--            <el-image class="figure-img" :class="{'figure-img-selected': item.id === figure.id }"-->
<!--                      :src="item.picture.replace('127.0.0.1','192.168.0.102')" fit="cover"></el-image>-->
            <el-image class="figure-img" :class="{'figure-img-selected': item.id === figure.id }"
                      :src="item.picture" fit="cover"></el-image>
<!--            <el-popover placement="right" trigger="hover" :content="''" @show="item.previewing = true"-->
<!--                        @hide="item.previewing = false"-->
<!--                        popper-class="video-preview-popover" :open-delay="1000" :close-delay="300">-->
<!--              <el-image slot="reference" class="figure-img" :class="{'figure-img-selected': item.id === figure.id }"-->
<!--                        :src="item.picture" fit="cover"></el-image>-->
<!--              <video :src="item.filepath" loop muted autoplay style="min-width: 150px" height="180"-->
<!--                     v-if="item.previewing">-->
<!--              </video>-->
<!--            </el-popover>-->
            <div class="figure-name" :class="{'figure-title-selected': item.id === figure.id }"
                 :title="item.name">{{ item.name }}</div>
          </div>
        </div>
      </div>
      <div style="flex: 1">
        <div class="figure-preview">
          <div class="figure-preview-content">
            <div class="figure-preview-setting"
                 ref="container"
                 @mousemove="onMouseMove"
                 @mouseup="onMouseUp"
                 @mouseleave="onMouseUp">
<!--              <el-image style="width: 100%;border-radius: 8px" :src="figure.picture.replace('127.0.0.1','192.168.0.102')"-->
<!--                        fit="contain" v-if="figure.picture"></el-image>-->
              <el-image style="width: 100%;border-radius: 8px" :src="figure.picture"
                        fit="contain" v-if="figure.picture"></el-image>
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
          <el-button type="primary" style="width: 176px;" @click="nextStep('/smartGenerate')">下一步：编辑文案</el-button>
        </div>
      </div>
      <div class="figure-right-panel">
        <div class="margin-b-12 font-weight">样式设置</div>
        <div class="style-card">
          <div class="style-card-item margin-b-16">
            <div class="margin-b-12 font-weight">音频</div>
            <div class="right-label">主播声音</div>
            <div class="s-voice-content margin-b-16">
              <div class="s-voice-btn">
                <i class="el-icon-play" @click="previewAudio(sound, -1)" v-if="audioIndex !== -1"></i>
                <i class="el-icon-pause" @click="stopAudio" v-else></i>
              </div>
              <el-popover placement="bottom" trigger="click">
                <div class="popover-content">
                  <el-row>
                    <el-col :span="12" v-for="(voice, index) in voices" :key="voice.id">
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
                <div class="s-voice-name" style="min-width: 350px" slot="reference" :title="sound.name">{{ sound.name }}</div>
              </el-popover>
            </div>
            <div class="right-label">背景声音</div>
            <div class="s-voice-content">
              <div class="s-voice-btn">
                <i class="el-icon-play" @click="previewAudio(bgm, -2)" v-if="audioIndex !== -2"></i>
                <i class="el-icon-pause" @click="stopAudio" v-else></i>
              </div>
              <el-popover placement="bottom" trigger="click" @hide="stopAudio">
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
                <div class="s-voice-name" slot="reference" style="min-width: 200px" :title="bgm.name">{{ bgm.name }}</div>
              </el-popover>
              <div class="right-label volume">音量</div>
              <div class="s-btn-volume">
                <el-slider v-model="bg_volume" :step="0.1" style="width: 80px" :min="0.1" :max="1"
                           @change="saveBgmVolume('bg_volume')" :format-tooltip="formatTooltip"></el-slider>
              </div>
            </div>
          </div>
          <div class="style-card-item margin-b-16">
            <div class="margin-b-12 font-weight flex-center">
              <div style="flex: 1">口播标题</div>
              <el-checkbox v-model="withTitle" @change="switchTitle"></el-checkbox>
            </div>
            <div class="flex-center">
              <div class="right-label" style="flex: 1">预设样式</div>
              <div class="preset-style"
                   v-for="item in titlePresets"
                   :key="item.id"
                   @click="selectTitlePreset(item)"
                   :style="{
                     backgroundColor: item.backgroundColor,
                     color: item.color,
                     '-webkit-text-stroke': '0.5px' + item.stroke,
                     border: activeTitlePresetId === item.id ? '1px solid #6286ed' : 'none'
                   }">
                T
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
<!--                      <img :src="item.img_path.replace('127.0.0.1','192.168.0.102')" style="width: 150px; height: 50px; margin-right: 8px;"/>-->
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
              <el-color-picker size="small" v-model="subtitleNameParams.name_color"
                               @change="saveSubtitleNameParams('name_color')"></el-color-picker>
            </div>
            <div class="flex-center margin-t-8 margin-b-16">
              <div class="right-label" style="flex: 1">描边颜色</div>
              <el-color-picker size="small" v-model="subtitleNameParams.name_stroke_color"
                               @change="saveSubtitleNameParams('name_stroke_color')"></el-color-picker>
            </div>
            <div class="flex-center back-checkbox" :class="{'margin-b-16': name_background_setting}" style="cursor: pointer"
                 @click="name_background_setting = !name_background_setting">
              <el-checkbox v-model="name_use_background" @change="switchNameUseBackground"></el-checkbox>
              <div class="right-label" style="flex: 1">背景</div>
              <i class="el-icon-arrow-down" style="color: #374151" v-if="name_background_setting"></i>
              <i class="el-icon-arrow-right" style="color: #374151" v-else></i>
            </div>
            <div class="flex-center margin-b-12 bg-color" v-if="name_background_setting">
              <div class="right-label" style="margin-right: 12px">颜色</div>
              <el-color-picker size="small" v-model="subtitleNameParams.name_background_color"
                               @change="saveSubtitleNameParams('name_background_color')"></el-color-picker>
              <div style="flex: 1"></div>
            </div>
            <div class="flex-center opacity" v-if="name_background_setting">
              <div class="right-label" style="margin-right: 12px">不透明度</div>
              <el-slider v-model="subtitleNameParams.name_background_opacity"
                         :step="0.01" style="flex: 1" :min="0" :max="1"
                         @input="saveSubtitleNameParams('name_background_opacity')"></el-slider>
              <div class="right-label" style="margin-left: 8px;width: 30px">
                {{ (subtitleNameParams.name_background_opacity * 100).toFixed(0) + '%' }}
              </div>
            </div>
          </div>
          <div class="style-card-item">
            <div class="margin-b-12 font-weight flex-center">
              <div style="flex: 1">口播内容</div>
              <el-checkbox v-model="withSubtitle" @change="switchSubtitle"></el-checkbox>
            </div>
            <div class="flex-center">
              <div class="right-label" style="flex: 1;display: flex">预设样式</div>
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
<!--                      <img :src="item.img_path.replace('127.0.0.1','192.168.0.102')" style="width: 150px; height: 50px; margin-right: 8px;"/>-->
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
              <el-color-picker size="small" v-model="subtitleParams.color"
                               @change="saveSubtitleParams('color')"></el-color-picker>
            </div>
            <div class="flex-center margin-t-8 margin-b-16">
              <div class="right-label" style="flex: 1">描边颜色</div>
              <el-color-picker size="small" v-model="subtitleParams.stroke_color"
                               @change="saveSubtitleParams('stroke_color')"></el-color-picker>
            </div>
            <div class="flex-center back-checkbox" :class="{'margin-b-16': background_setting}" style="cursor: pointer"
                 @click="background_setting = !background_setting">
              <el-checkbox v-model="use_background" @change="switchUseBackground"></el-checkbox>
              <div class="right-label" style="flex: 1">背景</div>
              <i class="el-icon-arrow-down" style="color: #374151" v-if="background_setting"></i>
              <i class="el-icon-arrow-right" style="color: #374151" v-else></i>
            </div>
            <div class="flex-center margin-b-12 bg-color" v-if="background_setting">
              <div class="right-label" style="margin-right: 12px">颜色</div>
              <el-color-picker size="small" v-model="subtitleParams.background_color"
                               @change="saveSubtitleParams('background_color')"></el-color-picker>
              <div style="flex: 1"></div>
            </div>
            <div class="flex-center opacity" v-if="background_setting">
              <div class="right-label" style="margin-right: 12px">不透明度</div>
              <el-slider v-model="subtitleParams.background_opacity"
                         :step="0.01" style="flex: 1" :min="0" :max="1"
                         @input="saveSubtitleParams('background_opacity')"></el-slider>
              <div class="right-label" style="margin-left: 8px;width: 30px">
                {{ (subtitleParams.background_opacity * 100).toFixed(0) + '%' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {getAction} from "@/api/api";
import {EnhancedChoiceMixin} from "@/mixins/EnhancedChoiceMixin";

export default {
  name: 'human',
  mixins: [EnhancedChoiceMixin],
  data() {
    return {
      figures: [],
      figure: {},
      withTitle: true,
      subtitleNameParams: {
        'name_background_opacity': 0.6
      },
      name_background_setting: false,
      withSubtitle: true,
      subtitleParams: {
        background_opacity: 0.6
      },
      use_background: false,
      name_use_background: false,
      background_setting: false,
      titlePresets: [
        {
          id: '1',
          fontFamily: 'SJxingkai-C-Regular',
          backgroundColor: '#404040',
          stroke: '#000000',
          color: '#ffffff'
        },
        {
          id: '2',
          fontFamily: 'SJxingkai-C-Regular',
          backgroundColor: '#404040',
          stroke: '#ffffff',
          color: '#000000'
        },
        {
          id: '3',
          fontFamily: 'SJxingkai-C-Regular',
          backgroundColor: '#404040',
          stroke: '#FC0202',
          color: '#FDFF00'
        },
        {
          id: '4',
          fontFamily: 'SJxingkai-C-Regular',
          backgroundColor: '#404040',
          stroke: '#FDFF00',
          color: '#FC0202'
        },
        {
          id: '5',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: '#c8c8c8',
          stroke: '#000000',
          color: '#ffffff'
        },
        {
          id: '6',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: '#c8c8c8',
          stroke: '#ffffff',
          color: '#000000'
        },
        {
          id: '7',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: '#c8c8c8',
          stroke: '#FC0202',
          color: '#FDFF00'
        },
        {
          id: '8',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: '#c8c8c8',
          stroke: '#FDFF00',
          color: '#FC0202'
        },
      ],
      activeTitlePresetId: '1',
      activePresetId: '1',
      fontFamily: [],
      voices: [],
      sound: {},
      bgmList: [],
      bgm: {},
      bg_volume: 0.5,
      audio: null,
      audioIndex: null,
      titleTextStyle: {},
      textStyle: {},
      contentHeight: 640,
      topRatio: 0.25,
      bottomRatio: 0.75,
    }
  },
  mounted() {
    this.queryFigures()
    this.querySounds();
    this.queryBgm();
    this.queryFontFamily();
    this.initParams()
  },
  methods: {
    formatTooltip(val) {
      return val * 100 + '%';
    },
    queryFigures() {
      getAction("/figure/query_success").then((res) => {
        if (res.data.status === "success") {
          let data = res.data.data.filter(item => item.status === "success");
          if (data.length > 0) {
            this.figures = data.filter(item => item.lip_sync && item.status === "success").map(item => ({
              ...item, previewing: false
            }))
          }
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

      this.topRatio = 0.25
      this.bottomRatio = 0.75

      this.$nextTick(() => {
        this.updateTextStyle()
        this.updateTitleTextStyle()
      })
    },
    initParams() {
      this.figure = JSON.parse(sessionStorage.getItem('figure')) || {}

      this.contentHeight = Number(sessionStorage.getItem('figure_content_height')) || 640
      this.topRatio = Number(sessionStorage.getItem('figure_top_offset_ratio')) || 0.25
      this.bottomRatio = Number(sessionStorage.getItem('figure_bottom_offset_ratio')) || 0.75

      this.withSubtitle = sessionStorage.getItem("figure_with_subtitle") === 'true'
      this.withTitle = sessionStorage.getItem("figure_with_title") === 'true'
      this.bg_volume = Number(sessionStorage.getItem("figure_bg_volume")) || 0.5

      this.use_background = sessionStorage.getItem("figure_use_background") === 'true'
      this.name_use_background = sessionStorage.getItem("figure_name_use_background") === 'true'
      this.activePresetId = sessionStorage.getItem("figure_preset_id") || '1'
      this.subtitleParams.fontsize = parseInt(sessionStorage.getItem("figure_fontsize")) || 5
      this.subtitleParams.color = sessionStorage.getItem("figure_color") || '#ffffff'
      this.subtitleParams.font = sessionStorage.getItem("figure_font") || 'SJxingkai-C-Regular'
      this.subtitleParams.background_color = sessionStorage.getItem("figure_background_color") || '#404040'
      this.subtitleParams.background_opacity = Number(sessionStorage.getItem("figure_background_opacity")) || 0.6
      this.subtitleParams.stroke_color = sessionStorage.getItem("figure_stroke_color") || '#000000'

      let rgb_color = this.hexToRgb(this.subtitleParams.background_color)
      let rgba_color = `rgba(${rgb_color.replace('rgb(', '')
          .replace(')', '')}, ${this.subtitleParams.background_opacity})`
      this.textStyle = {
        backgroundColor: this.use_background? rgba_color : '',
        color: this.subtitleParams.color,
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
      this.subtitleNameParams.name_stroke_color = sessionStorage.getItem("figure_name_stroke_color") || '#000000'

      let name_rgb_color = this.hexToRgb(this.subtitleNameParams.name_background_color)
      let name_rgba_color = `rgba(${name_rgb_color.replace('rgb(', '')
          .replace(')', '')}, ${this.subtitleNameParams.name_background_opacity})`
      this.titleTextStyle = {
        backgroundColor: this.name_use_background? name_rgba_color : '',
        color: this.subtitleNameParams.name_color,
        fontFamily: this.subtitleNameParams.name_font,
        lineHeight: 1,
        '-webkit-text-stroke': `0.5px ${this.subtitleNameParams.name_stroke_color}`,
        fontSize: (360 * this.subtitleNameParams.name_fontsize / 100) + 'px',
        top: this.topRatio * this.contentHeight + 'px'
      }
    },
    querySounds() {
      getAction("/timbres/query_success").then((res) => {
        if (res.data.status === "success") {
          this.voices = res.data.data.filter(item => item.status === "success");
          if (this.voices.length > 0) {
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
    selectVoice(voice) {
      this.sound = voice
      sessionStorage.setItem("figure_setting_voice", JSON.stringify(voice))
    },
    selectBgm(item) {
      this.bgm = item
      sessionStorage.setItem("setting_bgm", JSON.stringify(item))
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
      sessionStorage.setItem("bg_volume", this.bg_volume)
    },
    switchTitle() {
      sessionStorage.setItem("figure_with_title", this.withTitle)
      this.activeTitleNames = this.withTitle ? ['1'] : []
    },
    selectTitlePreset(item) {
      this.activeTitlePresetId = item.id
      sessionStorage.setItem('figure_title_preset_id', item.id)
      this.subtitleNameParams.name_background_color = item.backgroundColor
      sessionStorage.setItem('figure_name_background_color', item.backgroundColor)
      this.subtitleNameParams.name_background_opacity = 0.6
      sessionStorage.setItem('figure_name_background_opacity', '0.6')
      this.subtitleNameParams.name_color = item.color
      sessionStorage.setItem('figure_name_color', item.color)
      this.subtitleNameParams.name_font = item.fontFamily
      sessionStorage.setItem('figure_name_font', item.fontFamily)
      this.subtitleNameParams.name_fontsize = 10
      sessionStorage.setItem('figure_name_fontsize', '10')
      this.subtitleNameParams.name_stroke_color = item.stroke
      sessionStorage.setItem('figure_name_stroke_color', item.stroke)
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
      this.titleTextStyle = {
        backgroundColor: this.name_use_background? rgba_color : '',
        color: this.subtitleNameParams.name_color,
        fontFamily: this.subtitleNameParams.name_font,
        lineHeight: 1,
        '-webkit-text-stroke': `0.5px ${this.subtitleNameParams.name_stroke_color}`,
        fontSize: (360 * this.subtitleNameParams.name_fontsize / 100) + 'px',
        top: this.topRatio * this.contentHeight + 'px'
      }

      sessionStorage.setItem('figure_top_offset_ratio', this.topRatio)
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
      sessionStorage.setItem("figure_with_subtitle", this.withSubtitle)
      this.activeNames = this.withSubtitle ? ['1'] : []
    },
    selectPreset(item) {
      this.activePresetId = item.id
      sessionStorage.setItem('figure_preset_id', item.id)
      this.subtitleParams.background_color = item.backgroundColor
      sessionStorage.setItem('figure_background_color', item.backgroundColor)
      this.subtitleParams.background_opacity = 0.6
      sessionStorage.setItem('figure_background_opacity', '0.6')
      this.subtitleParams.color = item.color
      sessionStorage.setItem('figure_color', item.color)
      this.subtitleParams.font = item.fontFamily
      sessionStorage.setItem('figure_font', item.fontFamily)
      this.subtitleParams['fontsize'] = 5
      sessionStorage.setItem('figure_fontsize', '5')
      this.subtitleParams.stroke_color = item.stroke
      sessionStorage.setItem('figure_stroke_color', item.stroke)
      this.updateTextStyle()
    },
    updateTextStyle() {
      let rgb_color = this.hexToRgb(this.subtitleParams.background_color)
      let rgba_color = `rgba(${rgb_color.replace('rgb(', '')
          .replace(')', '')}, ${this.subtitleParams.background_opacity})`
      this.textStyle = {
        backgroundColor: this.use_background? rgba_color : '',
        color: this.subtitleParams.color,
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
        this.$alert('请先选择您的数字人分身','提示')
        return
      }
      this.$router.push({path: path})
      sessionStorage.setItem('script_type', 'figure')
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

.figure-list {
  height: calc(100% - 80px);
  display: grid;
  gap: 15px;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  grid-auto-rows: min-content;
  position: relative;
  cursor: pointer;
  padding: 15px;
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
  transform: scale(1.05);
}

.figure-name {
  font-size: 15px;
  color: #1e1f20;
  width: 100px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 auto;
}

.figure-img-selected {
  border: 2px solid #4c8df1;
}

.figure-title-selected {
  color: #4c8df1 !important;
}

.figure-preview {
  height: calc(100% - 60px);
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

.style-card-item >>> .el-checkbox__inner {
  width: 16px;
  height: 16px;
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
  flex: 1;
  background-color: #f3f4f6;
  padding: 4px 4px 4px 8px;
  font-size: 12px;
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
</style>