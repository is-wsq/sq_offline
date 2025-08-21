<template>
  <div class="imageToVideo">
    <div class="imageToVideo-header">
      <el-button type="text" class="back-btn" @click="backToScript">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <el-steps style="flex: 1;" :active="2" align-center finish-status="success">
        <el-step title="图生脚本"></el-step>
        <el-step title="脚本生图"></el-step>
        <el-step title="图生视频"></el-step>
      </el-steps>
      <div style="width: 36px"></div>
    </div>
    <div class="flex-center" style="margin-bottom: 20px">
      <div style="flex: 1">
        <div style="font-size: 24px; font-weight: bold;">图生视频</div>
        <div style="font-size: 14px; color: #4b5563;margin-top: 4px">
          基于您分镜脚本生成的图片生成对应的视频，可进行调整和优化
        </div>
      </div>
      <el-button type="primary">批量下载</el-button>
    </div>
    <div class="imageToVideo-body">
      <div class="video-item" v-for="(item, index) in video_scripts" :key="index">
        <div class="video-item-header">
          <div style="flex: 1">
            <div style="display: flex;gap: 8px">
              <div style="font-size: 18px; font-weight: bold;">分镜脚本{{ index + 1 }}</div>
            </div>
            <div class="video-item-copy">{{ item.copy }}</div>
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
          <div style="color: #4b5563;margin-bottom: 16px">生成视频</div>
          <div class="video-item-images" @mouseleave="item.hover = false"  @mouseenter="item.hover = true">
            <video :src="item.video_path" style="width: 120px;height: 160px;border-radius: 8px"
                   v-if="item.hover" loop muted autoplay></video>
            <el-image :src="item.image_path" style="width: 120px;height: 160px;border-radius: 8px"
                      v-else fit="cover"></el-image>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {postAction} from "@/api/api";

export default {
  name: 'imageToVideo',
  data() {
    return {
      video_scripts: [],
      loading: false,
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    handleReload(index) {
      this.loading = this.$loading({
        lock: true,
        text: '视频生成中，请稍等...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      let scripts = [{
        copy: this.video_scripts[index].copy,
        image_path: this.video_scripts[index].image_path,
      }]
      let params = {
        scripts: scripts,
        duration: 4,
      }
      postAction('/picture/generate_video', params, 600000).then(res => {
        if (res.data.status ==='success') {
          this.loading.close();
          this.loading = null;
          this.video_scripts[index] = res.data.data[0]
          sessionStorage.setItem('video_scripts', JSON.stringify(res.data.data))
          this.$message.success('分镜视频重新生成成功')
          this.$forceUpdate()
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
    handleDelete(index) {
      this.$confirm('确认删除该分镜脚本吗？','提示', {
        type: 'warning'
      }).then(() => {
        this.video_scripts.splice(index, 1)
        sessionStorage.setItem("video_scripts", JSON.stringify(this.video_scripts))
        this.$message.success('删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    initData() {
      this.video_scripts = JSON.parse(sessionStorage.getItem("video_scripts")).map(item => {
        return { ...item, hover: false }
      })
    },
    backToScript() {
      sessionStorage.setItem('figure_path', '/scriptToImage')
      this.$router.push({path: '/scriptToImage'})
    }
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

.imageToVideo-header >>> .el-step__title.is-process {
  color: #6366fe;
}

.imageToVideo-header >>> .el-step__head.is-process {
  color: #6366fe !important;
  border-color: #6366fe !important;
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

.video-item-images {
  width: 120px;
  display: flex;
  gap: 16px;
}
</style>