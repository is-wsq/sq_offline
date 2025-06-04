<template>
  <div class="video-player-container">
    <el-card class="box-card">
      <template #header>
        <div class="clearfix">
          <span>视频播放列表</span>
          <el-button style="float: right; padding: 3px 0" type="text">
            帮助
          </el-button>
        </div>
      </template>

      <!-- 视频播放区域 -->
      <div class="video-wrapper">
        <video
            ref="videoRef"
            @ended="playNextVideo"
            @timeupdate="updateProgress"
            @loadedmetadata="updateDuration"
            controls
            autoplay
            preload="metadata"
        >
          您的浏览器不支持HTML5视频播放。
        </video>

        <!-- 视频信息 -->
        <div class="video-info">
          <el-badge :value="currentIndex + 1" class="item">
            <el-tag size="medium">{{ currentVideo?.name || '未选择视频' }}</el-tag>
          </el-badge>
          <div class="progress-container">
            <el-slider
                v-model="currentTime"
                :max="duration"
                @change="seek"
                show-tooltip
                :format-tooltip="formatTime"
                class="progress-slider"
            ></el-slider>
          </div>
          <div class="time-display">
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
          </div>
        </div>

        <!-- 播放控制 -->
        <div class="control-bar">
          <el-button-group class="btn-ground">
            <el-button @click="togglePlayPause"><i class="el-icon-video-pause" style="font-size: 18px"></i></el-button>
            <el-button @click="togglePlayPause"><i class="el-icon-video-play" style="font-size: 18px"></i></el-button>
            <el-button @click="playPreviousVideo"><i class="el-icon-arrow-left" style="font-size: 18px"></i></el-button>
            <el-button @click="playNextVideo"><i class="el-icon-arrow-right" style="font-size: 18px"></i></el-button>
          </el-button-group>

          <el-button-group class="volume-controls btn-ground">
            <el-button @click="toggleMute">
              <i :class="volume === 0 ?'el-icon-turn-off-microphone':'el-icon-microphone'" style="font-size: 18px"></i>
            </el-button>
            <el-slider
                v-model="volume"
                :max="1"
                :min="0"
                :step="0.1"
                @change="setVolume"
                show-tooltip
                :format-tooltip="formatVolume"
                class="volume-slider"
            ></el-slider>
          </el-button-group>

          <el-button-group class="btn-ground">
            <el-button @click="toggleFullScreen"><i class="el-icon-full-screen" style="font-size: 18px"></i></el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 视频列表 -->
      <div class="playlist-container">
        <el-table
            :data="videos"
            stripe
            @row-click="selectVideo"
            highlight-current-row
            :current-row-key="currentIndex"
        >
          <el-table-column prop="name" label="视频名称"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                  size="mini"
                  type="primary"
                  @click.stop="playVideoAtIndex(scope.$index)"
              >
                播放
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 视频列表数据
      videos: [
        {
          name: '示例视频1',
          url: 'http://127.0.0.1:8383/results/f2c35bcc-9773-40ca-b566-d5149f2e77cf-final.mp4'
        },
        {
          name: '示例视频2',
          url: 'http://127.0.0.1:8383/results/f4744f29-90f0-4258-8899-6018dc3ba9bb-final.mp4'
        },
        {
          name: '示例视频3',
          url: 'http://127.0.0.1:8383/results/96ba588b-800c-44e5-ae70-31821cda6db7-final.mp4'
        },
        {
          name: '示例视频4',
          url: 'http://127.0.0.1:8383/results/1747b20f-ae16-445b-831d-c40e55fddd2c-r.mp4'
        }
      ],

      // 播放器状态
      currentIndex: 0,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      isMuted: false,
      volume: 0.8
    }
  },

  computed: {
    // 获取当前视频
    currentVideo() {
      return this.videos[this.currentIndex];
    }
  },

  mounted() {
    this.loadVideo(this.currentIndex);
  },

  methods: {
    // 视频控制方法
    loadVideo(index) {
      if (index >= 0 && index < this.videos.length) {
        this.currentIndex = index;
        this.$refs.videoRef.src = this.videos[index].url;
        this.$refs.videoRef.load();
        this.playVideo();
      }
    },

    playVideo() {
      this.$refs.videoRef.play().then(() => {
        this.isPlaying = true;
      }).catch(error => {
        console.error('播放失败:', error);
        // 这里可以添加错误处理逻辑，如显示错误消息
      });
    },

    pauseVideo() {
      this.$refs.videoRef.pause();
      this.isPlaying = false;
    },

    togglePlayPause() {
      this.isPlaying ? this.pauseVideo() : this.playVideo();
    },

    playNextVideo() {
      const nextIndex = (this.currentIndex + 1) % this.videos.length;
      this.loadVideo(nextIndex);
    },

    playPreviousVideo() {
      const prevIndex = (this.currentIndex - 1 + this.videos.length) % this.videos.length;
      this.loadVideo(prevIndex);
    },

    playVideoAtIndex(index) {
      if (index !== this.currentIndex) {
        this.loadVideo(index);
      }
    },

    selectVideo(row, event, column) {
      this.playVideoAtIndex(row.index);
    },

    // 进度控制
    updateProgress() {
      this.currentTime = this.$refs.videoRef.currentTime;
    },

    seek() {
      this.$refs.videoRef.currentTime = this.currentTime;
    },

    updateDuration() {
      this.duration = this.$refs.videoRef.duration;
    },

    // 音量控制
    setVolume() {
      this.$refs.videoRef.volume = this.volume;
      this.isMuted = this.volume === 0;
    },

    toggleMute() {
      this.isMuted = !this.isMuted;
      this.$refs.videoRef.muted = this.isMuted;
      this.volume = this.isMuted ? 0 : this.volume;
    },

    // 全屏控制
    toggleFullScreen() {
      const videoElement = this.$refs.videoRef;

      if (!document.fullscreenElement) {
        if (videoElement.requestFullscreen) {
          videoElement.requestFullscreen();
        } else if (videoElement.webkitRequestFullscreen) { /* Safari */
          videoElement.webkitRequestFullscreen();
        } else if (videoElement.msRequestFullscreen) { /* IE11 */
          videoElement.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
          document.msExitFullscreen();
        }
      }
    },

    // 辅助方法
    formatTime(timeInSeconds) {
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = Math.floor(timeInSeconds % 60);
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    formatVolume(volumeValue) {
      return `${Math.round(volumeValue * 100)}%`;
    }
  }
}
</script>

<style scoped>
.video-player-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.video-wrapper {
  margin-bottom: 20px;
}

video {
  width: 100%;
  max-height: 500px;
  background-color: #000;
  border-radius: 4px;
}

.video-info {
  padding: 10px 0;
}

.progress-container {
  margin: 10px 0;
}

.progress-slider {
  width: 100%;
}

.time-display {
  text-align: right;
  font-size: 12px;
  color: #606266;
}

.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.btn-ground >>> .el-button {
  padding: 7px 10px;
}

.volume-controls {
  display: flex;
  align-items: center;
  width: 150px;
}

.volume-slider {
  flex: 1;
  margin-left: 10px;
}

.playlist-container {
  margin-top: 20px;
}
</style>