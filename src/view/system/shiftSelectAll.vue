<template>
  <div class="video-selection-container">
    <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
    <div
      class="video-grid"
      @mousedown="startSelection"
      @mousemove="updateSelection"
      @mouseup="endSelection"
      @mouseleave="endSelection"
    >
      <div
        v-for="(video, index) in videoList"
        :key="video.id"
        :class="{'selected': isSelected(index), 'active': lastClickedIndex === index}"
        class="video-item"
        @click="handleVideoClick(index, $event)"
        ref="videoItems"
      >
        <div class="video-thumbnail">
          <img :src="`https://picsum.photos/seed/video${video.id}/300/200`" alt="视频缩略图">
          <div class="overlay" v-if="isSelected(index)"></div>
          <el-checkbox v-model="selectedIndexes[index]" class="checkbox"></el-checkbox>
        </div>
      </div>

      <!-- 选框元素 -->
      <div
        v-if="isSelecting"
        class="selection-box"
        :style="{
          left: `${selectionLeft}px`,
          top: `${selectionTop}px`,
          width: `${selectionWidth}px`,
          height: `${selectionHeight}px`
        }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
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
      selectedIndexes: Array(10).fill(false),
      lastClickedIndex: null,
      selectAll: false,

      // 框选相关状态
      isSelecting: false,
      initialX: 0,     // 初始X坐标
      initialY: 0,     // 初始Y坐标
      selectionLeft: 0,  // 选框左边界
      selectionTop: 0,   // 选框上边界
      selectionWidth: 0, // 选框宽度
      selectionHeight: 0 // 选框高度
    }
  },
  methods: {
    isSelected(index) {
      return this.selectedIndexes[index]
    },

    handleVideoClick(index, event) {
      // 如果是框选操作，不处理点击事件
      if (this.isSelecting) {
        event.stopPropagation()
        return
      }

      const isShiftKey = event.shiftKey
      // 普通点击：切换当前项的选中状态，不清空之前的选择
      if (!isShiftKey) {
        this.selectedIndexes[index] = !this.selectedIndexes[index]
        // 更新最后一次主动点击的位置
        this.lastClickedIndex = index
        return
      }

      // Shift点击：处理范围选择
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
        // 第一次点击并且按住了Shift键，处理方式同普通点击
        this.selectedIndexes[index] = !this.selectedIndexes[index]
      }

      this.lastClickedIndex = index
    },

    handleSelectAll(value) {
      this.selectedIndexes = Array(this.videoList.length).fill(value)
    },

    // 开始框选
    startSelection(event) {
      // 如果是右键点击或点击了复选框，不开始框选
      if (event.button !== 0 || event.target.closest('.el-checkbox')) {
        return
      }

      // 阻止默认行为和事件冒泡
      event.preventDefault()
      event.stopPropagation()

      // 记录初始位置
      const rect = this.$el.getBoundingClientRect()
      this.initialX = event.clientX - rect.left
      this.initialY = event.clientY - rect.top - 40

      // 初始化选框位置和大小
      this.selectionLeft = this.initialX
      this.selectionTop = this.initialY
      this.selectionWidth = 0
      this.selectionHeight = 0

      this.isSelecting = true
    },

    // 更新框选
    updateSelection(event) {
      if (!this.isSelecting) return

      const rect = this.$el.getBoundingClientRect()
      const currentX = event.clientX - rect.left
      const currentY = event.clientY - rect.top - 40

      // 计算选框位置和大小（考虑任意方向）
      this.selectionLeft = Math.min(this.initialX, currentX)
      this.selectionTop = Math.min(this.initialY, currentY)
      this.selectionWidth = Math.abs(currentX - this.initialX)
      this.selectionHeight = Math.abs(currentY - this.initialY)

      // 更新选中项
      this.updateSelectedItems()
    },

    // 结束框选
    endSelection() {
      if (!this.isSelecting) return

      this.isSelecting = false
      // 重置选框尺寸
      this.selectionWidth = 0
      this.selectionHeight = 0
    },

    // 更新选中项
    updateSelectedItems() {
      // 获取选框区域
      const selectionRect = {
        left: this.selectionLeft,
        top: this.selectionTop,
        right: this.selectionLeft + this.selectionWidth,
        bottom: this.selectionTop + this.selectionHeight
      }

      // 检查每个视频项是否在选框内
      this.$refs.videoItems.forEach((el, index) => {
        const rect = el.getBoundingClientRect()
        const containerRect = this.$el.getBoundingClientRect()

        // 计算相对于容器的位置
        const itemRect = {
          left: rect.left - containerRect.left,
          top: rect.top - containerRect.top - 40,
          right: rect.right - containerRect.left,
          bottom: rect.bottom - containerRect.top - 40
        }

        // 判断矩形是否重叠
        const isOverlapping =
            itemRect.left < selectionRect.right &&
            itemRect.right > selectionRect.left &&
            itemRect.top < selectionRect.bottom &&
            itemRect.bottom > selectionRect.top

        // 更新选中状态
        this.selectedIndexes[index] = isOverlapping
      })
    }
  },
  watch: {
    selectedIndexes: {
      handler(newValue) {
        const allSelected = newValue.every(Boolean)
        const noneSelected = newValue.every(v => !v)

        if (allSelected) {
          this.selectAll = true
        } else if (noneSelected) {
          this.selectAll = false
        } else {
          this.selectAll = null
        }
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
  padding: 20px;
  position: relative;
  border: 1px solid red;
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

.selection-box {
  position: absolute;
  border: 1px dashed #409eff;
  background-color: rgba(64, 158, 255, 0.1);
  pointer-events: none;
  z-index: 20;
  transition: all 0.1s ease;
}
</style>