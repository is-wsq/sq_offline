<template>
  <div class="video-player-container">
    <div class="video-wrapper">
      <video
          ref="video"
          @timeupdate="updateProgress"
          @ended="handleEnd"
          controls
      ></video>
    </div>

    <div class="controls">
      <div class="progress-bar" @click="seek">
        <div class="progress-filled" :style="{ width: progress + '%' }"></div>
        <div class="progress-handle" :style="{ left: progress + '%' }"></div>
      </div>

      <div class="control-buttons">
        <button @click="togglePlay">{{ playing ? '暂停' : '播放' }}</button>
        <span>{{ formatTime(currentTime) }} / {{ formatTime(totalDuration) }}</span>

        <div class="speed-controls">
          <select v-model="playbackRate" @change="setPlaybackRate">
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
      </div>
    </div>

    <div class="playlist">
      <h3>播放列表</h3>
      <ul>
        <li
            v-for="(video, index) in videoList"
            :key="index"
            :class="{ active: currentVideoIndex === index }"
            @click="seekToVideo(index)"
        >
          {{ video.name || `视频 ${index + 1}` }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoPlayer',
  data() {
    return {
      videoList: [
        { url: "https://samplelib.com/lib/preview/webm/sample-15s.webm", name: '示例视频1', duration: 0 },
        { url: "https://filesamples.com/samples/video/webm/sample_640x360.webm", name: '示例视频2', duration: 0 }
      ],
      mediaSource: null,
      sourceBuffer: null,
      isReady: false,
      playing: false,
      progress: 0,
      currentTime: 0,
      totalDuration: 0,
      currentVideoIndex: 0,
      playbackRate: 1,
      videoDurations: [],
      videoStartTimes: [],
      isAppending: false
    }
  },
  mounted() {
    this.initMediaSource();
  },
  beforeDestroy() {
    if (this.mediaSource) {
      this.mediaSource.endOfStream();
      this.mediaSource = null;
    }
  },
  methods: {
    initMediaSource() {
      if ('MediaSource' in window) {
        this.mediaSource = new MediaSource();
        this.$refs.video.src = URL.createObjectURL(this.mediaSource);

        this.mediaSource.addEventListener('sourceopen', this.onSourceOpen);
        this.mediaSource.addEventListener('sourceended', this.onSourceEnded);
        this.mediaSource.addEventListener('sourceclose', this.onSourceClosed);
      } else {
        console.error('你的浏览器不支持 Media Source Extensions API');
        alert('你的浏览器不支持无缝视频播放功能');
      }
    },

    async onSourceOpen() {
      try {
        // 获取第一个视频的内容类型
        const firstVideoUrl = this.videoList[0].url;
        const response = await fetch(firstVideoUrl);
        const contentType = response.headers.get('Content-Type');

        // 创建 SourceBuffer
        this.sourceBuffer = this.mediaSource.addSourceBuffer(contentType);
        this.sourceBuffer.mode = 'sequence';

        // 监听 SourceBuffer 更新事件
        this.sourceBuffer.addEventListener('updatestart', () => {
          this.isAppending = true;
        });

        this.sourceBuffer.addEventListener('updateend', () => {
          this.isAppending = false;

          // 如果还有视频需要添加，继续添加
          if (this.currentVideoIndex < this.videoList.length - 1) {
            this.appendNextVideo();
          }
        });

        // 开始添加第一个视频
        this.appendVideo(this.currentVideoIndex);

      } catch (error) {
        console.error('初始化 MediaSource 时出错:', error);
      }
    },

    async appendVideo(index) {
      if (index >= this.videoList.length || this.isAppending) return;

      try {
        this.currentVideoIndex = index;
        const videoUrl = this.videoList[index].url;

        // 加载视频
        const response = await fetch(videoUrl);
        const arrayBuffer = await response.arrayBuffer();

        // 存储视频时长
        const video = document.createElement('video');
        video.src = videoUrl;

        await new Promise(resolve => {
          video.onloadedmetadata = () => {
            this.videoDurations[index] = video.duration;
            resolve();
          };
        });

        // 计算总时长
        this.calculateTotalDuration();

        // 添加到 SourceBuffer
        if (!this.sourceBuffer.updating) {
          this.sourceBuffer.appendBuffer(arrayBuffer);
        }

      } catch (error) {
        console.error('添加视频时出错:', error);
      }
    },

    async appendNextVideo() {
      if (this.currentVideoIndex < this.videoList.length - 1) {
        await this.appendVideo(this.currentVideoIndex + 1);
      } else {
        // 所有视频都已添加，结束流
        if (this.mediaSource.readyState === 'open') {
          this.mediaSource.endOfStream();
        }
      }
    },

    calculateTotalDuration() {
      this.totalDuration = this.videoDurations.reduce((total, duration) => total + (duration || 0), 0);

      // 计算每个视频的开始时间点
      this.videoStartTimes = [0];
      for (let i = 1; i < this.videoDurations.length; i++) {
        this.videoStartTimes[i] = this.videoStartTimes[i - 1] + (this.videoDurations[i - 1] || 0);
      }
    },

    togglePlay() {
      if (this.$refs.video.paused) {
        this.$refs.video.play();
        this.playing = true;
      } else {
        this.$refs.video.pause();
        this.playing = false;
      }
    },

    updateProgress() {
      this.currentTime = this.$refs.video.currentTime;
      this.progress = (this.currentTime / this.totalDuration) * 100;
    },

    seek(e) {
      const scrubTime = (e.offsetX / e.target.offsetWidth) * this.totalDuration;
      this.$refs.video.currentTime = scrubTime;
    },

    seekToVideo(index) {
      if (index < 0 || index >= this.videoList.length) return;

      const seekTime = this.videoStartTimes[index];
      this.$refs.video.currentTime = seekTime;

      if (!this.playing) {
        this.togglePlay();
      }
    },

    setPlaybackRate() {
      this.$refs.video.playbackRate = this.playbackRate;
    },

    handleEnd() {
      this.playing = false;
    },

    onSourceEnded() {
      console.log('MediaSource 流已结束');
    },

    onSourceClosed() {
      console.log('MediaSource 已关闭');
    },

    formatTime(seconds) {
      if (isNaN(seconds)) return '00:00';
      const minutes = Math.floor(seconds / 60);
      seconds = Math.floor(seconds % 60);
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }
}
</script>

<style scoped>
/* 样式保持不变，与之前版本相同 */
.video-player-container {
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 比例 */
}

video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
}

.controls {
  padding: 10px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 10px;
}

.progress-bar {
  height: 5px;
  background: #ddd;
  cursor: pointer;
  position: relative;
}

.progress-filled {
  height: 100%;
  background: #2196F3;
  width: 0%;
  transition: width 0.1s linear;
}

.progress-handle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%) translateX(-50%);
  width: 12px;
  height: 12px;
  background: #2196F3;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s;
}

.progress-bar:hover .progress-handle {
  opacity: 1;
}

.control-buttons {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.control-buttons button {
  padding: 5px 10px;
  margin-right: 10px;
  cursor: pointer;
}

.speed-controls select {
  padding: 5px;
}

.playlist {
  margin-top: 20px;
}

.playlist ul {
  list-style: none;
  padding: 0;
}

.playlist li {
  padding: 8px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.playlist li:hover {
  background-color: #f5f5f5;
}

.playlist li.active {
  background-color: #e0f7fa;
  font-weight: bold;
}
</style>