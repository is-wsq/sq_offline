<template>
  <div class="ai">
    <div class="ai-content">
      <div style="display: flex;height: 40px;align-items: center">
        <el-switch :width="50" v-model="modelOpen" active-color="#6286ED" disabled></el-switch>
        <span style="margin-left: 20px;font-size: 16px;color: #6D7177">模型开关</span>
      </div>
      <el-button class="enter-service" type="primary" @click="startService" v-if="!modelOpen">进入服务</el-button>
      <el-button class="enter-service" type="danger" @click="stopService" v-else>停止服务</el-button>
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
import {postAction} from "@/api/api";
import axios from "axios";

export default {
  data() {
    return {
      modelOpen: false
    }
  },
  methods: {
    startService() {
      let params = {
        model_name: 'hf-mirror.com/unsloth/QwQ-32B-GGUF:Q3_K_M'
      }
      postAction('stop_docker_service').then(res => {
        if (res.data.status === 'success') {
          axios.post('http://127.0.0.1:8080/load_model', params).then(result => {
            if (result.data.status === 'success') {
              this.$message.success('模型加载成功')
              this.modelOpen = true
            }else {
              this.$message.error(result.data.message)
            }
          })
        }else {
          this.$message.error(res.data.message)
        }
      })
    },
    stopService() {
      let params = {
        model_name: 'hf-mirror.com/unsloth/QwQ-32B-GGUF:Q3_K_M'
      }
      axios.post('http://127.0.0.1:8080/unload_model', params).then(res => {
        if (res.data.status ==='success') {
          console.log('模型卸载成功')
          this.$message.success('模型卸载成功')
          this.modelOpen = false
        }else {
          console.log(res.data)
          this.$message.error(res.data.message)
        }
      })
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
  border-radius: 15px;
  font-size: 16px;
}
</style>

