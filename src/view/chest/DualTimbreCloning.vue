<template>
  <div class="dualTimbreCloning"
       v-loading="loading"
       element-loading-text="语音克隆中..."
       element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.8)">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="back">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="c-page-header">双人语音克隆</div>
      <div style="width: 36px"></div>
    </div>
    <div class="dualTimbreCloning-content">
      <div class="work-setting-area">
        <div class="font-weight">工作台</div>
        <div style="flex: 1;overflow-y: auto">
          <div class="work-setting-label margin-t-12">文本内容</div>
          <el-input type="textarea" v-model="copyText" :autosize="{ minRows: 3, maxRows: 5 }"
                    placeholder="请按照格式输入文本内容..." resize="none"></el-input>
          <div style="display: flex;margin-top: 16px">
            <div class="work-setting-label" style="margin: 0 !important;line-height: 24px">音色1</div>
            <el-popover ref="modePopoverRef1" placement="bottom-start" trigger="click">
              <div class="mode-popover-item" @click="saveMode('common', 1)">
                普通模式
                <i class="el-icon-check mode-select" v-if="mode1 === 'common'"></i>
              </div>
              <div class="mode-popover-item" @click="saveMode('advanced', 1)">
                高级模式
                <i class="el-icon-check mode-select" v-if="mode1 === 'advanced'"></i>
              </div>
              <div slot="reference" class="mode-switch">
                {{ mode1 === 'common' ? '普通模式' : '高级模式' }}
                <i class="el-icon-arrow-down"></i>
              </div>
            </el-popover>
            <div class="mode-info" v-if="mode1 === 'advanced'">
              <i class="el-icon-info" style="font-size: 16px;margin-right: 5px"></i>
              高级模式将调用云端接口并计费
            </div>
          </div>
          <div class="s-voice-content">
            <div class="s-voice-btn">
              <i class="el-icon-play" @click="previewAudio(timbreInfo1, -1)" v-if="audioIndex !== -1"></i>
              <i class="el-icon-pause" @click="stopAudio" v-else></i>
            </div>
            <el-popover ref="voiceRef1" placement="bottom" trigger="click" @hide="stopAudio" style="flex: 1">
              <div class="popover-content">
                <el-row>
                  <el-col :span="12" v-for="(voice, index) in mode1 === 'common'? voices : minimax_voices" :key="voice.id">
                    <div class="voice-item" :class="{ active: voice.id === timbreInfo1.id }" @click="selectVoice(voice, 1)">
                      <div class="voice-icon" @click.stop="previewAudio(voice, index)" v-if="audioIndex !== index">
                        <i class="el-icon-play" style="font-size: 12px; color: #6286ed"></i>
                      </div>
                      <div class="voice-icon" @click.stop="stopAudio" v-else>
                        <i class="el-icon-pause" style="font-size: 12px; color: #6286ed"></i>
                      </div>
                      <div class="voice-name" :title="voice.name">{{ voice.name }}</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
              <div class="s-voice-name" slot="reference" :title="timbreInfo1.name">{{ timbreInfo1.name }}</div>
            </el-popover>
          </div>
          <div style="display: flex;margin-top: 16px">
            <div class="work-setting-label" style="margin: 0 !important;line-height: 24px">音色2</div>
            <el-popover ref="modePopoverRef2" placement="bottom-start" trigger="click">
              <div class="mode-popover-item" @click="saveMode('common', 2)">
                普通模式
                <i class="el-icon-check mode-select" v-if="mode2 === 'common'"></i>
              </div>
              <div class="mode-popover-item" @click="saveMode('advanced', 2)">
                高级模式
                <i class="el-icon-check mode-select" v-if="mode2 === 'advanced'"></i>
              </div>
              <div slot="reference" class="mode-switch">
                {{ mode2 === 'common' ? '普通模式' : '高级模式' }}
                <i class="el-icon-arrow-down"></i>
              </div>
            </el-popover>
            <div class="mode-info" v-if="mode2 === 'advanced'">
              <i class="el-icon-info" style="font-size: 16px;margin-right: 5px"></i>
              高级模式将调用云端接口并计费
            </div>
          </div>
          <div class="s-voice-content">
            <div class="s-voice-btn">
              <i class="el-icon-play" @click="previewAudio(timbreInfo2, -2)" v-if="audioIndex !== -2"></i>
              <i class="el-icon-pause" @click="stopAudio" v-else></i>
            </div>
            <el-popover ref="voiceRef2" placement="bottom" trigger="click" @hide="stopAudio" style="flex: 1">
              <div class="popover-content">
                <el-row>
                  <el-col :span="12" v-for="(voice, index) in mode2 === 'common'? voices : minimax_voices" :key="voice.id">
                    <div class="voice-item" :class="{ active: voice.id === timbreInfo2.id }" @click="selectVoice(voice, 2)">
                      <div class="voice-icon" @click.stop="previewAudio(voice, index)" v-if="audioIndex !== index">
                        <i class="el-icon-play" style="font-size: 12px; color: #6286ed"></i>
                      </div>
                      <div class="voice-icon" @click.stop="stopAudio" v-else>
                        <i class="el-icon-pause" style="font-size: 12px; color: #6286ed"></i>
                      </div>
                      <div class="voice-name" :title="voice.name">{{ voice.name }}</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
              <div class="s-voice-name" slot="reference" :title="timbreInfo2.name">{{ timbreInfo2.name }}</div>
            </el-popover>
          </div>
        </div>
        <div class="generate-btn">
          <el-button @click="generate" :loading="!!loading">
            <i class="el-icon-bianjiqi btn-icon" v-if="!loading"></i>
            {{ !!loading ? '克隆中...' : '语音克隆' }}
          </el-button>
        </div>
      </div>
      <div class="dualTimbreCloning-preview">
        <div class="preview-header">
          <div class="preview-header-title">应用介绍&输入建议</div>
          <div class="preview-header-desc">
            <div>按照格式输入文本<br>[S1]代表第一个人讲话<br>[S2]代表第二个人讲话<br>
            </div>
          </div>
        </div>
        <div class="preview-body">
          <el-image :src="resultImg" class="preview-image" fit="contain"></el-image>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ClearCacheMixin} from "@/mixins/ClearCacheMixin";
import {getAction} from "@/api/api";

export default {
  name: 'DualTimbreCloning',
  mixins: [ClearCacheMixin],
  data() {
    return {
      copyText: '[S1]最近 AI 风刮得那叫一个猛，咱要不也凑凑热闹，学起来？听说能省不少事儿呢！\n' +
                '[S2]AI 确实是个好家伙，用处可多了去了。不过你想学 AI 的哪块啊？难不成想造个自己的 AI 替身，帮你上班打卡？\n' +
                '[S1]别贫了，我就想提高工作效率，像做 PPT 这事儿，每次都得熬夜，太折磨人。要是 AI 能帮忙，那可就解放了。\n' +
                '[S2]那咱先从基础的来，用 AI 生成 PPT 内容。你知道不，现在有个叫智谱「AutoGLM 沉思」的，超厉害，能自动检索信息生成报告，做 PPT 素材啥的肯定不在话下，关键还免费！\n' +
                '[S1]真的假的？这么宝藏！今晚你可得手把手教我，我怕我这‘科技小白’搞不定。\n' +
                '[S2]行嘞，现在咱就上网搜搜免费教程。还有个 DeepSider 浏览器插件也不错，里面集成了好多热门 AI 模型，说不定也能用来辅助做 PPT，先体验体验，要是上手了，以后做 PPT 就跟玩似的！',
      mode1: 'common',
      timbreInfo1: {},
      mode2: 'common',
      timbreInfo2: {},
      voices: [],
      minimax_voices: [],
      audio: null,
      audioIndex: null,
      resultImg: '/chest/dualTimbreCloning.png',
      loading: false,
    }
  },
  mounted() {
    this.queryVoices()
    this.queryMiniMaxVoices()
  },
  methods: {
    queryVoices() {
      getAction("/timbres/get_all_common_timbre").then((res) => {
        if (res.data.status === "success") {
          this.voices = res.data.data;
          this.timbreInfo1 = res.data.data[0] || {}
          this.timbreInfo2 = res.data.data[0] || {}
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
        } else {
          this.$message.error("获取高级声音列表失败。");
        }
      }).catch((error) => {
        console.error("获取高级声音列表失败:", error);
      });
    },
    saveMode(mode, num) {
      if (this['mode' + num] === mode) {
        return
      }
      this.stopAudio()
      this['timbreInfo' + num] = mode === 'common'? this.voices[0] : this.minimax_voices[0]
      this['mode' + num] = mode
      this.$refs.modePopoverRef1.showPopper = false
      this.$refs.modePopoverRef2.showPopper = false
    },
    selectVoice(voice, num) {
      this['timbreInfo' + num] = voice
      this.$nextTick(() => {
        this.$refs.voiceRef1.showPopper = false
        this.$refs.voiceRef2.showPopper = false
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
    generate() {

    },
    back() {
      this.clearCache()
      sessionStorage.setItem('chest_path', '/chest')
      this.$router.push({ path: '/chest'})
    }
  }
}
</script>

<style scoped>
.dualTimbreCloning {
  height: 100%;
  min-width: 1200px
}

.dualTimbreCloning-content {
  height: calc(100% - 50px);
  display: flex;
  gap: 20px;
}

.work-setting-area {
  width: 400px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;
}

.work-setting-label {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 4px;
  margin-top: 16px;
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
  border-radius: 8px;
}

.dualTimbreCloning-preview {
  flex: 1;
  height: 100%;
}

.preview-header {
  height: 120px;
  margin-bottom: 60px;
  opacity: 1;
  overflow-x: hidden;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border-radius: 12px;
  line-height: 24px;
  background-color: #fbfbfb;
  box-shadow: 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;
}

.preview-header-title {
  color: #000;
  font-size: 14px;
  font-weight: bold;
}

.preview-header-desc {
  color: #000;
  display: block;
  font-size: 14px;
  width: 100%;
  opacity: .8;
  white-space: pre-wrap;
}

.preview-body {
  height: calc(100% - 170px);
  display: flex;
  gap: 40px;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.dualTimbreCloning >>> .el-textarea__inner {
  font-size: 12px !important;
  color: #5f5f5f !important;
  padding: 5px 8px !important;
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
  height: 70px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.active {
  background-color: #e0e7fb;
}

.voice-icon {
  width: 37px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #c7d4f8;
  border-radius: 8px;
}

.voice-name {
  width: 110px;
  margin-left: 10px;
  font-size: 12px;
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
</style>