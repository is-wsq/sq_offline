<template>
  <div class="image-editor-container">
    <div class="editor-header">
      <h2>图片编辑器</h2>
      <div class="controls">
        <input type="file"
               id="file-upload"
               accept="image/*"
               @change="handleFileUpload"
               class="file-input"
        >
        <label for="file-upload" class="btn upload-btn">上传图片</label>

        <div class="brush-controls">
          <label>画笔颜色:</label>
          <input type="color" v-model="brushColor" @change="updateBrushSettings">

          <label>画笔粗细:</label>
          <input type="range" min="1" max="20" v-model="brushWidth" @change="updateBrushSettings">

          <button class="btn" @click="toggleEraser">
            {{ isEraserMode ? '切换画笔' : '切换橡皮擦' }}
          </button>
        </div>

        <button class="btn clear-btn" @click="clearCanvas" :disabled="!hasImage">清除编辑</button>
        <button class="btn download-btn" @click="downloadImage" :disabled="!hasImage">下载图片</button>
        <button class="btn upload-api-btn" @click="uploadToBackend" :disabled="!hasImage">提交到后端</button>
      </div>
    </div>

    <div class="editor-content">
      <div class="canvas-wrapper">
        <div class="canvas-container" :class="{ 'no-image': !hasImage }">
          <canvas ref="editorCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
          <div v-if="!hasImage" class="canvas-placeholder">请上传一张图片开始编辑</div>
        </div>
      </div>
    </div>

    <div class="status-message" v-if="statusMessage" :class="statusType">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script>
import {fabric} from 'fabric';
import axios from 'axios';

export default {
  data() {
    return {
      canvas: null,
      originalImage: null,
      hasImage: false,
      brushColor: '#ff0000',
      brushWidth: 20,
      isEraserMode: false,
      canvasWidth: 800,
      canvasHeight: 600,
      statusMessage: '',
      statusType: ''
    };
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
    initCanvas() {
      // 初始化画布
      this.canvas = new fabric.Canvas(this.$refs.editorCanvas, {
        backgroundColor: '#f5f5f5',
        isDrawingMode: true,
        // 增加坐标精度
        renderOnAddRemove: true,
        preserveObjectStacking: true
      });

      // 校准画布偏移
      this.calibrateCanvas();

      // 设置初始画笔
      this.updateBrushSettings();

      // 监听画布事件，确保绘制坐标正确
      this.canvas.on('after:render', () => {
        this.calibrateCanvas();
      });
    },

    // 校准画布偏移
    calibrateCanvas() {
      if (!this.canvas) return;

      const canvasElement = this.$refs.editorCanvas;
      const parentElement = canvasElement.parentElement;

      // 获取画布在页面中的实际位置
      const rect = canvasElement.getBoundingClientRect();
      const parentRect = parentElement.getBoundingClientRect();

      // 设置画布偏移，确保鼠标坐标与画布坐标一致
      this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      this.canvas.calcOffset();
    },

    updateBrushSettings() {
      if (!this.canvas) return;

      // 根据是否橡皮擦模式设置画笔
      this.canvas.freeDrawingBrush.color = this.isEraserMode ? '#f5f5f5' : this.brushColor;
      this.canvas.freeDrawingBrush.width = this.brushWidth;
    },

    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // 读取上传的图片
      const reader = new FileReader();
      reader.onload = (e) => {
        this.loadImageToCanvas(e.target.result);
      };
      reader.readAsDataURL(file);

      // 重置文件输入，允许重复选择同一文件
      event.target.value = '';
    },

    loadImageToCanvas(imageUrl) {
      fabric.Image.fromURL(imageUrl, (img) => {
        // 清除画布
        this.canvas.clear();

        // 调整图片大小以适应画布，保持比例
        const scaleX = this.canvasWidth / img.width;
        const scaleY = this.canvasHeight / img.height;
        const scale = Math.min(scaleX, scaleY, 1); // 不放大图片

        img.scale(scale);

        // 将图片居中
        img.set({
          left: (this.canvasWidth - img.width * scale) / 2,
          top: (this.canvasHeight - img.height * scale) / 2,
          // 确保图片在最底层
          zIndex: 1
        });

        // 添加图片到画布
        this.canvas.add(img);
        this.originalImage = img;
        this.hasImage = true;

        // 确保画笔设置正确
        this.updateBrushSettings();

        // 校准画布，防止偏移
        this.calibrateCanvas();

        this.showStatus('图片已加载，可开始编辑', 'success');
      }, {
        crossOrigin: 'anonymous'
      });
    },

    toggleEraser() {
      this.isEraserMode = !this.isEraserMode;
      this.updateBrushSettings();
    },

    clearCanvas() {
      if (!this.originalImage) return;

      // 清除所有绘制，只保留原始图片
      this.canvas.clear();
      this.canvas.add(this.originalImage);
      this.showStatus('已清除所有编辑', 'info');
    },

    downloadImage() {
      // 将画布内容转换为图片并下载
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

    showStatus(message, type = 'info') {
      this.statusMessage = message;
      this.statusType = type;

      // 3秒后自动清除状态消息
      setTimeout(() => {
        this.statusMessage = '';
        this.statusType = '';
      }, 3000);
    }
  }
};
</script>

<style scoped>
.image-editor-container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.editor-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

h2 {
  margin-top: 0;
  color: #333;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 15px;
}

.file-input {
  display: none;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.upload-btn {
  background-color: #42b983;
  color: white;
}

.upload-btn:hover {
  background-color: #359e75;
}

.brush-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 0 10px;
  padding: 5px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.brush-controls input[type="color"] {
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  cursor: pointer;
}

.brush-controls input[type="range"] {
  width: 100px;
}

.clear-btn {
  background-color: #f0ad4e;
  color: white;
}

.clear-btn:hover {
  background-color: #ec971f;
}

.clear-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.download-btn {
  background-color: #5bc0de;
  color: white;
}

.download-btn:hover {
  background-color: #31b0d5;
}

.download-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.upload-api-btn {
  background-color: #337ab7;
  color: white;
}

.upload-api-btn:hover {
  background-color: #286090;
}

.upload-api-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.editor-content {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.canvas-wrapper {
  position: relative;
  display: inline-block;
}

.canvas-container {
  position: relative;
  line-height: 0; /* 消除底部间隙 */
}

canvas {
  display: block;
  vertical-align: top; /* 消除基线对齐导致的间隙 */
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

.status-message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  color: white;
}

.status-message.success {
  background-color: #5cb85c;
}

.status-message.error {
  background-color: #d9534f;
}

.status-message.info {
  background-color: #5bc0de;
}
</style>
