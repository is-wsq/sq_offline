<template>
  <div class="figures">
    <div class="figures-content">
      <div class="figures-list">
        <div v-for="(item,index) in figures" :key="index" @contextmenu.stop="handleContextMenu(item,$event)">
          <el-image class="figures-img" :src="item.url" fit="cover"></el-image>
        </div>
      </div>
      <div style="text-align: center;margin-top: 10px">
        <el-upload
            class="avatar-uploader"
            action=""
            :show-file-list="false"
            accept=".mp4, .avi, .mov"
            :data="extraData"
            :on-success="uploadSuccess"
            :before-upload="beforeUpload">
          <el-button class="figures-btn">添加形象</el-button>
        </el-upload>
      </div>
      <div :style="menuStyle" v-if="rightMenuVisible">
        <div class="right-item" @click="preview">
          <i class="el-icon-view menu-icon"></i>
          <span style="margin-top: 2px">预览</span>
        </div>
        <div class="right-item" @click="rename">
          <i class="el-icon-edit-outline menu-icon"></i>
          <span style="margin-top: 2px">重命名</span>
        </div>
        <div class="right-item" @click="deleteItem">
          <i class="el-icon-delete-solid menu-icon"></i>
          <span style="margin-top: 2px">删除</span>
        </div>
      </div>
    </div>
    <el-dialog
        :visible.sync="dialogVisible"
        :before-close="beforeClose">
      <div style="width: 100%;text-align: center;position: relative;">
        <video style="width: 300px;" ref="video" :src="src" @click="controlVideo"></video>
      </div>
    </el-dialog>
    <div class="figures-footer">
      请上传格式为mp4\xxx\xxx的视频进行形象克隆，建议视频时长为5分钟。请在无遮挡场景进行录制，确保面部清晰出镜，面部表情丰富，适当添加无指向性手部动作。
    </div>
  </div>
</template>

<script>
import {RightMenuMixin} from "@/mixins/RightMenuMixin";

export default {
  name: 'figures',
  mixins: [RightMenuMixin],
  data() {
    return {
      figures: [
        {id: 1, name: '形象1', url: '/images/1.jpg', src: 'https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/2minute-demo.mp4'},
        {id: 2, name: '形象2', url: '/images/4.jpg', src: 'https://www.w3schools.com/html/mov_bbb.mp4'},
        {id: 3, name: '形象3', url: '/images/7.jpg', src: 'https://www.html5rocks.com/en/tutorials/video/basics/devstories.mp4'},
        {id: 4, name: '形象4', url: '/images/11.jpg', src: 'https://www.quirksmode.org/html5/videos/big_buck_bunny.mp4'},
        {id: 5, name: '形象5', url: '/images/12.jpg', src: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4'},
        {id: 6, name: '形象6', url: '/images/13.jpg', src: 'https://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_1mb.mp4'},
        {id: 7, name: '形象7', url: '/images/16.jpg', src: 'https://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_10mb.mp4'},
        {id: 8, name: '形象8', url: '/images/20.jpg', src: 'https://www.sample-videos.com/video/mp4/1080/big_buck_bunny_1080p_20mb.mp4'},
      ],
      dialogVisible: false,
      src: '',
      isPlaying: false,
      extraData: {}
    }
  },
  methods: {
    preview() {
      this.src = this.selectedItem.src;
      this.dialogVisible = true;
    },
    rename() {
      console.log(this.selectedItem)
    },
    deleteItem() {
      console.log(this.selectedItem)
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
    beforeClose() {
      this.isPlaying = false;
      const video = this.$refs.video;
      video.pause();
      this.dialogVisible = false;
    },
    beforeUpload() {
      this.loading = this.$loading({
        lock: true,
        text: '视频上传中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
    },
    uploadSuccess(response) {
      if(response.status ==='success') {

      }else {
        this.$message.error(response.message);
      }
      this.loading.close();
      this.loading = null;
    }
  }
}
</script>

<style scoped>
.figures {
  width: 100%;
  height: 100%;
  min-height: 700px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.figures >>> .el-dialog{
  background-color: #79777700 !important;
  box-shadow: none !important;
  width: 500px;
}

.figures >>> .el-dialog__headerbtn .el-dialog__close{
  font-size: 24px;
  color: #9A9A9A;
}

.figures-content {
  width: calc(90% + 80px);
  height: calc(100% - 180px);
  padding: 40px;
  margin-top: 80px;
  box-sizing: border-box;
  background-color: #f5f5f5;
  border-radius: 20px;
}

.figures-list {
  height: calc(100% - 50px);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 50px;
  justify-items: center;
  overflow: auto;
}

.figures-img {
  width: 150px;
  height: 150px;
  border-radius: 20px;
}

.figures-btn {
  background-color: #6286ED;
  color: #fff;
}

.figures-footer {
  width: 80%;
  height: 80px;
  margin-top: 20px;
  color: #6D7177;
}
</style>

