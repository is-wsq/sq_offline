<template>
  <div class="scriptToImage">
    <div class="scriptToImage-header">
      <el-button type="text" class="back-btn" @click="backToImage">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <el-steps style="flex: 1;" :active="1" align-center finish-status="success">
        <el-step title="图生脚本"></el-step>
        <el-step title="脚本生图"></el-step>
        <el-step title="图生视频"></el-step>
      </el-steps>
      <div style="width: 36px"></div>
    </div>
    <div class="flex-center" style="margin-bottom: 20px">
      <div style="flex: 1">
        <div style="font-size: 24px; font-weight: bold;">脚本生图</div>
        <div style="font-size: 14px; color: #4b5563;margin-top: 4px">基于您的分镜脚本生成对应图片，可进行调整和优化</div>
      </div>
      <el-button type="primary" @click="generateVideo">生成视频分镜</el-button>
    </div>
    <div class="scriptToImage-body">
      <div class="storyboard-item" v-for="(item, index) in image_scripts" :key="index">
        <div class="storyboard-item-header">
          <div style="flex: 1">
            <div style="display: flex;gap: 8px">
              <div style="font-size: 18px; font-weight: bold;">分镜脚本{{ index + 1 }}</div>
            </div>
            <div class="storyboard-item-copy">
              <template v-if="editIndex !== index">{{ item.copy }}</template>
              <template v-else>
                <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }"
                          resize="none" v-model="editCopy"></el-input>
              </template>
            </div>
          </div>
          <div class="operate-btn-group">
            <template v-if="editIndex !== index">
              <div class="cursor-pointer" @click="handleEdit(index)">
                <i class="el-icon-edit" style="margin-right: 5px;"></i>
                重新编辑</div>
              <el-button type="primary" @click="handleReload(index)">
                <i class="el-icon-refresh" style="margin-right: 5px;"></i>
                重新生成</el-button>
              <div class="cursor-pointer" @click="handleDelete(index)">
                <i class="el-icon-delete" style="margin-right: 5px;"></i>
                删除</div>
            </template>
            <template v-else>
              <div class="cursor-pointer" @click="handleSure">
                <i class="el-icon-check" style="margin-right: 5px;"></i>
                确定</div>
              <div class="cursor-pointer" @click="handleCancel">
                <i class="el-icon-close" style="margin-right: 5px;"></i>
                取消</div>
            </template>
          </div>
        </div>
        <div class="storyboard-item-body">
          <div style="color: #4b5563;margin-bottom: 16px">生成图片组</div>
          <div class="storyboard-item-images">
            <div v-for="(image,image_index) in item.images" :key="image_index"
                 @click="previewImage(image)" class="storyboard-item-image">
              <el-image :src="image" style="width: 100%;border-radius: 8px"></el-image>
              <i class="el-icon-zoom-in zoom-in"></i>
              <i class="el-icon-close close-btn" @click.stop="deleteImage(index,image_index)"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog class="preview-img-dialog" :visible.sync="previewImgVisible" width="430px">
      <el-image :src="previewImgUrl" style="width: 360px;border-radius: 8px"></el-image>
    </el-dialog>
  </div>
</template>

<script>
import {postAction} from "@/api/api";

export default {
  name: "scriptToImage",
  data() {
    return {
      operateProductInfo: {},
      image_scripts: [],
      editIndex: -1,
      editCopy: '',
      loading: null,
      previewImgVisible: false,
      previewImgUrl: ''
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    handleEdit(index) {
      this.editIndex = index
      this.editCopy = this.image_scripts[index].copy
    },
    handleReload(index) {
      this.loading = this.$loading({
        lock: true,
        text: '图片重新生成中，请稍等...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      let scripts = []
      let script = this.image_scripts.map(item => item.copy)[index]
      scripts.push({ copy: script })
      let params = {
        product_id: this.operateProductInfo.id,
        scripts: scripts,
        size: "portrait"
      }
      postAction('/picture/generate_images_parallel',params, 600000).then(res => {
        if (res.data.status === 'success') {
          this.loading.close();
          this.loading = null;
          this.image_scripts[index] = res.data.data[0]
          sessionStorage.setItem("image_scripts", JSON.stringify(this.image_scripts))
          this.$message.success('图片重新生成成功')
          this.$forceUpdate()
        } else {
          this.loading.close();
          this.loading = null;
          this.$alert(res.data.message,'提示')
        }
      }).catch(err => {
        this.loading.close();
        this.loading = null;
        this.$alert(err,'提示')
      })
    },
    handleDelete(index) {
      this.$confirm('确认删除该分镜脚本吗？','提示', {
        type: 'warning'
      }).then(() => {
        this.image_scripts.splice(index, 1)
        sessionStorage.setItem("image_scripts", JSON.stringify(this.image_scripts))
        this.$message.success('删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    handleSure() {
      this.image_scripts[this.editIndex].copy = this.editCopy
      this.editIndex = -1
      sessionStorage.setItem("image_scripts", JSON.stringify(this.image_scripts))
      this.$message.success('保存成功')
    },
    handleCancel() {
      this.editIndex = -1
      this.$message.info('已取消编辑')
    },
    previewImage(image) {
      this.previewImgUrl = image
      this.previewImgVisible = true
    },
    deleteImage(index, image_index) {
      this.$confirm('确认删除该图片吗？','提示', {
        type: 'warning'
      }).then(() => {
        this.image_scripts[index].images.splice(image_index, 1)
        sessionStorage.setItem("image_scripts", JSON.stringify(this.image_scripts))
        this.$message.success('删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    initData() {
      this.operateProductInfo = JSON.parse(sessionStorage.getItem('operate_product'))
      this.image_scripts = JSON.parse(sessionStorage.getItem("image_scripts"))
    },
    generateVideo() {
      let scripts = this.image_scripts.map(item => {
        return {
          copy: item.copy,
          image_path: item.selected_image
        }
      })
      let hasImagePathUndefined = scripts.every(item => !item.image_path);
      if (hasImagePathUndefined) {
        this.$alert('请先给每个分镜脚本选择生成视频的图片后重新尝试','生成失败')
        return
      }
      this.loading = this.$loading({
        lock: true,
        text: '视频生成中，请稍等...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      let params = {
        scripts: scripts,
        duration: 4,
      }
      postAction('/picture/generate_video', params, 600000).then(res => {
        if (res.data.status ==='success') {
          this.loading.close();
          this.loading = null;
          sessionStorage.setItem('video_scripts', JSON.stringify(res.data.data))

          sessionStorage.setItem('figure_path', '/imageToVideo')
          this.$router.push({ path: '/imageToVideo' })
        } else {
          this.loading.close();
          this.loading = null;
          this.$alert(res.data.message,'生成视频失败')
        }
      }).catch(err => {
        this.loading.close();
        this.loading = null;
        this.$alert(err,'生成视频错误')
      })
    },
    backToImage() {
      sessionStorage.setItem('figure_path', '/imageToScript')
      this.$router.push({ path: '/imageToScript' })
    }
  },
}
</script>

<style scoped>
.scriptToImage {
  height: 100%;
  min-height: 800px;
}

.scriptToImage-header {
  padding-bottom: 16px;
  box-sizing: border-box;
  color: #475569;
  display: flex;
  align-items: center;
}

.scriptToImage-header >>> .el-step__title.is-process {
  color: #6366fe;
}

.scriptToImage-header >>> .el-step__head.is-process {
  color: #6366fe !important;
  border-color: #6366fe !important;
}

.scriptToImage-body {
  height: calc(100% - 165px);
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.storyboard-item {
  width: 100%;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.storyboard-item-header {
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

.storyboard-item-copy {
  font-size: 14px;
  color: #4b5563;
  line-height: 20px;
  margin-top: 6px;
}

.operate-btn-group {
  display: flex;
  gap: 16px;
  width: 300px;
  justify-content: end;
  align-items: center;
  font-size: 14px;
  color: #4b5563;
  font-weight: bold;
}

.storyboard-item-body {
  padding: 16px;
}

.storyboard-item-images {
  display: flex;
  gap: 16px;
}

.storyboard-item-image {
  width: 120px;
  border-radius: 8px;
  position: relative;
  cursor: pointer;
}

.storyboard-item-image:hover {
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

.storyboard-item-image:hover .zoom-in,
.storyboard-item-image:hover .close-btn {
  opacity: 1;
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