<template>
  <div class="figures">
    <div class="figures-content">
      <div style="height: calc(100% - 50px);overflow-y: auto;">
        <el-row>
          <el-col :xl="3" :lg="4" :md="6" :sm="8" v-for="(item,index) in figures" :key="index" style="margin: 20px 0">
            <div class="figures-item" @contextmenu.stop="handleContextMenu(item,$event)">
              <el-image class="figures-img" :src="item.url" fit="cover"></el-image>
            </div>
          </el-col>
        </el-row>
      </div>
      <div style="text-align: center;margin-top: 10px">
        <el-button class="figures-btn">添加形象</el-button>
      </div>
      <el-menu :style="menuStyle" v-if="rightMenuVisible">
        <el-menu-item @click="preview">
          <i class="el-icon-view menu-icon"></i>
          <span style="margin-top: 2px">预览</span>
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
    <div class="figures-footer">
      请上传格式为mp4\xxx\xxx的视频进行形象克隆，建议视频时长为5分钟。请在无遮挡场景进行录制，确保面部清晰出镜，面部表情丰富，适当添加无指向性手部动作。
    </div>
  </div>
</template>

<script>
import {RightMenuMixin} from "@/mixins/RightMenuMixin";

export default {
  name: 'figures',
  mixins: [RightMenuMixin],
  data() {
    return {
      figures: [
        {id: 1, name: '形象1', url: '/images/1.jpg'},
        {id: 2, name: '形象2', url: '/images/4.jpg'},
        {id: 3, name: '形象3', url: '/images/7.jpg'},
        {id: 4, name: '形象4', url: '/images/11.jpg'},
        {id: 5, name: '形象5', url: '/images/12.jpg'},
        {id: 6, name: '形象6', url: '/images/13.jpg'},
        {id: 7, name: '形象7', url: '/images/16.jpg'},
        {id: 8, name: '形象8', url: '/images/20.jpg'},
      ],
    }
  },
  methods: {
    preview() {
      console.log(this.selectedItem)
    },
    rename() {
      console.log(this.selectedItem)
    },
    deleteItem() {
      console.log(this.selectedItem)
    }
  }
}
</script>

<style scoped>
.figures {
  width: 100%;
  height: 100%;
  min-height: 700px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.figures-content {
  width: calc(90% + 80px);
  height: calc(100% - 180px);
  padding: 40px;
  margin-top: 80px;
  box-sizing: border-box;
  background-color: #f5f5f5;
  border-radius: 20px;
}

.figures-item {
  margin: 0 auto
}

.figures-img {
  width: 150px;
  height: 150px;
  border-radius: 20px;
}

.figures-btn {
  background-color: #6286ED;
  color: #fff;
}

.figures-footer {
  width: 80%;
  height: 80px;
  margin-top: 20px;
  color: #6D7177;
}
</style>

