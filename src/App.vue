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

.el-menu {
  border-radius: 10px !important;
}

.el-menu-item {
  width: 130px !important;
  height: 46px !important;
  line-height: 46px !important;
  border-radius: 10px !important;
}

.el-menu-item:hover {
  .menu-icon {
    color: #fff !important;
  }

  background-color: #1890ff !important;
  color: #fff !important;
}

.menu-icon {
  color: #6D7177 !important;
  font-size: 14px !important;
  margin-right: 5px !important;
}

/* 定义整个滚动条的宽度和高度 */
::-webkit-scrollbar {
  width: 0; /* 垂直滚动条的宽度 */
  height: 1px; /* 水平滚动条的高度 */
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
