export const EnhancedChoiceMixin = {
    data() {
        return {
            lastClickedIndex: null,

            // 框选相关状态
            isSelecting: false,
            initialX: 0,     // 初始X坐标
            initialY: 0,     // 初始Y坐标
            selectionLeft: 0,  // 选框左边界
            selectionTop: 0,   // 选框上边界
            selectionWidth: 0, // 选框宽度
            selectionHeight: 0, // 选框高度
            initial_material_list: [],
            selectingThreshold: 10, // 新增：框选最小移动阈值（像素）
            isVideoItemClick: false // 新增：标记是否为视频项点击
        }
    },
    methods: {
        onVideoItemMouseDown() {
            this.isVideoItemClick = true; // 初始化为点击
        },
        startSelection(event) {
            if (event.button !== 0) {
                return
            }

            // 阻止默认行为和事件冒泡
            event.preventDefault()
            event.stopPropagation()

            // 记录初始位置
            const container = this.$refs.videoGrid
            const rect = this.$el.getBoundingClientRect()
            this.initialX = event.clientX - rect.left
            this.initialY = event.clientY - rect.top - 50 + container.scrollTop

            // 初始化选框位置和大小
            this.selectionLeft = this.initialX
            this.selectionTop = this.initialY
            this.selectionWidth = 0
            this.selectionHeight = 0

            this.isSelecting = true

            // 新增：记录框选开始时的所有选中状态
            this.initial_material_list = [...this.material_list]
        },

        // 更新框选
        updateSelection(event) {
            if (!this.isSelecting) return

            const container = this.$refs.videoGrid
            const rect = this.$el.getBoundingClientRect()
            const currentX = event.clientX - rect.left
            const currentY = event.clientY - rect.top - 50 + container.scrollTop

            // 计算位移距离
            const distance = Math.sqrt(
                Math.pow(currentX - this.initialX, 2) +
                Math.pow(currentY - this.initialY, 2)
            );

            // 只有当移动超过阈值时，才认为是真正的框选
            if (distance >= this.selectingThreshold) {
                // 阻止点击事件
                event.preventDefault();
                event.stopPropagation();
                this.isVideoItemClick = false
                // 计算选框位置和大小（考虑任意方向）
                this.selectionLeft = Math.min(this.initialX, currentX)
                this.selectionTop = Math.min(this.initialY, currentY)
                this.selectionWidth = Math.abs(currentX - this.initialX)
                this.selectionHeight = Math.abs(currentY - this.initialY)

                // 更新选中项
                this.updateSelectedItems()
            }
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
                const container = this.$refs.videoGrid

                // 计算相对于容器的位置
                const itemRect = {
                    left: rect.left - containerRect.left,
                    top: rect.top - containerRect.top - 50 + container.scrollTop,
                    right: rect.right - containerRect.left,
                    bottom: rect.bottom - containerRect.top - 50 + container.scrollTop
                }

                // 判断矩形是否重叠
                const isOverlapping =
                    itemRect.left < selectionRect.right &&
                    itemRect.right > selectionRect.left &&
                    itemRect.top < selectionRect.bottom &&
                    itemRect.bottom > selectionRect.top

                // 更新选中状态
                let id = this.materials[index].id
                if (isOverlapping && !this.material_list.includes(id)) {
                    this.material_list.push(id)
                }
                if (!isOverlapping && !this.initial_material_list.includes(id)) {
                    this.material_list = this.material_list.filter(item => item !== id)
                }
            })
            sessionStorage.setItem('material_list', JSON.stringify(this.material_list))
        }
    }
}