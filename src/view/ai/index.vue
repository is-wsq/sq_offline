<template>
  <div class="ai">
    <div class="ai-content">
      <div style="display: flex; height: 40px; align-items: center;width: 60%">
        <span style="margin-right: 20px; font-size: 16px; color: #6d7177">模型选择</span>
        <el-select v-model="model" placeholder="请选择">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
      <div style="display: flex; height: 40px; align-items: center;width: 60%;margin-top: 40px">
        <span style="margin-right: 20px; font-size: 16px; color: #6d7177">模型开关</span>
        <el-switch
          :width="50"
          v-model="modelOpen"
          active-color="#6286ED"
          @change="switchChange"
        ></el-switch>
      </div>
      <el-button class="enter-service" @click="enterService">进入服务</el-button>
    </div>
    <div style="margin-top: 74px;color: #6d7177;font-size: 16px;line-height: 27px;">
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
      model: '',
      options: [],
      modelOpen: false,
      loading: false,
    };
  },
  async mounted() {
    this.queryModels()
    this.modelOpen = await this.queryServiceStatus();
  },
  methods: {
    queryModels() {
      getAction("/get_model_dict").then(res => {
        if (res.data.status === "success") {
          this.options = res.data.options
          this.model = res.data.options[0].value || ''
        }
      })
    },
    enterService() {
      if (this.modelOpen) {
        window.open("http://127.0.0.1:8080");
      } else {
        this.$message.error("请先开启模型服务");
      }
    },
    async queryServiceStatus() {
      return axios.get("http://127.0.0.1:11434/api/ps").then((res) => {
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
    startWebui() {
      let params = {
        model: this.model,
      }
      postAction('start_webui',params).then(res => {
        console.log(res)
      }).catch(err => {
        this.$message.error(`webui模型开启失败，${err}`);
      })
    },
    startService() {
      this.modelOpen = false
      let params = {
        model: this.model,
        keep_alive: -1,
      };
      this.loading = this.$loading({
        lock: true,
        text: '模型服务启动中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      postAction("stop_docker_service")
        .then((res) => {
          if (res.data.status === "success") {
            this.startWebui();
            axios.post("http://127.0.0.1:11434/api/generate", params).then((result) => {
              if (result.data.done) {
                this.modelOpen = true;
                this.$message.success("模型加载成功");
              } else {
                this.modelOpen = false;
                this.$message.error(result.data.message);
              }
              this.loading.close();
              this.loading = null;
            }).catch(err => {
              this.loading.close();
              this.loading = null;
              this.modelOpen = false;
              this.$message.error("模型加载失败，请稍后重试。");
            });
          } else {
            this.modelOpen = false;
            this.loading.close();
            this.loading = null;
            this.$message.error("当前后台有任务在进行中，请稍后再试。");
          }
        })
        .catch((err) => {
          this.modelOpen = false;
          this.loading.close();
          this.loading = null;
          this.$message.error("当前后台有任务在进行中，请稍后再试。");
        });
    },
    stopService() {
      axios.get("http://127.0.0.1:11434/api/ps").then((res) => {
        if (res.data.models.length > 0) {
          let params = {
            model: res.data.models[0].model,
            keep_alive: 0,
          };
          this.modelOpen = true
          axios.post("http://127.0.0.1:11434/api/generate", params).then((res) => {
            if (res.data.done) {
              this.modelOpen = false;
              this.$message.success("模型卸载成功");
            } else {
              this.modelOpen = true;
              this.$message.error(res.data.message);
            }
          })
          .catch((err) => {
            this.modelOpen = true;
            this.$message.error("模型卸载失败，请稍后重试。");
          });
        }
      })
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

.ai >>> .el-input__inner {
  border-radius: 15px;
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
