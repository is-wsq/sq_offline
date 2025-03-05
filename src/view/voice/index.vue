<template>
  <div class="voice">
    <div class="voice-content">
      <el-row :gutter="40" style="height: 100%;width: 100%;margin: 0 auto;">
        <el-col :span="12" style="height: 100%;">
          <div class="voice-type">系统音色</div>
          <div class="voice-list">
            <div class="voice-item" v-for="(item, index) in systemSounds" :key="index"
                 @contextmenu.stop="handleContextMenu(item,$event)">
              <div class="voice-icon" @click="textAudio(item)">
                <el-image style="width: 20px;height: 20px;"
                          :src="item.isPlay?'/stop.png' : '/play.png'"></el-image>
              </div>
              <div :title="item.name" class="voice-name">{{ item.name }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="12" style="height: 100%;">
          <div class="voice-type">克隆音色</div>
          <div class="voice-list">
            <div class="voice-item">
              <el-upload
                  action="http://127.0.0.1:6006/timbre/clone"
                  :show-file-list="false"
                  accept=".mp3, .wav"
                  :on-success="uploadSuccess"
                  :before-upload="beforeUpload"
              >
                <div style="display: flex;justify-content: center;align-items: center;height: 80px;">
                  <div class="voice-icon" style="background-color: pink !important;">
                    <i class="el-icon-plus" style="font-size: 15px;color: red"></i>
                  </div>
                  <div style="width: 80px;margin-left: 10px;font-size: 14px;color: #101010;text-align: left">上传音频
                  </div>
                </div>
              </el-upload>
            </div>
            <div class="voice-item" v-for="(item, index) in cloneSounds" :key="index"
                 @contextmenu.stop="handleContextMenu(item,$event)">
              <div class="voice-icon" @click="textAudio(item)">
                <el-image style="width: 20px;height: 20px;"
                          :src="item.isPlay?'/stop.png' : '/play.png'"></el-image>
              </div>
              <div :title="item.name" class="voice-name">{{ item.name }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
      <div :style="menuStyle" v-if="rightMenuVisible">
        <div class="right-item" @click="listen">
          <i class="el-icon-yangshengqi menu-icon"></i>
          <span style="margin-top: 2px">试听</span>
        </div>
        <div class="right-item" @click="rename" v-if="selectedItem.type === 'clone'">
          <i class="el-icon-edit-outline menu-icon"></i>
          <span style="margin-top: 2px">重命名</span>
        </div>
        <div class="right-item" @click="deleteItem" v-if="selectedItem.type === 'clone'">
          <i class="el-icon-delete-solid menu-icon"></i>
          <span style="margin-top: 2px">删除</span>
        </div>
      </div>
    </div>
    <el-drawer
        title="重命名音色名称"
        :visible.sync="drawer"
        direction="rtl"
    >
      <div style="width: 100%;text-align: center">
        <el-form ref="form" style="width: 70%;margin: 0 auto">
          <el-form-item label="新名称" prop="newName">
            <el-input v-model="newName" placeholder="请输入新名称"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSave">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
    <div class="voice-footer">
      请上传格式为mp3\wav的音频进行声音克隆，建议音频时长为3分钟。请在无遮挡场景进行录制，背景选取纯色无杂物最佳，面部表情丰富，适当添加无指向性手部动作。
    </div>
  </div>
</template>

<script>
import {RightMenuMixin} from "@/mixins/RightMenuMixin";
import {delAction, getAction, postAction} from "@/api/api";

export default {
  name: 'Voice',
  mixins: [RightMenuMixin],
  data() {
    return {
      figures: [],
      activeSound: {},
      sound: {},
      systemSounds: [],
      cloneSounds: [],
      audio: null,
      newName: '',
      loading: null,
      drawer: false,
      soundId: null,
    }
  },
  mounted() {
    this.querySounds();
  },
  methods: {
    querySounds() {
      getAction('timbre/query').then(res => {
        if (res.data.status === 'success') {
          this.systemSounds = [];
          this.cloneSounds = [];
          res.data.data.forEach(item => {
            item.isPlay = false;
            if (item.type === 'system') {
              this.systemSounds.push(item);
            } else {
              this.cloneSounds.push(item);
            }
          })
        } else {
          this.$message.error('获取声音列表失败。');
        }
      })
    },
    textAudio(item) {
      this.selectedItem = item;
      this.listen();
    },
    listen() {
      let voice = this.selectedItem;
      if (voice.isPlay) {
        this.audio.pause();
        this.updateStatus(voice, false);
      } else {
        this.audio = new Audio(voice.filepath);
        this.audio.play();
        this.updateStatus(voice, true);
        this.audio.onended = () => {
          this.updateStatus(voice, false);
        };
      }
    },
    updateStatus(voice, status) {
      if (voice.type === 'system') {
        let index = this.systemSounds.findIndex(item => item.id === voice.id)
        this.systemSounds[index].isPlay = status;
      } else {
        let index = this.cloneSounds.findIndex(item => item.id === voice.id)
        this.cloneSounds[index].isPlay = status;
      }
      this.$forceUpdate();
    },
    rename() {
      this.soundId = this.selectedItem.id;
      this.newName = ''
      this.drawer = true;
    },
    onSave() {
      let params = {
        id: this.soundId,
        name: this.newName,
      }
      postAction('/timbre/updateName', params).then(res => {
        if (res.data.status === 'success') {
          this.$message.success('重命名成功。');
          this.querySounds();
        } else {
          this.$message.error(res.data.message);
        }
        this.drawer = false;
      })
    },
    deleteItem() {
      delAction('/timbre/delete', {id: this.selectedItem.id}).then(res => {
        if (res.data.status === 'success') {
          this.$message.success('删除成功。');
          this.querySounds();
        } else {
          this.$message.error(res.data.message);
        }
      })
    },
    beforeUpload() {
      this.loading = this.$loading({
        lock: true,
        text: '音频上传克隆中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
    },
    uploadSuccess() {
      this.querySounds()
      this.loading.close();
      this.loading = null;
    }
  },
}
</script>

<style scoped>
.voice {
  width: 100%;
  height: 100%;
  min-height: 700px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.voice-content {
  width: calc(90% + 80px);
  height: calc(100% - 180px);
  padding: 40px;
  margin-top: 80px;
  box-sizing: border-box;
  background-color: #f5f5f5;
  border-radius: 20px;
}

.voice-type {
  height: 80px;
  line-height: 80px;
  text-align: center;
  font-size: 18px;
  color: #1E1F20;
}

.voice-list {
  width: 100%;
  height: calc(100% - 80px);
  border: 2px dashed rgba(98, 134, 237, 0.2);
  border-radius: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-auto-rows: 80px;
  gap: 10px;
  justify-items: center;
  overflow: auto;
  padding: 20px;
  box-sizing: border-box;
}

.voice-item {
  width: 150px;
  height: 80px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.active {
  background-color: #e0e7fb;
}

.voice-icon {
  width: 42px;
  height: 37px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #c7d4f8;
  border-radius: 10px
}

.voice-name {
  width: 80px;
  margin-left: 10px;
  font-size: 14px;
  color: #101010;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.clone-btn {
  width: 150px;
  height: 50px;
  font-size: 16px;
  background-color: #77C285;
  color: #fff;
  border-radius: 10px
}

.voice-footer {
  width: 80%;
  height: 80px;
  margin-top: 20px;
  color: #6D7177;
}
</style>