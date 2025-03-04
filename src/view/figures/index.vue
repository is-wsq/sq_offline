<template>
  <div class="figures">
    <div class="figures-content">
      <div class="figures-list">
        <div v-for="(item,index) in figures" :key="index" @contextmenu.stop="handleContextMenu(item,$event)">
          <el-image class="figures-img" :src="item.path" fit="cover"></el-image>
          <div style="width: 100%;text-align: center">{{ item.name }}</div>
        </div>
      </div>
      <div style="text-align: center;margin-top: 10px">
        <el-upload
            class="avatar-uploader"
            action="https://u480621-aa32-189366b9.cqa1.seetacloud.com/figure/train"
            :show-file-list="false"
            accept=".mp4, .mov"
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
        <video style="width: 300px;border-radius: 20px" ref="video" :src="src"></video>
        <div style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">
          <i class="el-icon-play control-icon" @click="controlVideo" v-if="!isPlaying"></i>
<!--          <i class="el-icon-pause control-icon" @click="controlVideo" v-else></i>-->
        </div>
      </div>
    </el-dialog>
    <el-drawer
      title="重命名形象名称"
      :visible.sync="drawer"
      direction="rtl"
    >
      <div style="width: 100%;text-align: center">
        <el-form ref="form" style="width: 70%;margin: 0 auto">
          <el-form-item label="新名称" prop="newName">
            <el-input v-model="newName" placeholder="请输入新名称"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSave">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
    <div class="figures-footer">
      请上传格式为mp4\mov的视频进行形象克隆，建议视频时长为5分钟。请在无遮挡场景进行录制，确保面部清晰出镜，面部表情丰富，适当添加无指向性手部动作。
    </div>
  </div>
</template>

<script>
import {RightMenuMixin} from "@/mixins/RightMenuMixin";
import {delAction, getAction, postAction} from "@/api/api";

export default {
  name: 'figures',
  mixins: [RightMenuMixin],
  data() {
    return {
      figures: [],
      dialogVisible: false,
      drawer: false,
      src: '',
      isPlaying: false,
      figureId: null,
      newName: '',
    }
  },
  mounted() {
    this.queryFigures();
  },
  methods: {
    queryFigures() {
      getAction('/figure/queryAvailable').then(res => {
        if (res.data.status === 'success') {
          this.figures = res.data.data;
        }
      })
    },
    preview() {
      this.src = this.selectedItem.filepath;
      this.dialogVisible = true;
    },
    rename() {
      this.figureId = this.selectedItem.id;
      this.newName = ''
      this.drawer = true;
    },
    onSave() {
      let params = {
        figureId: this.figureId,
        name: this.newName
      }
      postAction('/figure/update_name', params).then(res => {
        if (res.data.status === 'success') {
          this.$message.success('重命名成功');
          this.queryFigures();
        } else {
          this.$message.error(res.data.message);
        }
        this.drawer = false;
      })
    },
    deleteItem() {
      delAction('/figure/delete', {figureId: this.selectedItem.id}).then(res => {
        if (res.data.status === 'success') {
          this.$message.success('删除成功');
          this.queryFigures();
        } else {
          this.$message.error(res.data.message);
        }
      })
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
    uploadSuccess() {
      this.queryFigures();
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

.figures >>> .el-dialog {
  background-color: #79777700 !important;
  box-shadow: none !important;
  width: 500px;
}

.figures >>> .el-dialog__headerbtn .el-dialog__close {
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
  grid-template-rows: 180px;
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

.control-icon {
  font-size: 30px;
  color: #fff;
  cursor: pointer;
  filter: drop-shadow(0px 0px 10px #292929);
}

.figures-footer {
  width: 80%;
  height: 80px;
  margin-top: 20px;
  color: #6D7177;
}
</style>

