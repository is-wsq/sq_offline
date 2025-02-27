<template>
  <div class="video">
    <div class="video-title">角色选择</div>
    <div class="video-template">
      <div v-for="i in 10" :key="i">
        <div>
          <el-image class="template-img" src="/images/4.jpg" fit="cover"></el-image>
        </div>
        <div style="margin-top: 10px;font-size: 15px;color: #1E1F20;width: 150px;text-align: center">系统形象</div>
      </div>
    </div>
    <div class="video-title">声音选择</div>
    <div class="voice-card">
      <div class="play-btn">
        <el-image style="width: 20px;height: 20px" :src="isPlay?'/pause.png' : '/play.png'"></el-image>
      </div>
      <div class="sound">
        <div class="sound-name">{{ sound.name }}</div>
        <el-image style="width: 20px;height: 20px; cursor: pointer" src="/more.png"></el-image>
      </div>
    </div>
    <div class="video-title">口播文案</div>
    <div class="text-card">
      <div class="text-content">

      </div>
    </div>
    <div style="width: 100%;text-align: center;margin-top: 30px">
      <el-button style="width: 125px;background-color: #77C285;color: #FFFFFF;border-radius: 10px">生成视频</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Video',
  data() {
    return {
      isPlay: false,
      sound: {
        name: '默认声音',
      }
    }
  },
  methods: {}
}
</script>

<style scoped>
.video {
  width: 100%;
  height: 100%;
  min-height: 700px;
  padding: 40px;
  box-sizing: border-box;
}

.video-title {
  margin: 10px;
  color: #1E1F20;
  font-size: 15px;
}

.video-template {
  width: 100%;
  height: 220px;
  background-color: #FFFFFF;
  border-radius: 10px;
  padding: 20px;
  box-sizing: border-box;
  overflow-x: auto;
  display: flex;
  gap: 20px;
}

.template-img {
  width: 150px;
  height: 150px;
  border-radius: 10px;
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

.sound {
  width: calc(100% - 50px);
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
  height: calc(100% - 480px);
  background-color: #FFFFFF;
  border-radius: 10px;
  padding: 20px;
  box-sizing: border-box;
}

.text-content {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background-color: #f9f9f9;
}
</style>