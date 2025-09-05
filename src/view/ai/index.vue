<template>
  <div class="ai">
    <div class="ai-content">
      <div class="flex-center" style="position: absolute;top: 20px;right: 20px">
        <div style="flex: 1"></div>
        <div class="guide" style="margin-right: 15px" @click="guideVisible = true">
          <i class="el-icon-s-opportunity" style="margin-right: 4px;"></i>
          使用指南
        </div>
      </div>
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
            @change="switchChange">
        </el-switch>
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
    <el-dialog class="guide-dialog" :visible.sync="guideVisible" width="600px">
      <div slot="title" class="guide-dialog-title">使用指南</div>
      <div class="guide-dialog-body">
        <div class="guide-item">
          <div class="guide-index">1</div>
          <div style="flex: 1">选择模型</div>
        </div>
        <div class="guide-item">
          <div class="guide-index">2</div>
          <div style="flex: 1">开启模型</div>
        </div>
        <div class="guide-item">
          <div class="guide-index">3</div>
          <div style="flex: 1">点击"进入服务"，进入WebUI服务页面</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {getAction, postAction} from "@/api/api";
import axios from "axios";

export default {
  data() {
    return {
      model: '',
      options: [
        {label: '奇点文本审核', value: 'doubao-1-5-thinking-pro-250415'}
      ],
      modelOpen: false,
      loading: false,
      guideVisible: false,
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
          this.options = this.options.concat(res.data.options)
          this.model = this.options[0].value || ''
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
      }).catch((err) => {
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
      postAction('start_webui', params).then(res => {
        console.log(res)
      }).catch(err => {
        this.$alert(err,'webui模型开启失败')
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
      postAction("stop_docker_service").then((res) => {
        if (res.data.status === "success") {
          this.startWebui();
          if (this.model === 'doubao-1-5-thinking-pro-250415') {
            this.loading.close();
            this.loading = null;
            this.modelOpen = true;
            this.$message.success("模型加载成功");
            return
          }
          axios.post("http://127.0.0.1:11434/api/generate", params).then((result) => {
            if (result.data.done) {
              this.modelOpen = true;
              this.$message.success("模型加载成功");
            } else {
              this.modelOpen = false;
              this.$alert(result.data.message,'模型加载失败');
            }
            this.loading.close();
            this.loading = null;
          }).catch(error => {
            this.loading.close();
            this.loading = null;
            this.modelOpen = false;
            this.$alert(error,'模型加载错误');
          });
        } else {
          this.modelOpen = false;
          this.loading.close();
          this.loading = null;
          this.$alert('当前后台有任务在进行中，请稍后再试','模型加载失败');
        }
      }).catch((err) => {
        this.modelOpen = false;
        this.loading.close();
        this.loading = null;
        this.$alert(err,'模型加载错误');
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
              this.$alert(res.data.message,'模型卸载失败');
            }
          }).catch((err) => {
            this.modelOpen = true;
            this.$alert(err,'模型卸载错误');
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
  position: relative;
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

.guide-dialog >>> .el-dialog {
  border-radius: 10px;
}

.guide-dialog-title {
  padding: 20px 20px 10px;
  line-height: 24px;
  font-size: 18px;
  color: #303133;
  font-weight: 700;
}

.guide-dialog-body {
  padding: 10px 20px;
  max-height: calc(70vh - 120px);
  overflow-y: auto;
}

.guide-item {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.guide-index {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e5e7eb;
  line-height: 24px;
  text-align: center;
  font-size: 12px;
}

.guide-dialog >>> .el-dialog__header {
  padding: 0;
}

.guide-dialog >>> .el-dialog__close {
  color: #9ca3af;
  font-size: 24px;
}

.guide-dialog >>> .el-dialog__body {
  padding: 0;
}

.guide-dialog >>> .el-dialog__footer {
  padding: 0;
}
</style>
