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
    }, 10000);
  },

  beforeDestroy() {
    // clearInterval(this.pollingTimer);
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

.right-item {
  width: 130px !important;
  height: 46px !important;
  line-height: 46px !important;
  border-radius: 10px !important;
  padding-left: 20px !important;
}

.right-item:hover {
  .menu-icon {
    color: #fff !important;
  }

  background-color: #1890ff !important;
  color: #fff !important;
}

.menu-icon {
  color: #6D7177 !important;
  font-size: 14px !important;
  margin-right: 10px !important;
}

.el-button--primary {
  background-color: #6286ED !important;
  border-color: #6286ED !important;
  color: #fff !important;
}

.image-wrapper {
  position: relative;
  display: inline-block;
  border-radius: 12px;
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
</style>
