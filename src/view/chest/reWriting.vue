<template>
  <div class="re-writing">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="back">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="re-writing-header">万物洗稿工作流</div>
      <div style="width: 36px"></div>
    </div>
    <div class="re-writing-example-card">
      <div class="re-writing-example-title">洗稿示例</div>
      <div class="flex-center">
        <div class="example-img" v-for="(item, index) in examples" :key="index">
          <div class="example-img-title">{{ item.title }}</div>
          <el-image :src="item.img" style="width: 90px; height: 120px;"></el-image>
        </div>
      </div>
    </div>
    <div class="re-writing-content">
      <div class="work-setting-area">
        <div class="flex-center">
          <div style="flex: 1;">
            <div class="work-setting-name">上传白底产品图</div>
            <el-upload
                class="img-uploader"
                action="#"
                accept=".jpg, .jpeg, .png"
                :show-file-list="false"
                :auto-upload="false"
                :on-change="handleProductChange">
              <div v-if="productImg" style="position: relative;">
                <el-image :src="productImg" class="img"></el-image>
                <div class="img-delete">
                  <i class="el-icon-delete" @click.stop="productDelete"></i>
                </div>
              </div>
              <i v-else class="el-icon-plus img-uploader-icon"></i>
            </el-upload>
          </div>
          <div style="flex: 1">
            <div class="work-setting-name">上传参考图</div>
            <el-upload
                class="img-uploader"
                action="#"
                accept=".jpg, .jpeg, .png"
                :show-file-list="false"
                :auto-upload="false"
                :on-change="handleExampleChange">
              <div v-if="exampleImg" style="position: relative;">
                <el-image :src="exampleImg" class="img"></el-image>
                <div class="img-delete">
                  <i class="el-icon-delete" @click.stop="exampleDelete"></i>
                </div>
              </div>
              <i v-else class="el-icon-plus img-uploader-icon"></i>
            </el-upload>
          </div>
        </div>
        <div class="generate-btn margin-t-12">
          <el-button @click="generate" :loading="!!loading"><i class="el-icon-bianjiqi btn-icon" v-if="!loading"></i>
            {{ !!loading ? '洗稿中...' : '洗稿' }}
          </el-button>
        </div>
        <div class="margin-t-12">
          <el-image v-if="resultImg" :src="resultImg" class="img"></el-image>
        </div>
      </div>
      <div class="editor-content">
        <div class="edit-tips">上传参考图片后，使用鼠标左键在画布上划线，即可进行涂抹遮罩区域。</div>
        <div style="display: flex;gap: 20px;margin-bottom: 12px;">
          <el-button type="primary" @click="clearCanvas" style="width: 150px">清除编辑</el-button>
          <el-button type="primary"  @click="downloadImage" style="width: 150px">下载图片</el-button>
        </div>
        <div class="canvas-wrapper">
          <div class="canvas-container" :class="{ 'no-image': !hasImage }">
            <canvas ref="editorCanvas" width="800" height="400"></canvas>
            <div v-if="!hasImage" class="canvas-placeholder">请上传一张图片开始编辑</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {fabric} from "fabric";
import axios from "axios";

export default {
  name: 'ReWriting',
  data() {
    return {
      examples: [
        { title: '产品白底图', img: require('/public/reWriting/img1.png') },
        { title: '参考图', img: require('/public/reWriting/img2.png') },
        { title: '涂抹遮罩区域', img: require('/public/reWriting/img3.png') },
        { title: '洗稿结果', img: require('/public/reWriting/img4.png') }
      ],
      productFile: {},
      productImg: '',
      exampleFile: {},
      exampleImg: '',
      editFile: {},
      editImg: '',
      hasImage: false,

      loading: false,
      resultImg: ''
    }
  },
  mounted() {
    this.initCanvas();
    // 监听窗口大小变化，必要时重新校准画布
    window.addEventListener('resize', this.calibrateCanvas);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.calibrateCanvas);
  },
  methods: {
    handleProductChange(file, fileList) {
      this.productFile = file
      this.productImg = URL.createObjectURL(file.raw)
    },
    productDelete() {
      this.productFile = {}
      this.productImg = ''
    },
    async handleExampleChange(file, fileList) {
      this.exampleFile = file
      this.exampleImg = URL.createObjectURL(file.raw)

      this.loadImageToCanvas(this.exampleImg);
    },
    exampleDelete() {
      this.exampleFile = {}
      this.exampleImg = ''
    },
    generate() {
      this.$alert('敬请期待','提示')
    },
    initCanvas() {
      this.canvas = new fabric.Canvas(this.$refs.editorCanvas, {
        backgroundColor: '#f5f5f5',
        isDrawingMode: true,
        renderOnAddRemove: true,
        preserveObjectStacking: true
      });

      this.calibrateCanvas();

      this.updateBrushSettings();

      this.canvas.on('after:render', () => {
        this.calibrateCanvas();
      });
    },

    calibrateCanvas() {
      if (!this.canvas) return;

      const canvasElement = this.$refs.editorCanvas;
      const parentElement = canvasElement.parentElement;

      const rect = canvasElement.getBoundingClientRect();
      const parentRect = parentElement.getBoundingClientRect();

      this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      this.canvas.calcOffset();
    },

    updateBrushSettings() {
      if (!this.canvas) return;

      this.canvas.freeDrawingBrush.color = '#ff0000';
      this.canvas.freeDrawingBrush.width = 20;
    },

    loadImageToCanvas(imageUrl) {
      fabric.Image.fromURL(imageUrl, (img) => {
        this.canvas.clear();

        const scaleX = 800 / img.width;
        const scaleY = 400 / img.height;
        const scale = Math.min(scaleX, scaleY, 1); // 不放大图片

        img.scale(scale);

        img.set({
          left: (800 - img.width * scale) / 2,
          top: (400 - img.height * scale) / 2,
          zIndex: 1
        });

        this.canvas.add(img);
        this.originalImage = img;
        this.hasImage = true;

        this.updateBrushSettings();

        this.calibrateCanvas();

      }, {
        crossOrigin: 'anonymous'
      });
    },

    clearCanvas() {
      if (!this.originalImage) return;

      this.canvas.clear();
      this.canvas.add(this.originalImage);
      this.showStatus('已清除所有编辑', 'info');
    },

    downloadImage() {
      const link = document.createElement('a');
      link.download = 'edited-image.png';
      link.href = this.canvas.toDataURL('image/png');
      link.click();
      this.showStatus('图片已下载', 'success');
    },

    async uploadToBackend() {
      try {
        // 将画布内容转换为Blob对象
        const blob = await new Promise((resolve) => {
          this.canvas.toBlob(resolve, 'image/png');
        });

        // 创建FormData对象
        const formData = new FormData();
        formData.append('editedImage', blob, 'edited-image.png');

        // 发送到后端 (请替换为你的实际API地址)
        const response = await axios.post('/api/upload-edited-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.success) {
          this.showStatus('图片已成功提交到后端', 'success');
        } else {
          this.showStatus('提交失败: ' + (response.data.message || '未知错误'), 'error');
        }
      } catch (error) {
        console.error('上传失败:', error);
        this.showStatus('提交失败: 网络错误或服务器无响应', 'error');
      }
    },
    back() {
      this.$router.push({ path: '/chest'})
    }
  }
}
</script>

<style scoped>
.re-writing {
  height: 100%;
  min-width: 1200px;
}

.re-writing-header {
  flex: 1;
  margin: 0 0 8px;
  font-weight: bold;
  display: flex;
  justify-content: center;
}

.re-writing-example-card {
  width: 100%;
  padding: 12px;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;
}

.re-writing-example-title {
  color: #101010;
  font-size: 14px;
  font-weight: bold;
}

.example-img {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.example-img-title {
  font-size: 12px;
  color: #999999;
}

.re-writing-content {
  margin-top: 16px;
  height: calc(100% - 250px);
  display: flex;
  gap: 20px;
}

.work-setting-area {
  width: 370px;
  padding: 12px;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;
  height: 100%;
  overflow: auto;
}

.work-setting-name {
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
  width: 120px;
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

.generate-btn >>> .el-button {
  width: 150px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border: none;
  padding: 12px 24px;;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 6px;
}

.editor-content {
  flex: 1;
  height: 100%;
}

.edit-tips {
  font-size: 14px;
  color: #999999;
  margin-bottom: 12px;
}

.canvas-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  height: calc(100% - 100px);
  overflow-y: auto;
}

.canvas-container {
  position: relative;
  line-height: 0; /* 消除底部间隙 */
}

.no-image canvas {
  background-color: #f9f9f9;
  background-image: linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
  linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
  linear-gradient(-45deg, transparent 75%, #e0e0e0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.canvas-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  pointer-events: none;
}
</style>