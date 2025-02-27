<template>
  <div class="voice">
    <div class="voice-content">
      <el-row :gutter="40" style="height: 100%;width: 100%;margin: 0 auto;">
        <el-col :span="12" style="height: 100%;">
          <div class="voice-type">系统音色</div>
          <div class="voice-list">
            <div class="voice-item" v-for="(item, index) in systemSounds" :key="index"
                 :class="{'active': item.code === selectSound.code}"
                 @click="selectSound = item">
              <div class="voice-icon">
                <el-image style="width: 20px;height: 20px;"
                          :src="require(item.isPlay?'/public/pause.png' : '/public/play.png')"></el-image>
              </div>
              <div style="width: 70px;margin-left: 10px;font-size: 14px;color: #101010">{{ item.name }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="12" style="height: 100%;">
          <div class="voice-type">克隆音色</div>
          <div class="voice-list">
            <div class="voice-item">
              <el-upload
                  action="https://live.tellai.tech/api/dhuman_live/upload/audio"
                  :show-file-list="false"
                  accept=".mp3, .wav"
              >
                <div style="display: flex;justify-content: center;align-items: center;height: 80px;">
                  <div class="voice-icon">
                    <i class="el-icon-plus" style="font-size: 15px;color: #6a8cee"></i>
                  </div>
                  <div style="width: 70px;margin-left: 10px;font-size: 14px;color: #101010;text-align: left">上传音频
                  </div>
                </div>
              </el-upload>
            </div>
            <div class="voice-item" v-for="(item, index) in cloneSounds" :key="index"
                 :class="{'active': item.code === selectSound.code}"
                 @click="selectSound = item" @contextmenu.stop="handleContextMenu(item,$event)">
              <div class="voice-icon">
                <el-image style="width: 20px;height: 20px;"
                          :src="item.isPlay?'/pause.png' : '/play.png'"></el-image>
              </div>
              <div style="width: 70px;margin-left: 10px;font-size: 14px;color: #101010">{{ item.name }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-menu :style="menuStyle" v-if="rightMenuVisible">
        <el-menu-item @click="listen">
          <i class="el-icon-yangshengqi menu-icon"></i>
          <span style="margin-top: 2px">试听</span>
        </el-menu-item>
        <el-menu-item @click="rename">
          <i class="el-icon-edit-outline menu-icon"></i>
          <span style="margin-top: 2px">重命名</span>
        </el-menu-item>
        <el-menu-item @click="deleteItem">
          <i class="el-icon-delete-solid menu-icon"></i>
          <span style="margin-top: 2px">删除</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="voice-footer">
      请上传格式为mp3\xxx\xxx的音频进行声音克隆，建议音频时长为3分钟。请在无遮挡场景进行录制，背景选取纯色无杂物最佳，面部表情丰富，适当添加无指向性手部动作。
    </div>
  </div>
</template>

<script>
import {RightMenuMixin} from "@/mixins/RightMenuMixin";

export default {
  name: 'Voice',
  mixins: [RightMenuMixin],
  data() {
    return {
      figures: [],
      selectSound: {},
      sound: {},
      systemSounds: [
        {id: 1, name: '女声', code: 'xiaoyan', isPlay: false},
        {id: 1, name: '女声', code: 'xiaoyan', isPlay: false},
        {id: 1, name: '女声', code: 'xiaoyan', isPlay: false},
        {id: 1, name: '女声', code: 'xiaoyan', isPlay: false},
        {id: 1, name: '女声', code: 'xiaoyan', isPlay: false},
        {id: 1, name: '女声', code: 'xiaoyan', isPlay: false},
        {id: 1, name: '女声', code: 'xiaoyan', isPlay: false},
        {id: 1, name: '女声', code: 'xiaoyan', isPlay: false},
        {id: 1, name: '女声', code: 'xiaoyan', isPlay: false},
        {id: 1, name: '女声', code: 'xiaoyan', isPlay: false},
        {id: 1, name: '女声', code: 'xiaoyan', isPlay: false},
      ],
      cloneSounds: [
        {id: 1, name: '男声', code: 'xiaoyan', isPlay: false},
        {id: 1, name: '男声', code: 'xiaoyan', isPlay: false},
        {id: 1, name: '男声', code: 'xiaoyan', isPlay: false},
        {id: 1, name: '男声', code: 'xiaoyan', isPlay: false},
        {id: 1, name: '男声', code: 'xiaoyan', isPlay: false},
        {id: 1, name: '男声', code: 'xiaoyan', isPlay: false},
        {id: 1, name: '男声', code: 'xiaoyan', isPlay: false},
        {id: 1, name: '男声', code: 'xiaoyan', isPlay: false},
        {id: 1, name: '男声', code: 'xiaoyan', isPlay: false},
        {id: 1, name: '男声', code: 'xiaoyan', isPlay: false},
      ],
      isPlay: false,
    }
  },
  methods: {
    listen() {
      console.log(this.selectedItem)
    },
    rename() {
      console.log(this.selectedItem)
    },
    deleteItem() {
      console.log(this.selectedItem)
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