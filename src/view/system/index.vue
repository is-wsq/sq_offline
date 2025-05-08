<template>
  <div class="system">
    <div class="system-content">
      <div class="title" @click="goto('/agreement')">用户协议</div>
      <div class="title">隐私政策</div>
      <div class="title">产品说明</div>
      <div class="title">联系我们</div>
      <el-form :inline="true" label-width="100px">
        <el-form-item label="保存路径">
          <el-input v-model="downloadPath" placeholder="请选择视频下载保存路径" style="width: 400px;" readonly />
          <el-button @click="chooseFolder" icon="el-icon-folder-opened">选择</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'system',
  data() {
    return {
      downloadPath: ''
    }
  },
  mounted() {
    this.downloadPath = localStorage.getItem('downloadPath') || 'D:\\offline'
  },
  methods: {
    chooseFolder() {
      window.electronAPI.selectFolder().then((path) => {
        if (path) {
          this.downloadPath = path
          localStorage.setItem('downloadPath', path)
        }
      })
    },
    goto(path) {
      this.$router.push(path)
    }
  }
}
</script>

<style scoped>
.system {
  width: 100%;
  height: 100%;
  min-height: 700px;
  padding: 40px;
  box-sizing: border-box;
}

.system-content {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.title {
  width: 400px;
  height: 60px;
  line-height: 60px;
  border-radius: 10px;
  border: 1px solid #BBBBBB;
  text-align: center;
  color: #101010;
  cursor: pointer;
}
</style>