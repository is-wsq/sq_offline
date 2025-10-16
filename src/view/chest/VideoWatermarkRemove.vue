<template>
  <div class="logo-remove"
       v-loading="loading"
       element-loading-text="视频水印去除中..."
       element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.8)">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="back">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="c-page-header">视频水印去除</div>
      <div style="width: 36px"></div>
    </div>
    <div class="logo-remove-content">
      <div class="work-setting-area">
        <div class="font-weight">工作台</div>
        <div style="flex: 1;overflow-y: auto">
          <div class="work-setting-label">上传视频</div>
          <el-upload
              class="uploader"
              action="#"
              accept=".mp4, .mov"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleVideoChange">
            <div v-if="video_image" style="position: relative;">
              <el-image :src="video_image" class="placeholder-image" fit="cover"></el-image>
              <div class="placeholder-image-delete-icon">
                <i class="el-icon-delete" @click.stop="videoDelete"></i>
              </div>
            </div>
            <i v-else class="el-icon-plus uploader-icon"></i>
          </el-upload>
        </div>
        <div class="generate-btn">
          <el-button @click="generate" :loading="!!loading" :disabled="!videoFile">
            <i class="el-icon-bianjiqi btn-icon" v-if="!loading"></i>
            {{ !!loading ? '去除中...' : '水印去除' }}
          </el-button>
        </div>
      </div>
      <div class="logo-remove-preview">
        <div class="preview-header">
          <div class="preview-header-title">应用介绍&输入建议</div>
          <div class="preview-header-desc">
            <div>视频移动水印去除即梦 、可灵、豆包、VEO3等通用版</div>
          </div>
        </div>
        <div class="preview-body">
          <video :src="result_video" controls class="preview-video"></video>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ClearCacheMixin} from "@/mixins/ClearCacheMixin";

export default {
  name: 'LogoRemove',
  mixins: [ClearCacheMixin],
  data() {
    return {
      videoFile: {},
      example_video: 'http://127.0.0.1:6006/running_hub/resource/logoRemove_example.mp4',
      video_image: 'http://127.0.0.1:6006/running_hub/resource/logoRemove_example.jpg',
      result_video: 'http://127.0.0.1:6006/running_hub/resource/logoRemove_result.mp4',
      loading: false,
    }
  },
  mounted() {
    this.initFile()
  },
  methods: {
    async initFile() {
      try {
        const response = await fetch(this.example_video);

        if (!response.ok) {
          throw new Error(`请求失败: ${response.status}`);
        }

        const blob = await response.blob();

        const realFile = new File([blob], "example.mp4", {
          type: blob.type,
          lastModified: Date.now()
        });

        this.videoFile = {
          uid: Date.now(),
          raw: realFile,
          name: "example.mp4",
          url: this.example_video
        };
      } catch (error) {
        console.error("视频文件初始化失败:", error);
      }
    },
    handleVideoChange(file, fileList) {

    },
    videoDelete() {

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
.logo-remove {
  height: 100%;
  min-width: 1200px
}

.logo-remove-content {
  height: calc(100% - 50px);
  display: flex;
  gap: 20px;
}

.work-setting-area {
  width: 320px;
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

.logo-remove-preview {
  flex: 1;
  height: 100%;
}

.preview-header {
  height: 80px;
  margin-bottom: 60px;
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
  line-height: 24px;
}

.preview-body {
  height: calc(100% - 170px);
}

.preview-video {
  height: 100%;
  width: 100%;
  border-radius: 8px;
}
</style>