<template>
  <div class="video">
    <div class="video-title">角色选择</div>
    <div class="video-template" ref="template" :style="templateStyle">
      <div v-for="item in templates" :key="item.id" style="border-radius: 10px;width: 160px" @click="figure = item"
           :style="{'background-color': item.id === figure.id? '#e0e7fb' : '#FFFFFF'}">
        <div>
          <el-image class="template-img" :src="item.url" fit="cover"></el-image>
        </div>
        <div class="template-name">{{ item.name }}
        </div>
      </div>
    </div>
    <div class="more-btn">
      <i class="el-icon-arrow-down more" @click="showMore" v-if="!templateHigh"></i>
      <i class="el-icon-arrow-up more" @click="showMore" v-if="templateHigh"></i>
    </div>
    <div class="video-title">声音选择</div>
    <div class="voice-card">
      <div class="play-btn" @click="listenAudio">
        <el-image style="width: 20px;height: 20px" :src="isPlay?'/stop.png' : '/play.png'"></el-image>
      </div>
      <el-popover
          placement="right"
          trigger="click">
        <div class="popover-content">
          <el-row>
            <el-col :span="12" v-for="voice in voices" :key="voice.id">
              <div class="voice-item" :class="{'active': voice.code === sound.code}" @click="sound = voice">
                <div class="voice-icon" @click="previewAudio(voice)">
                  <el-image style="width: 20px;height: 20px;" :src="voice.isPlay?'/stop.png' : '/play.png'"></el-image>
                </div>
                <div class="voice-name">{{ voice.name }}</div>
              </div>
            </el-col>
          </el-row>
        </div>
        <div class="sound" slot="reference">
          <div class="sound-name">{{ sound.name }}</div>
          <el-image style="width: 20px;height: 20px; cursor: pointer" src="/more.png"></el-image>
        </div>
      </el-popover>
    </div>
    <div class="video-title">口播文案</div>
    <div class="text-card">
      <el-input
          type="textarea"
          style="height: 100%; width: 100%;"
          @focus="isFocus = true"
          @blur="isFocus = false"
          v-model="text">
      </el-input>
      <span class="text-tips" v-if="!isFocus && text === ''">请输入视频口播文案</span>
    </div>
    <el-button class="generate-btn">生成视频</el-button>
  </div>
</template>

<script>
import {getAction} from "@/api/api";

export default {
  name: 'Video',
  data() {
    return {
      isPlay: false,
      userId: 4,
      templateStyle: {
        height: '205px',
        overflow: 'hidden',
      },
      templateHigh: false,
      templates: [
        {id: 1, name: '形象1', url: '/images/1.jpg'},
        {id: 2, name: '形象2', url: '/images/4.jpg'},
        {id: 3, name: '形象3', url: '/images/7.jpg'},
        {id: 4, name: '形象4', url: '/images/11.jpg'},
        {id: 5, name: '形象5', url: '/images/12.jpg'},
        {id: 6, name: '形象6', url: '/images/13.jpg'},
        {id: 7, name: '形象7', url: '/images/16.jpg'},
        {id: 8, name: '形象8', url: '/images/20.jpg'},
        {id: 9, name: '形象8', url: '/images/20.jpg'},
        {id: 10, name: '形象8', url: '/images/20.jpg'},
        {id: 11, name: '形象8', url: '/images/20.jpg'},
        {id: 12, name: '形象8', url: '/images/20.jpg'},
        {id: 13, name: '形象8', url: '/images/20.jpg'},
        {id: 14, name: '形象8', url: '/images/20.jpg'},
        {id: 15, name: '形象8', url: '/images/20.jpg'},
        {id: 16, name: '形象8', url: '/images/20.jpg'},
      ],
      voices: [],
      figure: {id: 1, name: '形象1', url: '/images/1.jpg'},
      sound: {},
      text: '',
      audio: null,
      testAudio: null,
      isFocus: false,
    }
  },
  mounted() {
    this.querySounds();
  },
  methods: {
    querySounds() {
      getAction('timbre/query', {userId: this.userId}).then(res => {
        if (res.data.status === 'success') {
          let data = res.data.data
          this.voices = data.systems.concat(data.clones);
          this.voices.forEach(voice => {
            voice.isPlay = false;
          });
          if (this.voices.length > 0)
            this.sound = this.voices[0];
        } else {
          this.$message.error('获取声音列表失败。');
        }
      })
    },
    showMore() {
      if (!this.templateHigh) {
        this.templateStyle.height = 410 + 'px';
        this.templateStyle.overflow = 'auto';
        this.templateHigh = true;
      } else {
        this.$refs.template.scrollTop = 0;
        this.templateStyle.height = 205 + 'px';
        this.templateStyle.overflow = 'hidden';
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
      let index = this.voices.findIndex(item => item.code === voice.code)
      this.voices[index].isPlay = status;
      this.$forceUpdate();
    },
  }
}
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
  color: #1E1F20;
  font-size: 15px;
}

.video-template {
  width: 100%;
  background-color: #FFFFFF;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding: 20px;
  padding-bottom: 0 !important;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  position: relative;
}

.template-img {
  width: 150px;
  height: 150px;
  margin: 5px;
  border-radius: 10px;
}

.template-name {
  font-size: 15px;
  color: #1E1F20;
  width: 150px;
  text-align: center;
}

.more-btn {
  height: 25px;
  width: 100%;
  text-align: right;
  background-color: #FFFFFF;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.more {
  color: #9A9A9A;
  font-size: 20px;
  margin-right: 10px;
  margin-bottom: 10px;
}

.voice-card {
  width: 300px;
  background-color: #FFFFFF;
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
  border-radius: 10px
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
  color: #1E1F20;
  font-size: 14px;
  margin-left: 20px;
  line-height: 40px;
}

.text-card {
  width: 100%;
  height: calc(100% - 500px);
  min-height: 300px;
  background-color: #FFFFFF;
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
  color: #9A9A9A;
  transform: translate(-50%, 50%);
}

.generate-btn {
  width: 126px;
  background-color: #77C285;
  color: #FFFFFF;
  border-radius: 10px;
  margin-top: 30px !important;
  margin-left: calc(50% - 63px);
}
</style>