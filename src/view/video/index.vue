<template>
  <div class="video">
    <div class="video-header">
      <div class="video-card">
        <div class="video-card-list">
          <div class="video-title">素材</div>
          <div class="video-template">
            <div v-for="item in materials" :key="item.id" style="border-radius: 10px; width: 130px"
                 @click="selectFigure(item)"
                 :style="{ 'background-color': item.id === figure.id ? '#e0e7fb' : '#FFFFFF' }">
              <el-image class="template-img" :src="item.picture" fit="cover"></el-image>
              <div class="template-name">{{ item.name }}</div>
            </div>
          </div>
        </div>
        <div class="video-card-list">
          <div class="video-title">角色</div>
          <div class="video-template">
            <div v-for="item in figures" :key="item.id" style="border-radius: 10px; width: 130px"
                 @click="selectFigure(item)"
                 :style="{ 'background-color': item.id === figure.id ? '#e0e7fb' : '#FFFFFF' }">
              <el-image class="template-img" :src="item.picture" fit="cover"></el-image>
              <div class="template-name">{{ item.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div style="display: flex;gap: 10px;margin-top: 10px">
      <div style="flex: 1">
        <div class="voice-card">
          <div class="video-title" style="margin-bottom: 10px">声音选择</div>
          <div style="display: flex;align-items: center;">
            <div class="play-btn" @click="previewAudio(sound, -1)" v-if="audioIndex !== -1">
              <i class="el-icon-play" style="font-size: 13px; color: #6286ed"></i>
            </div>
            <div class="play-btn" @click="stopAudio" v-else>
              <i class="el-icon-pause" style="font-size: 13px; color: #6286ed"></i>
            </div>
            <el-popover placement="right" trigger="click" @hide="stopAudio">
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
                      <div class="voice-name">{{ voice.name }}</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
              <div class="sound" slot="reference">
                <div class="sound-name">{{ sound.name }}</div>
                <i class="el-icon-a-ze-bars1" style="font-size: 20px; color: #9a9a9a"></i>
              </div>
            </el-popover>
          </div>
        </div>
      </div>
      <div style="flex: 1">
        <div class="voice-card">
          <div class="video-title" style="margin-bottom: 10px">背景音乐</div>
          <div style="display: flex;align-items: center;">
            <div class="play-btn" @click="previewAudio(bgm, -2)" v-if="audioIndex !== -2">
              <i class="el-icon-play" style="font-size: 13px; color: #6286ed"></i>
            </div>
            <div class="play-btn" @click="stopAudio" v-else>
              <i class="el-icon-pause" style="font-size: 13px; color: #6286ed"></i>
            </div>
            <el-popover placement="bottom" trigger="click"  @hide="stopAudio">
              <div class="popover-content">
                <el-row>
                  <el-col :span="12" v-for="(item, index) in bgmList" :key="item.id">
                    <div class="voice-item" :class="{ active: item.id === bgm.id }" @click="selectBgm(item)">
                      <div class="voice-icon" @click="previewAudio(item, 10000 + index)" v-if="audioIndex !== (10000 + index)">
                        <i :class="item.isPlay ? 'el-icon-pause' : 'el-icon-play'" style="font-size: 13px; color: #6286ed"></i>
                      </div>
                      <div class="voice-icon" @click="stopAudio" v-else>
                        <i class="el-icon-pause" style="font-size: 13px; color: #6286ed"></i>
                      </div>
                      <div class="voice-name">{{ item.name }}</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
              <div class="sound" slot="reference">
                <div class="sound-name">{{ bgm.name }}</div>
                <i class="el-icon-a-ze-bars1" style="font-size: 20px; color: #9a9a9a"></i>
              </div>
            </el-popover>
            <div style="margin: 0 10px;font-size: 13px;color: #303133">音量</div>
            <el-slider v-model="bg_volume" :step="0.1" style="width: 90px" :min="0.1" :max="1"
                       @change="saveBgmVolume('bg_volume')"></el-slider>
          </div>
        </div>
      </div>
    </div>
    <div style="margin-top: 10px;border-radius: 10px;padding: 15px;box-sizing: border-box;background: #ffffff;position: relative">
      <div style="margin-bottom: 20px;display: flex;align-items: center;position: absolute;top: 15px;left: 85px">
        <el-switch :width="50" v-model="withSubtitle" @change="switchSubtitle"></el-switch>
        <div style="margin-left: 20px;font-size: 13px;color: #9a9a9a">需开启添加字幕功能后，以下设置才会生效</div>
      </div>
      <el-collapse v-model="activeNames">
        <el-collapse-item title="字幕设置" name="1">
          <div style="display: flex;gap: 30px;align-items: center;height: 80px">
            <div style="text-align: center">
              <div style="font-size: 13px;height: 40px">字体颜色</div>
              <el-color-picker v-model="subtitleParams.color" size="small"
                               @change="saveSubtitleParams('color')"></el-color-picker>
            </div>
            <div style="text-align: center">
              <div style="font-size: 13px;height: 40px">字体样式</div>
              <el-select v-model="subtitleParams.font" placeholder="请选择" style="height: 35px;width: 180px"
                         @change="saveSubtitleParams('font')">
                <el-option
                    v-for="item in fontFamily"
                    :key="item.font_id"
                    :label="item.name"
                    :value="item.font_id"
                >
                  <div style="display: flex; align-items: center">
                    <img :src="item.img_path" style="width: 150px; height: 50px; margin-right: 8px;"/>
                    <span>{{ item.name }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>
            <div>
              <div style="font-size: 13px;height: 35px">字体大小</div>
              <div style="display: flex">
                <el-slider v-model="subtitleParams.fontsize" style="width: 170px" :min="5" :max="50"
                           @change="saveSubtitleParams('font_size')"></el-slider>
                <el-input-number v-model="subtitleParams.fontsize" controls-position="right" :min="5" :max="50"
                                 style="margin-left: 10px" @change="saveSubtitleParams('font_size')"></el-input-number>
              </div>
            </div>
            <div style="text-align: center">
              <div style="font-size: 13px;height: 40px">描边颜色</div>
              <el-color-picker v-model="subtitleParams.stroke_color" size="small"
                               @change="saveSubtitleParams('stroke_color')"></el-color-picker>
            </div>
            <div style="text-align: center">
              <div style="font-size: 13px;height: 40px">开启字幕背景</div>
              <div style="height: 35px;">
                <el-switch :width="50" v-model="use_background" @change="switchUseBackground" style="margin-top: 5px"></el-switch>
              </div>
            </div>
            <div style="text-align: center">
              <div style="font-size: 13px;height: 40px">背景颜色</div>
              <el-color-picker v-model="subtitleParams.background_color" show-alpha size="small"
                               @change="saveSubtitleParams('background_color')"></el-color-picker>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="text-card">
      <div class="video-title" style="margin-bottom: 10px">口播文案</div>
      <el-input type="textarea" style="height: calc(100% - 30px); width: 100%" @focus="isFocus = true"
                @blur="isFocus = false" v-model="text">
      </el-input>
      <span class="text-tips" v-if="!isFocus && text === ''">请输入视频口播文案</span>
    </div>
    <div style="height: 50px;display: flex;align-items: center;">
      <div style="margin-right: 20px;margin-left: 10px;font-size: 15px">视频倒序循环</div>
      <el-switch :width="50" v-model="reverse" @change="switchReverse"></el-switch>
    </div>
    <el-button type="primary" class="generate-btn" @click="verify">生成视频</el-button>
  </div>
</template>

<script>
import {getAction, postAction} from "@/api/api";

export default {
  name: "Video",
  data() {
    return {
      isPlay: false,
      templates: [],
      materials: [],
      figures: [],
      figure: {},
      voices: [],
      sound: {},
      bgmList: [],
      bgm: {},
      bg_volume: 0.5,
      text: "",
      audio: null,
      audioIndex: null,
      isFocus: false,
      reverse: false,
      withSubtitle: false,
      use_background: false,
      subtitleParams: {},
      fontFamily: [],
      activeNames: []
    };
  },
  mounted() {
    this.querySounds();
    this.queryFigures();
    this.queryFontFamily()
    this.queryBgm()
    this.initParams()
  },
  beforeDestroy() {
    this.stopAudio();
  },
  methods: {
    initParams() {
      this.withSubtitle = sessionStorage.getItem("with_subtitle") === 'true'
      this.reverse = sessionStorage.getItem("reverse") === 'true'
      this.bg_volume = Number(sessionStorage.getItem("bg_volume")) || 0.5
      this.use_background = sessionStorage.getItem("use_background") === 'true'
      this.subtitleParams.fontsize = parseInt(sessionStorage.getItem("font_size")) || 24
      this.subtitleParams.color = sessionStorage.getItem("color") || '#ffffff'
      this.subtitleParams.font = sessionStorage.getItem("font") || 'SJxingkai-C-Regular'
      this.subtitleParams.background_color = sessionStorage.getItem("background_color") || 'rgba(64,64,64,0.6)'
      this.subtitleParams.stroke_color = sessionStorage.getItem("stroke_color") || '#000000'
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
    queryFigures() {
      getAction("/figure/query_success").then((res) => {
        if (res.data.status === "success") {
          if (res.data.data.length > 0) {
            this.materials = res.data.data.filter(item => !item.lip_sync);
            this.figures = res.data.data.filter(item =>  item.lip_sync);
            let figure = JSON.parse(sessionStorage.getItem("setting_figure"))
            if (figure && res.data.data.some(item => item.id === figure.id)) {
              this.figure = figure
            } else {
              this.figure = res.data.data[0];
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
          if (res.data.data.length > 0) {
            this.voices = res.data.data;
            let sound = JSON.parse(sessionStorage.getItem("setting_voice"))
            if (sound && this.voices.some(item => item.id === sound.id)) {
              this.sound = sound
            } else {
              this.sound = this.voices[0];
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
      getAction('/bgm/all').then(res => {
        if (res.data.status === 'success') {
          if (res.data.data.length > 0) {
            this.bgmList = res.data.data
            let bgm = JSON.parse(sessionStorage.getItem("setting_bgm"))
            if (bgm && this.bgmList.some(item => item.id === bgm.id)) {
              this.bgm = bgm
            } else {
              this.bgm = this.bgmList[0]
            }
          }
        } else {
          this.$message.error("获取背景音乐列表失败。");
        }
      }).catch((error) => {
        console.error("获取背景音乐列表失败:", error);
      })
    },
    previewAudio(voice, index) {
      if (voice.id === 'default') {
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
    setName() {
      let data = new Date();
      let year = data.getFullYear();
      let month = String(data.getMonth() + 1).padStart(2, "0");
      let day = String(data.getDate()).padStart(2, "0");
      let hours = String(data.getHours()).padStart(2, "0");
      let minutes = String(data.getMinutes()).padStart(2, "0");
      let seconds = String(data.getSeconds()).padStart(2, "0");
      return year + '-' + month + '-' + day + '_' + hours + '-' + minutes + '-' + seconds
    },
    verify() {
      getAction('/verify/activation').then(res => {
        if (res.data.status === 'success') {
          this.generateVideo()
        } else {
          this.$alert(res.data.message, "验证失败");
        }
      })
    },
    generateVideo() {
      let name = this.setName()
      let background_colors = this.subtitleParams.background_color.replace(/rgba|\(|\)|\s/g, '').split(',');
      let params = {
        video_id: this.figure.video_id,
        voice_id: this.sound.voice_id,
        bgm_id: this.bgm.id,
        filename: name,
        reverse: this.reverse,
        text: this.text,
        with_subtitle: this.withSubtitle,
        lip_sync: !!this.figure.lip_sync,
        subtitle_params: {
          font: this.subtitleParams.font,
          fontsize: this.subtitleParams['fontsize'],
          color: this.subtitleParams.color,
          stroke_color: this.subtitleParams.stroke_color,
          use_background: this.use_background,
          background_color: background_colors.slice(0, 3).map(Number),
          background_opacity: Number(background_colors[3])
        },
      };
      postAction("/figure/generate_video", params).then((res) => {
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

    selectFigure(item) {
      this.figure = item
      sessionStorage.setItem("setting_figure", JSON.stringify(item))
    },
    selectVoice(voice) {
      this.sound = voice
      sessionStorage.setItem("setting_voice", JSON.stringify(voice))
    },
    selectBgm(item) {
      this.bgm = item
      sessionStorage.setItem("setting_bgm", JSON.stringify(item))
    },
    switchSubtitle() {
      sessionStorage.setItem("with_subtitle", this.withSubtitle)
    },
    saveBgmVolume() {
      sessionStorage.setItem("bg_volume", this.bg_volume)
    },
    switchUseBackground() {
      sessionStorage.setItem("use_background", this.use_background)
    },
    saveSubtitleParams(key) {
      this.$forceUpdate()
      let value
      if (key === 'font_size') {
        value = this.subtitleParams['fontsize']
      } else {
        value = this.subtitleParams[key]
      }
      sessionStorage.setItem(key, value)
    },
    switchReverse() {
      sessionStorage.setItem("reverse", this.reverse)
    },
  },
};
</script>

<style scoped>
.video {
  width: 100%;
  height: 100%;
  min-height: 800px;
  padding: 5px 40px;
  box-sizing: border-box;
  overflow: auto;
}

.video-title {
  color: #1e1f20;
  font-size: 15px;
}

.video-header {

}

.video-card {
  width: 100%;
  display: flex;
  gap: 10px;
}

.video-card-list {
  flex: 1;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 5px 15px 15px 15px;
  box-sizing: border-box;
}

.video-template {
  width: 100%;
  height: 195px;
  margin-top: 7px;
  display: grid;
  overflow-y: auto;
  overflow-x: hidden;;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  grid-template-rows: 195px;
  gap: 15px;
  position: relative;
}

.template-img {
  width: 120px;
  height: 160px;
  margin: 5px;
  border-radius: 10px;
}

.template-name {
  font-size: 15px;
  color: #1e1f20;
  width: 120px;
  text-align: center;
}

.voice-card {
  width: 100%;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 15px;
  box-sizing: border-box;
}

.play-btn {
  width: 36px;
  height: 36px;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 1px solid #f3f3f3;
  background-color: rgb(247, 247, 247, 0.8);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
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
}

.sound {
  width: 200px;
  height: 35px;
  border-radius: 5px;
  margin-left: 10px;
  background-color: rgb(247, 247, 247, 0.8);
  border: 1px solid #f3f3f3;
  display: flex;
  align-items: center;
}

.sound-name {
  width: calc(100% - 60px);
  height: 40px;
  color: #1e1f20;
  font-size: 14px;
  margin-left: 20px;
  line-height: 40px;
}

.text-card {
  width: 100%;
  height: calc(100% - 620px);
  margin-top: 10px;
  min-height: 180px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 15px;
  box-sizing: border-box;
  position: relative;
}

.video >>> .el-textarea__inner {
  resize: none;
  background-color: #f9f9f9;
  height: 100%;
  border: none;
  border-radius: 10px;
  padding: 10px 15px;
}

.text-tips {
  position: absolute;
  bottom: 50%;
  left: 50%;
  color: #9a9a9a;
  transform: translate(-50%, 50%);
}

.generate-btn {
  width: 126px;
  border-radius: 4px;
  margin-left: calc(50% - 63px);
}

.video >>> .el-slider__button {
  height: 18px;
  width: 4px;
  border-radius: 2px;
  border: none;
  background-color: #E4E7ED;
}

.video >>> .el-slider__button-wrapper {
  height: 33px;
}

.video >>> .el-slider__runway {
  height: 3px;
}

.video >>> .el-slider__bar {
  height: 3px;
}

.video >>> .el-input__inner {
  height: 30px;
  line-height: 30px;
  padding-right: 35px !important;
}

.video >>> .el-input-number {
  width: 80px
}

.video >>> .el-input-number__decrease {
  width: 20px;
  height: 15px !important;
  line-height: 15px !important;
  bottom: 5px !important;
}

.video >>> .el-input-number__increase {
  width: 20px;
  height: 14px !important;
  line-height: 14px !important;
  top: 5px !important;
}

.video >>> .el-input__icon {
  line-height: 30px;
}

.el-select-dropdown__item {
  height: 52px;
  line-height: 52px;
}

.video >>> .el-collapse {
  border: none !important;
  margin-top: 0 !important;
}

.video >>> .el-collapse-item__header {
  height: 21px;
  line-height: 21px;
  border: none;
  font-size: 15px;
  color: #1e1f20;
}

.video >>> .el-collapse-item__content {
  padding-bottom: 0;
  margin-top: 15px;
}

.video >>> .el-collapse-item__wrap {
  border: none !important;
}
</style>
