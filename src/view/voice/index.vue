<template>
  <div class="timbre">
    <div class="timbre-header">音色库</div>
    <div class="timbre-content">
      <div class="timbre-card">
        <div class="timbre-card-title flex-center">
          <div style="flex: 1">系统音色</div>
          <div class="flex-center">
            <div style="flex: 1"></div>
            <div class="guide" style="margin-right: 15px" @click="guideVisible = true">
              <i class="el-icon-s-opportunity" style="margin-right: 4px;"></i>
              使用指南
            </div>
          </div>
        </div>
        <div class="timbre-card-content">
          <el-row :gutter="16">
            <el-col :span="6" v-for="(item, index) in systemVoice" :key="index">
              <div class="timbre-item" :class="{'is-playing': previewTimbreId === item.id}">
                <div class="timbre-item-icon" @click="textAudio(item)">
                  <i :class="previewTimbreId === item.id ? 'el-icon-pause' : 'el-icon-play'"
                     style="font-size: 13px; color: #6286ed"></i>
                </div>
                <div :title="item.name" class="timbre-item-name">{{ item.name }}</div>
                <el-tag type="success" v-if="item.from_source === 'step-audio'">普通</el-tag>
                <el-tag type="warning" v-else>高级</el-tag>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      <div class="timbre-card margin-t-12">
        <div class="timbre-card-title">
          <div style="flex: 1">克隆音色</div>
<!--          <el-upload-->
<!--            action="http://127.0.0.1:6006/timbres/clone"-->
<!--            :show-file-list="false"-->
<!--            accept=".mp3, .wav"-->
<!--            :on-success="uploadSuccess"-->
<!--            :on-error="uploadError"-->
<!--            :before-upload="beforeUpload">-->
<!--            <el-button type="primary" icon="el-icon-upload">上传音频克隆</el-button>-->
<!--          </el-upload>-->
        </div>
        <div class="timbre-card-content">
          <el-row :gutter="16">
            <el-col :span="6">
              <el-popover
                  placement="top"
                  ref="timbreRef"
                  width="200"
                  trigger="click">
                <div style="margin-top: 5px">
                  <i class="el-icon-info" style="margin-right: 5px;color: #f90"></i>
                  请选择音色克隆类型
                </div>
                <div style="display: flex;margin-top: 10px;gap: 8px">
                  <div style="flex: 1"></div>
                  <el-button size="small" @click="advancedClone" disabled>高级音色</el-button>
                  <el-upload
                      action="http://127.0.0.1:6006/timbres/clone"
                      :show-file-list="false"
                      accept=".mp3, .wav"
                      :on-success="uploadSuccess"
                      :on-error="uploadError"
                      :before-upload="beforeUpload">
                    <el-button type="primary" size="small" @click="$refs.timbreRef.showPopper = false">普通音色</el-button>
                  </el-upload>
                </div>
                <div slot="reference" class="clone-item">
                  <div class="clone-item-icon">
                    <i class="el-icon-upload"></i>
                  </div>
                  <div class="clone-item-name">上传音频克隆</div>
                </div>
              </el-popover>
            </el-col>
            <el-col :span="6" v-for="task in processVoice" :key="task.id">
              <div class="timbre-item">
                <div class="timbre-item-icon">
                  <div class="dot-spinner">
                    <div class="dot"
                         v-for="n in 8"
                         :key="n"
                         :style="{transform: 'rotate(' + (n * 45) + 'deg) translate(0, -9px)', animationDelay: (n * 0.1) + 's'}">
                    </div>
                  </div>
                </div>
                <div :title="task.name" class="timbre-item-name">{{ task.name }}</div>
              </div>
            </el-col>
            <el-col :span="6" v-for="(item, index) in cloneVoice" :key="index">
              <div class="timbre-item" :class="{'is-playing': previewTimbreId === item.id}">
                <div class="timbre-item-icon" @click="textAudio(item)">
                  <i :class="previewTimbreId === item.id ? 'el-icon-pause' : 'el-icon-play'"
                     style="font-size: 13px; color: #6286ed"></i>
                </div>
                <div :title="item.name" class="timbre-item-name">{{ item.name }}</div>
                <el-dropdown trigger="click" @command="command => handleCommand(command, item)" class="action-dropdown">
                  <span class="el-dropdown-link">
                    <i class="el-icon-more"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="rename" style="width: 150px">
                      <i class="el-icon-edit" style="margin-right: 15px"></i>重命名
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" style="width: 150px">
                      <i class="el-icon-delete" style="margin-right: 15px"></i>删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <div class="timbre-footer">
      请上传格式为mp3\wav的音频进行声音克隆，建议音频时长为3分钟。避免采集环境噪音过大、声音失真或包含他人声音的样本，否则会影响克隆效果。
    </div>
    <el-dialog class="rename-dialog" :visible.sync="renameDialogVisible" width="600px">
      <div slot="title" class="rename-dialog-title">重命名音色</div>
      <div class="rename-dialog-body">
        <div style="margin: 10px 0 5px 0;font-size: 15px;font-weight: bold">原名称</div>
        <el-input v-model="form.original" readonly></el-input>
        <div style="margin: 10px 0 5px 0;font-size: 15px;font-weight: bold">新名称</div>
        <el-input v-model="form.name"  placeholder="请输入新名称"></el-input>
      </div>
      <div slot="footer" class="rename-dialog-footer">
        <el-button @click="renameDialogVisible = false" size="small">取消</el-button>
        <el-button type="primary" @click="sureRename" size="small">确认</el-button>
      </div>
    </el-dialog>
    <el-dialog class="guide-dialog" :visible.sync="guideVisible" width="700px">
      <div slot="title" class="guide-dialog-title">使用指南</div>
      <div class="guide-dialog-body">
        <div class="guide-item">
          <div class="guide-index">1</div>
          <div style="flex: 1">系统音色：点击播放图标按钮、右键可试听系统音色</div>
        </div>
        <div class="guide-item">
          <div class="guide-index">2</div>
          <div style="flex: 1">点击"上传音频克隆"按钮、选择音频文件，上传成功后进行后台处理，克隆对应的声音</div>
        </div>
        <div class="guide-item">
          <div class="guide-index">3</div>
          <div style="flex: 1">右键声音选择对应的功能项，如重命名、删除、试听，也可通过播放图标按钮进行试听</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {RightMenuMixin} from "@/mixins/RightMenuMixin";
import {delAction, getAction, postAction} from "@/api/api";
import {mapGetters} from "vuex";

export default {
  name: "Voice",
  mixins: [RightMenuMixin],
  data() {
    return {
      systemVoice:[],
      previewTimbreId: '',
      previewTimbrePath: '',
      audio: null,
      newName: "",
      drawer: false,
      soundId: null,
      task: {},
      renameDialogVisible: false,
      form: {
        original: '',
        name: ''
      },
      guideVisible: false,
    }
  },
  computed: {
    ...mapGetters("task", ["voiceTasks"]), // 获取任务列表
    processVoice() {
      return this.voiceTasks.filter((item) => item.status === 'pending');
    },
    cloneVoice() {
      return this.voiceTasks.filter((item) => item.type === "clone" && item.status === "success");
    }
  },
  mounted() {
    this.$store.dispatch("task/pollVoiceTasks");
    this.querySystemVoice()
  },
  beforeDestroy() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null
    }
  },
  methods: {
    advancedClone() {
      this.$refs.timbreRef.showPopper = false
      this.$alert('敬请期待','提示')
    },
    querySystemVoice() {
      getAction('/timbres/get_all_system_timbres').then(res => {
        if (res.data.status === 'success') {
          this.systemVoice = res.data.data
        }else {
          this.$message.error('查询系统音色失败')
        }
      }).catch(() => {
        this.$message.error('查询系统音色错误')
      })
    },
    textAudio(item) {
      if (this.previewTimbreId) {
        this.audio.pause();
        this.audio = null
      }
      if (this.previewTimbreId === item.id) {
        this.previewTimbreId = '';
        return
      }
      this.previewTimbreId = item.id;
      this.audio = new Audio(item.filepath);
      this.audio.play();
      this.audio.onended = () => {
        this.previewTimbreId = '';
        this.audio = null;
      };
    },
    handleCommand(command, item) {
      if (command === 'rename') {
        this.rename(item)
      } else if (command === 'delete') {
        this.deleteItem(item)
      }
    },
    rename(item) {
      this.soundId = item.id;
      this.form.original = item.name;
      this.form.name = '';
      this.renameDialogVisible = true;
    },
    sureRename() {
      let params = {
        timbre_id: this.soundId,
        name: this.form.name,
      };
      postAction("/timbres/update_name", params).then((res) => {
        if (res.data.status === "success") {
          this.$message.success("重命名成功。");
          this.$store.dispatch("task/pollVoiceTasks");
        } else {
          this.$alert(res.data.message, "重命名失败")
        }
        this.renameDialogVisible = false;
      }).catch((err) => {
        this.$alert(err, "重命名错误")
      });
    },
    deleteItem(item) {
      this.$confirm('确认删除该音色吗？', '提示', {
        type: 'warning'
      }).then(() => {
        delAction(`/timbres/${item.id}`).then((res) => {
          if (res.data.status === "success") {
            this.$message.success("删除成功。");
            this.$store.dispatch("task/pollVoiceTasks");
          } else {
            this.$alert(res.data.message, "删除失败")
          }
        }).catch((err) => {
          this.$alert(err, "删除错误")
        });
      }).catch((err) => {
        this.$message({type: 'info', message: '已取消删除'});
      });
    },
    async beforeUpload(file) {
      return getAction('/verify/activation').then(res => {
        if (res.data.status === 'success') {
          return true;
        } else {
          this.$alert(res.data.message, "验证失败");
          return Promise.reject('验证失败，停止上传');
        }
      })
    },
    uploadError(file) {
      let content = `创建${file.name}音色克隆任务失败`;
      this.$alert(content, "任务创建提醒");
    },
    uploadSuccess(res, file) {
      if (res.status === "success") {
        let content = `已创建${file.name}音色克隆任务，音色克隆成功后会自动更新音色列表`;
        this.$alert(content, "任务创建提醒");
        this.$store.dispatch("task/pollVoiceTasks");
      } else {
        let content = `创建${file.name}音色克隆任务失败，${res.data}`;
        this.$alert(content, "任务创建提醒");
      }
    },
  },
};
</script>

<style scoped>
.timbre {
  padding: 20px;
  width: 100%;
  min-width: 1000px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.timbre-header {
  font-size: 24px;
  font-weight: bold;
  color: #1D2129;
}

.timbre-card {
  height: calc(50vh - 110px);
  width: 100%;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 10px 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.timbre-card-title {
  color: #1D2129;
  font-weight: bold;
  line-height: 40px;
  display: flex;
}

.timbre-card-content {
  margin-top: 10px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.clone-item {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 12px;
  border-radius: 6px;
  transition: all 0.2s ease-in-out;
  margin-bottom: 16px;
  cursor: pointer;
  background-color: #6366fe !important;
  border-color: #DCDFE6 !important;
  color: #fff !important;
}

.timbre-item {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 12px;
  border: 1px solid #E4E7ED;
  border-radius: 6px;
  background-color: #F7F8FA;
  transition: all 0.2s ease-in-out;
  margin-bottom: 16px;
}

.timbre-item:hover,.clone-item:hover {
  background-color: #EFF5FF;
  border-color: #A0CFFF;
}

.timbre-item.is-playing {
  background-color: #EBF5FF;
  border-color: #409EFF;
}

.timbre-item-icon {
  width: 32px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #ffffff;
  border: 1px solid #DCDFE6;
  border-radius: 8px;
}

.clone-item-icon {
  width: 32px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #7893d1;
  border-radius: 8px;
  cursor: pointer;
}

.timbre-item-name {
  flex: 1;
  margin: 0 10px;
  font-size: 14px;
  color: #101010;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.clone-item-name {
  flex: 1;
  margin: 0 10px;
  font-size: 14px;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.el-dropdown-link {
  font-size: 18px;
  color: #a3a3a3;
  transform: rotate(90deg);
  display: inline-block;
  cursor: pointer;
}

.timbre-item:hover .el-dropdown-link {
  color: #409EFF;
}

.timbre-footer {
  width: 80%;
  margin: 0 auto;
  height: 50px;
  color: #6d7177;
}

.dot-spinner {
  position: relative;
  width: 24px;
  height: 24px;
}

.dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3px;
  height: 3px;
  background-color: #4c8df1;
  border-radius: 50%;
  transform-origin: 0 0;
  animation: fade 1s linear infinite;
}

@keyframes fade {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
}

.rename-dialog >>> .el-dialog {
  border-radius: 10px;
}

.rename-dialog-title {
  padding: 20px 20px 10px;
  line-height: 24px;
  font-size: 18px;
  color: #303133;
  font-weight: 700;
}

.rename-dialog-body {
  padding: 10px 20px;
}

.rename-dialog-footer {
  padding: 10px 20px 20px;
}

.rename-dialog >>> .el-dialog__header {
  padding: 0;
}

.rename-dialog >>> .el-dialog__close {
  color: #9ca3af;
  font-size: 24px;
}

.rename-dialog >>> .el-dialog__body {
  padding: 0;
}

.rename-dialog >>> .el-dialog__footer {
  padding: 0;
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
