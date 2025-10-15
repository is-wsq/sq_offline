<template>
  <div class="e-commerce"
       v-loading="loading"
       element-loading-text="带货视频制作中..."
       element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.8)">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="back">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="e-commerce-header">电商带货短视频制作</div>
      <div style="width: 36px"></div>
    </div>
    <div class="e-commerce-body">
      <div class="e-commerce-card">
        <div style="font-weight: bold">工作台</div>
        <div style="flex: 1;overflow-y: auto">
          <div class="setting-name margin-t-12">上传图片</div>
          <el-upload
              class="img-uploader"
              action="#"
              accept=".jpg, .jpeg, .png"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleImgChange">
            <div v-if="imgUrl" style="position: relative;">
              <el-image :src="imgUrl" class="img" fit="cover"></el-image>
              <div class="img-delete">
                <i class="el-icon-delete" @click.stop="imgDelete"></i>
              </div>
            </div>
            <i v-else class="el-icon-plus img-uploader-icon"></i>
          </el-upload>
          <div style="display: flex;margin-top: 12px">
            <div class="setting-name" style="margin-bottom: 0 !important;line-height: 24px">主播声音</div>
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
          <div class="setting-name margin-t-12">口播内容</div>
          <el-input type="textarea" v-model="copywriting" :autosize="{ minRows: 3, maxRows: 6 }"
                    placeholder="口播文案内容..." resize="none"></el-input>
          <div class="setting-name margin-t-12">提示词（默认效果就挺好，也可自行调整）</div>
          <el-input type="textarea" v-model="promptInput" :autosize="{ minRows: 3, maxRows: 5 }"
                    placeholder="口播文案内容..." resize="none"></el-input>
        </div>
        <div class="generate-btn">
          <el-button @click="generate" :loading="!!loading"><i class="el-icon-bianjiqi btn-icon" v-if="!loading"></i>
            {{ !!loading ? '生成中...' : '生成视频' }}
          </el-button>
        </div>
      </div>
      <div class="e-commerce-preview">
        <div class="preview-header">
          <div class="preview-header-title">应用介绍&输入建议</div>
          <div class="preview-header-desc">电商带货数字人口播，上传图片（图片需包含商品图和主播形象）、输入口播文案、选择口播音色，即可制作电商带货短视频</div>
        </div>
        <div class="preview-body">
          <video :src="videoUrl" controls class="preview-video"></video>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {getAction, postAction} from "@/api/api";
import axios from "axios";
import {ClearCacheMixin} from "@/mixins/ClearCacheMixin";

export default {
  name: 'eCommerce',
  mixins: [ClearCacheMixin],
  data() {
    return {
      imgUrl: '/eCommerce/defaultImg.png',
      imgFile: {},
      mode: 'common',
      timbreInfo: {},
      voices: [],
      minimax_voices: [],
      audio: null,
      audioIndex: null,
      copywriting: '',
      promptInput: '一位亚洲女孩正在自然生动地介绍她手中的商品。镜头全程平稳匀速跟随她的动作与讲解过程，动作节奏合理，完全符合真实人体运动逻辑。人物无遮挡，主体清晰完整，面部结构稳定，五官清晰，表情自然灵动，展现出自信优雅的气质。\n' +
          '她始终双手展示一件具体商品，商品在整个过程中保持结构一致、位置稳定，不发生变形、漂移、融合错误或重绘问题。商品的颜色、尺寸、外观细节、品牌标识等信息始终一致，真实可见，细节清晰完整。\n' +
          '商品与手部接触自然，贴合真实，无错位、无穿插，具备可信的物理接触感。衣物颜色与款式全程保持一致，布料动态自然、无异常形变。\n' +
          '人物皮肤细腻光滑，纹理自然，无AI伪影、融合错误或异常噪点。镜头运动流畅无抖动，背景稳定无漂移，画面无跳帧、无模糊、无形变。整体构图平衡，画面风格写实统一，动作连贯自然，具有商业广告级别的视觉表现力与真实质感。\n' +
          '全程无结构错乱、无异物干扰、无道具变化，人物与展示商品在画面中始终清晰协调，真实可信，强化产品价值与展示效果',

      loading: false,
      videoUrl: 'http://127.0.0.1:6006/running_hub/resource/eCommerce_example.mp4',
    }
  },
  mounted() {
    this.queryVoices()
    this.queryMiniMaxVoices()
    this.initDefaultImgFile()
  },
  methods: {
    async initDefaultImgFile() {
      try {
        const response = await fetch(this.imgUrl);

        if (!response.ok) {
          throw new Error(`请求失败: ${response.status}`);
        }

        const blob = await response.blob();

        const realFile = new File([blob], 'defaultImg.png', {
          type: blob.type,
          lastModified: Date.now()
        });

        this.imgFile = {
          uid: Date.now(),
          raw: realFile,
          name: 'defaultImg.png',
          url: this.imgUrl
        };
      } catch (error) {
        console.error("视频文件初始化失败:", error);
      }
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
    handleImgChange(file, fileList) {
      this.imgUrl = URL.createObjectURL(file.raw);
      this.imgFile = file
    },
    imgDelete() {
      this.imgUrl = '';
      this.imgFile = {};
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
    generate() {
      if (!this.imgFile.uid) {
        this.$alert('请上传图片后重试', '提示')
        return
      }
      if (!this.copywriting) {
        this.$alert('请输入口播文案后重试', '提示')
        return
      }
      this.loading = true

      const formData = new FormData();
      formData.append("image_file", this.imgFile.raw);
      formData.append('timbre_id', this.timbreInfo.voice_id);
      formData.append('voice_mode', this.mode);
      formData.append('copy', this.copywriting);
      formData.append('prompt', this.promptInput);

      axios.post("http://127.0.0.1:6006/running_hub/e_ommerce", formData,{
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 1800000
      }).then(res => {
        if (res.data.status === 'success') {
          this.videoUrl = res.data.data.video_path
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
.e-commerce {
  height: 100%;
  min-width: 1200px;
}

.e-commerce-header {
  flex: 1;
  margin: 0 0 8px;
  font-weight: bold;
  display: flex;
  justify-content: center;
}

.e-commerce-body {
  height: calc(100% - 60px);
  display: flex;
  gap: 20px;
}

.e-commerce-card {
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

.setting-name {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 4px;
}

.img-uploader >>> .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.img-uploader >>> .el-upload:hover {
  border-color: #409EFF;
}

.img-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 160px;
  line-height: 160px;
  text-align: center;
}

.img {
  height: 160px;
  max-width: 317px;
  display: block;
}

.img-delete {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 4px;
  background-color: #232a2e80;
  color: #fff;
  border-radius: 3px;
  cursor: pointer;
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

.e-commerce-preview {
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
  margin-top: 8px;
}

.preview-body {
  height: calc(100% - 160px);
}

.preview-video {
  height: 100%;
  width: 100%;
  border-radius: 8px;
}

.e-commerce >>> .el-textarea__inner {
  font-size: 14px !important;
  color: #5f5f5f !important;
  padding: 5px 8px !important;
}
</style>