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
            selectingThreshold: 50, // 新增：框选最小移动阈值（像素）
            isVideoItemClick: false, // 新增：标记是否为视频项点击
            shouldShowPopover: false,
            info_msg: ''
        }
    },
    methods: {
        onVideoItemMouseDown() {
            this.isVideoItemClick = true; // 初始化为点击
        },
        onMouseLeave() {
            this.shouldShowPopover = false;
        },
        onMouseEnter() {
            if (!this.isSelecting) {
                this.shouldShowPopover = true;
            }
        },
        onMouseDown(type, event) {
            this.dragging = true;
            this.draggingType = type;
            this.startY = event.clientY;
        },
        onMouseMove(event) {
            if (!this.dragging) return;
            const deltaY = event.clientY - this.startY;
            this.startY = event.clientY;

            const containerHeight = this.$refs.container.clientHeight;
            const titleHeight = this.$refs.titleContainer?this.$refs.titleContainer.clientHeight:0;
            const contentHeight = this.$refs.contentContainer?this.$refs.contentContainer.clientHeight:0;
            let topOffset = this.topRatio * containerHeight
            let bottomOffset = this.bottomRatio * containerHeight

            if (this.draggingType === 'top') {
                let newTop = topOffset + deltaY;
                if (this.$refs.contentContainer) {
                    newTop = Math.max(0, Math.min(bottomOffset - titleHeight, newTop));
                }else {
                    newTop = Math.max(0, Math.min(containerHeight - titleHeight, newTop));
                }
                this.topRatio = Number((newTop / containerHeight).toFixed(2));
                this.updateTitleTextStyle()
            }

            if (this.draggingType === 'bottom') {
                let newBottom = bottomOffset + deltaY;
                if (this.$refs.titleContainer) {
                    newBottom = Math.max(topOffset + titleHeight,
                        Math.min(containerHeight - contentHeight, newBottom));
                } else {
                    newBottom = Math.max(titleHeight,Math.min(containerHeight - contentHeight, newBottom));
                }
                this.bottomRatio = Number((newBottom / containerHeight).toFixed(2));
                this.updateTextStyle()
            }
        },
        onMouseUp() {
            this.dragging = false;
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
            this.initialY = event.clientY - rect.top

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
            const currentY = event.clientY - rect.top

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
            this.filterMaterials()
        },

        /**
         * 用于校验新加入的素材是否与已选素材的 size 和 store 属性一致
         * @param {object} newItem - 准备新加入选区的素材对象
         * @returns {boolean} - true 表示校验通过，false 表示不一致
         */
        checkConsistency(newItem) {
            if (this.material_list.length === 0) {
                return true;
            }

            const firstSelectedId = this.material_list[0];
            const referenceItem = this.filter_materials.find(m => m.id === firstSelectedId);

            // 检查 size 和 store 是否一致
            const isSizeConsistent = referenceItem.size === newItem.size;
            if (!isSizeConsistent) {
                this.info_msg = '检测到不同尺寸的素材，已结束框选，并自动过滤不同尺寸的素材'
                return false;
            }
            const isStoreConsistent = referenceItem.store_id === newItem.store_id;
            if (!isStoreConsistent) {
                this.info_msg = '检测到不同店铺的素材，已结束框选，并自动过滤不同店铺的素材'
                return false;
            }

            return true
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
            for (const [index , el] of this.$refs.videoItems.entries()) {
                const domElement = el.$el || el;
                const rect = el.getBoundingClientRect()
                const containerRect = this.$el.getBoundingClientRect()

                // 计算相对于容器的位置
                const itemRect = {
                    left: rect.left - containerRect.left,
                    top: rect.top - containerRect.top,
                    right: rect.right - containerRect.left,
                    bottom: rect.bottom - containerRect.top
                }

                // 判断矩形是否重叠
                const isOverlapping =
                    itemRect.left < selectionRect.right &&
                    itemRect.right > selectionRect.left &&
                    itemRect.top < selectionRect.bottom &&
                    itemRect.bottom > selectionRect.top

                const id = domElement.dataset.id;
                const currentItem = this.filter_materials.find(m => m.id === id);

                if (isOverlapping && !this.material_list.includes(id)) {
                    if (this.checkConsistency(currentItem)) {
                        this.material_list.push(id);
                    } else {
                        this.$alert(this.info_msg,'提示')
                        this.endSelection();
                        return;
                    }
                }

                if (!isOverlapping && !this.initial_material_list.includes(id)) {
                    this.material_list = this.material_list.filter(item => item !== id)
                }
            }
            sessionStorage.setItem('material_list', JSON.stringify(this.material_list))
            this.contentHeight = 640
            if (this.mentionList.length > 0) {
                let material = this.mentionList[0]
                this.contentHeight = material.height / (material.width / 360)
            }
            sessionStorage.setItem('content_height', this.contentHeight)
            // this.topRatio = 0.25
            // this.bottomRatio = 0.75
            this.updateTextStyle()
            this.updateTitleTextStyle()
        }
    }
}