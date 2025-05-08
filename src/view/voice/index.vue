<template>
  <div class="voice">
    <div class="voice-content">
      <el-row :gutter="40" style="height: 100%; width: 100%; margin: 0 auto">
        <el-col :span="12" style="height: 100%">
          <div class="voice-type">系统音色</div>
          <div class="voice-list">
            <div class="voice-item" v-for="(item, index) in systemVoice" :key="index"
                 @contextmenu.stop="handleContextMenu(item, $event)">
              <div class="voice-icon" @click="textAudio(item)">
                <i :class="item.isPlay ? 'el-icon-pause' : 'el-icon-play'" style="font-size: 13px; color: #6286ed"></i>
              </div>
              <div :title="item.name" class="voice-name">{{ item.name }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="12" style="height: 100%">
          <div class="voice-type">克隆音色</div>
          <div class="voice-list">
            <div class="voice-item">
              <el-upload
                action="http://127.0.0.1:6006/timbres/clone"
                :show-file-list="false"
                accept=".mp3, .wav"
                :on-success="uploadSuccess"
                :on-error="uploadError"
                :before-upload="beforeUpload"
              >
                <div style="display: flex;justify-content: center;align-items: center;height: 80px;">
                  <div class="voice-icon" style="background-color: pink !important">
                    <i class="el-icon-plus" style="font-size: 15px; color: red"></i>
                  </div>
                  <div style="width: 80px;margin-left: 10px;font-size: 14px;color: #101010;text-align: left">上传音频</div>
                </div>
              </el-upload>
            </div>
            <div class="voice-item" v-for="task in processVoice" :key="task.id">
              <div class="voice-icon" style="background-color: rgba(187, 187, 187, 0.25) !important;">
                <div class="dot-spinner">
                  <div class="dot" v-for="n in 8" :key="n"
                       :style="{ transform: 'rotate(' + (n * 45) + 'deg) translate(0, -9px)', animationDelay: (n * 0.1) + 's' }"
                  ></div>
                </div>
              </div>
              <div class="voice-name" style="display: flex">
                <div>音色克隆中</div>
                <div style="width: 10px;text-align: left;margin-left: 5px;font-size: 20px">{{ dot }}</div>
              </div>
            </div>
            <div class="voice-item" v-for="(item, index) in cloneVoice" :key="index"
                 @contextmenu.stop="handleContextMenu(item,$event)">
              <div class="voice-icon" @click="textAudio(item)">
                <i :class="item.isPlay ? 'el-icon-pause' : 'el-icon-play'" style="font-size: 13px; color: #6286ed"></i>
              </div>
              <div :title="item.name" class="voice-name">{{ item.name }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
      <div :style="menuStyle" v-if="rightMenuVisible">
        <div class="right-item" @click="listen">
          <i class="el-icon-yangshengqi menu-icon"></i>
          <span style="margin-top: 2px">试听</span>
        </div>
        <div class="right-item" @click="rename" v-if="selectedItem.type === 'clone'">
          <i class="el-icon-edit-outline menu-icon"></i>
          <span style="margin-top: 2px">重命名</span>
        </div>
        <div class="right-item" @click="deleteItem" v-if="selectedItem.type === 'clone'">
          <i class="el-icon-delete-solid menu-icon"></i>
          <span style="margin-top: 2px">删除</span>
        </div>
      </div>
    </div>
    <el-drawer title="重命名音色名称" :visible.sync="drawer" direction="rtl">
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
    <div class="voice-footer">
      请上传格式为mp3\wav的音频进行声音克隆，建议音频时长为3分钟。请在无遮挡场景进行录制，背景选取纯色无杂物最佳，面部表情丰富，适当添加无指向性手部动作。
    </div>
  </div>
</template>

<script>
import { RightMenuMixin } from "@/mixins/RightMenuMixin";
import { delAction, getAction, postAction } from "@/api/api";
import { mapGetters } from "vuex";

export default {
  name: "Voice",
  mixins: [RightMenuMixin],
  data() {
    return {
      audio: null,
      newName: "",
      drawer: false,
      soundId: null,
      task: {},
      dotCount: 1,
      dotTimer: null,
      dot: '.',
    }
  },
  computed: {
    ...mapGetters("task", ["voiceTasks"]), // 获取任务列表
    processVoice() {
      return this.voiceTasks.filter((item) => item.status === 'pending');
    },
    systemVoice() {
      return this.voiceTasks.filter((item) => item.type === "system");
    },
    cloneVoice() {
      return this.voiceTasks.filter((item) => item.type === "clone" && item.status === "success");
    }
  },
  mounted() {
    this.startDotAnimation();
    this.$store.dispatch("task/pollVoiceTasks");
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
    textAudio(item) {
      this.selectedItem = item;
      this.listen();
    },
    listen() {
      let voice = this.selectedItem;
      if (voice.isPlay) {
        this.audio.pause();
        this.updateStatus(voice, false);
      } else {
        this.audio = new Audio(voice.filepath);
        this.audio.play();
        this.updateStatus(voice, true);
        this.audio.onended = () => {
          this.updateStatus(voice, false);
        };
      }
    },
    updateStatus(voice, status) {
      if (voice.type === "system") {
        let index = this.systemVoice.findIndex((item) => item.id === voice.id);
        this.systemVoice[index].isPlay = status;
      } else {
        let index = this.cloneVoice.findIndex((item) => item.id === voice.id);
        this.cloneVoice[index].isPlay = status;
      }
      this.$forceUpdate();
    },
    rename() {
      this.soundId = this.selectedItem.id;
      this.newName = "";
      this.drawer = true;
    },
    onSave() {
      let params = {
        timbre_id: this.soundId,
        name: this.newName,
      };
      postAction("/timbres/update_name", params).then((res) => {
        if (res.data.status === "success") {
          this.$message.success("重命名成功。");
          this.$store.dispatch("task/pollVoiceTasks");
        } else {
          this.$message.error(res.data.message);
        }
        this.drawer = false;
      })
      .catch((err) => {
        this.$message.error("重命名失败，请稍后重试！");
      });
    },
    deleteItem() {
      delAction(`/timbres/${this.selectedItem.id}`).then((res) => {
        if (res.data.status === "success") {
          this.$message.success("删除成功。");
          this.$store.dispatch("task/pollVoiceTasks");
        } else {
          this.$message.error(res.data.message);
        }
      })
      .catch((err) => {
        this.$message.error("删除失败，请稍后重试！");
      });
    },
    async beforeUpload(file) {
      return getAction('/verify/activation').then(res => {
        if (res.data.status === 'success'){
          return true;
        }else {
          this.$alert(res.data.message, "验证失败");
          return Promise.reject('验证失败，停止上传');
        }
      })
    },
    uploadError(file) {
      let content = `创建${file.name}音色克隆任务失败`;
      this.$alert(content, "任务创建提醒");
    },
    uploadSuccess(res, file) {
      if (res.status === "success") {
        let content = `已创建${file.name}音色克隆任务，音色克隆成功后会自动更新音色列表`;
        this.$alert(content, "任务创建提醒");
        this.$store.dispatch("task/pollVoiceTasks");
      } else {
        let content = `创建${file.name}音色克隆任务失败，${res.data}`;
        this.$alert(content, "任务创建提醒");
      }
    },
  },
};
</script>

<style scoped>
.voice {
  width: 100%;
  height: 100%;
  min-height: 700px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.voice >>> .el-loading-spinner .circular {
  width: 25px !important;
  height: 25px !important;
}

.voice-content {
  width: calc(90% + 80px);
  height: calc(100% - 180px);
  padding: 40px;
  margin-top: 80px;
  box-sizing: border-box;
  background-color: #f5f5f5;
  border-radius: 20px;
}

.voice-type {
  height: 80px;
  line-height: 80px;
  text-align: center;
  font-size: 18px;
  color: #1e1f20;
}

.voice-list {
  width: 100%;
  height: calc(100% - 80px);
  border: 2px dashed rgba(98, 134, 237, 0.2);
  border-radius: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-auto-rows: 80px;
  gap: 10px;
  justify-items: center;
  overflow: auto;
  padding: 20px;
  box-sizing: border-box;
}

.voice-item {
  width: 150px;
  height: 80px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.active {
  background-color: #e0e7fb;
}

.voice-icon {
  width: 42px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #c7d4f8;
  border-radius: 10px;
}

.dot-spinner {
  position: relative;
  width: 24px;
  height: 24px;
}

.dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3px;
  height: 3px;
  background-color: #4c8df1;
  border-radius: 50%;
  transform-origin: 0 0;
  animation: fade 1s linear infinite;
}

@keyframes fade {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
}

.voice-name {
  width: 80px;
  margin-left: 10px;
  font-size: 14px;
  color: #101010;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.clone-btn {
  width: 150px;
  height: 50px;
  font-size: 16px;
  background-color: #77c285;
  color: #fff;
  border-radius: 10px;
}

.voice-footer {
  width: 80%;
  height: 80px;
  margin-top: 20px;
  color: #6d7177;
}
</style>
