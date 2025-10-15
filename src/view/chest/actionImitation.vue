<template>
  <div class="action-imitation"
       v-loading="loading"
       element-loading-text="姿势+动作模仿中..."
       element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.8)">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="back">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="c-page-header">一键模仿姿势 + 动作</div>
      <div style="width: 36px"></div>
    </div>
    <div class="action-imitation-content">
      <div class="work-setting-area">
        <div class="font-weight">工作台</div>
        <div style="flex: 1;overflow-y: auto">
          <div class="work-setting-label">原始人物（正视+站姿效果更佳）</div>
          <el-upload
              class="uploader"
              action="#"
              accept=".jpg, .jpeg, .png"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleOriginalChange">
            <div v-if="original_image" style="position: relative;">
              <el-image :src="original_image" class="placeholder-image" fit="cover"></el-image>
              <div class="placeholder-image-delete-icon">
                <i class="el-icon-delete" @click.stop="originalDelete"></i>
              </div>
            </div>
            <i v-else class="el-icon-plus uploader-icon"></i>
          </el-upload>
          <div class="work-setting-label">上传要模仿的姿势图</div>
          <el-upload
              class="uploader"
              action="#"
              accept=".jpg, .jpeg, .png"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleImitationChange">
            <div v-if="imitation_image" style="position: relative;">
              <el-image :src="imitation_image" class="placeholder-image" fit="cover"></el-image>
              <div class="placeholder-image-delete-icon">
                <i class="el-icon-delete" @click.stop="imitationDelete"></i>
              </div>
            </div>
            <i v-else class="el-icon-plus uploader-icon"></i>
          </el-upload>
          <div class="work-setting-label flex-center">
            <div style="flex: 1">最大分辨率（越大越慢）</div>
            <el-input-number v-model="resolutionRatio" size="mini" :min="1" :max="2160"></el-input-number>
          </div>
        </div>
        <div class="generate-btn">
          <el-button @click="generate" :loading="!!loading" :disabled="!originalFile || !imitationFile">
            <i class="el-icon-bianjiqi btn-icon" v-if="!loading"></i>
            {{ !!loading ? '模仿中...' : '一键模仿' }}
          </el-button>
        </div>
      </div>
      <div class="action-imitation-preview">
        <div class="preview-header">
          <div class="preview-header-title">应用介绍&输入建议</div>
          <div class="preview-header-desc">
            <div>说明：生成一次大概5分钟以内，首次生成比第二次生成的时间要长。</div>
          </div>
        </div>
        <div class="preview-body">
          <el-image :src="result_image" class="preview-result" fit="contain"></el-image>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ClearCacheMixin} from "@/mixins/ClearCacheMixin";

export default {
  name: 'ActionImitation',
  mixins: [ClearCacheMixin],
  data() {
    return {
      originalFile: {},
      original_image: '/actionImitation/original.png',
      imitationFile: {},
      imitation_image: '/actionImitation/imitation.jpeg',
      resolutionRatio: 1280,
      result_image: '/actionImitation/result.png',
      loading: false,
    }
  },
  mounted() {
    this.initFile('original')
    this.initFile('imitation')
  },
  methods: {
    async initFile(type) {
      try {
        let url = type  === 'original' ? this.original_image : this.imitation_image
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

        this[type === 'original' ? 'originalFile' : 'imitationFile'] = {
          uid: Date.now(),
          raw: realFile,
          name: type + suffix,
          url: url
        };
      } catch (error) {
        console.error("文件初始化失败:", error);
      }
    },
    handleOriginalChange(file, fileList) {
      this.original_image = URL.createObjectURL(file.raw);
      this.originalFile = file
    },
    originalDelete() {
      this.original_image = '';
      this.originalFile = null;
    },
    handleImitationChange(file, fileList) {
      this.imitation_image = URL.createObjectURL(file.raw);
      this.imitationFile = file
    },
    imitationDelete() {
      this.imitation_image = '';
      this.imitationFile = null;
    },
    generate() {

    },
    back() {
      this.clearCache()
      this.$router.push({ path: '/chest'})
    }
  }
}
</script>

<style scoped>
.action-imitation {
  height: 100%;
  min-width: 1200px
}

.action-imitation-content {
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

.action-imitation-preview {
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

.preview-result {
  height: 100%;
  width: 100%;
  border-radius: 8px;
}
</style>