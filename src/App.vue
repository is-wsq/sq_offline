<template>
  <div id="app">
    <dashboard/>
  </div>
</template>

<script>
import dashboard from './view/dashboard.vue'

export default {
  name: 'App',
  components: {
    dashboard
  },
  data() {
    return {
      pollingTimer: null
    }
  },
  created() {
    // localStorage.removeItem('tasks')
  },
  mounted() {
    this.$store.dispatch("task/pollVideoTasks");
    this.$store.dispatch("task/pollVoiceTasks");
    this.$store.dispatch("task/pollFigureTasks");
    this.pollingTimer = setInterval(() => {
      this.$store.dispatch("task/pollVideoTasks");
      this.$store.dispatch("task/pollVoiceTasks");
      this.$store.dispatch("task/pollFigureTasks");
    }, 5000);
  },

  beforeDestroy() {
    clearInterval(this.pollingTimer);
  }
}
</script>

<style>
#app {
  height: 100%;
  min-width: 1100px;
  overflow: auto;
}

body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

.el-message-box__headerbtn {
  display: none;
}

.margin-b-12 {
  margin-bottom: 12px;
}

.margin-b-8 {
  margin-bottom: 8px;
}

.margin-b-16 {
  margin-bottom: 16px;
}

.margin-t-8 {
  margin-top: 8px;
}

.margin-t-12 {
  margin-top: 12px;
}

.font-weight {
  font-weight: bold !important;
}

.cursor-pointer {
  cursor: pointer !important;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.back-btn {
  padding: 7px !important;
  border-radius: 50% !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
  color: #a2a8b3 !important;
  background-color: #FFFFFF !important;
  margin: 0 0 8px !important;
}

.back-btn:hover {
  color: #1F2937 !important;
}

.material-function {
  width: 130px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 20px;
  line-height: 20px;
  font-size: 14px;
  color: #606266;
  font-family: Arial, sans-serif;
}

.material-function:hover {
  background-color: #f5f7fa;
}

.menu-icon {
  color: #6D7177 !important;
  font-size: 14px !important;
  margin-right: 15px !important;
}

.el-button--primary {
  background-color: #6366fe !important;
  border-color: #DCDFE6 !important;
  color: #fff !important;
  border-radius: 6px !important;
}

.figure-image-wrapper {
  width: 120px;
  height: 160px;
  position: relative;
  display: inline-block;
  border-radius: 8px;
  overflow: hidden;
}

.image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  display: inline-block;
  border-radius: 8px;
  overflow: hidden;
}

.shine-layer {
  content: '';
  position: absolute;
  top: 0;
  left: -60px;
  width: 20px;
  height: 100%;
  background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.4) 40%,
      rgba(255, 255, 255, 0.7) 50%,
      rgba(255, 255, 255, 0.4) 60%,
      rgba(255, 255, 255, 0) 100%
  );
  filter: blur(20px); /* 拖尾模糊 */
  opacity: 1;
  pointer-events: none;
  border-radius: 12px;
  z-index: 2;
}

.shining .shine-layer {
  animation: shine-move 2s linear infinite;
}

@keyframes shine-move {
  0% {
    left: -100%;
  }
  100% {
    left: 120%;
  }
}

/* 定义整个滚动条的宽度和高度 */
::-webkit-scrollbar {
  width: 0; /* 垂直滚动条的宽度 */
  height: 3px; /* 水平滚动条的高度 */
}

/* 滚动条轨道样式 */
::-webkit-scrollbar-track {
  background: #f1f1f1; /* 轨道背景色 */
  border-radius: 10px; /* 轨道角的圆滑度 */
}

/* 滚动条滑块样式 */
::-webkit-scrollbar-thumb {
  background: #888; /* 滑块背景色 */
  border-radius: 10px; /* 滑块角的圆滑度 */
}

/* 鼠标悬停在滚动条滑块上的样式 */
::-webkit-scrollbar-thumb:hover {
  background: #555; /* 悬停时的滑块颜色 */
}

.el-textarea__inner:focus {
  outline: none;
  background: white;
  border-color: #8b5cf6 !important;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.el-textarea__inner {
  font-family: "Helvetica Neue", Arial, sans-serif;
  padding: 5px 10px;
}
</style>
