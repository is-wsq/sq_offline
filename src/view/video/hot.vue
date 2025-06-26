<template>
  <div class="hot">
    <el-button type="text" class="back-btn" @click="$router.go(-1)">
      <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
    </el-button>
    <div class="box-card">
      <div class="search-content">
        <el-input prefix-icon="el-icon-search" placeholder="一句话搜模板，例如：科技感转场"
                  class="search-input" v-model="searchText" @change="searchFilter"></el-input>
      </div>
      <div class="tags">
        <el-tag size="small" class="tag" :class="{ 'tag-active': activeTag === '全部推荐' }"
                @click="tagFilter('全部推荐')">全部推荐
        </el-tag>
        <el-tag v-for="(tag, index) in classifies" :key="index" size="small" class="tag"
                :class="{ 'tag-active': tag.name === activeTag }" @click="tagFilter(tag.name)">
          {{ tag.name }}
        </el-tag>
      </div>
      <div class="hot-list">
        <div style="aspect-ratio: 9 / 16;">
          <div class="upload-card" @click="uploadDialogVisible = true">
            <i class="el-icon-shangchuan" style="font-size: 28px"></i>
            <span style="font-size: 12px;margin-top: 8px">上传爆款视频</span>
          </div>
        </div>
        <div v-for="(video, index) in filter_hots" :key="index" class="video-card" @mouseleave="video.isHover = false"
             @mouseenter="video.isHover = true">
          <template v-if="!video.isHover">
            <el-image style="width: 100%; height: 100%;border-radius: 8px;" :src="video.picture" fit="cover">
            </el-image>
            <el-tag size="mini" v-if="video.category" class="video-tag"
                    :style="{ backgroundColor: classifies.find(item => item.name === video.category).color }">
              {{ video.category }}
            </el-tag>
            <div class="video-title">{{ video.name }}</div>
          </template>
          <template v-else>
            <video :src="video.filepath" style="width: 100%; height: 100%;border-radius: 8px;"
                   loop muted autoplay>
            </video>
            <div class="video-title-hover">
              <div style="margin-bottom: 8px">{{ video.name }}</div>
              <div style="display: flex;justify-content: center;align-items: center">
                <i class="el-icon-video-play" style="font-size: 14px"></i>
                <div style="margin-left: 8px;flex: 1">{{ formattedDuration(video.duration) }}</div>
                <i class="el-icon-film" style="font-size: 14px"></i>
                <div style="margin-left: 8px;">{{ video.segments.data.total_segments + '分镜' }}</div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div style="text-align: center; margin-top: 12px;">
      <el-button type="primary" class="foot-btn">一键复刻</el-button>
    </div>
    <el-dialog class="upload-dialog" :visible.sync="uploadDialogVisible" width="32rem"
               title="上传爆款视频" :before-close="beforeUploadClose">
      <el-upload
          v-if="!use_link"
          drag
          ref="hotUpload"
          class="video-uploader"
          style="width: 100%"
          action="http://127.0.0.1:6006/figure/add_hot_video"
          :data="{ title: title, category: classify, tag: uploadTag }"
          :on-success="uploadSuccess"
          :on-error="uploadError"
          :before-upload="beforeUpload"
          accept=".mp4, .mov"
          :auto-upload="false"
          multiple>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>

      <div class="flex-center" style="margin: 10px 0 5px 0">
        <el-checkbox v-model="use_link"></el-checkbox>
        <div style="font-size: 15px;font-weight: bold;flex: 1">使用链接上传</div>
      </div>
      <el-input prefix-icon="el-icon-link" v-model="dy_link" placeholder="粘贴抖音视频分享链接上传" :disabled="!use_link"></el-input>

<!--      <div style="margin: 10px 0 5px 0;font-size: 15px;font-weight: bold">标题</div>-->
<!--      <el-input v-model="title" placeholder="请输入视频标题"></el-input>-->
      <div style="margin: 10px 0 5px 0;font-size: 15px;font-weight: bold">分类</div>
      <div class="classifies">
        <el-tag v-for="(tag, index) in classifies" :key="index" size="small" class="tag"
                :class="{ 'tag-active': tag.name === classify }" @click="classify = tag.name">
          {{ tag.name }}
        </el-tag>
      </div>
      <div style="margin: 10px 0 5px 0;font-size: 15px;font-weight: bold">标签</div>
      <el-input v-model="uploadTag" placeholder="多标签使用逗号(，)分隔，用于匹配搜索"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="uploadDialogVisible = false" size="small" style="border-radius: 6px">取消</el-button>
        <el-button type="primary" @click="handleSubmit" size="small" style="border-radius: 6px">确认上传</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {getAction} from "@/api/api";

export default {
  data() {
    return {
      searchText: '',
      activeTag: '全部推荐',
      hots: [],
      filter_hots: [],
      uploadDialogVisible: false,
      uploadFile: null,
      use_link: false,
      dy_link: '',
      title: '',
      uploadTag: '',
      classifies: [
        { name: '行业热点', color: '#f97316' },
        { name: '产品展示', color: '#3b82f6' },
        { name: '口播', color: '#22c55e' },
        { name: '企业故事', color: '#a855f7' },
        { name: '教程干货', color: '#f97316' },
        { name: '生活Vlog', color: '#22c55e' },
        { name: '搞笑段子', color: '#a855f7' },
        { name: '特效转场', color: '#f97316' },
        { name: 'AIGC', color: '#22c55e' },
        { name: '活动宣传', color: '#a855f7' },
      ],
      classify: '行业热点',
      loading: false,
    }
  },
  mounted() {
    this.queryHots()
  },
  methods: {
    formattedDuration(duration) {
      const totalSeconds = parseInt(duration.toFixed(0));
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
      return `${minutes}:${formattedSeconds}`;
    },
    searchFilter() {
      let filteredItems = this.hots;

      if (this.searchText) {
        filteredItems = filteredItems.filter(item =>
            item.name.includes(this.searchText) ||
            item.tag.split(/[,，]/).includes(this.searchText)
        );
      }

      if (this.activeTag !== '全部推荐') {
        filteredItems = filteredItems.filter(item => item.category === this.activeTag);
      }

      this.filter_hots = filteredItems;
    },
    tagFilter(name) {
      this.activeTag = name
      this.searchFilter()
    },
    queryHots() {
      let params = {
        video_type: 'hot_video',
      }
      getAction("/figure/query_success",params).then((res) => {
        if (res.data.status === "success") {
          let data = res.data.data.filter(item => item.status === "success");
          this.hots = data.map(item => ({ ...item, isHover: false }))
          this.searchText = ''
          this.activeTag = '全部推荐'
          this.filter_hots = this.hots
        }
      }).catch((error) => {
        console.error("获取角色列表失败:", error);
      });
    },
    beforeUploadClose() {
      this.uploadFile = null
      this.title = ''
      this.tag = ''
      this.uploadDialogVisible = false
    },
    handleSubmit() {
      // if (!this.title) {
      //   this.$alert('请填写标题')
      //   return
      // }

      if (!this.use_link) {
        this.$refs.hotUpload.submit()
        return;
      }

      if (!this.dy_link) {
        this.$alert('请粘贴抖音视频分享链接')
        return;
      }

      this.$alert('接口未完善，待接入')
    },
    uploadSuccess(res, file) {
      if (res.status === "success") {
        this.$notify({
          title: "上传提示",
          message: `${file.name}爆款视频上传成功`,
          duration: 20000,
          type: "success",
        });
      } else {
        this.$notify({
          title: "上传提示",
          message: `${file.name}爆款视频上传失败，${res.message}`,
          duration: 0,
          type: "error",
        });
      }
      if (this.loading) {
        this.loading.close();
        this.loading = null;
      }
      this.queryHots()
    },
    uploadError() {
      if (this.loading) {
        this.loading.close();
        this.loading = null;
      }
    },
    beforeUpload() {
      this.uploadDialogVisible = false
      this.loading = this.$loading({
        lock: true,
        text: '爆款视频上传中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
    },
  }
}
</script>

<style scoped>
.hot {
  min-width: 1000px;
}

.box-card {
  height: calc(100vh - 180px);
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  background-color: #FFFFFF;
  padding: 20px;
}

.search-content {
  text-align: center;
  margin-bottom: 16px;
}

.search-input {
  width: 500px;
}

.search-content >>> .el-input__icon {
  line-height: 30px;
}

.search-content >>> .el-input__inner {
  height: 30px;
  line-height: 30px;
  border-radius: 15px;
  background-color: #F5F5F5;
  font-size: 12px;
}

.tags {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.tag {
  background-color: #F5F5F5;
  color: #525252;
  border-radius: 14px;
  border: 1px solid #F5F5F5;
  cursor: pointer;
  height: 28px;
  line-height: 28px;
  padding-left: 12px;
  padding-right: 12px;
}

.tag-active {
  background-color: #3b82f6 !important;
  color: #FFFFFF !important;
}

.hot-list {
  margin-top: 20px;
  max-height: calc(100% - 120px);
  padding: 10px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 20px;
}

.upload-card {
  width: calc(100% - 4px);
  height: calc(100% - 4px);
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #64748b;
  border: 2px dashed #d9d9d9;
  cursor: pointer;
  border-radius: 8px;
}

.video-card {
  aspect-ratio: 9 / 16;
  position: relative;
}

.video-card:hover {
  transform: scale(1.05);
}

.video-tag {
  position: absolute;
  top: 5px;
  left: 5px;
  z-index: 999;
  color: #FFFFFF;
  border: none;
  height: 20px;
  line-height: 20px;
  padding: 0 5px;
  font-size: 11px;
  border-radius: 2px;
}

.video-title {
  position: absolute;
  bottom: 4px;
  width: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
  padding: 10px;
  box-sizing: border-box;
  color: #FFFFFF;
  font-size: 12px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.video-title-hover {
  position: absolute;
  bottom: 4px;
  width: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
  padding: 2px 10px 10px 10px;
  box-sizing: border-box;
  color: #FFFFFF;
  font-size: 12px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.foot-btn {
  margin: 0 auto;
  width: 280px;
  border-radius: 8px;
}

.upload-dialog >>> .el-dialog {
  border-radius: 10px;
}

.upload-dialog >>> .el-dialog__title {
  font-weight: 700;
}

.upload-dialog >>> .el-dialog__close {
  color: #9ca3af;
  font-size: 24px;
}

.upload-dialog >>> .el-dialog__body {
  padding: 10px 20px !important;
}

.video-uploader >>> .el-upload {
  width: 100%;
}

.video-uploader >>> .el-upload-dragger {
  width: 100%;
  height: 145px;
}

.video-uploader >>> .el-icon-upload {
  margin: 30px 0 16px;
}

.video-uploader >>> .el-upload-list {
  max-height: 80px;
  overflow: auto;
}

.classifies {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>