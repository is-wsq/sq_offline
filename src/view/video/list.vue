<template>
  <div class="video-list">
    <div style="flex: 1;"></div>
    <div class="list-content">
      <div v-for="item in videoTasks" :key="item.id" style="text-align: center">
        <div class="image-wrapper shining">
          <el-image
            style="width: 180px; height: 240px; border-radius: 12px;filter: blur(15px);opacity: 0.8"
            :src="require('/public/images/4.jpg')"
            fit="cover"
          ></el-image>
          <div class="shine-layer"></div>
          <div class="list-progress">
            <div>视频生成中</div>
            <div style="width: 10px;text-align: left;margin-left: 5px;font-size: 22px">{{ dot }}</div>
          </div>
        </div>
        <div style="display: flex;align-items: center;justify-content: center;margin-top: 5px">
          {{ item.name }}
<!--          <div>视频生成中</div>-->
<!--          <div style="width: 10px;text-align: left;margin-left: 5px;font-size: 20px">{{ dot }}</div>-->
        </div>
      </div>
      <div style="text-align: center;border-radius: 12px;padding: 5px 0" v-for="item in videoList" :key="item.id"
           :class="{'activeClass': item.id === selected.id}" @click="selectItem(item)">
        <el-image style="width: 180px;height: 240px;border-radius: 12px" :src="item.picture" fit="cover"></el-image>
        <div style="margin-top: 5px;color: #1E1F20">{{ item.filename }}</div>
      </div>
    </div>
    <div style="flex: 1;">
<!--      <el-button type="primary" style="width: 124px;margin-top: 40px;" @click="isManage = true" v-if="!isManage">管理</el-button>-->
<!--      <template v-else>-->
        <el-button type="danger" style="width: 124px;margin-top: 40px;" @click="deleteVideo">删除</el-button>
        <el-button type="primary" style="width: 124px;margin-top: 40px;margin-left: 50px;" @click="downloadVideo">下载</el-button>
<!--      </template>-->
    </div>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import {delAction, getAction} from "@/api/api";
import axios from "axios";

export default {
  data() {
    return {
      videoList: [
        { id: 1, picture: '', filename: '视频1' },
        { id: 2, picture: '', filename: '视频2' },
        { id: 3, picture: '', filename: '视频3' },
      ],
      dotCount: 1,
      dotTimer: null,
      dot: '.',
      selected: {},
      isManage: false,
    }
  },
  computed: {
    ...mapGetters("task", ["allTasks"]), // 获取任务列表
    videoTasks() {
      return this.allTasks.filter((item) => item.type === "video");
    },
  },
  watch: {
    videoTasks: {
      handler() {
        this.queryVideos();
      },
      deep: true,
    },
  },
  mounted() {
    this.startDotAnimation();
    this.queryVideos();
  },
  methods: {
    startDotAnimation() {
      this.dotTimer = setInterval(() => {
        this.dotCount = this.dotCount % 3 + 1;
        this.dot = '.'.repeat(this.dotCount);
      }, 1000);
    },
    queryVideos() {
      getAction('/video_record/query').then(res => {
        if (res.data.status === 'success') {
          this.videoList = res.data.data;
        }else {
          this.$message.error(res.data.message);
        }
      }).catch(err => {
        console.log(err)
      })
    },
    selectItem(item) {
      // if (!this.isManage)
      //   return;
      this.selected = item;
    },
    deleteVideo() {
      if (!this.selected.id) {
        this.$message.error('请先选择要删除的视频');
        return;
      }
      delAction(`/video_record/delete/${this.selected.id}`).then(res => {
        if (res.data.status ==='success') {
          this.$message.success('删除成功');
          this.queryVideos();
          this.isManage = false;
          this.selected = {};
        } else {
          this.$message.error(res.data.message);
        }
      })
    },
    async downloadVideo() {
      if (!this.selected.id) {
        this.$message.error('请先选择要下载的视频');
        return;
      }
      let downloadPath = localStorage.getItem('downloadPath') || 'D:\\Downloads'
      // let path = this.selected.video_path.replace('127.0.0.1', '192.168.0.122')
      window.electronAPI.downloadFile(this.selected.video_path, downloadPath)
      console.log(res)
      // this.$notify({
      //
      // })
      // if (!this.selected.id) {
      //   this.$message.error('请先选择要下载的视频');
      //   return;
      // }
      // let path = this.selected.video_path
      // try {
      //   const response = await axios.get(path, {
      //     responseType: "blob", // 重要，确保获取二进制数据
      //   });
      //
      //   // 创建 Blob 对象
      //   const blob = new Blob([response.data], { type: "video/mp4" });
      //   const blobUrl = window.URL.createObjectURL(blob);
      //
      //   // 创建下载链接
      //   const a = document.createElement("a");
      //   a.href = blobUrl;
      //   a.download = path.split("/").pop(); // 自定义下载文件名
      //   document.body.appendChild(a);
      //   a.click();
      //
      //   // 清理 URL 对象
      //   window.URL.revokeObjectURL(blobUrl);
      //   document.body.removeChild(a);
      //   this.isManage = false;
      //   this.selected = {};
      // } catch (error) {
      //   this.$message.error("下载视频失败");
      //   console.error("下载视频失败:", error);
      // }
    }
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
  min-height: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.list-content {
  width: 90%;
  height: calc(100% - 200px);
  padding: 40px;
  box-sizing: border-box;
  background-color: #f5f5f5;
  border-radius: 20px;
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  grid-auto-rows: 280px;
  overflow: auto;
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

.activeClass {
  border: 1px solid #6286ED;
}
</style>