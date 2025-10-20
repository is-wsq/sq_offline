<template>
  <div class="content-removal"
       v-loading="loading"
       element-loading-text="内容移除中..."
       element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.8)">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="back">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="c-page-header">内容移除</div>
      <div style="width: 36px"></div>
    </div>
    <div class="content-removal-content">
      <div class="work-setting-area">
        <div class="font-weight">工作台</div>
        <div style="flex: 1;overflow-y: auto">
          <div class="work-setting-label">原图，点击右下方画笔绘制移除区</div>
          <div class="flex-center">
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
            <div style="flex: 1;height: 140px;position: relative">
              <i class="el-icon-edit edit-icon" @click="showDialog"/>
            </div>
          </div>
        </div>
        <div class="generate-btn">
          <el-button @click="generate" :loading="!!loading" :disabled="!imageFile">
            <i class="el-icon-bianjiqi btn-icon" v-if="!loading"></i>
            {{ !!loading ? '内容移除中...' : '内容移除' }}
          </el-button>
        </div>
      </div>
      <div class="content-removal-preview">
        <div class="preview-header">
          <div class="preview-header-title">应用介绍&输入建议</div>
          <div class="preview-header-desc">
            <div>图片内容消除，涂哪消哪，简单操作精准消除</div>
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
    <el-dialog class="edit-dialog" :visible.sync="showDrawDialog" width="640px" :before-close="handleCloseDrawDialog">
      <div slot="title" class="edit-dialog-title">绘制移除区</div>
      <div class="edit-dialog-body">
        <div class="edit-list">
          <el-popover
              placement="bottom"
              width="200"
              trigger="click">
            <el-slider v-model="lineWidth" :min="1" :max="100" :step="1" style="margin: -4px 0" @change="lineWidthChange"></el-slider>
            <i class="el-icon-removal cursor-pointer" style="color: #409eff;" slot="reference"></i>
          </el-popover>
<!--          <el-tooltip class="item" effect="dark" content="编辑" placement="top">-->
<!--            <i class="el-icon-removal cursor-pointer" style="color: #409eff;"></i>-->
<!--          </el-tooltip>-->
          <el-tooltip class="item" effect="dark" content="撤销编辑" placement="top">
            <i class="el-icon-chexiao cursor-pointer" @click="clearCanvas"></i>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="还原" placement="top">
            <i class="el-icon-refresh-left font-weight cursor-pointer" @click="restore"></i>
          </el-tooltip>
        </div>
        <canvas ref="editorCanvas" width="600" height="600"></canvas>
      </div>
      <div slot="footer" class="edit-dialog-footer">
        <el-button type="primary" size="small" @click="submitDraw">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {ClearCacheMixin} from "@/mixins/ClearCacheMixin";
import axios from "axios";
import {fabric} from "fabric";

export default {
  name: 'ContentRemoval',
  mixins: [ClearCacheMixin],
  data() {
    return {
      imageFile: null,
      image_path: './chest/contentRemoval_example.png',
      originalImage: './chest/contentRemoval_example.png',
      resultList: [
        './chest/contentRemoval_result1.gif',
        './chest/contentRemoval_result2.webp',
      ],
      activeIndex: 0,
      loading: false,

      showDrawDialog: false,
      imagePosition: {},
      canvas: null,
      maskCanvas: null,

      lineWidth: 20,
    }
  },
  mounted() {
    this.initFile()
    window.addEventListener('resize', this.calibrateCanvas);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.calibrateCanvas);
  },
  methods: {
    lineWidthChange() {
          if (this.canvas) {
            this.canvas.freeDrawingBrush.width = this.lineWidth;
          }
    },
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
      this.originalImage = URL.createObjectURL(file.raw);
      this.imageFile = file
    },
    imageDelete() {
      this.image_path = '';
      this.imageFile = null;
    },
    showDialog() {
      this.showDrawDialog = true
      this.$nextTick(async () => {
        if (!this.canvas) {
          await this.initCanvas();
        }
        this.loadImageToCanvas(this.image_path)
      })
    },
    async submitDraw() {
      const tempCanvas = this.generatePreview();
      this.imageFile = await new Promise((resolve) => {
        tempCanvas.toBlob(resolve, 'image/png');
      });
      this.image_path = URL.createObjectURL(this.imageFile)
      this.handleCloseDrawDialog()
    },
    initCanvas() {
      // 如果已有canvas实例，先销毁
      if (this.canvas) {
        this.canvas.dispose();
      }
      this.canvas = new fabric.Canvas(this.$refs.editorCanvas, {
        backgroundColor: '#fff',
        isDrawingMode: true,
        selection: false
      });

      this.maskCanvas = document.createElement('canvas');
      this.maskCanvas.width = 600;
      this.maskCanvas.height = 600;

      this.updateBrushSettings();

      this.canvas.on('path:created', (event) => {
        this.updateMask(event.path);
        this.generatePreview();
      });

      this.canvas.clear();
    },

    calibrateCanvas() {
      if (!this.canvas) return;

      this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      this.canvas.calcOffset();
    },

    updateBrushSettings() {
      if (!this.canvas) return;

      this.canvas.freeDrawingBrush.color = '#fff';
      this.canvas.freeDrawingBrush.width = 20;
      this.canvas.freeDrawingBrush.lineCap = 'round';
      this.canvas.freeDrawingBrush.lineJoin = 'round';
    },

    loadImageToCanvas(imageUrl) {
      this.canvas.clear();
      const maskCtx = this.maskCanvas.getContext('2d');
      maskCtx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
      fabric.Image.fromURL(imageUrl, (img) => {
        const scaleX = 600 / img.width;
        const scaleY = 600 / img.height;
        const scale = Math.min(scaleX, scaleY, 1); // 不放大图片

        img.scale(scale);
        img.set({
          left: (600 - img.width * scale) / 2,
          top: (600 - img.height * scale) / 2,
          selectable: false
        });

        this.imagePosition = {
          left: (600 - img.width * scale) / 2,
          top: (600 - img.height * scale) / 2,
          width: img.width * scale,
          height: img.height * scale
        };

        this.canvas.add(img);
        this.updateBrushSettings();
        this.calibrateCanvas();
      }, {
        crossOrigin: 'anonymous'
      });
    },

    updateMask(path) {
      if (!this.maskCanvas) return;

      const ctx = this.maskCanvas.getContext('2d');
      const pathData = path.path;
      ctx.beginPath();

      pathData.forEach((segment) => {
        const [command, ...params] = segment;
        switch (command) {
          case 'M':
            ctx.moveTo(params[0], params[1]);
            break;
          case 'L':
            ctx.lineTo(params[0], params[1]);
            break;
          case 'Q':
            ctx.quadraticCurveTo(params[0], params[1], params[2], params[3]);
            break;
          case 'C':
            ctx.bezierCurveTo(params[0], params[1], params[2], params[3], params[4], params[5]);
            break;
        }
      });

      ctx.lineWidth = this.lineWidth;
      ctx.strokeStyle = '#ffffff';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    },

    generatePreview() {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.imagePosition.width;
      tempCanvas.height = this.imagePosition.height;
      const tempCtx = tempCanvas.getContext('2d');

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

      const maskData = this.maskCanvas.getContext('2d').getImageData(
          this.imagePosition.left,
          this.imagePosition.top,
          this.imagePosition.width,
          this.imagePosition.height
      );

      const imageData = tempCtx.getImageData(
          0, 0,
          this.imagePosition.width,
          this.imagePosition.height
      );

      const pixels = imageData.data;
      const maskPixels = maskData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        if (maskPixels[i] > 0) {
          pixels[i + 3] = 0;
        }
      }

      tempCtx.putImageData(imageData, 0, 0);
      return tempCanvas;
    },

    clearCanvas() {
      this.loadImageToCanvas(this.image_path)
    },

    restore() {
      this.loadImageToCanvas(this.originalImage)
    },
    handleCloseDrawDialog() {
      this.showDrawDialog = false
    },
    generate() {
      if (!this.imageFile) {
        this.$alert('请上传图片后重试', '提示')
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
.content-removal {
  height: 100%;
  min-width: 1200px
}

.content-removal-content {
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
  margin-bottom: 8px;
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
  width: 140px;
  height: 140px;
  line-height: 140px;
  text-align: center;
}

.placeholder-image {
  height: 140px;
  width: 140px;
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

.edit-icon {
  position: absolute;
  right: 0;
  bottom: 0;
  font-size: 20px;
  cursor: pointer;
  color: #979998
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

.content-removal-preview {
  flex: 1;
  height: 100%;
}

.preview-header {
  height: 80px;
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

.preview-image {
  width: 100%;
  height: 100%;
}

.edit-dialog >>> .el-dialog {
  border-radius: 10px;
}

.edit-dialog-title {
  padding: 20px 20px 10px;
  line-height: 24px;
  font-size: 18px;
  color: #303133;
  font-weight: 700;
}

.edit-dialog-body {
  padding: 10px 20px;
}

.edit-list {
  height: 30px;
  font-size: 18px;
  display: flex;
  gap: 20px;
}

.edit-dialog-footer {
  padding: 10px 20px 20px;
}

.edit-dialog >>> .el-dialog__header {
  padding: 0;
}

.edit-dialog >>> .el-dialog__close {
  color: #9ca3af;
  font-size: 24px;
}

.edit-dialog >>> .el-dialog__body {
  padding: 0;
}

.edit-dialog >>> .el-dialog__footer {
  padding: 0;
}
</style>