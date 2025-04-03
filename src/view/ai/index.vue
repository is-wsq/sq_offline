<template>
  <div class="ai">
    <div class="ai-content">
      <div style="display: flex; height: 40px; align-items: center">
        <el-switch
          :width="50"
          v-model="modelOpen"
          active-color="#6286ED"
          @change="switchChange"
        ></el-switch>
        <span style="margin-left: 20px; font-size: 16px; color: #6d7177"
          >模型开关</span
        >
      </div>
      <el-button class="enter-service" @click="enterService"
        >进入服务</el-button
      >
    </div>
    <div
      style="
        margin-top: 74px;
        color: #6d7177;
        font-size: 16px;
        line-height: 27px;
      "
    >
      请开启模型后再点击 “进入服务”
      使用AI大模型，使用完毕后请关闭模型开关释放资源。
    </div>
    <div style="color: #6d7177; font-size: 16px; line-height: 27px">
      注意，模型服务与数字人形象无法同时使用，关闭模型开关即可正常使用数字人服务。
    </div>
  </div>
</template>

<script>
import { getAction, postAction } from "@/api/api";
import axios from "axios";

export default {
  data() {
    return {
      modelOpen: false,
    };
  },
  async mounted() {
    this.modelOpen = await this.queryServiceStatus();
  },
  methods: {
    enterService() {
      if (this.modelOpen) {
        window.open("http://127.0.0.1:8080");
      } else {
        this.$message.error("请先开启模型服务");
      }
    },
    async queryServiceStatus() {
      return axios
        .get("http://127.0.0.1:11434/api/ps")
        .then((res) => {
          return res.data.models.length > 0;
        })
        .catch((err) => {
          return false;
        });
    },
    switchChange(val) {
      if (val) {
        this.startService();
      } else {
        this.stopService();
      }
    },
    startService() {
      let params = {
        model: "hf-mirror.com/unsloth/QwQ-32B-GGUF:Q3_K_M",
        keep_alive: -1,
      };
      postAction("stop_docker_service")
        .then((res) => {
          if (res.data.status === "success") {
            axios
              .post("http://127.0.0.1:11434/api/generate", params)
              .then((result) => {
                if (result.data.done) {
                  this.$message.success("模型加载成功");
                } else {
                  this.$message.error(result.data.message);
                }
              });
          } else {
            this.modelOpen = false;
            this.$message.error("当前后台有任务在进行中，请稍后再试。");
          }
        })
        .catch((err) => {
          this.modelOpen = false;
          this.$message.error("当前后台有任务在进行中，请稍后再试。");
        });
    },
    stopService() {
      let params = {
        model: "hf-mirror.com/unsloth/QwQ-32B-GGUF:Q3_K_M",
        keep_alive: 0,
      };
      axios
        .post("http://127.0.0.1:11434/api/generate", params)
        .then((res) => {
          if (res.data.done) {
            this.$message.success("模型卸载成功");
          } else {
            this.$message.error(res.data.message);
          }
        })
        .catch((err) => {
          this.$message.error("模型卸载失败，请稍后重试。");
        });
    },
  },
};
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
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.enter-service {
  margin-top: 50px;
  width: 150px;
  height: 44px;
  background-color: #6286ed;
  border-radius: 15px;
  color: #ffffff;
  font-size: 16px;
}

.enter-service:hover {
  background-color: #6286ed;
  color: #ffffff;
}
</style>
