<template>
  <div class="video-selection-container">
    <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
    <div class="video-grid">
      <div
          v-for="(video, index) in videoList"
          :key="video.id"
          :class="{'selected': isSelected(index), 'active': lastClickedIndex === index}"
          class="video-item"
          @click="handleVideoClick(index)"
      >
        <div class="video-thumbnail">
          <img :src="`https://picsum.photos/seed/video${video.id}/300/200`" alt="视频缩略图">
          <div class="overlay" v-if="isSelected(index)"></div>
          <el-checkbox v-model="selectedIndexes[index]" class="checkbox"></el-checkbox>
        </div>
<!--        <div class="video-info">-->
<!--          <h3>{{ video.title }}</h3>-->
<!--          <p>{{ video.duration }}</p>-->
<!--        </div>-->
      </div>
    </div>
<!--    <div class="selected-info">-->
<!--      已选择 {{ selectedCount }} 个视频-->
<!--    </div>-->
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 模拟视频数据
      videoList: [
        {id: 1, title: '视频 1', duration: '03:45'},
        {id: 2, title: '视频 2', duration: '05:12'},
        {id: 3, title: '视频 3', duration: '01:30'},
        {id: 4, title: '视频 4', duration: '02:22'},
        {id: 5, title: '视频 5', duration: '04:15'},
        {id: 6, title: '视频 6', duration: '02:58'},
        {id: 7, title: '视频 7', duration: '03:10'},
        {id: 8, title: '视频 8', duration: '01:45'},
        {id: 9, title: '视频 9', duration: '05:30'},
        {id: 10, title: '视频 10', duration: '02:15'}
      ],
      // 存储选中的视频索引
      selectedIndexes: Array(10).fill(false),
      // 上次点击的索引
      lastClickedIndex: null,
      // 全选状态
      selectAll: false
    }
  },
  computed: {
    // 计算选中的视频数量
    selectedCount() {
      return this.selectedIndexes.filter(Boolean).length
    }
  },
  methods: {
    // 判断视频是否被选中
    isSelected(index) {
      return this.selectedIndexes[index]
    },

    // 处理视频点击事件
    handleVideoClick(index) {
      const isShiftKey = window.event.shiftKey

      // 如果没有按住Shift键，直接处理单个选择
      if (!isShiftKey) {
        // 如果点击的是已选中的项，并且不是通过Shift多选操作
        if (this.isSelected(index) && !isShiftKey) {
          // 如果按下Ctrl/Cmd键，则取消选择
          if (window.event.ctrlKey || window.event.metaKey) {
            this.selectedIndexes[index] = false
          }
          // 否则只选中当前项
          else {
            this.selectedIndexes = Array(this.videoList.length).fill(false)
            this.selectedIndexes[index] = true
          }
        }
        // 如果点击的是未选中的项
        else {
          // 如果按下Ctrl/Cmd键，则添加到选择
          if (window.event.ctrlKey || window.event.metaKey) {
            this.selectedIndexes[index] = true
          }
          // 否则只选中当前项
          else {
            this.selectedIndexes = Array(this.videoList.length).fill(false)
            this.selectedIndexes[index] = true
          }
        }

        // 更新最后点击的索引
        this.lastClickedIndex = index
        return
      }

      // 如果按住Shift键，处理范围选择
      if (this.lastClickedIndex !== null) {
        // 获取起始和结束索引
        const start = Math.min(this.lastClickedIndex, index)
        const end = Math.max(this.lastClickedIndex, index)

        // 清除所有选择
        if (!(window.event.ctrlKey || window.event.metaKey)) {
          this.selectedIndexes = Array(this.videoList.length).fill(false)
        }

        // 选中范围内的所有项
        for (let i = start; i <= end; i++) {
          this.selectedIndexes[i] = true
        }
      } else {
        // 如果是第一次点击并且按住了Shift键，处理方式同普通点击
        this.selectedIndexes = Array(this.videoList.length).fill(false)
        this.selectedIndexes[index] = true
      }

      // 更新最后点击的索引
      this.lastClickedIndex = index
    },

    // 处理全选/取消全选
    handleSelectAll(value) {
      this.selectedIndexes = Array(this.videoList.length).fill(value)
    }
  },
  watch: {
    // 监听选择状态变化，更新全选状态
    selectedIndexes: {
      handler(newValue) {
        const allSelected = newValue.every(Boolean)
        const noneSelected = newValue.every(v => !v)

        if (allSelected) {
          this.selectAll = true
        } else if (noneSelected) {
          this.selectAll = false
        } else {
          this.selectAll = null // 部分选中状态
        }
      },
      deep: true
    }
  }
}
</script>

<style scoped>
/* 样式与Vue3版本完全相同 */
.video-selection-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.video-item {
  border: 1px solid #e4e4e4;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.video-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.video-item.selected {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.video-item.active {
  box-shadow: 0 0 0 2px #409eff;
}

.video-thumbnail {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.video-thumbnail:hover img {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(64, 158, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.video-info {
  padding: 12px;
}

.video-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-info p {
  margin: 6px 0 0;
  font-size: 14px;
  color: #909399;
}

.selected-info {
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
  text-align: center;
}
</style>