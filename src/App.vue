<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
  }
}
</script>

<style>
#app {
  height: 100%;
  min-width: 1000px;
  overflow: auto;
}

body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
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
