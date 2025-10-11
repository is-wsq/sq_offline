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
        <div class="margin-t-12 work-setting-name" v-if="resultImg">
          洗稿结果
        </div>
        <div v-if="resultImg" style="position: relative;width: 120px;cursor: pointer" @click="previewImgVisible = true">
          <el-image :src="resultImg" class="img"></el-image>
          <div class="img-delete">
            <i class="el-icon-download" @click.stop="downloadResult"></i>
          </div>
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
    <el-dialog class="preview-img-dialog" :visible.sync="previewImgVisible" width="430px">
      <el-image :src="resultImg" style="width: 360px;border-radius: 8px"></el-image>
    </el-dialog>
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
      imagePosition: {},

      loading: false,
      resultImg: '', //http://127.0.0.1:6006/results/ComfyUI_00001_oukpp_1760176951.png
      canvas: null,
      maskCanvas: null,

      previewImgVisible: false
    }
  },
  mounted() {
    this.initCanvas();
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
    async generate() {
      if (!this.productFile.uid) {
        this.$alert('请上传产品图后重试', '提示')
        return
      }
      if (!this.exampleFile.uid) {
        this.$alert('请上传参考图后重试', '提示')
        return
      }
      this.loading = true
      const loading = this.$loading({
        lock: true,
        text: '带货视频制作中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });

      const tempCanvas = this.generatePreview();
      const blob = await new Promise((resolve) => {
        tempCanvas.toBlob(resolve, 'image/png');
      });
      const formData = new FormData();
      formData.append("white_image_file", this.productFile.raw)
      formData.append("black_image_file", blob)

      axios.post("http://127.0.0.1:6006/running_hub/generate_all_rewrite_picture_workflow", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(res => {
        if (res.data.status === "success") {
          this.resultImg = res.data.data.image_path;
          this.$message.success('洗稿成功');
          loading.close();
          this.loading = false
        } else {
          loading.close();
          this.loading = false
          this.$alert('洗稿失败:'+ res.data.message, '提示');
        }
      }).catch(err => {
        loading.close();
        this.loading = false
        console.error('洗稿错误:', err);
      });
    },
    downloadResult() {
      fetch(this.resultImg).then(response => response.blob()).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const filename = this.resultImg.split('/').pop();
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }).catch(error => {
        console.error('下载图片失败:', error);
        this.$message.error('下载图片失败');
      });
    },
    initCanvas() {
      this.canvas = new fabric.Canvas(this.$refs.editorCanvas, {
        backgroundColor: '#f5f5f5',
        isDrawingMode: true,
        selection: false
      });

      // 初始化遮罩画布(不可见，用于记录涂抹区域)
      this.maskCanvas = document.createElement('canvas');
      this.maskCanvas.width = 800;
      this.maskCanvas.height = 400;

      this.updateBrushSettings();

      // 监听绘制事件，同步到遮罩画布
      this.canvas.on('path:created', (event) => {
        this.updateMask(event.path);
        this.generatePreview();
      });
    },

    calibrateCanvas() {
      if (!this.canvas) return;

      this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      this.canvas.calcOffset();
    },

    updateBrushSettings() {
      if (!this.canvas) return;

      this.canvas.freeDrawingBrush.color = '#353535';
      this.canvas.freeDrawingBrush.width = 20;
      this.canvas.freeDrawingBrush.lineCap = 'round';
      this.canvas.freeDrawingBrush.lineJoin = 'round';
    },

    loadImageToCanvas(imageUrl) {
      this.canvas.clear();
      const maskCtx = this.maskCanvas.getContext('2d');
      maskCtx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
      fabric.Image.fromURL(imageUrl, (img) => {
        const scaleX = 800 / img.width;
        const scaleY = 400 / img.height;
        const scale = Math.min(scaleX, scaleY, 1); // 不放大图片

        img.scale(scale);

        img.set({
          left: (800 - img.width * scale) / 2,
          top: (400 - img.height * scale) / 2,
          selectable: false
        });

        this.imagePosition = {
          left: (800 - img.width * scale) / 2,
          top: (400 - img.height * scale) / 2,
          width: img.width * scale,
          height: img.height * scale
        };

        this.canvas.add(img);
        this.originalImage = img;
        this.hasImage = true;

        this.updateBrushSettings();

        this.calibrateCanvas();

      }, {
        crossOrigin: 'anonymous'
      });
    },

    // 更新遮罩(记录涂抹区域)
    updateMask(path) {
      if (!this.maskCanvas) return;

      const ctx = this.maskCanvas.getContext('2d');
      const pathData = path.path;

      // 绘制路径到遮罩画布(用白色标记涂抹区域)
      ctx.beginPath();

      // 解析路径数据
      pathData.forEach((segment) => {
        const [command, ...params] = segment;

        switch (command) {
          case 'M': // 移动到
            ctx.moveTo(params[0], params[1]);
            break;
          case 'L': // 直线到
            ctx.lineTo(params[0], params[1]);
            break;
          case 'Q': // 二次贝塞尔曲线
            ctx.quadraticCurveTo(params[0], params[1], params[2], params[3]);
            break;
          case 'C': // 三次贝塞尔曲线
            ctx.bezierCurveTo(params[0], params[1], params[2], params[3], params[4], params[5]);
            break;
        }
      });

      // 设置线条样式并绘制
      ctx.lineWidth = 20;
      ctx.strokeStyle = '#ffffff'; // 白色标记涂抹区域
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    },

    generatePreview() {
      if (!this.originalImage) return;

      // 创建临时画布用于处理
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.imagePosition.width;
      tempCanvas.height = this.imagePosition.height;
      const tempCtx = tempCanvas.getContext('2d');

      // 1. 绘制原始图片区域
      tempCtx.drawImage(
          this.canvas.lowerCanvasEl,
          this.imagePosition.left,
          this.imagePosition.top,
          this.imagePosition.width,
          this.imagePosition.height,
          0,
          0,
          this.imagePosition.width,
          this.imagePosition.height
      );

      // 2. 获取遮罩数据
      const maskData = this.maskCanvas.getContext('2d').getImageData(
          this.imagePosition.left,
          this.imagePosition.top,
          this.imagePosition.width,
          this.imagePosition.height
      );

      // 3. 获取图像数据
      const imageData = tempCtx.getImageData(
          0, 0,
          this.imagePosition.width,
          this.imagePosition.height
      );

      // 4. 处理像素：涂抹区域(有白色标记)设为透明
      const pixels = imageData.data;
      const maskPixels = maskData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        // 如果遮罩该位置有颜色(涂抹过)，设置透明度为0
        if (maskPixels[i] > 0) { // 检查红色通道(白色的RGB值都为255)
          pixels[i + 3] = 0; // 设置alpha通道为0(完全透明)
        }
      }

      // 5. 将处理后的像素放回画布
      tempCtx.putImageData(imageData, 0, 0);

      return tempCanvas;
    },
    clearCanvas() {
      if (!this.originalImage) return;

      this.canvas.clear();
      this.canvas.add(this.originalImage);
    },
    async downloadImage() {
      const tempCanvas = this.generatePreview();
      const url = tempCanvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.download = 'edited-image-part.png';
      link.href = url;
      link.click();
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

.preview-img-dialog >>> .el-dialog {
  background-color: transparent;
  box-shadow: none !important;
  margin: 0 auto;
}

.preview-img-dialog >>> .el-dialog__headerbtn {
  right: 0;
}

.preview-img-dialog >>> .el-dialog__close {
  font-size: 24px;
  font-weight: bold;
  color: #9ca3af;
}

.preview-img-dialog >>> .el-dialog__body {
  padding: 15px 35px;
}
</style>