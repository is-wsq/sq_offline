<template>
  <div class="image-lip-sync"
       v-loading="loading"
       element-loading-text="视频创作中..."
       element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.8)">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="back">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="c-page-header">图片对嘴型</div>
      <div style="width: 36px"></div>
    </div>
    <div class="image-lip-sync-content">
      <div class="work-setting-area">
        <div class="font-weight">工作台</div>
        <div style="flex: 1;overflow-y: auto;overflow-x: hidden">
          <div class="work-setting-label">图片</div>
          <el-upload
              class="uploader"
              action="#"
              accept=".jpg, .jpeg, .png"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleImageChange">
            <div v-if="image_path" style="position: relative;">
              <el-image :src="image_path" class="placeholder-image" fit="cover"></el-image>
              <div class="placeholder-image-delete-icon">
                <i class="el-icon-delete" @click.stop="imageDelete"></i>
              </div>
            </div>
            <i v-else class="el-icon-plus uploader-icon"></i>
          </el-upload>
          <div class="work-setting-label flex-center">
            <div style="flex: 1">音频来源</div>
            <el-select v-model="voice_from" size="mini">
              <el-option label="0-音频上传" :value="0"></el-option>
              <el-option label="1-音频生成" :value="1"></el-option>
            </el-select>
          </div>
          <template v-if="voice_from === 0">
            <div class="work-setting-label">音频文件(可以是说话可以是唱歌)</div>
            <el-upload
                class="uploader"
                action="#"
                accept=".mp3, .wav"
                :show-file-list="false"
                :auto-upload="false"
                :on-change="handleVoiceChange">
              <div v-if="voiceFile.uid" style="position: relative;">
                <el-image :src="voice_path" class="placeholder-image" fit="cover"></el-image>
                <div class="placeholder-image-delete-icon">
                  <i class="el-icon-delete" @click.stop="voiceDelete"></i>
                </div>
              </div>
              <i v-else class="el-icon-plus uploader-icon"></i>
            </el-upload>
          </template>
          <template v-else>
            <div style="display: flex;margin-top: 12px">
              <div class="work-setting-label" style="margin: 0 !important;line-height: 24px">音色</div>
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
            <div class="s-voice-content">
              <div class="s-voice-btn">
                <i class="el-icon-play" @click="previewAudio(timbreInfo, -1)" v-if="audioIndex !== -1"></i>
                <i class="el-icon-pause" @click="stopAudio" v-else></i>
              </div>
              <el-popover ref="voiceRef" placement="bottom" trigger="click" @hide="stopAudio" style="flex: 1">
                <div class="popover-content">
                  <el-row>
                    <el-col :span="12" v-for="(voice, index) in mode === 'common'? voices : minimax_voices" :key="voice.id">
                      <div class="voice-item" :class="{ active: voice.id === timbreInfo.id }" @click="selectVoice(voice)">
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
                <div class="s-voice-name" slot="reference" :title="timbreInfo.name">{{ timbreInfo.name }}</div>
              </el-popover>
            </div>
            <div class="work-setting-label margin-t-12">口播内容</div>
            <el-input type="textarea" v-model="copywriting" :autosize="{ minRows: 3, maxRows: 6 }"
                      placeholder="音频内容..." resize="none"></el-input>
          </template>
          <div class="work-setting-label flex-center">
            <div style="flex: 1;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;"
                 title="动作幅度（动作幅度越大开口越大）">动作幅度(动作幅度越大开口越大)</div>
            <el-input-number v-model="movement_range" size="mini" :step="0.1" :min="0.1" :max="1"></el-input-number>
          </div>
          <div class="work-setting-label flex-center">
            <div style="flex: 1">分辨率(越小越快)</div>
            <el-input-number v-model="resolution_ratio" size="mini" :step="64" :min="128" :max="2048"></el-input-number>
          </div>
        </div>
        <div class="generate-btn">
          <el-button @click="generate" :loading="!!loading" :disabled="!imageFile || !voiceFile">
            <i class="el-icon-bianjiqi btn-icon" v-if="!loading"></i>
            {{ !!loading ? '视频生成中...' : '生成视频' }}
          </el-button>
        </div>
      </div>
      <div class="image-lip-sync-preview">
        <div class="preview-header">
          <div class="preview-header-title">应用介绍&输入建议</div>
          <div class="preview-header-desc">
            <div>
              测试视频22秒用了9分钟。出来的口型动作都不错。只需要上传图片与声音即可。其他都设置好了无需修改，大家可以分段用几秒的声音去让图片动起来。5-6秒一个场景，适合小说推文配音用比较OK
            </div>
          </div>
        </div>
        <div class="preview-body">
          <el-button type="text" class="cut-btn" @click="activeIndex --" :disabled="activeIndex === 0">
            <i class="el-icon-arrow-left"></i>
          </el-button>
          <div class="preview-result">
            <video :src="resultList[activeIndex]" controls class="preview-video"></video>
          </div>
          <el-button type="text" class="cut-btn" @click="activeIndex ++" :disabled="activeIndex === resultList.length - 1">
            <i class="el-icon-arrow-right"></i>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ClearCacheMixin} from "@/mixins/ClearCacheMixin";
import axios from "axios";
import {getAction} from "@/api/api";

export default {
  name: 'ImageLipSync',
  mixins: [ClearCacheMixin],
  data() {
    return {
      imageFile: {},
      image_path: './chest/imageLipSync_example.png',
      voice_from: 0,
      voiceFile: {},
      voice_path: './chest/ai-icon-sound.png',
      mode: 'common',
      timbreInfo: {},
      voices: [],
      minimax_voices: [],
      audio: null,
      audioIndex: null,
      copywriting: '',
      movement_range: 0.5,
      resolution_ratio: 512,
      resultList: [
        'http://127.0.0.1:6006/running_hub/resource/imageLipSync_result1.mp4',
        'http://127.0.0.1:6006/running_hub/resource/imageLipSync_result2.mp4',
      ],
      activeIndex: 0,
      loading: false,
    }
  },
  mounted() {
    this.queryVoices()
    this.queryMiniMaxVoices()
    this.initFile()
  },
  methods: {
    async initFile() {
      try {
        let url = this.image_path
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`请求失败: ${response.status}`);
        }

        const blob = await response.blob();

        const suffix = '.' + blob.type.split('/')[1];
        const realFile = new File([blob], 'example' + suffix, {
          type: blob.type,
          lastModified: Date.now()
        });

        this.imageFile = {
          uid: Date.now(),
          raw: realFile,
          name: 'example' + suffix,
          url: url
        };
      } catch (error) {
        console.error("文件初始化失败:", error);
      }
    },
    handleImageChange(file, fileList) {
      this.image_path = URL.createObjectURL(file.raw);
      this.imageFile = file
    },
    imageDelete() {
      this.image_path = '';
      this.imageFile = null;
    },
    queryVoices() {
      getAction("/timbres/get_all_common_timbre").then((res) => {
        if (res.data.status === "success") {
          this.voices = res.data.data;
          this.timbreInfo = res.data.data[0] || {}
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
    saveMode(mode) {
      if (this.mode === mode) {
        return
      }
      this.stopAudio()
      this.timbreInfo = mode === 'common'? this.voices[0] : this.minimax_voices[0]
      this.mode = mode
      this.$refs.modePopoverRef.showPopper = false
    },
    selectVoice(voice) {
      this.timbreInfo = voice
      this.$nextTick(() => {
        this.$refs.voiceRef.showPopper = false
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
    handleVoiceChange(file, fileList) {
      this.voiceFile = file
    },
    voiceDelete() {
      this.voiceFile = null;
    },
    generate() {
      if (!this.imageFile.uid) {
        this.$alert('请上传图片后重试', '提示')
        return
      }
      if (!this.voiceFile.uid) {
        this.$alert('请上传音频后重试', '提示')
        return
      }
      this.loading = true

      const formData = new FormData();
      formData.append('user_id', sessionStorage.getItem('token'));

      axios.post("http://127.0.0.1:6006/running_hub/imitate_person_pose", formData,{
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 1800000
      }).then(res => {
        if (res.data.status === 'success') {
          this.activeIndex = 0
          this.resultList = res.data.data.image_paths
          this.loading = false
        } else {
          this.loading = false
          this.$alert(`生成失败，${res.data.message}`, '提示')
        }
      }).catch(err => {
        this.loading = false
        this.$alert(`生成错误，${err}`, '提示')
      })
    },
    back() {
      this.clearCache()
      this.stopAudio()
      sessionStorage.setItem('chest_path', '/chest')
      this.$router.push({ path: '/chest'})
    }
  },
  beforeDestroy() {
    this.stopAudio()
  },
}
</script>

<style scoped>
.image-lip-sync {
  height: 100%;
  min-width: 1200px
}

.image-lip-sync-content {
  height: calc(100% - 50px);
  display: flex;
  gap: 20px;
}

.work-setting-area {
  width: 370px;
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

.uploader >>> .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.uploader >>> .el-upload:hover {
  border-color: #409EFF;
}

.uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 108px;
  height: 108px;
  line-height: 108px;
  text-align: center;
}

.placeholder-image {
  height: 108px;
  width: 108px;
  display: block;
}

.placeholder-image-delete-icon {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 4px;
  background-color: #232a2e80;
  color: #fff;
  border-radius: 3px;
  cursor: pointer;
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

.image-lip-sync-preview {
  flex: 1;
  height: 100%;
}

.preview-header {
  height: 100px;
  margin-bottom: 40px;
  opacity: 1;
  overflow-x: hidden;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border-radius: 12px;
  background-color: #fbfbfb;
  box-shadow: 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;
}

.preview-header-title {
  color: #000;
  font-size: 14px;
  font-weight: bold;
  line-height: 22px;
}

.preview-header-desc {
  color: #000;
  display: block;
  font-size: 14px;
  width: 100%;
  opacity: .8;
  margin-top: 4px;
  line-height: 22px;
}

.preview-body {
  height: calc(100% - 170px);
  display: flex;
  gap: 40px;
}

.cut-btn {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  color: #a2a8b3;
  background-color: #FFFFFF;
  margin: auto 0;
  cursor: pointer;
}

.preview-result {
  flex: 1;
  height: 100%;
}

.preview-video {
  width: 100%;
  height: 100%;
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