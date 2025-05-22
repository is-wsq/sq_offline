<template>
  <div class="figures">
    <div class="figures-content">
      <div class="figure-item">
        <div style="margin-bottom: 10px">素材</div>
        <div class="figures-list">
          <div v-for="item in processMaterials" :key="item.id">
            <div class="image-wrapper shining">
              <el-image
                  style="width: 120px; height: 158px; border-radius: 8px;filter: blur(15px);opacity: 0.8"
                  :src="require('/public/images/4.jpg')"
                  fit="cover"
              ></el-image>
              <div class="shine-layer"></div>
              <div class="figure-progress">
                <div>素材上传中</div>
                <div style="width: 10px;text-align: left;margin-left: 5px;font-size: 22px">{{ dot }}</div>
              </div>
            </div>
            <div class="figure-name" :title="item.name">{{ item.name }}</div>
          </div>
          <div v-for="(item, index) in materials" :key="index" @contextmenu.stop="handleContextMenu(item, $event)"
               @click="selectItem(item)">
            <el-image class="figures-img" :src="item.picture" fit="cover"></el-image>
            <div class="figure-name" :title="item.name">{{ item.name }}</div>
          </div>
        </div>
      </div>
      <div class="figure-item">
        <div style="margin-bottom: 10px">形象</div>
        <div class="figures-list">
          <div v-for="item in processTasks" :key="item.id">
            <div class="image-wrapper shining">
              <el-image
                  style="width: 120px; height: 158px; border-radius: 8px;filter: blur(15px);opacity: 0.8"
                  :src="require('/public/images/4.jpg')"
                  fit="cover"
              ></el-image>
              <div class="shine-layer"></div>
              <div class="figure-progress">
                <div>形象克隆中</div>
                <div style="width: 10px;text-align: left;margin-left: 5px;font-size: 22px">{{ dot }}</div>
              </div>
            </div>
            <div class="figure-name" :title="item.name">{{ item.name }}</div>
          </div>
          <div v-for="(item, index) in figures" :key="index" @contextmenu.stop="handleContextMenu(item, $event)"
               @click="selectItem(item)">
            <el-image class="figures-img" :src="item.picture" fit="cover"></el-image>
            <div class="figure-name" :title="item.name">{{ item.name }}</div>
          </div>
        </div>
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
    <div style="display: flex;margin-top: 30px;gap: 100px">
      <div style="text-align: end;flex: 1">
        <el-upload
            class="avatar-uploader"
            action="http://192.168.0.116:6006/figure/clone_only"
            :show-file-list="false"
            accept=".mp4, .mov"
            multiple
            :on-success="uploadMaterialsSuccess"
            :on-error="uploadMaterialsError"
            :before-upload="beforeUpload"
            :file-list="MaterialList"
            :data="{ lip_sync: false }"
        >
          <el-button type="primary">上传素材</el-button>
        </el-upload>
      </div>
      <div style="flex: 1">
        <el-upload
            class="avatar-uploader"
            action="http://127.0.0.1:6006/figure/clone"
            :show-file-list="false"
            accept=".mp4, .mov"
            :on-success="uploadSuccess"
            :on-error="uploadError"
            :before-upload="beforeUpload"
            :data="{ lip_sync: true }"
        >
          <el-button type="primary">添加形象</el-button>
        </el-upload>
      </div>
    </div>
    <el-dialog :visible.sync="dialogVisible" :before-close="beforeClose" :width="aspectRatio > 1? '640px' : '390px'">
      <div style="width: 100%;text-align: center;position: relative">
        <video style="border-radius: 10px;width: calc(100% - 40px)" ref="video" :src="src" @ended="isPlaying = false"
               @loadedmetadata="checkAspectRatio"></video>
        <div style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">
          <i class="el-icon-play control-icon" @click="controlVideo" v-if="!isPlaying"></i>
        </div>
      </div>
    </el-dialog>
    <el-drawer title="重命名形象名称" :visible.sync="drawer" direction="rtl">
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
    <div class="figures-footer">
      上传的视频文件格式需为:mp4、mov、MP4、MOV格式；上传的视频文件的时长最少应不低于30秒，建议不超过90秒；上传的视频内容必须符合规范，包含单个人物形象，脸部无遮挡；容量小的原始视频（建议50-100M左右）有利于提高模型速度。
    </div>
  </div>
</template>

<script>
import {RightMenuMixin} from "@/mixins/RightMenuMixin";
import {delAction, getAction, postAction} from "@/api/api";
import {mapGetters} from "vuex";
import axios from "axios";

export default {
  name: "figures",
  mixins: [RightMenuMixin],
  data() {
    return {
      dialogVisible: false,
      drawer: false,
      src: "",
      aspectRatio: 0,
      isPlaying: false,
      figureId: null,
      newName: "",
      dotCount: 1,
      dotTimer: null,
      dot: '.',
      MaterialList: []
    };
  },
  computed: {
    ...mapGetters("task", ["figureTasks"]), // 获取任务列表
    processMaterials() {
      return this.figureTasks.filter((item) => item.status === "pending");
    },
    processTasks() {
      return this.figureTasks.filter((item) => item.status === "ready");
    },
    figures() {
      return this.figureTasks.filter((item) => item.status === "success" && item.lip_sync);
    },
    materials() {
      return this.figureTasks.filter((item) => item.status === "success" && !item.lip_sync);
    },
  },
  mounted() {
    this.startDotAnimation();
    this.$store.dispatch("task/pollFigureTasks");
  },
  beforeDestroy() {
    clearInterval(this.dotTimer);
  },
  methods: {
    startDotAnimation() {
      this.dotTimer = setInterval(() => {
        this.dotCount = this.dotCount % 3 + 1;
        this.dot = '.'.repeat(this.dotCount);
      }, 1000);
    },
    selectItem(item) {
      this.selectedItem = item;
      this.preview()
    },
    preview() {
      this.src = this.selectedItem.filepath;
      this.dialogVisible = true;
    },
    rename() {
      this.figureId = this.selectedItem.id;
      this.newName = "";
      this.drawer = true;
    },
    onSave() {
      let params = {
        figure_id: this.figureId,
        name: this.newName,
      };
      postAction("/figure/update_name", params).then((res) => {
        if (res.data.status === "success") {
          this.$message.success("重命名成功");
          this.$store.dispatch("task/pollFigureTasks");
        } else {
          this.$message.error(res.data.message);
        }
        this.drawer = false;
      }).catch((err) => {
        this.$message.error("重命名失败，请稍后重试！");
      });
    },
    deleteItem() {
      delAction("/figure/delete", {figure_id: this.selectedItem.id}).then((res) => {
        if (res.data.status === "success") {
          this.$message.success("删除成功");
          this.$store.dispatch("task/pollFigureTasks");
        } else {
          this.$message.error(res.data.message);
        }
      }).catch((err) => {
        this.$message.error("删除失败，请稍后重试！");
      });
    },
    checkAspectRatio() {
      const video = this.$refs.video;
      const width = video.videoWidth;
      const height = video.videoHeight;
      this.aspectRatio = width / height
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
    async beforeUpload(file) {
      return getAction('/verify/activation').then(res => {
        if (res.data.status === 'success') {
          return true;
        } else {
          this.$alert(res.data.message, "验证失败");
          return Promise.reject('验证失败，停止上传');
        }
      })
    },
    uploadMaterialsError(file) {
      let content = `创建${file.name}素材上传任务失败`;
      this.$alert(content, "任务创建提醒");
    },
    uploadMaterialsSuccess(res, file) {
      if (res.status === "success") {
        let content = `已创建${file.name}素材上传任务，素材上传成功后会自动更新素材列表`;
        this.$alert(content, "任务创建提醒");
        this.$store.dispatch("task/pollFigureTasks");
      } else {
        let content = `创建${file.name}素材上传任务失败，${res.data}`;
        this.$alert(content, "任务创建提醒");
      }
    },
    uploadError(file) {
      let content = `创建${file.name}形象克隆任务失败`;
      this.$alert(content, "任务创建提醒");
    },
    uploadSuccess(res, file) {
      if (res.status === "success") {
        let content = `已创建${file.name}形象克隆任务，形象克隆成功后会自动更新形象列表`;
        this.$alert(content, "任务创建提醒");
        this.$store.dispatch("task/pollFigureTasks");
      } else {
        let content = `创建${file.name}形象克隆任务失败，${res.data}`;
        this.$alert(content, "任务创建提醒");
      }
    },
  },
};
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

.figure-name {
  width: 120px;
  text-align: center;
  line-height: 23px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.figures >>> .el-dialog {
  background-color: #79777700 !important;
  box-shadow: none !important;
}

.figures >>> .el-dialog__headerbtn .el-dialog__close {
  font-size: 24px;
  color: #9a9a9a;
}

.figures-content {
  width: 100%;
  height: calc(100% - 160px);
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  gap: 20px;
}

.figure-item {
  flex: 1;
  height: 100%;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 10px;
  box-sizing: border-box;
}

.figures-list {
  height: calc(100% - 40px);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  grid-auto-rows: 190px;
  gap: 20px;
  justify-items: center;
  overflow: auto;
}

.figure-progress {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.figures-img {
  width: 120px;
  height: 160px;
  border-radius: 8px;
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
  color: #6d7177;
}
</style>
