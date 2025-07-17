<template>
  <div class="video-container">
    <video ref="videoPlayer" controls width="640" height="360"></video>
    <div class="status-message" v-if="statusMessage">{{ statusMessage }}</div>
    <button v-if="showPlayButton" @click="handlePlay" class="play-button">开始播放</button>
    <div class="progress-bar" v-if="progress > 0 && progress < 100">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      <div class="progress-text">{{ progress }}%</div>
    </div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<script>
export default {
  name: 'VideoConcatenator',
  props: {
    videoUrls: {
      type: Array,
      required: true,
      validator: (value) => value.every(url => typeof url === 'string' && url.trim() !== '')
    }
  },
  data() {
    return {
      statusMessage: '准备拼接视频...',
      errorMessage: '',
      progress: 0,
      mediaSource: null,
      sourceBuffer: null,
      videoChunks: [],
      showPlayButton: false,
      isProcessing: false
    }
  },
  mounted() {
    console.log('组件已挂载，videoUrls:', this.videoUrls);
    this.initVideoConcatenation();
  },
  methods: {
    async initVideoConcatenation() {
      try {
        if (!window.MediaSource) {
          throw new Error('当前浏览器不支持MediaSource API，无法拼接视频');
        }

        this.statusMessage = '正在加载视频资源...';
        await this.loadVideoChunks();

        this.statusMessage = '准备合并视频...';
        await this.setupMediaSource();

        this.statusMessage = '正在合并视频...';
        this.isProcessing = true;
        await this.appendVideoChunks();

        this.statusMessage = '视频合并完成';
        this.showPlayButton = true;
        this.isProcessing = false;
      } catch (error) {
        console.error('视频拼接过程中出错:', error);
        this.statusMessage = '视频处理失败';
        this.errorMessage = error.message;
        this.showPlayButton = false;
        this.isProcessing = false;
      }
    },

    async loadVideoChunks() {
      const totalVideos = this.videoUrls.length;

      for (let i = 0; i < totalVideos; i++) {
        const url = this.videoUrls[i];
        console.log('即将请求的视频 URL:', url);
        this.statusMessage = `正在加载视频 ${i + 1}/${totalVideos}`;

        const maxRetries = 3;
        let retryCount = 0;

        while (retryCount < maxRetries) {
          try {
            const response = await fetch(url + '?t=' + new Date().getTime(), {
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            });

            if (!response.ok) {
              throw new Error(`无法加载视频 ${i + 1}: ${response.statusText}`);
            }

            const contentType = response.headers.get('Content-Type');
            console.log(`视频 ${i + 1} 的Content-Type:`, contentType);

            const arrayBuffer = await response.arrayBuffer();
            if (arrayBuffer.byteLength === 0) {
              throw new Error(`视频 ${i + 1} 加载数据为空，可能资源有问题`);
            }

            this.videoChunks.push(arrayBuffer);
            console.log(`视频 ${i + 1} 加载成功，大小: ${arrayBuffer.byteLength} 字节`);

            this.progress = Math.round(((i + 1) / totalVideos) * 50);
            break; // 加载成功，跳出重试循环
          } catch (error) {
            retryCount++;
            if (retryCount >= maxRetries) {
              throw new Error(`视频 ${i + 1} 加载失败，重试 ${maxRetries} 次均失败: ${error.message}`);
            }
            console.warn(`视频 ${i + 1} 加载失败，正在重试（第 ${retryCount} 次）:`, error);
          }
        }
      }
    },

    async setupMediaSource() {
      return new Promise((resolve, reject) => {
        this.mediaSource = new MediaSource();
        this.$refs.videoPlayer.src = URL.createObjectURL(this.mediaSource);

        let isOpen = false;
        const timeoutId = setTimeout(() => {
          if (!isOpen) {
            reject(new Error('MediaSource sourceopen 事件超时未触发'));
          }
        }, 5000);

        this.mediaSource.addEventListener('sourceopen', () => {
          isOpen = true;
          clearTimeout(timeoutId);

          // 扩展可能的MIME类型列表
          const possibleMimeCodecs = [
            'video/mp4; codecs="avc1.42E01E, mp4a.40.2"', // 常见H.264+AAC
            'video/mp4; codecs="avc1.640028, mp4a.40.2"', // 更高profile的H.264
            'video/mp4; codecs="avc1.4d401f, mp4a.40.2"', // 常见变体
            'video/mp4; codecs="vp09.00.10.08, opus"',    // VP9+Opus(WebM)
            'video/mp4; codecs="av01.0.05M.08, opus"',    // AV1+Opus
            'video/mp4; codecs="avc1.42E01E, mp4a.40.5"'  // AAC LC
          ];

          const tryMime = (index) => {
            if (index >= possibleMimeCodecs.length) {
              reject(new Error('没有找到支持的MIME类型'));
              return;
            }

            const mimeCodec = possibleMimeCodecs[index];
            console.log('尝试MIME类型:', mimeCodec);

            if (MediaSource.isTypeSupported(mimeCodec)) {
              try {
                this.sourceBuffer = this.mediaSource.addSourceBuffer(mimeCodec);
                console.log('成功添加SourceBuffer，MIME:', mimeCodec);

                // 添加sourceBuffer事件监听
                this.sourceBuffer.addEventListener('updateend', () => {
                  console.log('SourceBuffer updateend事件触发');
                });

                this.sourceBuffer.addEventListener('error', (event) => {
                  console.error('SourceBuffer error事件触发:', event);
                });

                this.sourceBuffer.addEventListener('abort', () => {
                  console.warn('SourceBuffer abort事件触发');
                });

                // 添加MediaSource状态变化监听
                this.mediaSource.addEventListener('sourceclose', () => {
                  console.warn('MediaSource已关闭，SourceBuffer可能失效');
                  this.sourceBuffer = null;
                });

                this.mediaSource.addEventListener('sourceended', () => {
                  console.log('MediaSource已结束');
                });

                resolve();
              } catch (error) {
                console.warn('添加SourceBuffer失败，尝试下一个MIME:', error);
                tryMime(index + 1);
              }
            } else {
              console.log('不支持的MIME类型:', mimeCodec);
              tryMime(index + 1);
            }
          };

          tryMime(0);
        });

        this.mediaSource.addEventListener('error', (event) => {
          clearTimeout(timeoutId);
          reject(new Error(`MediaSource错误: ${event.message}`));
        });
      });
    },

    async appendVideoChunks() {
      return new Promise(async (resolve, reject) => {
        try {
          const totalChunks = this.videoChunks.length;
          if (totalChunks === 0) {
            throw new Error('没有可用的视频片段进行合并');
          }

          let processedChunks = 0;

          const processNextChunk = async () => {
            // 检查MediaSource和SourceBuffer状态
            if (this.mediaSource.readyState !== 'open' || !this.sourceBuffer) {
              reject(new Error('MediaSource未开启或SourceBuffer已被移除，无法继续处理视频片段'));
              return;
            }

            if (processedChunks >= totalChunks) {
              console.log('所有视频片段已处理完毕');

              try {
                if (this.mediaSource.readyState === 'open' && !this.sourceBuffer.updating) {
                  console.log('结束MediaSource流');
                  this.mediaSource.endOfStream();
                }
                resolve();
              } catch (error) {
                reject(new Error(`结束MediaSource流失败: ${error.message}`));
              }
              return;
            }

            const chunk = this.videoChunks[processedChunks];
            this.statusMessage = `正在合并视频片段 ${processedChunks + 1}/${totalChunks}`;

            try {
              console.log(`准备追加视频片段 ${processedChunks + 1}，大小: ${chunk.byteLength} 字节`);
              await this.appendChunkWithBackoff(chunk);
              processedChunks++;
              this.progress = 50 + Math.round((processedChunks / totalChunks) * 50);
              await processNextChunk(); // 递归调用，确保顺序执行
            } catch (error) {
              reject(new Error(`合并视频片段 ${processedChunks + 1}/${totalChunks} 失败: ${error.message}`));
            }
          };

          processNextChunk();
        } catch (error) {
          reject(new Error(`合并视频片段失败: ${error.message}`));
        }
      });
    },

    async appendChunkWithBackoff(chunk) {
      return new Promise((resolve, reject) => {
        const appendChunk = async () => {
          // 检查SourceBuffer状态
          if (!this.sourceBuffer) {
            reject(new Error('SourceBuffer不存在，无法追加片段'));
            return;
          }

          // 等待sourceBuffer准备好
          while (this.sourceBuffer.updating) {
            console.log('SourceBuffer正在更新，等待100ms...');
            await new Promise(resolve => setTimeout(resolve, 100));

            // 再次检查SourceBuffer状态
            if (!this.sourceBuffer) {
              reject(new Error('等待过程中SourceBuffer被移除，无法追加片段'));
              return;
            }
          }

          if (this.mediaSource.readyState !== 'open') {
            reject(new Error('MediaSource状态不是"open"，无法追加片段'));
            return;
          }

          try {
            console.log('开始追加视频片段...');

            // 检查buffer是否有足够空间
            if (this.sourceBuffer.buffered && this.sourceBuffer.buffered.length > 0) {
              try {
                const end = this.sourceBuffer.buffered.end(this.sourceBuffer.buffered.length - 1);
                console.log('当前buffer结束时间:', end);
              } catch (error) {
                console.warn('读取buffered属性异常:', error);
              }
            }

            this.sourceBuffer.appendBuffer(chunk);

            // 设置超时处理
            const timeoutId = setTimeout(() => {
              if (this.sourceBuffer && this.sourceBuffer.updating) {
                console.warn('SourceBuffer更新超时（30秒），尝试中止');
                try {
                  this.sourceBuffer.abort();
                } catch (error) {
                  console.error('中止SourceBuffer失败:', error);
                }
              }
            }, 30000);

            const onUpdateEnd = () => {
              clearTimeout(timeoutId);

              // 移除事件监听前检查sourceBuffer是否存在
              if (this.sourceBuffer) {
                this.sourceBuffer.removeEventListener('updateend', onUpdateEnd);
                this.sourceBuffer.removeEventListener('error', onError);
                this.sourceBuffer.removeEventListener('abort', onAbort);
              }

              try {
                if (this.sourceBuffer && this.sourceBuffer.buffered) {
                  console.log('视频片段追加成功，当前buffered范围:', this.sourceBuffer.buffered);
                }
              } catch (error) {
                console.warn('读取buffered属性异常:', error);
              }

              resolve();
            };

            const onError = (event) => {
              clearTimeout(timeoutId);
              console.error('sourceBuffer 追加错误，错误对象:', event);

              // 移除事件监听前检查sourceBuffer是否存在
              if (this.sourceBuffer) {
                this.sourceBuffer.removeEventListener('updateend', onUpdateEnd);
                this.sourceBuffer.removeEventListener('error', onError);
                this.sourceBuffer.removeEventListener('abort', onAbort);
              }

              let errorMsg = '添加视频片段失败';
              if (this.sourceBuffer && this.sourceBuffer.error) {
                errorMsg += `: ${this.sourceBuffer.error.message}`;
              } else if (event && event.message) {
                errorMsg += `: ${event.message}`;
              } else {
                errorMsg += ': 未知错误';
              }

              reject(new Error(errorMsg));
            };

            const onAbort = () => {
              clearTimeout(timeoutId);
              console.warn('sourceBuffer 追加操作被中止');

              // 移除事件监听前检查sourceBuffer是否存在
              if (this.sourceBuffer) {
                this.sourceBuffer.removeEventListener('updateend', onUpdateEnd);
                this.sourceBuffer.removeEventListener('error', onError);
                this.sourceBuffer.removeEventListener('abort', onAbort);
              }

              reject(new Error('添加视频片段操作被中止'));
            };

            // 添加事件监听前检查sourceBuffer是否存在
            if (this.sourceBuffer) {
              this.sourceBuffer.addEventListener('updateend', onUpdateEnd);
              this.sourceBuffer.addEventListener('error', onError);
              this.sourceBuffer.addEventListener('abort', onAbort);
            } else {
              reject(new Error('添加事件监听前SourceBuffer已被移除'));
            }
          } catch (error) {
            console.error('appendChunk执行出错:', error);
            reject(error);
          }
        };

        appendChunk();
      });
    },

    handlePlay() {
      this.$refs.videoPlayer.play().catch(error => {
        console.error('播放失败:', error);
        this.errorMessage = `播放失败: ${error.message}`;
      });
    }
  }
}
</script>

<style scoped>
.video-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.status-message {
  color: #333;
  font-size: 1rem;
}

.play-button {
  padding: 0.5rem 1rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.play-button:hover {
  background-color: #3a78c2;
}

.progress-bar {
  width: 100%;
  max-width: 640px;
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background-color: #4a90e2;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

.error-message {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
</style>
