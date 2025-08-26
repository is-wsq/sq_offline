<template>
  <div class="imageToVideo">
    <div class="imageToVideo-header">
      <el-button type="text" class="back-btn" @click="backToScript">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="flex-center" style="flex: 1;">
        <div class="custom-steps">
          <div class="custom-step-item cursor-pointer custom-completed" @click="toImage">
            <div class="custom-step-circle">
              <i class="el-icon-check font-weight"></i>
            </div>
            <div class="custom-step-title">图生脚本</div>
          </div>
          <div class="custom-step-lines first-step">
            <div class="custom-step-line step-line-completed"></div>
          </div>
          <div class="custom-step-item cursor-pointer custom-completed" @click="backToScript">
            <div class="custom-step-circle">
              <i class="el-icon-check font-weight"></i>
            </div>
            <div class="custom-step-title">脚本生图</div>
          </div>
          <div class="custom-step-lines second-step">
            <div class="custom-step-line step-line-completed"></div>
          </div>
          <div class="custom-step-item cursor-pointer custom-active">
            <div class="custom-step-circle">3</div>
            <div class="custom-step-title">图生视频</div>
          </div>
        </div>
      </div>
      <div style="width: 36px"></div>
    </div>
    <div class="flex-center" style="margin-bottom: 20px">
      <div style="flex: 1">
        <div style="font-size: 24px; font-weight: bold;">图生素材</div>
        <div style="font-size: 14px; color: #4b5563;margin-top: 4px">
          基于您分镜脚本生成的图片生成对应的素材，可进行调整和优化
        </div>
      </div>
      <el-button type="primary" @click="saveAsMaterial">保存至素材列表</el-button>
    </div>
    <div class="imageToVideo-body">
      <div class="video-item" v-for="(item, index) in video_scripts" :key="index">
        <div class="video-item-header">
          <div style="flex: 1">
            <div style="display: flex;gap: 8px">
              <div style="font-size: 18px; font-weight: bold;">分镜脚本{{ index + 1 }}</div>
            </div>
            <div class="video-item-copy">{{ item.video_copy || item.copy }}</div>
          </div>
          <div class="operate-btn-group">
            <el-button type="primary" @click="handleReload(index)">
              <i class="el-icon-refresh" style="margin-right: 5px;"></i>
              重新生成
            </el-button>
            <div class="cursor-pointer" @click="handleDelete(index)">
              <i class="el-icon-delete" style="margin-right: 5px;"></i>
              删除
            </div>
          </div>
        </div>
        <div class="video-item-body">
          <div style="color: #4b5563;">生成素材组</div>
          <div class="storyboard-item-videos">
            <template v-if="item.video_paths && item.video_paths.length > 0">
              <div v-for="(video,video_index) in item.video_paths" :key="video_index"
                   @click="previewVideo(item.video_paths, video, video_index)" class="storyboard-item-video"
                   @mouseenter="hover(index,video_index,video,item)" @mouseleave="leave">
                <video :src="video" loop muted autoplay
                       style="width: 120px;height: 160px;border-radius: 8px;object-fit: cover"
                       v-if="hoverIndex === index && hoverVideoIndex === video_index">
                </video>
                <el-image :src="item.images[video_index]" style="width: 120px;height: 160px;border-radius: 8px"
                          v-else fit="cover"></el-image>
                <i class="el-icon-zoom-in zoom-in"></i>
                <i class="el-icon-close close-btn" @click.stop="deleteVideo(index,video_index)"></i>
              </div>
            </template>
            <template v-else>
              <div class="storyboard-item-video-empty">
                <i class="el-icon-empty-video"></i>
                <div style="font-size: 14px !important;">暂未生成素材，请点击右侧重新生成按钮生成素材</div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <el-dialog class="preview-video-dialog" :visible.sync="previewVideoVisible" width="430px" :before-close="closePreviewVideo">
      <div class="preview-video-container flex-center">
        <div class="preview-video-btn">
          <i class="el-icon-arrow-left" @click="lastPreview"></i>
        </div>
        <video style="border-radius: 8px;width: 300px;aspect-ratio: 9 / 16;object-fit: cover"
               ref="video" :src="previewVideoUrl" @ended="endPreview">
        </video>
        <div class="preview-video-btn">
          <i class="el-icon-arrow-right" @click="nextPreview"></i>
        </div>
        <i class="el-icon-play control-icon" @click="controlVideo" v-if="!isPlaying"></i>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {postAction} from "@/api/api";

export default {
  name: 'imageToVideo',
  data() {
    return {
      video_scripts: [],
      params_scripts: [],
      loading: false,
      hoverIndex: null,
      hoverVideoIndex: null,
      previewVideoVisible: false,
      previewVideos: [],
      previewVideoUrl: '',
      previewVideoIndex: 0,
      isPlaying: false,
      productInfo: {}
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    handleReload(index) {
      this.loading = this.$loading({
        lock: true,
        text: '素材生成中，请稍等...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      let params = {
        scripts: [this.params_scripts[index]],
        duration: 4,
      }
      postAction('/picture/generate_video', params, 600000).then(res => {
        if (res.data.status ==='success') {
          this.loading.close();
          this.loading = null;
          this.video_scripts[index].images = [...this.video_scripts[index].images, ...res.data.data[0].images]
          this.video_scripts[index].video_paths = [...this.video_scripts[index].video_paths, ...res.data.data[0].video_paths]
          sessionStorage.setItem('video_scripts', JSON.stringify(this.video_scripts))

          this.params_scripts[index].video_paths = [...this.params_scripts[index].video_paths, ...res.data.data[0].video_paths]
          sessionStorage.setItem('params_scripts', JSON.stringify(this.params_scripts))
          this.$message.success('分镜素材重新生成成功')
          this.$forceUpdate()
        } else {
          this.loading.close();
          this.loading = null;
          this.$alert(res.data.message,'生成素材失败')
        }
      }).catch(err => {
        this.loading.close();
        this.loading = null;
        this.$alert(err,'生成素材错误')
      })
    },
    handleDelete(index) {
      this.$confirm('确认删除该分镜脚本吗？','提示', {
        type: 'warning'
      }).then(() => {
        this.video_scripts.splice(index, 1)
        sessionStorage.setItem("video_scripts", JSON.stringify(this.video_scripts))

        this.params_scripts.splice(index, 1)
        sessionStorage.setItem("params_scripts", JSON.stringify(this.params_scripts))
        this.$message.success('删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    hover(index, video_index) {
      this.hoverIndex = index
      this.hoverVideoIndex = video_index
    },
    leave() {
      this.hoverIndex = null
      this.hoverVideoIndex = null
    },
    previewVideo(vList, v, vIndex) {
      this.previewVideos = vList
      this.previewVideoUrl = v
      this.previewVideoIndex = vIndex
      this.previewVideoVisible = true
    },
    closePreviewVideo() {
      this.isPlaying = false
      this.$refs.video.pause()
      this.$refs.video.currentTime = 0
      this.previewVideoVisible = false
    },
    lastPreview() {
      if (this.previewVideoIndex === 0) {
        this.$message.warning('已是第一个素材')
        return
      }
      this.previewVideoIndex--
      this.reload()
    },
    nextPreview() {
      if (this.previewVideoIndex === this.previewVideos.length - 1) {
        this.$message.warning('已是最后一个素材')
        return
      }
      this.previewVideoIndex++
      this.reload()
    },
    reload() {
      this.previewVideoUrl = this.previewVideos[this.previewVideoIndex]
      this.isPlaying = false
      this.$refs.video.pause()
      this.$refs.video.currentTime = 0
    },
    endPreview() {
      this.$refs.video.currentTime = 0
      this.isPlaying = false
    },
    controlVideo() {
      const video = this.$refs.video;
      if (this.isPlaying) {
        video.pause();
        this.isPlaying = false;
      } else {
        video.play();
        this.isPlaying = true;
      }
    },
    deleteVideo(index, video_index) {
      this.$confirm('确认删除该素材吗？','提示', {
        type: 'warning'
      }).then(() => {
        this.video_scripts[index].video_paths.splice(video_index, 1)
        this.video_scripts[index].images.splice(video_index, 1)
        sessionStorage.setItem("video_scripts", JSON.stringify(this.video_scripts))

        this.params_scripts[index].video_paths.splice(video_index, 1)
        sessionStorage.setItem("params_scripts", JSON.stringify(this.params_scripts))
        this.$message.success('删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    saveAsMaterial() {
      let params_scripts = this.params_scripts.map(item => {
        return {
          ...item,
          video_copy: item.video_copy || item.copy,
        }
      })
      let params = {
        store_id: this.productInfo.store_id,
        scripts: params_scripts,
      }
      postAction('/figure/upload_generated_video_list',params).then(res => {
        if (res.data.status ==='success') {
          this.$message.success('保存为素材成功')
          this.clearCache()
          sessionStorage.setItem('classify_type', 'material')
          this.$router.push({path: '/figures'})
        } else {
          this.$alert(res.data.message,'保存为素材失败')
        }
      }).catch(err => {
        this.$alert(err,'保存为素材错误')
      })
    },
    clearCache() {
      sessionStorage.removeItem('video_scripts')
      sessionStorage.removeItem('params_scripts')
      sessionStorage.removeItem('operate_product')
      sessionStorage.removeItem('figure_path')
      sessionStorage.removeItem('chats')
      sessionStorage.removeItem('image_scripts')
      sessionStorage.removeItem('last_generated_scripts')
      sessionStorage.removeItem('operate_img_index')
      sessionStorage.removeItem('operate_isAlreadyGenerated')
      sessionStorage.removeItem('operate_scripts')
    },
    initData() {
      this.productInfo = JSON.parse(sessionStorage.getItem("operate_product"))
      this.video_scripts = JSON.parse(sessionStorage.getItem("video_scripts"))
      this.params_scripts = JSON.parse(sessionStorage.getItem("params_scripts"))
    },
    backToScript() {
      sessionStorage.setItem('figure_path', '/scriptToImage')
      this.$router.push({path: '/scriptToImage'})
    },
    toImage() {
      sessionStorage.setItem('figure_path', '/imageToScript')
      this.$router.push({ path: '/imageToScript' })
    },
  }
}
</script>

<style scoped>
.imageToVideo {
  height: 100%;
  min-height: 800px;
}

.imageToVideo-header {
  padding-bottom: 16px;
  box-sizing: border-box;
  color: #475569;
  display: flex;
  align-items: center;
}

.custom-steps {
  width: 70%;
  position: relative;
  display: flex;
  justify-content: space-between;
}

.custom-step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  cursor: default;
}

.custom-step-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 700;
  color: #c0c4cc;
  border: 2px solid #C0C4CC;
  background-color: #fff;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.custom-step-title {
  font-size: 15px;
  font-weight: 500;
  color: #C0C4CC;
  transition: all 0.3s ease;
}

.custom-step-item.custom-active .custom-step-circle {
  border-color: #6366fe !important;
  color: #6366fe !important;
}

.custom-step-item.custom-active .custom-step-title {
  font-weight: 700 !important;
  color: #6366fe !important;
}

.custom-step-item.custom-completed .custom-step-circle {
  border-color: #67c23a;
  color: #67c23a;
}

.custom-step-item.custom-completed .custom-step-title {
  color: #67c23a;
}

.custom-step-lines {
  width: 100%;
  position: absolute;
  top: 17px;
  display: flex;
  justify-content: space-between;
  z-index: 5;
}

.first-step {
  left: 24px;
}

.second-step {
  left: 50%;
}

.custom-step-line {
  height: 2px;
  width: calc(50% - 30px);
  background-color: #C0C4CC;
  transition: all 0.3s ease;
  margin: 0 10px;
}

.step-line-completed {
  background-color: #67c23a !important;
}

.imageToVideo-body {
  height: calc(100% - 165px);
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.video-item {
  width: 100%;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.video-item-header {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 60px;
}

.tag {
  border-radius: 14px;
  border: 1px solid #F5F5F5;
  cursor: pointer;
  height: 28px;
  line-height: 28px;
  padding-left: 12px;
  padding-right: 12px;
}

.video-item-copy {
  font-size: 14px;
  color: #4b5563;
  line-height: 20px;
  margin-top: 6px;
}

.operate-btn-group {
  display: flex;
  gap: 16px;
  width: 230px;
  justify-content: end;
  align-items: center;
  font-size: 14px;
  color: #4b5563;
  font-weight: bold;
}

.video-item-body {
  padding: 16px;
}

.storyboard-item-videos {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 8px 0;
  white-space: nowrap;
}

.storyboard-item-video {
  width: 120px;
  height: 160px;
  border-radius: 8px;
  position: relative;
  cursor: pointer;
  flex: 0 0 auto;
}

.storyboard-item-video:hover {
  transform: scale(1.05);
}

.zoom-in, .close-btn {
  color: #ffffff;
  position: absolute;
  opacity: 0;
}

.zoom-in {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 20px;
}

.close-btn {
  top: 5px;
  right: 5px;
  font-size: 16px;
  font-weight: bold;
}

.storyboard-item-video:hover .zoom-in,
.storyboard-item-video:hover .close-btn {
  opacity: 1;
}

.storyboard-item-video-empty {
  width: 100%;
  height: 160px;
  display: flex;
  gap: 12px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #cdcdcd;
  font-size: 50px;
}

.preview-video-dialog >>> .el-dialog {
  background-color: transparent;
  box-shadow: none !important;
  margin: 0 auto;
}

.preview-video-dialog >>> .el-dialog__headerbtn {
  right: 0;
}

.preview-video-dialog >>> .el-dialog__close {
  font-size: 24px;
  font-weight: bold;
  color: #9ca3af;
}

.preview-video-dialog >>> .el-dialog__body {
  padding: 15px 35px;
}

.preview-video-container {
  width: 360px;
  position: relative;
}

.preview-video-btn {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #a9a9a9;
  font-size: 24px;
  cursor: pointer;
  filter: drop-shadow(0px 0px 10px #292929);
}

.control-icon {
  font-size: 30px;
  color: #fff;
  cursor: pointer;
  filter: drop-shadow(0px 0px 10px #292929);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>