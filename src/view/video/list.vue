<template>
  <div class="video-list">
    <div class="list-content">
      <div v-for="item in processList" :key="item.id" style="text-align: center">
        <div class="image-wrapper shining">
          <el-image style="width: 100%;height: 100%;border-radius: 8px;filter: blur(15px);opacity: 0.8"
                    :src="require('/public/images/4.jpg')" fit="contain"></el-image>
          <div class="video-item-info">
            <div :title="item.filename" class="video-name">{{ item.filename }}</div>
          </div>

          <div class="shine-layer"></div>
          <div class="list-progress">
            <div>视频生成中</div>
            <div style="width: 10px;text-align: left;margin-left: 5px;font-size: 22px">{{ dot }}</div>
          </div>
        </div>
      </div>
      <div class="video-list-item"
           v-for="item in videoList"
           :key="item.id"
           :class="{'activeClass': item.id === selected.id}"
           @contextmenu.stop="handleContextMenu(item, $event)"
           @click="preview(item)"
           @mouseleave="hover_id = null"
           @mouseenter="hover_id = item.id">
        <video class="video-item-file" :src="item.video_path" loop muted autoplay v-if="item.id === hover_id"></video>
        <el-image class="video-item-file" :src="item.picture" fit="cover" lazy v-else></el-image>
        <div class="video-item-info">
          <div :title="item.filename" class="video-name" v-if="editId !== item.id">{{ item.filename }}</div>
          <div v-else style="flex: 1" @click.stop="">
            <el-input :ref="'renameInput_' + item.id" style="width: 100%" v-model="newName" @change="onSave(item)"
                      @blur="onBlur(item)"></el-input>
          </div>
          <div class="more-btn" @click.stop="">
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
                <el-dropdown-item command="download" style="width: 150px">
                  <i class="el-icon-download" style="margin-right: 15px"></i>另存为
                </el-dropdown-item>
                <el-dropdown-item command="document" style="width: 150px">
                  <i class="el-icon-document" style="margin-right: 15px"></i>日志
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </div>
      <el-dialog class="preview-dialog" :visible.sync="dialogVisible" :before-close="beforeClose" width="390px">
        <div style="width: 100%;text-align: center;position: relative">
          <video style="border-radius: 10px;width: calc(100% - 40px);object-fit: cover"
                 ref="video" :src="src" @ended="isPlaying = false">
          </video>
          <div style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">
            <i class="el-icon-play control-icon" @click="controlVideo" v-if="!isPlaying"></i>
          </div>
        </div>
      </el-dialog>
      <el-dialog class="log-dialog" :visible.sync="logDialogVisible" top="10vh" width="900px" :before-close="logClose">
        <div slot="title" class="log-dialog-title" @mousedown.stop="">视频生成日志</div>
        <div class="log-dialog-body">
          <el-descriptions title="基础信息" :column="2" border :labelStyle="{'width': '120px','text-align': 'center'}">
            <el-descriptions-item label="开始生成时间" :contentStyle="{'width': '307px'}">
              {{ logInfo.created_at || '' }}
            </el-descriptions-item>
            <el-descriptions-item label="完成时间" :contentStyle="{'width': '307px'}">
              {{ logInfo.finished_at || '' }}
            </el-descriptions-item>
            <el-descriptions-item label="文案标题" :span="2">
              {{ logInfo.title }}
            </el-descriptions-item>
            <el-descriptions-item label="视频时长" :contentStyle="{'width': '307px'}">
              {{ logInfo.duration ? logInfo.duration.toFixed(2) + 's' : '' }}
            </el-descriptions-item>
            <el-descriptions-item label="背景音乐" :contentStyle="{'width': '307px'}">
              <div v-if="!logInfo.bgm_path">
                无
              </div>
              <div style="display: flex;align-items: center;gap: 15px" v-else>
                <div class="timbre-item-icon" @click="previewBgm(logInfo.bgm_path)">
                  <i :class="audioPlaying ? 'el-icon-pause' : 'el-icon-play'"
                     style="font-size: 13px; color: #6286ed"></i>
                </div>
                <div class="timbre-item-name">{{ logInfo.bgm_name }}</div>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="文案内容" :span="2">
              {{ logInfo.content ? logInfo.content : '无文案' }}
            </el-descriptions-item>
            <el-descriptions-item label="文案要求" :span="2">
              {{ logInfo.copy_request }}
            </el-descriptions-item>
            <el-descriptions-item label="混剪要求" :span="2">
              {{ logInfo.user_request }}
            </el-descriptions-item>
          </el-descriptions>
          <el-divider content-position="left">分镜组混剪信息</el-divider>

          <div class="group-card">
            <div class="group-title" :title="logInfo.title">{{ logInfo.title }}</div>
            <div class="group-content" :title="logInfo.content" v-if="logInfo.content">
              {{ logInfo.content }}
            </div>
            <div class="group-content" style="display: flex;gap: 2px" v-else>
              <i class="el-icon-wuneirong" style="line-height: 21px"></i>
              <div style="line-height: 21px">无文案</div>
              <div style="margin: 0 5px;line-height: 18px">|</div>
              <i class="el-icon-time" style="line-height: 21px"></i>
              <div style="line-height: 21px">{{ logInfo.duration + 's' }}</div>
            </div>
            <div class="groups-segment" v-if="logInfo.video_data">
              <div class="group-segment" v-for="(group,group_index) in logInfo.video_data.segment_group"
                   :key="group_index">
                <div class="segment-title"
                     :style="{ width: ((group.materials.length - 1) * 100 + 80) + 'px' }"
                     :title="group.contentSummary">
                  {{ group.contentSummary }}
                </div>
                <div class="material-list">
                  <div class="material-item" v-for="(material,material_index) in group.materials"
                       :key="material_index" @click="previewMaterial(material)">
                    <el-image class="material-item-img" :src="material.picture"></el-image>
                    <div class="material-item-title" :title="material.name">{{ material.name }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!--          <el-table :data="logInfo.video_data.segment_group" row-key="groupId" style="width: 100%"-->
          <!--                    border v-if="logInfo.video_data" :expanded-row-keys="expandedRowKeys">-->
          <!--            <el-table-column type="expand">-->
          <!--              <template slot-scope="props">-->
          <!--                <div style="padding: 10px 20px;">-->
          <!--                  <p><strong>分镜组描述:</strong> {{ props.row.contentSummary }}</p>-->
          <!--                  <p><strong>素材匹配:</strong></p>-->
          <!--                  <ul>-->
          <!--                    <li v-for="material in props.row.materials" :key="material.id" style="height: 30px;line-height: 30px">-->
          <!--                      <div style="display: flex">-->
          <!--                        <div class="material-name" @click="previewMaterial(material)">{{ material.name }}</div>-->
          <!--                        <div>- 时长: {{ material.duration }}s</div>-->
          <!--                      </div>-->
          <!--                    </li>-->
          <!--                  </ul>-->
          <!--                </div>-->
          <!--              </template>-->
          <!--            </el-table-column>-->
          <!--            <el-table-column label="分镜组类型">-->
          <!--              <template slot-scope="scope">-->
          <!--                {{ scope.row.groupType === 'material_clips' ? '素材':'数字人' }}-->
          <!--              </template>-->
          <!--            </el-table-column>-->
          <!--            <el-table-column label="匹配素材数">-->
          <!--              <template slot-scope="scope">{{ scope.row.materials.length }}</template>-->
          <!--            </el-table-column>-->
          <!--            <el-table-column label="分镜组时长(s)" prop="groupDuration"></el-table-column>-->
          <!--          </el-table>-->
          <el-divider content-position="left">LLM 思考过程</el-divider>
          <el-collapse v-model="activeCollapse">
            <el-collapse-item title="LLM 分析" name="1">
              <div class="llm-thought-process">{{ logInfo.reason }}</div>
            </el-collapse-item>
          </el-collapse>
        </div>
        <div slot="footer" class="log-dialog-footer"></div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {RightMenuMixin} from "@/mixins/RightMenuMixin";
import {mapGetters} from "vuex";
import {delAction, getAction, postAction} from "@/api/api";

export default {
  mixins: [RightMenuMixin],
  data() {
    return {
      keyword: '',
      filterProcess: [],
      dotCount: 1,
      dotTimer: null,
      dot: '.',
      selected: {},
      newName: '',
      videoId: '',
      dialogVisible: false,
      src: "",
      aspectRatio: 0,
      isPlaying: false,
      downloadFilePath: '',
      downloadFileName: '',
      selectedId: '',
      inputFocus: false,
      videoList: [],
      hover_id: null,
      editId: '',
      logDialogVisible: false,
      logInfo: {},
      expandedRowKeys: [],
      activeCollapse: '',
      audioPlaying: false,
      audio: null,
    }
  },
  computed: {
    ...mapGetters("task", ["videoTasks"]),
    processList() {
      return this.videoTasks.filter((item) => item.status === 'pending');
    },
    videos() {
      return this.videoTasks.reduce((acc, item) => {
        if (item.status === 'success') {
          acc.push({...item, isEdit: false});
        }
        return acc;
      }, []);
    },
  },
  watch: {
    videos: function (newVal, oldVal) {
      this.videoList = newVal
    }
  },
  mounted() {
    this.startDotAnimation();
    this.$store.dispatch("task/pollVideoTasks")
  },
  methods: {
    startDotAnimation() {
      this.dotTimer = setInterval(() => {
        this.dotCount = this.dotCount % 3 + 1;
        this.dot = '.'.repeat(this.dotCount);
      }, 1000);
    },
    handleCommand(command, item) {
      if (command === 'rename') {
        this.editId = item.id
        this.rename(item)
      } else if (command === 'delete') {
        this.deleteVideo(item)
      } else if (command === 'download') {
        this.downloadVideo(item)
      } else if (command === 'document') {
        this.viewLog(item)
      }
    },
    deleteVideo(item) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        delAction(`/video_record/delete/${item.id}`).then(res => {
          if (res.data.status === 'success') {
            this.$message.success('删除成功');
            this.$store.dispatch("task/pollVideoTasks")
          } else {
            this.$alert(res.data.message, '删除提示');
          }
        })
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    async downloadVideo(item) {
      let self = this
      window.electronAPI.selectFolder().then((path) => {
        if (path) {
          window.electronAPI.downloadFile(item.video_path, path, item.filename)
          self.$message.success(`视频已另存为${path}`)
        }
      })
    },
    rename(item) {
      this.newName = item.filename;
      this.videoId = item.id;

      this.$nextTick(() => {
        const inputRefs = this.$refs[`renameInput_${item.id}`];
        if (inputRefs && inputRefs.length > 0) {
          const input = inputRefs[0];
          input.focus();
          // 可选：全选内容
          // input.select();
        } else {
          console.warn('未找到对应的输入框 ref', item.id);
        }
      });
    },
    onBlur() {
      this.editId = ''
    },
    onSave(item) {
      if (this.newName === item.filename) {
        this.editId = ''
        return
      }
      let params = {
        id: this.videoId,
        name: this.newName,
      };
      postAction("/video_record/update_name", params).then((res) => {
        if (res.data.status === "success") {
          this.$message.success("重命名成功");
          this.$store.dispatch("task/pollVideoTasks")
        } else {
          this.$alert(res.data.message, '重命名提示');
        }
        this.editId = ''
      }).catch((err) => {
        this.$message.error("重命名失败，请稍后重试！");
      });
    },
    viewLog(item) {
      console.log(item)
      this.logInfo = item.details
      this.logDialogVisible = true;
    },
    checkAspectRatio() {
      const video = this.$refs.video;
      const width = video.videoWidth;
      const height = video.videoHeight;
      this.aspectRatio = width / height
    },
    preview(item) {
      this.src = item.video_path;
      this.dialogVisible = true;
    },
    previewMaterial(material) {
      this.src = material.filepath;
      this.dialogVisible = true;
    },
    previewBgm(bgm_path) {
      if (this.audioPlaying) {
        this.pauseBgm()
        return
      }
      this.pauseBgm()
      setTimeout(() => {
        this.audio = new Audio(bgm_path)
        this.audio.play()
        this.audioPlaying = true
        this.audio.onended = () => {
          this.audio = null;
          this.audioPlaying = false;
        };
      }, 100);
    },
    pauseBgm() {
      if (this.audioPlaying) {
        this.audio.pause();
        this.audio = null;
        this.audioPlaying = false;
      }
    },
    logClose() {
      this.pauseBgm()
      this.logDialogVisible = false;
    },
    controlVideo() {
      const video = this.$refs.video;
      if (this.isPlaying) {
        video.pause();
        this.isPlaying = false;
      } else {
        video.play();
        this.isPlaying = true;
      }
    },
    beforeClose() {
      this.isPlaying = false;
      const video = this.$refs.video;
      video.pause();
      this.dialogVisible = false;
    },
  },
  beforeDestroy() {
    clearInterval(this.dotTimer);
  }
}

</script>

<style scoped>
.video-list {
  width: 100%;
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
  min-height: 800px;
}

.list-search {
  text-align: center;
}

.list-search-input {
  width: 33.33%;
}

.list-search >>> .el-input__icon {
  line-height: 42px;
  font-size: 20px;
}

.list-search >>> .el-input__inner {
  height: 42px;
  line-height: 42px;
  border-radius: 21px;
  background-color: #FFFFFF;
  border: 1px solid #D1D5DB;
  font-size: 16px;
  padding-left: 40px;
}

.list-content {
  height: calc(100% - 63px);
  padding: 10px;
  margin-top: 20px;
  box-sizing: border-box;
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  grid-auto-rows: min-content;
  overflow: auto;
}

.video-list-item {
  aspect-ratio: 9 / 16;
  position: relative;
  display: flex;
  justify-content: center;
}

.video-list-item:hover {
  transform: scale(1.05);
}

.list-progress {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.video-item-file {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.video-item-info {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
  padding: 10px 5px 10px 10px;
  box-sizing: border-box;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  display: flex;
  align-items: end;
}


.video-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  color: #FFFFFF;
  font-size: 15px;
}

.video-list-item >>> .el-input__inner {
  -webkit-appearance: none;
  background-color: #1e1f20;
  background-image: none;
  border-radius: 4px;
  border: 2px solid #4c8df1;
  box-sizing: border-box;
  color: #ffffff;
  display: inline-block;
  height: 30px;
  line-height: 30px;
  outline: 0;
  padding: 0 15px;
  transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
  width: 100%;
}

.more-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  padding: 0;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}

.more-btn:hover {
  background-color: rgba(0, 0, 0, 1);
  color: #FFFFFF;
}

.more-btn-item {
  height: 40px;
  line-height: 40px;
  border-radius: 5px;
  padding-left: 10px
}

.more-btn-item:hover {
  background-color: #1890ff !important;
  color: #fff !important;
}

.menu-icon-more {
  margin-left: 10px;
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
}

.activeClass {
  border: 1px solid #6286ED;
}

.preview-dialog >>> .el-dialog {
  background-color: #79777700 !important;
  box-shadow: none !important;
  margin: 0 auto;
  aspect-ratio: 9 / 16;
}

.preview-dialog >>> .el-dialog__body {
  padding: 10px 35px;
}

.preview-dialog >>> .el-dialog__headerbtn .el-dialog__close {
  font-size: 24px;
  color: #d3d2d2;
}

.control-icon {
  font-size: 30px;
  color: #fff;
  cursor: pointer;
  filter: drop-shadow(0px 0px 10px #292929);
}

.el-dropdown-link {
  font-size: 16px;
  color: #dfdede;
  transform: rotate(90deg);
  display: inline-block;
}

.more-btn:hover .el-dropdown-link {
  color: #409EFF;
}

.log-dialog >>> .el-dialog {
  border-radius: 10px;
}

.log-dialog-title {
  padding: 20px 20px 10px;
  line-height: 24px;
  font-size: 18px;
  color: #303133;
  font-weight: 700;
}

.log-dialog-body {
  padding: 10px 20px;
  height: calc(80vh - 75px);
  overflow-y: auto;
}

.log-dialog-body::-webkit-scrollbar {
  width: 5px !important;
}

.log-dialog-footer {
  padding-top: 10px;
}

.log-dialog >>> .el-dialog__header {
  padding: 0;
}

.log-dialog >>> .el-dialog__close {
  color: #9ca3af;
  font-size: 24px;
}

.log-dialog >>> .el-dialog__body {
  padding: 0;
}

.log-dialog >>> .el-dialog__footer {
  padding: 0;
}

.llm-thought-process {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  white-space: pre-wrap; /* 保留换行和空格 */
  word-wrap: break-word;
}

.material-name {
  color: #409EFF;
  margin-right: 5px;
  cursor: pointer;
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

.timbre-item-name {
  flex: 1;
}

.group-card {
  width: 100%;
  box-sizing: border-box;
  color: #1f2937;
  cursor: pointer;
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
  position: relative;
  background: linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%) !important;
  border-color: #8b5cf6 !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(139, 92, 246, 0.15) !important;
}

.group-title {
  width: 100%;
  line-height: 28px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1e293b;
  font-size: 16px;
  font-weight: 600;
}

.group-content {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
}

.groups-segment {
  margin-top: 12px;
  display: flex;
  flex-direction: row;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 12px;
}

.group-segment {
  flex-shrink: 0;
  background-color: #f8fafc;
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.segment-title {
  font-size: 13px;
  font-weight: 500;
  color: #4338ca;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.material-list {
  display: flex;
  gap: 20px;
}

.material-item {
  position: relative;
  width: 80px;
  display: flex;
  aspect-ratio: 9 / 16;
  border-radius: 5px;
  flex-shrink: 0;
}

.material-item-img {
  width: 100%;
  height: 100%;
  border-radius: 5px;
}

.material-item-title {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
  padding: 10px 2px;
  box-sizing: border-box;
  color: #FFFFFF;
  font-size: 12px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>