<template>
  <div class="ai">
    <div class="ai-content">
      <div style="display: flex;height: 40px;align-items: center">
        <el-switch :width="50" v-model="modelOpen" active-color="#6286ED"></el-switch>
        <span style="margin-left: 20px;font-size: 16px;color: #6D7177">模型开关</span>
      </div>
      <el-button class="enter-service" @click="enterService">进入服务</el-button>
    </div>
    <div style="margin-top: 74px;color: #6D7177;font-size: 16px;line-height: 27px">
      请开启模型后再点击 “进入服务” 使用AI大模型，使用完毕后请关闭模型开关释放资源。
    </div>
    <div style="color: #6D7177;font-size: 16px;line-height: 27px">
      注意，模型服务与数字人形象无法同时使用，关闭模型开关即可正常使用数字人服务。
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      modelOpen: false
    }
  },
  methods: {
    enterService() {

    }
  }
}
</script>

<style scoped>
.ai {
  width: 100%;
  height: 100%;
  min-height: 700px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.ai-content {
  width: 667px;
  height: 375px;
  border-radius: 45px;
  background-color: #FFFFFF;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.enter-service {
  margin-top: 50px;
  width: 150px;
  height: 44px;
  background-color: #6286ED;
  border-radius: 15px;
  color: #FFFFFF;
  font-size: 16px;
}

.enter-service:hover {
  background-color: #6286ED;
  color: #FFFFFF;
}
</style>

