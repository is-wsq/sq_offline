<template>
  <div class="e-commerce">
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
          <div class="e-commerce-card-item">
            <div class="setting-name">上传图片</div>
            <el-upload
                class="img-uploader"
                action="http://127.0.0.1:6006/running_hub/upload"
                accept=".jpg, .jpeg, .png"
                :show-file-list="false"
                :data = "{'type': 'image' }"
                :on-success="handleImgSuccess">
              <div v-if="imgUrl" style="position: relative;">
                <el-image :src="imgUrl" class="img"></el-image>
                <div class="img-delete">
                  <i class="el-icon-delete" @click.stop="imgDelete"></i>
                </div>
              </div>
              <i v-else class="el-icon-plus img-uploader-icon"></i>
            </el-upload>
          </div>
          <div class="e-commerce-card-item">
            <div class="setting-name">上传口播音频</div>
            <div @click="stopAudio">
              <el-upload
                  class="audio-uploader"
                  action="http://127.0.0.1:6006/running_hub/upload"
                  accept=".mp3, .wav"
                  :show-file-list="false"
                  :data = "{'type': 'audio' }"
                  :on-success="handleAudioSuccess">
                <div v-if="audioInfo.uid" class="audio">
                  <div class="audio-icon" @click.stop="previewAudio">
                    <i :class="audio ? 'el-icon-pause' : 'el-icon-play'"
                       style="font-size: 13px; color: #6286ed"></i>
                  </div>
                  <div :title="audioInfo.name" class="audio-name">{{ audioInfo.name }}</div>
                  <i class="el-icon-delete" style="color: red" @click.stop="deleteAudio"></i>
                </div>
                <div v-else style="height: 58px">
                  <el-button type="primary" style="width: 150px">点击上传</el-button>
                </div>
              </el-upload>
            </div>
          </div>
          <div class="e-commerce-card-item">
            <div class="flex-center">
              <div class="setting-name" style="flex: 1">设置视频时长（秒）</div>
              <el-input-number class="input-number"
                               v-model="duration"
                               controls-position="right"
                               :min="5"
                               :max="50"
                               style="margin-left: 10px;width: 80px !important;">
              </el-input-number>
            </div>
          </div>
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
          <div class="preview-header-desc">电商带货商品展示数字人口播，上传图片和制作好的口播音频即可生成带货短视频，视频时长要设置比音频多1秒</div>
        </div>
        <div class="preview-body">
          <video :src="videoUrl" controls class="preview-video"></video>
<!--          <div class="preview-none">-->
<!--            <i class="el-icon-video-camera preview-none-icon"></i>-->
<!--            <div class="preview-none-title">暂无视频预览</div>-->
<!--            <div class="preview-none-desc">请使用左侧工具生成带货视频</div>-->
<!--          </div>-->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {postAction} from "@/api/api";

export default {
  name: 'eCommerce',
  data() {
    return {
      imgUrl: '',
      imgId: '',
      audioInfo: {},
      audioId: '',
      audio: null,
      duration: 5,
      loading: false,
      videoUrl: '',
    }
  },
  methods: {
    handleImgSuccess(res, file) {
      if (res.status === 'success') {
        this.imgId = res.data.running_hub_ids[0]
        this.imgUrl = URL.createObjectURL(file.raw);
      } else {
        this.$message.error('上传图片失败，请重试')
      }
    },
    imgDelete() {
      this.imgUrl = '';
      this.imgId = '';
    },
    handleAudioSuccess(res, file) {
      if (res.status === 'success') {
        this.audioId = res.data.running_hub_ids[0]
        this.audioInfo = file;
      } else {
        this.$message.error('上传音频失败，请重试')
      }
    },
    previewAudio() {
      if (this.audio) {
        this.audio.pause();
        this.audio = null
        return
      }
      this.audio = new Audio(URL.createObjectURL(this.audioInfo.raw));
      this.audio.play();
      this.audio.onended = () => {
        this.audio = null;
      };
    },
    stopAudio() {
      if (this.audio) {
        this.audio.pause();
        this.audio = null
      }
    },
    deleteAudio() {
      this.stopAudio();
      this.audioInfo = {};
      this.audioId = '';
    },
    generate() {
      if (!this.imgId) {
        this.$alert('请上传图片后重试', '提示')
        return
      }
      if (!this.audioId) {
        this.$alert('请上传口播音频后重试', '提示')
        return
      }
      let params = {
        image_id: this.imgId,
        audio_id: this.audioId,
        duration: this.duration
      }
      this.loading = true
      const loading = this.$loading({
        lock: true,
        text: '带货视频生成中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      postAction('/running_hub/digital_human_broadcast',params,1800000).then(res => {
        if (res.data.status === 'success') {
          this.videoUrl = res.data.data.video_path
          loading.close();
          this.loading = false
        } else {
          loading.close();
          this.loading = false
          this.$alert(`生成失败，${res.data.message}`, '提示')
        }
      }).catch(err => {
        loading.close();
        this.loading = false
        this.$alert(`生成错误，${err}`, '提示')
      })
    },
    back() {
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
  background-color: #fbfbfb;
  box-shadow: 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;
}

.e-commerce-card-item {
  margin-top: 16px;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 8px;
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
  object-fit: cover;
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

.audio {
  display: flex;
  align-items: center;
  height: 56px;
  width: 317px;
  padding: 0 12px;
  border: 1px solid #E4E7ED;
  border-radius: 6px;
  background-color: #F7F8FA;
  transition: all 0.2s ease-in-out;
}

.audio-icon {
  width: 32px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #ffffff;
  border: 1px solid #DCDFE6;
  border-radius: 8px;
}

.audio-name {
  flex: 1;
  margin: 0 10px;
  font-size: 14px;
  color: #101010;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
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

.preview-none {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.preview-none-icon {
  font-size: 54px;
  color: #9ca3af;
}

.preview-none-title {
  font-size: 14px;
  color: #9ca3af;
  margin-top: 8px;
}

.preview-none-desc {
  font-size: 12px;
  color: #9ca3af;
}
</style>