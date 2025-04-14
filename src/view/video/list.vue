<template>
  <div class="video-list">
    <div class="list-content">
      <div v-for="item in videoTasks" :key="item.id" style="text-align: center">
        <div class="image-wrapper shining">
          <el-image
            style="width: 180px; height: 240px; border-radius: 12px;filter: blur(15px);opacity: 0.8"
            :src="require('/public/images/4.jpg')"
            fit="cover"
          ></el-image>
          <div class="shine-layer"></div>
          <div class="list-progress">
            <div>视频生成中</div>
            <div style="width: 10px;text-align: left;margin-left: 5px;font-size: 22px">{{ dot }}</div>
          </div>
        </div>
        <div style="display: flex;align-items: center;justify-content: center;margin-top: 5px">
          {{ item.name }}
        </div>
      </div>
      <div style="text-align: center;border-radius: 12px;padding: 5px 0;position: relative" v-for="item in videoList" :key="item.id"
           :class="{'activeClass': item.id === selected.id}" @contextmenu.stop="handleContextMenu(item, $event)" @click="preview(item)">
        <el-image style="width: 180px;height: 240px;border-radius: 12px" :src="item.picture" fit="cover"></el-image>
        <div style="margin-top: 5px;color: #1E1F20">{{ item.filename }}</div>
      </div>
      <div :style="menuStyle" v-if="rightMenuVisible">
        <div class="right-item" @click="deleteVideo">
          <i class="el-icon-delete-solid menu-icon"></i>
          <span style="margin-top: 2px">删除</span>
        </div>
        <div class="right-item" @click="downloadVideo">
          <i class="el-icon-download menu-icon"></i>
          <span style="margin-top: 2px">另存为</span>
        </div>
        <div class="right-item" @click="rename">
          <i class="el-icon-edit-outline menu-icon"></i>
          <span style="margin-top: 2px">重命名</span>
        </div>
      </div>
      <el-dialog :visible.sync="dialogVisible" :before-close="beforeClose">
        <div style="width: 100%; text-align: center; position: relative">
          <video style="width: 300px; border-radius: 20px" ref="video" :src="src"></video>
          <div style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">
            <i class="el-icon-play control-icon" @click="controlVideo" v-if="!isPlaying"></i>
          </div>
        </div>
      </el-dialog>
      <el-drawer title="重命名视频名称" :visible.sync="drawer" direction="rtl">
        <div style="width: 100%; text-align: center">
          <el-form ref="form" style="width: 70%; margin: 0 auto">
            <el-form-item label="新名称" prop="newName">
              <el-input v-model="newName" placeholder="请输入新名称"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSave">保存</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<script>
import {RightMenuMixin} from "@/mixins/RightMenuMixin";
import {mapGetters} from "vuex";
import {delAction, getAction, postAction} from "@/api/api";
import axios from "axios";

export default {
  mixins: [RightMenuMixin],
  data() {
    return {
      videoList: [],
      dotCount: 1,
      dotTimer: null,
      dot: '.',
      selected: {},
      drawer: false,
      newName: '',
      videoId: '',
      dialogVisible: false,
      src: "",
      isPlaying: false,
    }
  },
  computed: {
    ...mapGetters("task", ["allTasks"]), // 获取任务列表
    videoTasks() {
      return this.allTasks.filter((item) => item.type === "video");
    },
  },
  watch: {
    videoTasks: {
      handler() {
        this.queryVideos();
      },
      deep: true,
    },
  },
  mounted() {
    this.startDotAnimation();
    this.queryVideos();
  },
  methods: {
    startDotAnimation() {
      this.dotTimer = setInterval(() => {
        this.dotCount = this.dotCount % 3 + 1;
        this.dot = '.'.repeat(this.dotCount);
      }, 1000);
    },
    queryVideos() {
      getAction('/video_record/query').then(res => {
        if (res.data.status === 'success') {
          this.videoList = res.data.data;
        }else {
          this.$message.error(res.data.message);
        }
      }).catch(err => {
        console.log(err)
      })
    },
    deleteVideo() {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delAction(`/video_record/delete/${this.selectedItem.id}`).then(res => {
          if (res.data.status ==='success') {
            this.$message.success('删除成功');
            this.queryVideos();
          } else {
            this.$message.error(res.data.message);
          }
        })
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    async downloadVideo() {
      let self = this
      window.electronAPI.selectFolder().then((path) => {
        if (path) {
          window.electronAPI.downloadFile(this.selectedItem.video_path, path)
          self.$message.success(`视频已另存为${path}`)
        }
      })
    },
    rename() {
      this.videoId = this.selectedItem.id;
      this.newName = "";
      this.drawer = true;
    },
    onSave() {
      let params = {
        id: this.videoId,
        name: this.newName,
      };
      postAction("/video_record/update_name", params).then((res) => {
        if (res.data.status === "success") {
          this.$message.success("重命名成功");
          this.queryVideos();
        } else {
          this.$message.error(res.data.message);
        }
        this.drawer = false;
      })
      .catch((err) => {
        this.$message.error("重命名失败，请稍后重试！");
      });
    },
    preview(item) {
      console.log(item.video_path)
      this.src = item.video_path;
      this.dialogVisible = true;
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
  },
  beforeDestroy() {
    clearInterval(this.dotTimer);
  }
}

</script>

<style scoped>
.video-list {
  width: 100%;
  height: 100%;
  min-height: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.list-content {
  width: 90%;
  height: calc(100% - 200px);
  padding: 40px;
  box-sizing: border-box;
  background-color: #f5f5f5;
  border-radius: 20px;
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  grid-auto-rows: 280px;
  overflow: auto;
}

.list-progress {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.activeClass {
  border: 1px solid #6286ED;
}

.video-list >>> .el-dialog {
  background-color: #79777700 !important;
  box-shadow: none !important;
  width: 500px;
}

.video-list >>> .el-dialog__headerbtn .el-dialog__close {
  font-size: 24px;
  color: #9a9a9a;
}
</style>