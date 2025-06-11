<template>
  <div class="hot">
    <el-button type="text" class="back-btn">
      <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
    </el-button>
    <div class="box-card">
      <div class="search-content">
        <el-input prefix-icon="el-icon-search" placeholder="一句话搜模板，例如：科技感转场"
                  class="search-input" v-model="searchText"></el-input>
      </div>
      <div class="tags">
        <el-tag v-for="(tag, index) in tags" :key="index" size="small" class="tag"
                :class="{ 'tag-active': tag === activeTag }" @click="activeTag = tag">
          {{ tag }}
        </el-tag>
      </div>
      <div class="hot-list">
        <div style="aspect-ratio: 9 / 16;">
          <div class="upload-card" @click="uploadDialogVisible = true">
            <i class="el-icon-shangchuan" style="font-size: 28px"></i>
            <span style="font-size: 12px;margin-top: 8px">上传爆款视频</span>
          </div>
        </div>
        <div v-for="(video, index) in videos" :key="index" class="video-card" @mouseleave="video.isHover = false"
             @mouseenter="video.isHover = true">
          <el-image style="width: 100%; height: 100%;" :src="`https://picsum.photos/seed/video${video.id}/300/200`" fit="cover">
          </el-image>
          <el-tag size="mini" v-if="video.tag" class="video-tag">{{ video.tag }}</el-tag>
          <div class="video-title" v-if="!video.isHover">{{ video.title }}</div>
          <div class="video-title-hover" v-if="video.isHover">
            <div style="margin-bottom: 8px">{{ video.title }}</div>
            <div style="display: flex;justify-content: center;align-items: center">
              <i class="el-icon-video-play" style="font-size: 14px"></i>
              <div style="margin-left: 8px;flex: 1">{{ video.duration }}</div>
              <i class="el-icon-film" style="font-size: 14px"></i>
              <div style="margin-left: 8px;">{{ video.storyboard }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div style="text-align: center; margin-top: 12px;">
      <el-button type="primary" class="foot-btn">一键复刻</el-button>
    </div>
    <el-dialog class="upload-dialog" :visible.sync="uploadDialogVisible" width="800px" title="上传爆款视频" :before-close="beforeUploadClose">
      <el-upload
          drag
          ref="upload"
          class="video-uploader"
          style="width: 100%"
          action="http://127.0.0.1:6006/figure/clone_only"
          accept=".mp4, .mov"
          :auto-upload="false">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <div style="margin: 20px 0 10px 0;font-size: 15px;font-weight: bold">标题</div>
      <el-input v-model="title" placeholder="请输入视频标题"></el-input>
      <div style="margin: 20px 0 10px 0;font-size: 15px;font-weight: bold">分类</div>
      <div class="classifies">
        <el-tag v-for="(tag, index) in classifies" :key="index" size="small" class="tag"
                :class="{ 'tag-active': tag === classify }" @click="classify = tag">
          {{ tag }}
        </el-tag>
      </div>
      <div style="margin: 20px 0 10px 0;font-size: 15px;font-weight: bold">标签</div>
      <el-input v-model="tag" placeholder="多标签使用逗号(，)分隔，用于匹配搜索"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="uploadDialogVisible = false" size="small">取消</el-button>
        <el-button type="primary" @click="handleSubmit" size="small">确认上传</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchText: '',
      tags: ['全部推荐','行业热点','产品展示','口播','企业故事'],
      activeTag: '全部推荐',
      videos: [
        {id: 1, title: '企业宣传片模板', duration: '00:15', tag: '产品展示', storyboard: '12分镜', isHover: false},
        {id: 2, title: '新品发布口播', duration: '00:08', tag: '口播', storyboard: '5分镜', isHover: false},
        {id: 3, title: '科技前沿动态', duration: '00:21', tag: '行业热点', storyboard: '18分镜', isHover: false},
        {id: 4, title: '品牌发展历程', duration: '00:30', tag: '企业故事', storyboard: '25分镜', isHover: false},
        {id: 5, title: '我们招人啦', duration: '00:12', tag: '口播', storyboard: '8分镜', isHover: false},
        {id: 6, title: '城市美食探店', duration: '00:18', tag: '行业热点', storyboard: '15分镜', isHover: false},
        {id: 7, title: '3D产品展示', duration: '00:15', tag: '产品展示', storyboard: '12分镜', isHover: false}
      ],
      uploadDialogVisible: false,
      uploadFile: null,
      title: '',
      tag: '',
      classifies: ['行业热点','产品展示','口播','企业故事','教程干货','生活Vlog','搞笑段子','特效转场','AIGC','活动宣传'],
      classify: '行业热点'
    }
  },
  methods: {
    beforeUploadClose() {
      this.uploadFile = null
      this.title = ''
      this.tag = ''
      this.uploadDialogVisible = false
    },
    handleSubmit() {
      this.uploadDialogVisible = false
    },
  }
}
</script>

<style scoped>
.back-btn {
  padding: 7px;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  color: #a2a8b3;
  background-color: #FFFFFF;
  margin: 0 0 8px;
}

.back-btn:hover {
  color: #1F2937 !important;
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
  background-color: #3b82f6;
  color: #FFFFFF;
  border: 1px solid #3b82f6;
  cursor: pointer;
  height: 20px;
  line-height: 20px;
  padding: 0 5px;
}

.video-title {
  position: absolute;
  bottom: 4px;
  width: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 1));
  padding: 10px;
  box-sizing: border-box;
  color: #FFFFFF;
  font-size: 12px;
}

.video-title-hover {
  position: absolute;
  bottom: 4px;
  width: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 1));
  padding: 2px 10px 10px 10px;
  box-sizing: border-box;
  color: #FFFFFF;
  font-size: 12px;
}

.foot-btn {
  margin: 0 auto;
  width: 280px;
  border-radius: 8px;
}

.upload-dialog >>> .el-dialog__body {
  padding-top: 10px !important;
}

.video-uploader >>> .el-upload {
  width: 100%;
}

.video-uploader >>> .el-upload-dragger {
  width: 100%;
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