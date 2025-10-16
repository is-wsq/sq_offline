<template>
  <div class="multiple-pose"
       v-loading="loading"
       element-loading-text="多姿势图生成中..."
       element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.8)">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="back">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="c-page-header">多姿势图生成</div>
      <div style="width: 36px"></div>
    </div>
    <div class="multiple-pose-content">
      <div class="work-setting-area">
        <div class="font-weight">工作台</div>
        <div style="flex: 1;overflow-y: auto">
          <div class="work-setting-label">上传人物（正视图+站姿效果更佳）</div>
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
            <div style="flex: 1">最大分辨率（越大越慢）</div>
            <el-input-number v-model="resolutionRatio" size="mini" :min="1" :max="2160"></el-input-number>
          </div>
        </div>
        <div class="generate-btn">
          <el-button @click="generate" :loading="!!loading" :disabled="!imageFile">
            <i class="el-icon-bianjiqi btn-icon" v-if="!loading"></i>
            {{ !!loading ? '生成中...' : '生成视频' }}
          </el-button>
        </div>
      </div>
      <div class="multiple-pose-preview">
        <div class="preview-header">
          <div class="preview-header-title">应用介绍&输入建议</div>
          <div class="preview-header-desc">
            <div>说明：生成一次大概10分钟以内，首次生成比第二次生成的时间要长.</div>
          </div>
        </div>
        <div class="preview-body">
          <el-button type="text" class="cut-btn" @click="activeIndex --" :disabled="activeIndex === 0">
            <i class="el-icon-arrow-left"></i>
          </el-button>
          <div class="preview-result">
            <el-image :src="resultList[activeIndex]" class="preview-image" fit="contain"></el-image>
          </div>
          <el-button type="text" class="cut-btn" @click="activeIndex ++" :disabled="activeIndex === resultList.length - 1">
            <i class="el-icon-arrow-right"></i>
          </el-button>
          <div class="preview-list">
            <div v-for="(item, index) in resultList" :key="index">
              <el-image class="preview-list-item" :class="{ 'preview-list-item-active': index === activeIndex }"
                        :src="item" fit="cover" @click="activeIndex = index"></el-image>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ClearCacheMixin} from "@/mixins/ClearCacheMixin";

export default {
  name: 'MultiplePose',
  mixins: [ClearCacheMixin],
  data() {
    return {
      imageFile: {},
      image_path: '/chest/multiPose_example.png',
      resolutionRatio: 1360,
      resultList: [
        '/chest/multiPose_result1.png',
        '/chest/multiPose_result2.png',
        '/chest/multiPose_result3.png',
        '/chest/multiPose_result4.png',
      ],
      activeIndex: 0,
      loading: false,
    }
  },
  mounted() {
    this.initFile()
  },
  methods: {
    async initFile() {
      try {
        const response = await fetch(this.image_path);

        if (!response.ok) {
          throw new Error(`请求失败: ${response.status}`);
        }

        const blob = await response.blob();

        const realFile = new File([blob], "example.png", {
          type: blob.type,
          lastModified: Date.now()
        });

        this.imageFile = {
          uid: Date.now(),
          raw: realFile,
          name: "example.png",
          url: this.image_path
        };
      } catch (error) {
        console.error("视频文件初始化失败:", error);
      }
    },
    handleImageChange(file, fileList) {
      this.imgUrl = URL.createObjectURL(file.raw);
      this.imgFile = file
    },
    imageDelete() {
      this.imgUrl = '';
      this.imgFile = null;
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
.multiple-pose {
  height: 100%;
  min-width: 1200px
}

.multiple-pose-content {
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

.multiple-pose-preview {
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
  display: flex;
  gap: 40px;
}

.preview-list {
  width: 160px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  margin-right: 24px;
}

.preview-list-item {
  width: 160px;
  height: 160px;
  box-sizing: border-box;
  cursor: pointer;
}

.preview-list-item-active {
  border: 2px solid #409EFF;
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

.preview-image {
  width: 100%;
  height: 100%;
}
</style>