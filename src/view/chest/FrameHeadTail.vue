<template>
  <div class="frame-head-tail"
       v-loading="loading"
       element-loading-text="视频创作中..."
       element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.8)">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="back">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="c-page-header">视频首尾帧</div>
      <div style="width: 36px"></div>
    </div>
    <div class="frame-head-tail-content">
      <div class="work-setting-area">
        <div class="font-weight">工作台</div>
        <div style="flex: 1;overflow-y: auto">
          <div class="work-setting-label">提示词（填写特效效果）</div>
          <el-input type="textarea" v-model="promptInput" :autosize="{ minRows: 3, maxRows: 5 }"
                    placeholder="请输入提示词..." resize="none"></el-input>
          <div class="work-setting-label">首帧（竖屏、横屏、方形决定最终出片形状）</div>
          <el-upload
              class="uploader"
              action="#"
              accept=".jpg, .jpeg, .png"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleFirstChange">
            <div v-if="first_frame" style="position: relative;">
              <el-image :src="first_frame" class="placeholder-image" fit="cover"></el-image>
              <div class="placeholder-image-delete-icon">
                <i class="el-icon-delete" @click.stop="firstDelete"></i>
              </div>
            </div>
            <i v-else class="el-icon-plus uploader-icon"></i>
          </el-upload>
          <div class="work-setting-label">尾帧（尽量和首帧同比例，否则会被剪裁）</div>
          <el-upload
              class="uploader"
              action="#"
              accept=".jpg, .jpeg, .png"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleEndChange">
            <div v-if="end_frame" style="position: relative;">
              <el-image :src="end_frame" class="placeholder-image" fit="cover"></el-image>
              <div class="placeholder-image-delete-icon">
                <i class="el-icon-delete" @click.stop="endDelete"></i>
              </div>
            </div>
            <i v-else class="el-icon-plus uploader-icon"></i>
          </el-upload>
          <div class="work-setting-label flex-center">
            <div style="flex: 1">视频时长</div>
            <el-input-number v-model="duration" size="mini" :min="1" :max="60"></el-input-number>
          </div>
        </div>
        <div class="generate-btn">
          <el-button @click="generate" :loading="!!loading" :disabled="!firstFrameFile || !endFrameFile">
            <i class="el-icon-bianjiqi btn-icon" v-if="!loading"></i>
            {{ !!loading ? '视频生成中...' : '生成视频' }}
          </el-button>
        </div>
      </div>
      <div class="frame-head-tail-preview">
        <div class="preview-header">
          <div class="preview-header-title">应用介绍&输入建议</div>
          <div class="preview-header-desc">
            <div>
              采用480P采样，6秒10分钟出片，7秒15分出，建议时间长一点，变形会自然一些。<br>
              提示词只需填写增加的特效效果。如变形金刚变形效果，小孩长大效果，生长特效，解体特效，烟雾特效等。无需太长，内置图片反推和首尾帧提示词会自动优化。
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

export default {
  name: 'FrameHeadTail',
  mixins: [ClearCacheMixin],
  data() {
    return {
      promptInput: '',
      firstFrameFile: {},
      first_frame: './chest/frameHeadTail_example1.png',
      endFrameFile: {},
      end_frame: './chest/frameHeadTail_example2.png',
      duration: 6,
      resultList: [
          'http://127.0.0.1:6006/running_hub/resource/frameHeadTail_result1.mp4',
          'http://127.0.0.1:6006/running_hub/resource/frameHeadTail_result2.mp4',
          'http://127.0.0.1:6006/running_hub/resource/frameHeadTail_result3.mp4',
      ],
      activeIndex: 0,
      loading: false,
    }
  },
  mounted() {
    this.initFile('first')
    this.initFile('end')
  },
  methods: {
    async initFile(type) {
      try {
        let url = type  === 'first' ? this.first_frame : this.end_frame
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`请求失败: ${response.status}`);
        }

        const blob = await response.blob();

        const suffix = '.' + blob.type.split('/')[1];
        const realFile = new File([blob], type + suffix, {
          type: blob.type,
          lastModified: Date.now()
        });

        this[type === 'first' ? 'firstFrameFile' : 'endFrameFile'] = {
          uid: Date.now(),
          raw: realFile,
          name: type + suffix,
          url: url
        };
      } catch (error) {
        console.error("文件初始化失败:", error);
      }
    },
    handleFirstChange(file, fileList) {
      this.first_frame = URL.createObjectURL(file.raw);
      this.firstFrameFile = file
    },
    firstDelete() {
      this.first_frame = '';
      this.firstFrameFile = null;
    },
    handleEndChange(file, fileList) {
      this.end_frame = URL.createObjectURL(file.raw);
      this.endFrameFile = file
    },
    endDelete() {
      this.end_frame = '';
      this.endFrameFile = null;
    },
    generate() {
      if (!this.firstFrameFile.uid) {
        this.$alert('请上传首帧后重试', '提示')
        return
      }
      if (!this.endFrameFile.uid) {
        this.$alert('请上传尾帧后重试', '提示')
        return
      }
      this.loading = true

      const formData = new FormData();

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
      sessionStorage.setItem('chest_path', '/chest')
      this.$router.push({ path: '/chest'})
    }
  }
}
</script>

<style scoped>
.frame-head-tail {
  height: 100%;
  min-width: 1200px
}

.frame-head-tail-content {
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

.frame-head-tail-preview {
  flex: 1;
  height: 100%;
}

.preview-header {
  height: 120px;
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

.frame-head-tail >>> .el-textarea__inner {
  font-size: 12px !important;
  color: #5f5f5f !important;
  padding: 5px 8px !important;
}
</style>