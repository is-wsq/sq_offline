<template>
  <div class="material">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="$router.go(-1)">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="material-h-t">素材选择</div>
      <div style="width: 36px"></div>
    </div>
    <div class="material-content">
      <div class="c-left">
        <div style="line-height: 40px;font-weight: bold;margin-left: 15px">素材库</div>
        <div class="m-card"
             @mousedown="startSelection"
             @mousemove="updateSelection"
             @mouseup="endSelection"
             @mouseleave="endSelection"
             ref="videoGrid">
<!--          <div class="m-item" v-for="item in filter_materials" :key="item.id"-->
<!--               @mousedown="onVideoItemMouseDown"-->
<!--               @mouseleave="onMouseLeave"-->
<!--               @mouseenter="onMouseEnter"-->
<!--               @click="selectMaterial(item, $event)"-->
<!--               ref="videoItems">-->
          <div class="m-item" v-for="item in filter_materials" :key="item.id"
               @mousedown="onVideoItemMouseDown"
               @click="selectMaterial(item, $event)"
               ref="videoItems">
            <el-image class="m-item-img" :class="{'m-img-selected': material_list.includes(item.id) }"
                      :src="item.picture" fit="cover"></el-image>
<!--            <el-popover placement="right" trigger="hover" :content="''" @show="item.previewing = true"-->
<!--                        @hide="item.previewing = false" :disabled="isSelecting || !shouldShowPopover"-->
<!--                        popper-class="video-preview-popover" :open-delay="1000" :close-delay="300">-->
<!--              <el-image slot="reference" class="m-item-img" :class="{'m-img-selected': material_list.includes(item.id) }"-->
<!--                        :src="item.picture" fit="cover"></el-image>-->
<!--              <video :src="item.filepath" loop muted autoplay style="min-width: 150px" height="180"-->
<!--                     v-if="item.previewing">-->
<!--              </video>-->
<!--            </el-popover>-->
<!--            <div class="m-item-title" :class="{'m-title-selected': material_list.includes(item.id) }">{{item.name}}</div>-->

            <div style="display: flex">
              <div class="m-item-title" :class="{'m-title-selected': material_list.includes(item.id) }" :title="item.name">{{ item.name }}</div>
              <div style="line-height: 1.5;margin-right: 5px">
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
          <!-- 选框元素 -->
          <div v-if="isSelecting" class="selection-box"
               :style="{
                    left: `${selectionLeft}px`,
                    top: `${selectionTop}px`,
                    width: `${selectionWidth}px`,
                    height: `${selectionHeight}px`
                 }">
          </div>
        </div>
      </div>
      <div class="c-center">
        <div class="c-center-preview">
          <div class="c-center-preview-content">
            <div class="c-preview-setting"
                 ref="container"
                 @mousemove="onMouseMove"
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
          <el-button type="primary" class="next-btn" @click="nextStep('/smartGenerate')">下一步：编辑文案</el-button>
          <el-button type="primary" class="next-btn" @click="nextStep('/syncCv')">下一步：一键混剪</el-button>
        </div>
      </div>
      <div class="c-right">
        <div class="margin-b-12 font-weight">样式设置</div>
        <div class="s-card">
          <div class="s-card-item margin-b-16">
            <div class="margin-b-12 font-weight">音频</div>
            <div class="s-voice-title">主播声音</div>
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
            <div class="s-voice-title">背景声音</div>
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
              <div class="s-voice-title volume">音量</div>
              <div class="s-btn-volume">
                <el-slider v-model="bg_volume" :step="0.1" style="width: 80px" :min="0.1" :max="1"
                           @change="saveBgmVolume('bg_volume')"></el-slider>
              </div>
            </div>
          </div>
          <div class="s-card-item margin-b-16">
            <div class="margin-b-12 font-weight flex-center">
              <div style="flex: 1">口播标题</div>
              <el-checkbox v-model="withTitle" @change="switchTitle"></el-checkbox>
            </div>
            <div class="flex-center">
              <div class="s-voice-title" style="flex: 1">预设样式</div>
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
              <div class="s-voice-title" style="flex: 1;display: flex;align-items: center">
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
              <el-color-picker size="small" v-model="subtitleNameParams.name_color"
                               @change="saveSubtitleNameParams('name_color')"></el-color-picker>
            </div>
            <div class="flex-center margin-t-8 margin-b-16">
              <div class="s-voice-title" style="flex: 1">描边颜色</div>
              <el-color-picker size="small" v-model="subtitleNameParams.name_stroke_color"
                               @change="saveSubtitleNameParams('name_stroke_color')"></el-color-picker>
            </div>
            <div class="flex-center" :class="{'margin-b-16': name_background_setting}" style="cursor: pointer"
                 @click="name_background_setting = !name_background_setting">
              <div class="s-voice-title" style="flex: 1">背景颜色</div>
              <i class="el-icon-arrow-down" style="color: #374151" v-if="name_background_setting"></i>
              <i class="el-icon-arrow-right" style="color: #374151" v-else></i>
            </div>
            <div class="flex-center margin-b-12 bg-color" v-if="name_background_setting">
              <div class="s-voice-title" style="margin-right: 12px">颜色</div>
              <el-color-picker size="small" v-model="subtitleNameParams.name_background_color"
                               @change="saveSubtitleNameParams('name_background_color')"></el-color-picker>
              <div style="flex: 1"></div>
            </div>
            <div class="flex-center opacity" v-if="name_background_setting">
              <div class="s-voice-title" style="margin-right: 12px">不透明度</div>
              <el-slider v-model="subtitleNameParams.name_background_opacity"
                         :step="0.01" style="flex: 1" :min="0" :max="1"
                         @input="saveSubtitleNameParams('name_background_opacity')"></el-slider>
              <div class="s-voice-title" style="margin-left: 8px;width: 30px">
                {{ (subtitleNameParams.name_background_opacity * 100).toFixed(0) + '%' }}
              </div>
            </div>
          </div>
          <div class="s-card-item">
            <div class="margin-b-12 font-weight flex-center">
              <div style="flex: 1">口播内容</div>
              <el-checkbox v-model="withSubtitle" @change="switchSubtitle"></el-checkbox>
            </div>
            <div class="flex-center">
              <div class="s-voice-title" style="flex: 1;display: flex">预设样式</div>
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
              <div class="s-voice-title" style="flex: 1;display: flex;align-items: center">
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
              <el-color-picker size="small" v-model="subtitleParams.color"
                               @change="saveSubtitleParams('color')"></el-color-picker>
            </div>
            <div class="flex-center margin-t-8 margin-b-16">
              <div class="s-voice-title" style="flex: 1">描边颜色</div>
              <el-color-picker size="small" v-model="subtitleParams.stroke_color"
                               @change="saveSubtitleParams('stroke_color')"></el-color-picker>
            </div>
            <div class="flex-center" :class="{'margin-b-16': background_setting}" style="cursor: pointer"
                 @click="background_setting = !background_setting">
              <div class="s-voice-title" style="flex: 1">背景颜色</div>
              <i class="el-icon-arrow-down" style="color: #374151" v-if="background_setting"></i>
              <i class="el-icon-arrow-right" style="color: #374151" v-else></i>
            </div>
            <div class="flex-center margin-b-12 bg-color" v-if="background_setting">
              <div class="s-voice-title" style="margin-right: 12px">颜色</div>
              <el-color-picker size="small" v-model="subtitleParams.background_color"
                               @change="saveSubtitleParams('background_color')"></el-color-picker>
              <div style="flex: 1"></div>
            </div>
            <div class="flex-center opacity" v-if="background_setting">
              <div class="s-voice-title" style="margin-right: 12px">不透明度</div>
              <el-slider v-model="subtitleParams.background_opacity"
                         :step="0.01" style="flex: 1" :min="0" :max="1"
                         @input="saveSubtitleParams('background_opacity')"></el-slider>
              <div class="s-voice-title" style="margin-left: 8px;width: 30px">
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
import Video from "@/view/video/index.vue";

export default {
  name: 'Material',
  components: {Video},
  mixins: [EnhancedChoiceMixin],
  data() {
    return {
      materials: [],
      filter_materials: [],
      material_list: [],
      mute_materials: [],
      withTitle: true,
      subtitleNameParams: {
        'name_background_opacity': 0.6
      },
      name_background_setting: false,
      withSubtitle: true,
      subtitleParams: {
        background_opacity: 0.6
      },
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
      dragging: false,
      draggingType: '',
      startY: 0,
      topOffset: 0,
      bottomOffset: 100,
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
    this.querySounds();
    this.queryBgm();
    this.queryFontFamily();
    this.initParams()
  },
  methods: {
    addMute(id) {
      this.mute_materials.push(id)
      sessionStorage.setItem("mute_materials", JSON.stringify(this.mute_materials))
    },
    removeMute(id) {
      this.mute_materials = this.mute_materials.filter(item => item !== id)
      sessionStorage.setItem("mute_materials", JSON.stringify(this.mute_materials))
    },
    initParams() {
      // this.material_list = JSON.parse(sessionStorage.getItem('material_list')) || []
      this.mute_materials = JSON.parse(sessionStorage.getItem('mute_materials')) || []

      this.topOffset = Number(sessionStorage.getItem('top_offset')) || 0
      this.bottomOffset = Number(sessionStorage.getItem('bottom_offset')) || 100

      this.withSubtitle = sessionStorage.getItem("with_subtitle") === 'true'
      this.withTitle = sessionStorage.getItem("with_title") === 'true'
      this.bg_volume = Number(sessionStorage.getItem("bg_volume")) || 0.5

      this.activePresetId = sessionStorage.getItem("preset_id") || '1'
      this.subtitleParams.fontsize = parseInt(sessionStorage.getItem("fontsize")) || 5
      this.subtitleParams.color = sessionStorage.getItem("color") || '#ffffff'
      this.subtitleParams.font = sessionStorage.getItem("font") || 'SJxingkai-C-Regular'
      this.subtitleParams.background_color = sessionStorage.getItem("background_color") || '#404040'
      this.subtitleParams.background_opacity = Number(sessionStorage.getItem("background_opacity")) || 0.6
      this.subtitleParams.stroke_color = sessionStorage.getItem("stroke_color") || '#000000'

      let rgb_color = this.hexToRgb(this.subtitleParams.background_color)
      let rgba_color = `rgba(${rgb_color.replace('rgb(', '')
          .replace(')', '')}, ${this.subtitleParams.background_opacity})`
      this.textStyle = {
        backgroundColor: rgba_color,
        color: this.subtitleParams.color,
        fontFamily: this.subtitleParams.font,
        lineHeight: 1,
        '-webkit-text-stroke': `0.5px ${this.subtitleParams.stroke_color}`,
        fontSize: (360 * this.subtitleParams['fontsize'] / 100) + 'px',
        top: this.bottomOffset + 'px'
      }

      this.activeTitlePresetId = sessionStorage.getItem("title_preset_id") || '1'
      this.subtitleNameParams.name_fontsize = parseInt(sessionStorage.getItem("name_fontsize")) || 10
      this.subtitleNameParams.name_color = sessionStorage.getItem("name_color") || '#ffffff'
      this.subtitleNameParams.name_font = sessionStorage.getItem("name_font") || 'SJxingkai-C-Regular'
      this.subtitleNameParams.name_background_color = sessionStorage.getItem("name_background_color") || '#404040'
      this.subtitleNameParams.name_background_opacity = Number(sessionStorage.getItem("name_background_opacity")) || 0.6
      this.subtitleNameParams.name_stroke_color = sessionStorage.getItem("name_stroke_color") || '#000000'

      let name_rgb_color = this.hexToRgb(this.subtitleNameParams.name_background_color)
      let name_rgba_color = `rgba(${name_rgb_color.replace('rgb(', '')
          .replace(')', '')}, ${this.subtitleNameParams.name_background_opacity})`
      this.titleTextStyle = {
        backgroundColor: name_rgba_color,
        color: this.subtitleNameParams.name_color,
        fontFamily: this.subtitleNameParams.name_font,
        lineHeight: 1,
        '-webkit-text-stroke': `0.5px ${this.subtitleNameParams.name_stroke_color}`,
        fontSize: (360 * this.subtitleNameParams.name_fontsize / 100) + 'px',
        top: this.topOffset + 'px'
      }
    },
    queryMaterials() {
      getAction("/figure/query_success").then((res) => {
        if (res.data.status === "success") {
          let data = res.data.data.filter(item => item.status === "success");
          // data.forEach(item => {
          //   item.picture = item.picture.replace('127.0.0.1', '120.86.188.249')
          // })
          if (data.length > 0) {
            this.materials = data.filter(item => !item.lip_sync).map(item => ({
              ...item, previewing: false, size: item.height + '*' + item.width
            }))
            this.material_list = JSON.parse(sessionStorage.getItem('material_list')) || []
            if (this.material_list.length > 0) {
              let size = this.materials.find(item => item.id === this.material_list[0]).size
              this.filter_materials = this.materials.filter(item => item.size === size)
            }else {
              this.filter_materials = this.materials
            }
          }
        }
      }).catch((error) => {
        console.error("获取角色列表失败:", error);
      });
    },
    querySounds() {
      getAction("/timbres/query_success").then((res) => {
        if (res.data.status === "success") {
          this.voices = res.data.data.filter(item => item.status === "success");
          if (this.voices.length > 0) {
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
          // this.fontFamily.forEach(item => {
          //   item.img_path = item.img_path.replace('127.0.0.1', '120.86.188.249')
          // })
        }
      }).catch((error) => {
        console.error("获取字体样式列表失败:", error);
      });
    },
    selectMaterial(item, event) {
      if (this.isSelecting || !this.isVideoItemClick) {
        event.stopPropagation()
        return
      }
      const isShiftKey = event.shiftKey
      if (this.material_list.length === 0) {
        this.filter_materials = this.filter_materials.filter(material => material.size === item.size)
      }
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
      this.topOffset = 0
      this.bottomOffset = 100
      this.updateTextStyle()
      this.updateTitleTextStyle()
      if (!this.material_list.includes(item.id)) {
        this.material_list.push(item.id)
      } else {
        if (shiftSelect) {
          return
        }
        this.material_list.splice(this.material_list.indexOf(item.id), 1)
        if (this.material_list.length === 0) {
          this.lastClickedIndex = null
          this.filter_materials = this.materials
        }
      }
      sessionStorage.setItem('material_list', JSON.stringify(this.material_list))
    },
    selectVoice(voice) {
      this.sound = voice
      sessionStorage.setItem("setting_voice", JSON.stringify(voice))
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
      sessionStorage.setItem("with_title", this.withTitle)
      this.activeTitleNames = this.withTitle ? ['1'] : []
    },
    selectTitlePreset(item) {
      this.activeTitlePresetId = item.id
      sessionStorage.setItem('title_preset_id', item.id)
      this.subtitleNameParams.name_background_color = item.backgroundColor
      sessionStorage.setItem('name_background_color', item.backgroundColor)
      this.subtitleNameParams.name_background_opacity = 0.6
      sessionStorage.setItem('name_background_opacity', '0.6')
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
      this.titleTextStyle = {
        backgroundColor: rgba_color,
        color: this.subtitleNameParams.name_color,
        fontFamily: this.subtitleNameParams.name_font,
        lineHeight: 1,
        '-webkit-text-stroke': `0.5px ${this.subtitleNameParams.name_stroke_color}`,
        fontSize: (360 * this.subtitleNameParams.name_fontsize / 100) + 'px',
        top: this.topOffset + 'px'
      }

      const containerHeight = this.$refs.container.clientHeight;
      let top_offset_ratio = (this.topOffset / containerHeight).toFixed(2)
      sessionStorage.setItem('top_offset', this.topOffset)
      sessionStorage.setItem('top_offset_ratio', top_offset_ratio)
    },
    saveSubtitleNameParams(key) {
      let value = this.subtitleNameParams[key]
      this.updateTitleTextStyle()
      sessionStorage.setItem(key, value)
      this.activeTitlePresetId = '0'
      sessionStorage.setItem('title_preset_id', '0')
      this.$forceUpdate()
    },
    switchSubtitle() {
      sessionStorage.setItem("with_subtitle", this.withSubtitle)
      this.activeNames = this.withSubtitle ? ['1'] : []
    },
    selectPreset(item) {
      this.activePresetId = item.id
      sessionStorage.setItem('preset_id', item.id)
      this.subtitleParams.background_color = item.backgroundColor
      sessionStorage.setItem('background_color', item.backgroundColor)
      this.subtitleParams.background_opacity = 0.6
      sessionStorage.setItem('background_opacity', '0.6')
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
      this.textStyle = {
        backgroundColor: rgba_color,
        color: this.subtitleParams.color,
        fontFamily: this.subtitleParams.font,
        lineHeight: 1,
        '-webkit-text-stroke': `0.5px ${this.subtitleParams.stroke_color}`,
        fontSize: (360 * this.subtitleParams['fontsize'] / 100) + 'px',
        top: this.bottomOffset + 'px'
      }

      const containerHeight = this.$refs.container.clientHeight;
      let bottom_offset_ratio = (this.bottomOffset / containerHeight).toFixed(2)
      sessionStorage.setItem('bottom_offset', this.bottomOffset)
      sessionStorage.setItem('bottom_offset_ratio', bottom_offset_ratio)
    },
    saveSubtitleParams(key) {
      let value = this.subtitleParams[key]
      this.updateTextStyle()
      sessionStorage.setItem(key, value)
      this.activePresetId = '0'
      sessionStorage.setItem('preset_id', '0')
      this.$forceUpdate()
    },
    nextStep(path) {
      if (this.material_list.length === 0) {
        this.$alert('请先选择需要混剪的素材', '提示')
        return
      }
      sessionStorage.setItem('script_type', 'material')
      this.$router.push({path: path})
    }
  }
}
</script>

<style scoped>
.material {
  min-width: 1200px;
  min-height: 800px;
  height: 100%;
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

.m-card {
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
  max-width: 140px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.c-center {
  flex: 1;
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
  padding: 20px 0;
  cursor: move;
  user-select: none;
}

.c-preview-content {
  position: absolute;
  width: 100%;
  text-align: center;
  padding: 20px 0;
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

.s-card-item >>> .el-checkbox__inner {
  width: 16px;
  height: 16px;
}

.s-voice-title {
  font-size: 12px;
  color: #374151;
}

.bg-color >>> .el-color-picker__trigger {
  width: 132px;
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