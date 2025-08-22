<template>
  <div class="hot">
    <el-button type="text" class="back-btn" @click="back">
      <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
    </el-button>
    <div class="box-card">
      <div class="search-content">
        <el-input prefix-icon="el-icon-search" placeholder="一句话搜模板，例如：科技感转场" clearable
                  class="search-input" v-model="searchText"></el-input>
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
        <div v-for="item in processFile" :key="item.id" class="video-card">
          <div class="figure-image-wrapper shining" style="width: 100% !important; height: 100% !important">
            <el-image style="width: 100%; height: 100%;border-radius: 8px;filter: blur(15px);opacity: 0.8"
                      :src="require('/public/images/4.jpg')" fit="cover">
            </el-image>
            <div class="shine-layer"></div>
          </div>
          <div class="file-progress">
            <div>视频上传中</div>
            <div style="width: 10px;text-align: left;margin-left: 5px;font-size: 22px">{{ dot }}</div>
          </div>
          <div class="video-title">{{ item.name }}</div>
        </div>
        <div v-for="(video, index) in filter_hots" :key="index" @click="selectVideo(video)"
             :class="{ 'video-active': select_hots.id === video.id }" class="video-card"
             @contextmenu.stop="handleRightClick(video, $event)"
             @mouseleave="video.isHover = false" @mouseenter="video.isHover = true">
          <el-tag size="mini" v-if="video.category" class="video-tag"
                  :style="{ backgroundColor: classifies.find(item => item.name === video.category).color }">
            {{ video.category }}
          </el-tag>
          <div class="selection-tick" v-if="select_hots.id === video.id">
            <i class="el-icon-check" style="padding: 2px"></i>
          </div>
          <template v-if="!video.isHover">
            <el-image class="hot-img" :src="video.picture" fit="cover"></el-image>
            <div class="video-title">{{ video.name }}</div>
          </template>
          <template v-else>
            <video class="hot-img" style="object-fit: cover;" :src="video.filepath" loop muted autoplay></video>
            <div class="video-title-hover">
              <div style="margin-bottom: 8px">{{ video.name }}</div>
              <div style="display: flex;justify-content: center;align-items: center">
                <i class="el-icon-video-play" style="font-size: 14px"></i>
                <div style="margin-left: 8px;flex: 1">{{ formattedDuration(video.duration) }}</div>
                <i class="el-icon-film" style="font-size: 14px"></i>
                <div style="margin-left: 8px;">{{ video.segments.length + '分镜' }}</div>
              </div>
            </div>
          </template>
        </div>
        <div :style="menuStyle" v-if="rightMenuVisible" style="padding: 8px 12px">
          <div class="material-function" @click="preview">
            <i class="el-icon-view menu-icon"></i>
            播放
          </div>
          <div class="material-function" @click="rename">
            <i class="el-icon-edit-outline menu-icon"></i>
            重命名
          </div>
          <div class="material-function" @click="removeHot">
            <i class="el-icon-delete-solid menu-icon"></i>
            删除
          </div>
          <div class="material-function" @click="showDetail">
            <i class="el-icon-document menu-icon"></i>
            分镜详情
          </div>
        </div>
      </div>
    </div>
    <div style="text-align: center; margin-top: 12px;">
      <el-button type="primary" class="foot-btn" @click="duplicate">一键复刻</el-button>
    </div>
    <el-dialog class="upload-dialog" :visible.sync="uploadDialogVisible" width="600px"
               title="上传爆款视频" :before-close="beforeUploadClose">
      <el-upload
          v-if="!use_link"
          drag
          ref="hotUpload"
          class="video-uploader"
          style="width: 100%"
          action="http://127.0.0.1:6006/figure/add_hot_video"
          :data="{ title: title, withAsr: withAsr, category: classify, tag: uploadTag }"
          :on-success="uploadSuccess"
          :on-error="uploadError"
          :before-upload="beforeUpload"
          accept=".mp4, .mov"
          :auto-upload="false"
          :limit="6"
          multiple>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>

      <div class="flex-center" style="margin: 10px 0 5px 0">
        <el-checkbox v-model="use_link"></el-checkbox>
        <div style="font-size: 15px;font-weight: bold;flex: 1">使用链接上传</div>
      </div>
      <el-input prefix-icon="el-icon-link" v-model="dy_link" placeholder="粘贴抖音视频分享链接上传"
                :disabled="!use_link"></el-input>
      <div style="line-height: 50px">
        <el-radio-group v-model="withAsr">
          <el-radio :label="true">有文案复刻</el-radio>
          <el-radio :label="false">无文案复刻</el-radio>
        </el-radio-group>
      </div>
      <div style="margin-bottom: 5px;font-size: 15px;font-weight: bold">分类</div>
      <div class="classifies">
        <el-tag v-for="(tag, index) in classifies" :key="index" size="small" class="tag"
                :class="{ 'tag-active': tag.name === classify }" @click="classify = tag.name">
          {{ tag.name }}
        </el-tag>
      </div>
      <div style="margin: 10px 0 5px 0;font-size: 15px;font-weight: bold">标签</div>
      <el-input v-model="uploadTag" placeholder="多标签使用逗号(，)分隔，用于匹配搜索"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="uploadDialogVisible = false" size="small">取消</el-button>
        <el-button type="primary" @click="handleSubmit" size="small">确认上传</el-button>
      </span>
    </el-dialog>
    <el-dialog class="preview-dialog" :visible.sync="previewDialogVisible" :before-close="beforePreviewClose"
               width="390px">
      <div style="width: 100%;text-align: center;position: relative">
        <video style="border-radius: 10px;width: calc(100% - 40px);object-fit: cover"
               ref="video" :src="preview_src" @ended="isPlaying = false">
        </video>
        <div style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">
          <i class="el-icon-play control-icon" @click="controlVideo" v-if="!isPlaying"></i>
        </div>
      </div>
    </el-dialog>
    <el-dialog class="upload-dialog" :visible.sync="renameDialogVisible" width="600px" title="重命名视频名称">
      <div style="margin: 10px 0 5px 0;font-size: 15px;font-weight: bold">原名称</div>
      <el-input v-model="form.original" readonly></el-input>
      <div style="margin: 10px 0 5px 0;font-size: 15px;font-weight: bold">新名称</div>
      <el-input v-model="form.name"  placeholder="请输入新的视频名称"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="renameDialogVisible = false" size="small">取消</el-button>
        <el-button type="primary" @click="sureRename" size="small">确认</el-button>
      </span>
    </el-dialog>
    <el-dialog class="detail-dialog" :visible.sync="detailDialogVisible" width="800px" title="爆款视频分镜详情">
      <div class="detail-list">
        <div class="detail-item" v-for="(segment, index) in segments" :key="index">
          <div v-html="marked(segment.description)" class="markdown-content"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {delAction, getAction, postAction} from "@/api/api";
import {v4 as uuidv4} from 'uuid';
import {marked} from "marked";
import {mapGetters} from "vuex";

export default {
  data() {
    return {
      searchText: '',
      activeTag: '全部推荐',
      select_hots: {},
      uploadDialogVisible: false,
      uploadFile: null,
      use_link: false,
      dy_link: '',
      withAsr: true,
      title: '',
      uploadTag: '',
      classifies: [
        {name: '行业热点', color: '#f97316'},
        {name: '产品展示', color: '#3b82f6'},
        {name: '口播', color: '#22c55e'},
        {name: '企业故事', color: '#a855f7'},
        {name: '教程干货', color: '#f97316'},
        {name: '生活Vlog', color: '#22c55e'},
        {name: '搞笑段子', color: '#a855f7'},
        {name: '特效转场', color: '#f97316'},
        {name: 'AIGC', color: '#22c55e'},
        {name: '活动宣传', color: '#a855f7'},
      ],
      classify: '行业热点',
      loading: false,
      dotCount: 1,
      dotTimer: null,
      dot: '.',
      menuStyle: {
        position: 'fixed',
        top: '0',
        left: '0',
        border: '1px solid #eee',
        'border-radius': '6px',
        'background-color': '#fff',
        'z-index': 9999
      },
      rightMenuVisible: false,
      rightItem: {},
      previewDialogVisible: false,
      preview_src: '',
      isPlaying: false,
      renameDialogVisible: false,
      form: {
        original: '',
        name: ''
      },
      renameId: '',
      detailDialogVisible: false,
      segments: []
    }
  },
  computed: {
    ...mapGetters("task", ["figureTasks"]),
    processFile() {
      return this.figureTasks.filter((item) => item.status === 'pending' && item.video_type === 'hot_video');
    },
    hots() {
      let data = this.figureTasks.filter((item) => item.status === 'success' && item.video_type === 'hot_video');
      return data.map(item => ({...item, isHover: false}))
    },
    filter_hots() {
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

      return filteredItems
    }
  },
  mounted() {
    this.initData()
    this.startDotAnimation();
    this.$store.dispatch("task/pollFigureTasks");
  },
  beforeDestroy() {
    clearInterval(this.dotTimer);
  },
  methods: {
    marked,
    startDotAnimation() {
      this.dotTimer = setInterval(() => {
        this.dotCount = this.dotCount % 3 + 1;
        this.dot = '.'.repeat(this.dotCount);
      }, 1000);
    },
    formattedDuration(duration) {
      const totalSeconds = parseInt(duration.toFixed(0));
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
      return `${minutes}:${formattedSeconds}`;
    },
    tagFilter(name) {
      this.activeTag = name
    },
    selectVideo(item) {
      this.select_hots = item
      sessionStorage.setItem('select_hots', JSON.stringify(this.select_hots))
    },
    handleRightClick(item, event) {
      event.preventDefault();
      this.rightItem = item
      this.rightMenuVisible = true;
      this.menuStyle.left = event.clientX + 'px'
      this.menuStyle.top = event.clientY + 'px'
      document.body.addEventListener("click", this.bodyClick);
    },
    bodyClick() {
      this.rightMenuVisible = false;
      this.rightItem = {}
      document.body.removeEventListener("click", this.bodyClick);
    },
    preview() {
      this.preview_src = this.rightItem.filepath
      this.previewDialogVisible = true
    },
    controlVideo() {
      const video = this.$refs.video;
      this.isPlaying ? video.pause() : video.play();
      this.isPlaying = !this.isPlaying;
    },
    beforePreviewClose() {
      this.isPlaying = false;
      if (this.$refs.video) {
        this.$refs.video.pause()
        this.preview_src = ''
      }
      this.previewDialogVisible = false;
    },
    rename() {
      this.form.original = this.rightItem.name
      this.form.name = ''
      this.renameId = this.rightItem.id
      this.renameDialogVisible = true
    },
    sureRename() {
      let params = {
        figure_id: this.renameId,
        name: this.form.name  ,
      };
      postAction("/figure/update_name", params).then((res) => {
        if (res.data.status === "success") {
          this.$message.success("重命名成功");
          this.$store.dispatch("task/pollFigureTasks");
        } else {
          this.$alert(res.data.message,'重命名失败')
        }
        this.renameDialogVisible = false;
      }).catch((err) => {
        this.$alert(err,'重命名错误')
      });
    },
    removeHot() {
      this.deleteId = this.rightItem.id
      this.$confirm('此操作将删除该爆款视频, 是否继续?', '删除爆款视频', {
        type: 'warning'
      }).then(() => {
        delAction("/figure/delete", {ids: this.deleteId}).then((res) => {
          if (res.data.status === "success") {
            this.$message.success("删除成功");
            this.$store.dispatch("task/pollFigureTasks");
          } else {
            this.$alert(res.data.message, "删除失败")
          }
        }).catch((err) => {
          this.$alert(err, "删除错误")
        });
      }).catch(() => {
        this.$message({type: 'info', message: '已取消删除'});
      });
    },
    showDetail() {
      this.segments = this.rightItem.segments
      this.detailDialogVisible = true
    },
    initData() {
      this.select_hots = JSON.parse(sessionStorage.getItem('select_hots')) || {}
    },
    beforeUploadClose() {
      this.uploadFile = null
      this.title = ''
      this.withAsr = true
      this.tag = ''
      this.uploadDialogVisible = false
    },
    handleSubmit() {
      if (!this.use_link) {
        let files = this.$refs.hotUpload.uploadFiles || []
        if (files.length === 0) {
          this.$alert('请至少选择一个爆款视频文件上传。','上传提示')
          return;
        }
        this.$refs.hotUpload.submit()
        return;
      }

      if (!this.dy_link) {
        this.$alert('请在输入框内粘贴抖音视频链接。','上传提示')
        return;
      }
      this.uploadDialogVisible = false
      let params = {
        url: this.dy_link,
        tag: this.uploadTag,
        withAsr: this.withAsr,
        category: this.classify,
      }
      postAction('/figure/add_hot_video_by_link', params, 600000).then(res => {
        if (res.data.status === 'success') {
          this.$notify({
            title: "上传提示",
            message: `已创建爆款视频上传任务`,
            duration: 5000,
            type: "success",
          });
        } else {
          this.$notify({
            title: "上传提示",
            message: `创建爆款视频上传任务失败，${res.data.message}`,
            duration: 0,
            type: "error",
          });
        }
        this.$store.dispatch("task/pollFigureTasks");
      })
    },
    uploadSuccess(res, file) {
      if (res.status === "success") {
        this.$notify({
          title: "上传提示",
          message: `创建${file.name}爆款视频上传任务成功`,
          duration: 5000,
          type: "success",
        });
      } else {
        this.$notify({
          title: "上传提示",
          message: `创建${file.name}爆款视频上传任务失败，${res.message}`,
          duration: 0,
          type: "error",
        });
      }
      this.$store.dispatch("task/pollFigureTasks");
    },
    uploadError() {
      if (this.loading) {
        this.loading.close();
        this.loading = null;
      }
    },
    beforeUpload(file) {
      this.uploadDialogVisible = false
    },
    duplicate() {
      if (!this.select_hots.id) {
        this.$alert('请先选择一个要复刻的爆款视频','提示')
      }
      sessionStorage.setItem('video_path', '/material')
      this.$router.push({path: '/material'})
    },
    back() {
      sessionStorage.setItem('video_path', '/video')
      this.$router.push({path: '/video'})
    }
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
  padding: 15px;
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
  border-radius: 8px;
  display: flex;
}

.video-card:hover {
  background-color: #f5f5f5;
  transform: scale(1.03);
}

.video-active {
  border: 2px solid #3b82f6;
  box-sizing: border-box;
}

.hot-img {
  width: 100%;
  aspect-ratio: 9 / 16;
  border-radius: 6px;
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

.file-progress {
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 14px;
  font-family: "Helvetica Neue", Arial, sans-serif;
  font-weight: 500;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.selection-tick {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #3b82f6;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  color: white;
  z-index: 5;
}

.delete-hot-btn {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 20px;
  height: 20px;
  background-color: #ef4444;
  color: white;
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.8);
  transition: all 0.2s ease;
  z-index: 5;
}

.video-title, .video-title-hover {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
  padding: 10px;
  box-sizing: border-box;
  color: #FFFFFF;
  font-size: 12px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  color: #d3d2d2;
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

.preview-dialog >>> .el-dialog {
  background-color: #79777700 !important;
  box-shadow: none !important;
  margin: 0 auto;
  aspect-ratio: 9 / 16;
}

.preview-dialog >>> .el-dialog__body {
  padding: 10px 35px;
}

.preview-dialog >>> .el-dialog__headerbtn .el-dialog__close {
  font-size: 24px;
  color: #9a9a9a;
}

.control-icon {
  font-size: 30px;
  color: #fff;
  cursor: pointer;
  filter: drop-shadow(0px 0px 10px #292929);
}

.detail-dialog >>> .el-dialog {
  border-radius: 10px;
}

.detail-dialog >>> .el-dialog__title {
  font-weight: 700;
}

.detail-dialog >>> .el-dialog__close {
  color: #d3d2d2;
  font-size: 24px;
}

.detail-dialog >>> .el-dialog__body {
  padding: 0 !important;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: calc(70vh - 80px);
  overflow-y: auto;
  padding: 10px 20px;
}

.detail-list::-webkit-scrollbar {
  width: 5px !important;
}

.detail-item {
  background-color: #f5f5f5;
  padding: 0 10px;
  border-radius: 8px;
}
</style>