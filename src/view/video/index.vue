<template>
  <div class="video">
    <div class="video-title">角色选择</div>
    <div class="video-template" ref="template" :style="templateStyle">
      <div v-for="item in templates" :key="item.id"
        style="border-radius: 10px; width: 130px" @click="figure = item"
        :style="{ 'background-color': item.id === figure.id ? '#e0e7fb' : '#FFFFFF' }">
        <div>
          <el-image class="template-img" :src="item.picture" fit="cover"></el-image>
        </div>
        <div class="template-name">{{ item.name }}</div>
      </div>
    </div>
    <div class="more-btn">
      <i class="el-icon-arrow-down more" @click="showMore" v-if="!templateHigh"></i>
      <i class="el-icon-arrow-up more" @click="showMore" v-if="templateHigh"></i>
    </div>
    <div class="video-title">声音选择</div>
    <div class="voice-card">
      <div class="play-btn" @click="listenAudio">
        <i :class="isPlay ? 'el-icon-pause' : 'el-icon-play'" style="font-size: 13px; color: #6286ed"></i>
      </div>
      <el-popover placement="right" trigger="click">
        <div class="popover-content">
          <el-row>
            <el-col :span="12" v-for="voice in voices" :key="voice.id">
              <div class="voice-item" :class="{ active: voice.id === sound.id }" @click="sound = voice">
                <div class="voice-icon" @click="previewAudio(voice)">
                  <i :class="voice.isPlay ? 'el-icon-pause' : 'el-icon-play'" style="font-size: 13px; color: #6286ed"></i>
                </div>
                <div class="voice-name">{{ voice.name }}</div>
              </div>
            </el-col>
          </el-row>
        </div>
        <div class="sound" slot="reference">
          <div class="sound-name">{{ sound.name }}</div>
          <i class="el-icon-a-ze-bars1" style="font-size: 20px; color: #9a9a9a"></i>
        </div>
      </el-popover>
    </div>
    <div class="video-title">口播文案</div>
    <div class="text-card">
      <el-input type="textarea" style="height: 100%; width: 100%" @focus="isFocus = true" @blur="isFocus = false" v-model="text">
      </el-input>
      <span class="text-tips" v-if="!isFocus && text === ''">请输入视频口播文案</span>
    </div>
    <el-button type="success" class="generate-btn" @click="verify">生成视频</el-button>
  </div>
</template>

<script>
import { getAction, postAction } from "@/api/api";
import axios from "axios";
import { mapGetters } from "vuex";

export default {
  name: "Video",
  data() {
    return {
      isPlay: false,
      templateStyle: {
        height: "215px",
        overflow: "hidden",
      },
      templateHigh: false,
      templates: [],
      figure: {},
      voices: [],
      sound: {},
      text: "",
      audio: null,
      testAudio: null,
      isFocus: false,
    };
  },
  computed: {
    ...mapGetters("task", ["allTasks"]), // 获取任务列表
    voiceAndFigureTasks() {
      return this.allTasks.filter(
        (item) => item.type === "figures" || item.type === "voice"
      );
    },
  },
  watch: {
    voiceAndFigureTasks: {
      handler() {
        this.querySounds();
        this.queryFigures();
      },
      deep: true,
    },
  },
  mounted() {
    this.querySounds();
    this.queryFigures();
  },
  methods: {
    queryFigures() {
      getAction("/figure/query_success").then((res) => {
        if (res.data.status === "success") {
          this.templates = res.data.data;
          if (this.templates.length > 0) {
            this.figure = this.templates[0];
          }
        }
      })
      .catch((error) => {
        console.error("获取角色列表失败:", error);
      });
    },
    querySounds() {
      getAction("/timbres/query_success").then((res) => {
        if (res.data.status === "success") {
          this.voices = res.data.data;
          this.voices.forEach((voice) => {
            voice.isPlay = false;
          });
          if (this.voices.length > 0) this.sound = this.voices[0];
        } else {
          this.$message.error("获取声音列表失败。");
        }
      })
      .catch((error) => {
        console.error("获取声音列表失败:", error);
      });
    },
    showMore() {
      if (!this.templateHigh) {
        this.templateStyle.height = 430 + "px";
        this.templateStyle.overflow = "auto";
        this.templateHigh = true;
      } else {
        this.$refs.template.scrollTop = 0;
        this.templateStyle.height = 215 + "px";
        this.templateStyle.overflow = "hidden";
        this.templateHigh = false;
      }
    },
    listenAudio() {
      let self = this;
      if (self.isPlay) {
        self.isPlay = false;
        self.testAudio.pause();
      } else {
        self.isPlay = true;
        self.testAudio = new Audio(self.sound.filepath);
        self.testAudio.play();
        self.testAudio.onended = () => {
          self.isPlay = false;
        };
      }
    },
    previewAudio(voice) {
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
      let index = this.voices.findIndex((item) => item.id === voice.id);
      this.voices[index].isPlay = status;
      this.$forceUpdate();
    },
    generateUniqueId() {
      return Date.now() + Math.random().toString(36).substr(2, 16);
    },
    setName() {
      let data = new Date();
      let year = data.getFullYear();
      let month = String(data.getMonth() + 1).padStart(2, "0");
      let day = String(data.getDate()).padStart(2, "0");
      let hours = String(data.getHours()).padStart(2, "0");
      let minutes = String(data.getMinutes()).padStart(2, "0");
      let seconds = String(data.getSeconds()).padStart(2, "0");
      return  year + '-' + month + '-' + day + '_' + hours + '-' + minutes + '-' + seconds
    },
    verify() {
      getAction('/verify/activation').then(res => {
        if (res.data.status === 'success'){
          this.generateVideo()
        }else {
          this.$alert(res.data.message, "验证失败");
        }
      })
    },
    generateVideo() {
      let name = this.setName()
      let task = {
        type: "video",
        id: this.generateUniqueId(),
        name: name,
        status: "running",
      };
      this.$store.dispatch("task/addTask", task);
      let content = `已创建视频生成任务，视频生成成功后会自动下载到本地`;
      this.$alert(content, "任务创建提醒");

      setTimeout(() => {
        this.$router.push({path: '/videoList'})
      },500)

      let params = {
        video_id: this.figure.video_id,
        voice_id: this.sound.voice_id,
        filename: name,
        text: this.text,
      };
      postAction("/figure/generate_video", params, 18000000).then((res) => {
        if (res.data.status === "success") {
          this.$store.dispatch("task/removeTask", task.id);
          let message = `${task.id}视频生成任务已完成！`;
          this.$notify({
            title: "生成成功",
            message: message,
            duration: 0,
            type: "success",
          });
          this.downloadVideo(res.data.data.video_path, name);
        } else {
          this.$store.dispatch("task/removeTask", task.id);
          let message = `${task.id}视频生成任务失败,${res.data.message}`;
          this.$notify({
            title: "生成失败",
            message: message,
            duration: 0,
            type: "error",
          });
        }
      })
      .catch((error) => {
        this.$store.dispatch("task/removeTask", task.id);
        let message = `${task.id}视频生成任务失败,${error}`;
        this.$notify({
          title: "生成失败",
          message: message,
          duration: 0,
          type: "error"
        });
      });
    },
    async downloadVideo(path, fileName) {
      let downloadPath = localStorage.getItem('downloadPath') || 'D:\\Downloads'
      window.electronAPI.downloadFile(path, downloadPath, fileName)
      this.$message.success(`视频已保存到${downloadPath}`)
    },
  },
};
</script>

<style scoped>
.video {
  width: 100%;
  height: 100%;
  min-height: 700px;
  padding: 5px 40px;
  box-sizing: border-box;
  overflow: auto;
}

.video-title {
  margin: 10px;
  color: #1e1f20;
  font-size: 15px;
}

.video-template {
  width: 100%;
  background-color: #ffffff;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding: 20px;
  padding-bottom: 0 !important;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  grid-template-rows: 195px;
  gap: 20px;
  position: relative;
}

.template-img {
  width: 120px;
  height: 160px;
  margin: 5px;
  border-radius: 10px;
}

.template-name {
  font-size: 15px;
  color: #1e1f20;
  width: 120px;
  text-align: center;
}

.more-btn {
  height: 25px;
  width: 100%;
  text-align: right;
  background-color: #ffffff;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.more {
  color: #9a9a9a;
  font-size: 20px;
  margin-right: 10px;
  margin-bottom: 10px;
}

.voice-card {
  width: 300px;
  background-color: #ffffff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 15px 30px;
}

.play-btn {
  width: 36px;
  height: 36px;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 1px solid #f3f3f3;
  background-color: rgb(247, 247, 247, 0.8);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.popover-content {
  width: 350px;
  height: 350px;
  border-radius: 10px;
  overflow: auto;
}

.voice-item {
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
  height: 37px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #c7d4f8;
  border-radius: 10px;
}

.voice-name {
  width: 100px;
  margin-left: 10px;
  font-size: 14px;
  color: #101010;
}

.sound {
  width: 250px;
  height: 35px;
  border-radius: 5px;
  margin-left: 10px;
  background-color: rgb(247, 247, 247, 0.8);
  border: 1px solid #f3f3f3;
  display: flex;
  align-items: center;
}

.sound-name {
  width: calc(100% - 60px);
  height: 40px;
  color: #1e1f20;
  font-size: 14px;
  margin-left: 20px;
  line-height: 40px;
}

.text-card {
  width: 100%;
  height: calc(100% - 500px);
  min-height: 300px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
}

.video >>> .el-textarea__inner {
  resize: none;
  background-color: #f9f9f9;
  height: 100%;
  border: none;
  border-radius: 10px;
  padding: 10px 15px;
}

.text-tips {
  position: absolute;
  bottom: 50%;
  left: 50%;
  color: #9a9a9a;
  transform: translate(-50%, 50%);
}

.generate-btn {
  width: 126px;
  border-radius: 10px;
  margin-top: 30px !important;
  margin-left: calc(50% - 63px);
}
</style>
