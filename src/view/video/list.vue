<template>
  <div class="video-list">
    <div class="list-content">
      <div v-for="item in processList" :key="item.id" style="text-align: center">
        <div class="image-wrapper shining">
          <el-image style="width: 100%;height: 100%;border-radius: 8px;filter: blur(15px);opacity: 0.8"
                    :src="require('/public/images/4.jpg')" fit="contain"></el-image>
          <div class="video-item-info">
            <div :title="item.filename" class="video-name">{{ item.filename }}</div>
          </div>

          <div class="shine-layer"></div>
          <div class="list-progress">
            <div>视频生成中</div>
            <div style="width: 10px;text-align: left;margin-left: 5px;font-size: 22px">{{ dot }}</div>
          </div>
        </div>
      </div>
      <div class="video-list-item"
           v-for="item in videoList"
           :key="item.id"
           :class="{'activeClass': item.id === selected.id}"
           @contextmenu.stop="handleContextMenu(item, $event)"
           @click="preview(item)"
           @mouseleave="hover_id = null"
           @mouseenter="hover_id = item.id">
        <video class="video-item-file" :src="item.video_path" loop muted autoplay v-if="item.id === hover_id"></video>
        <el-image class="video-item-file" :src="item.picture" fit="cover" lazy v-else></el-image>
        <div class="video-item-info">
          <div :title="item.filename" class="video-name" v-if="!item.isEdit">{{ item.filename }}</div>
          <div v-else style="flex: 1" @click.stop="">
            <el-input :ref="'renameInput_' + item.id" style="width: 100%" v-model="newName" @change="onSave(item)"
                      @blur="onBlur(item)"></el-input>
          </div>
          <el-popover
              placement="left-start"
              popper-class="video-item-more-popover"
              v-model="popoverStates[item.id]"
              trigger="click">
            <div class="more-btn-item" @click="deleteVideo(item)">
              <i class="el-icon-delete-solid menu-icon"></i>
              <span style="margin-top: 2px">删除</span>
            </div>
            <div class="more-btn-item" @click="downloadVideo(item)">
              <i class="el-icon-download menu-icon"></i>
              <span style="margin-top: 2px">另存为</span>
            </div>
            <div class="more-btn-item" @click="rename(item)">
              <i class="el-icon-edit-outline menu-icon"></i>
              <span style="margin-top: 2px">重命名</span>
            </div>
            <el-button slot="reference" type="text" class="more-btn" icon="el-icon-gengduo"
                       @click.stop="clearOther(item)"></el-button>
          </el-popover>
        </div>
      </div>
      <el-dialog :visible.sync="dialogVisible" :before-close="beforeClose" :width="aspectRatio > 1? '640px' : '390px'">
        <div style="width: 100%;text-align: center;position: relative">
          <video style="border-radius: 10px;width: calc(100% - 40px)"
                 ref="video"
                 :src="src"
                 @ended="isPlaying = false"
                 @loadedmetadata="checkAspectRatio">
          </video>
          <div style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">
            <i class="el-icon-play control-icon" @click="controlVideo" v-if="!isPlaying"></i>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {RightMenuMixin} from "@/mixins/RightMenuMixin";
import {mapGetters} from "vuex";
import {delAction, getAction, postAction} from "@/api/api";

export default {
  mixins: [RightMenuMixin],
  data() {
    return {
      keyword: '',
      filterProcess: [],
      dotCount: 1,
      dotTimer: null,
      dot: '.',
      selected: {},
      newName: '',
      videoId: '',
      dialogVisible: false,
      src: "",
      aspectRatio: 0,
      isPlaying: false,
      downloadFilePath: '',
      downloadFileName: '',
      selectedId: '',
      popoverStates: {},
      inputFocus: false,
      videoList: [],
      hover_id: null
    }
  },
  computed: {
    ...mapGetters("task", ["videoTasks"]),
    processList() {
      return this.videoTasks.filter((item) => item.status === 'pending');
    },
    videos() {
      return this.videoTasks.reduce((acc, item) => {
        if (item.status === 'success') {
          acc.push({...item, isEdit: false});
        }
        return acc;
      }, []);
    },
  },
  watch: {
    videos: function (newVal, oldVal) {
      this.videoList = newVal
    }
  },
  mounted() {
    this.startDotAnimation();
    this.$store.dispatch("task/pollVideoTasks")
  },
  methods: {
    startDotAnimation() {
      this.dotTimer = setInterval(() => {
        this.dotCount = this.dotCount % 3 + 1;
        this.dot = '.'.repeat(this.dotCount);
      }, 1000);
    },
    deleteVideo(item) {
      this.popoverStates[item.id] = false;
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        delAction(`/video_record/delete/${item.id}`).then(res => {
          if (res.data.status === 'success') {
            this.$message.success('删除成功');
            this.$store.dispatch("task/pollVideoTasks")
          } else {
            this.$alert(res.data.data,'删除提示');
          }
        })
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    async downloadVideo(item) {
      this.popoverStates[item.id] = false;
      let self = this
      window.electronAPI.selectFolder().then((path) => {
        if (path) {
          window.electronAPI.downloadFile(item.video_path, path, item.filename)
          self.$message.success(`视频已另存为${path}`)
        }
      })
    },
    rename(item) {
      this.popoverStates[item.id] = false;
      item.isEdit = true;
      this.newName = item.filename;
      this.videoId = item.id;

      this.$nextTick(() => {
        const inputRefs = this.$refs[`renameInput_${item.id}`];
        if (inputRefs && inputRefs.length > 0) {
          const input = inputRefs[0];
          input.focus();
          // 可选：全选内容
          // input.select();
        } else {
          console.warn('未找到对应的输入框 ref', item.id);
        }
      });
    },
    clearOther(item) {
      this.videoList.forEach((video) => {
        if (video.id !== item.id) {
          video.isEdit = false
          this.popoverStates[video.id] = false;
        }
      })
    },
    onBlur(item) {
      item.isEdit = false;
      this.$forceUpdate()
    },
    onSave(item) {
      if (this.newName === item.filename) {
        item.isEdit = false;
        this.$forceUpdate()
        return
      }
      let params = {
        id: this.videoId,
        name: this.newName,
      };
      postAction("/video_record/update_name", params).then((res) => {
        if (res.data.status === "success") {
          this.$message.success("重命名成功");
          this.$store.dispatch("task/pollVideoTasks")
        } else {
          this.$alert(res.data.data,'重命名提示');
        }
        item.isEdit = false;
      }).catch((err) => {
        this.$message.error("重命名失败，请稍后重试！");
      });
    },
    checkAspectRatio() {
      const video = this.$refs.video;
      const width = video.videoWidth;
      const height = video.videoHeight;
      this.aspectRatio = width / height
    },
    preview(item) {
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
  padding: 12px;
  box-sizing: border-box;
  min-height: 800px;
}

.list-search {
  text-align: center;
}

.list-search-input {
  width: 33.33%;
}

.list-search >>> .el-input__icon {
  line-height: 42px;
  font-size: 20px;
}

.list-search >>> .el-input__inner {
  height: 42px;
  line-height: 42px;
  border-radius: 21px;
  background-color: #FFFFFF;
  border: 1px solid #D1D5DB;
  font-size: 16px;
  padding-left: 40px;
}

.list-content {
  height: calc(100% - 63px);
  padding: 10px;
  margin-top: 20px;
  box-sizing: border-box;
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  grid-auto-rows: min-content;
  overflow: auto;
}

.video-list-item {
  aspect-ratio: 9 / 16;
  position: relative;
  display: flex;
  justify-content: center;
}

.video-list-item:hover {
  transform: scale(1.05);
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

.video-item-file {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.video-item-info {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
  padding: 10px 5px 10px 10px;
  box-sizing: border-box;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  display: flex;
  align-items: end;
}


.video-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  color: #FFFFFF;
  font-size: 14px;
}

.video-list-item >>> .el-input__inner {
  -webkit-appearance: none;
  background-color: #1e1f20;
  background-image: none;
  border-radius: 4px;
  border: 2px solid #4c8df1;
  box-sizing: border-box;
  color: #ffffff;
  display: inline-block;
  height: 30px;
  line-height: 30px;
  outline: 0;
  padding: 0 15px;
  transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
  width: 100%;
}

.more-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  padding: 0;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
}

.more-btn:hover {
  background-color: rgba(0, 0, 0, 1);
  color: #FFFFFF;
}

.more-btn-item {
  height: 40px;
  line-height: 40px;
  border-radius: 5px;
  padding-left: 10px
}

.more-btn-item:hover {
  background-color: #1890ff !important;
  color: #fff !important;
}

.menu-icon-more {
  margin-left: 10px;
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
}

.activeClass {
  border: 1px solid #6286ED;
}

.video-list >>> .el-dialog {
  background-color: #79777700 !important;
  box-shadow: none !important;
}

.video-list >>> .el-dialog__headerbtn .el-dialog__close {
  font-size: 24px;
  color: #9a9a9a;
}

.control-icon {
  font-size: 30px;
  color: #fff;
  cursor: pointer;
  filter: drop-shadow(0px 0px 10px #292929);
}
</style>