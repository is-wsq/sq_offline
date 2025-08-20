<template>
  <div class="scriptToImage">
    <div class="scriptToImage-header">
      <el-button type="text" class="back-btn" @click="backToImage">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <el-steps style="flex: 1;" :active="1" align-center finish-status="success">
        <el-step title="图生脚本"></el-step>
        <el-step title="脚本生图"></el-step>
        <el-step title="图生视频"></el-step>
      </el-steps>
      <div style="width: 36px"></div>
    </div>
    <div class="flex-center" style="margin-bottom: 20px">
      <div style="flex: 1">
        <div style="font-size: 24px; font-weight: bold;">脚本生图</div>
        <div style="font-size: 14px; color: #4b5563;margin-top: 4px">基于您的分镜脚本生成对应图片，可进行调整和优化</div>
      </div>
      <el-button type="primary">生成视频分镜</el-button>
    </div>
    <div class="scriptToImage-body">
      <div class="storyboard-item" v-for="(item, index) in operate_scripts" :key="index">
        <div class="storyboard-item-header">
          <div style="flex: 1">
            <div style="display: flex;gap: 8px">
              <div style="font-size: 18px; font-weight: bold;">分镜脚本{{ index + 1 }}</div>
              <el-tag v-for="(tag, tag_index) in item.tags" :key="tag_index" size="small" class="tag">
                {{ tag }}
              </el-tag>
            </div>
            <div class="storyboard-item-copy">
              <template v-if="editIndex !== index">
                {{ item.copy }}
              </template>
              <template v-else>
                <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }"
                          resize="none" v-model="editCopy"></el-input>
              </template>
            </div>
          </div>
          <div class="operate-btn-group">
            <template v-if="editIndex !== index">
              <div class="cursor-pointer" @click="handleEdit(index)">
                <i class="el-icon-edit" style="margin-right: 5px;"></i>
                重新编辑</div>
              <el-button type="primary" @click="handleReload(index)">
                <i class="el-icon-refresh" style="margin-right: 5px;"></i>
                重新生成</el-button>
              <div class="cursor-pointer" @click="handleDelete(index)">
                <i class="el-icon-delete" style="margin-right: 5px;"></i>
                删除</div>
            </template>
            <template v-else>
              <div class="cursor-pointer" @click="handleSure">
                <i class="el-icon-check" style="margin-right: 5px;"></i>
                确定</div>
              <div class="cursor-pointer" @click="handleCancel">
                <i class="el-icon-close" style="margin-right: 5px;"></i>
                取消</div>
            </template>
          </div>
        </div>
        <div class="storyboard-item-body">
          <div style="color: #4b5563;margin-bottom: 16px">生成图片组</div>
          <div class="storyboard-item-images">
            <div v-for="(item,index) in text_images" :key="index">
              <el-image :src="item.img" style="width: 120px;border-radius: 8px"></el-image>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "scriptToImage",
  data() {
    return {
      operate_scripts: [],
      text_images: [
        { name: 'Product A1', img: 'https://placehold.co/300x400/60A5FA/FFFFFF?text=Product+A1' },
        { name: 'Product A2', img: 'https://placehold.co/300x400/34D399/FFFFFF?text=Product+A2' },
        { name: 'Product A3', img: 'https://placehold.co/300x400/A78BFA/FFFFFF?text=Product+A3' },
        { name: 'Product A4', img: 'https://placehold.co/300x400/FBBF24/FFFFFF?text=Product+A4' },
      ],
      editIndex: -1,
      editCopy: '',
    }
  },
  watch: {
    operate_scripts: {
      deep: true,
      handler(newValue, oldValue) {
        sessionStorage.setItem("operate_scripts", JSON.stringify(newValue))
      }
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    handleEdit(index) {
      this.editIndex = index
      this.editCopy = this.operate_scripts[index].copy
    },
    handleReload(index) {

    },
    handleDelete(index) {
      this.$confirm('确认删除该分镜脚本吗？','提示', {
        type: 'warning'
      }).then(() => {
        this.operate_scripts.splice(index, 1)
        this.$message.success('删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    handleSure() {
      this.operate_scripts[this.editIndex].copy = this.editCopy
      this.editIndex = -1
      this.$message.success('保存成功')
    },
    handleCancel() {
      this.editIndex = -1
      this.$message.info('已取消编辑')
    },
    initData() {
      this.operate_scripts = JSON.parse(sessionStorage.getItem("operate_scripts"))
    },
    backToImage() {
      this.$router.push({ path: '/imageToScript' })
    }
  },
}
</script>

<style scoped>
.scriptToImage {
  height: 100%;
  min-height: 800px;
}

.scriptToImage-header {
  padding-bottom: 16px;
  box-sizing: border-box;
  color: #475569;
  display: flex;
  align-items: center;
}

.scriptToImage-header >>> .el-step__title.is-process {
  color: #6366fe;
}

.scriptToImage-header >>> .el-step__head.is-process {
  color: #6366fe !important;
  border-color: #6366fe !important;
}

.scriptToImage-body {
  height: calc(100% - 165px);
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.storyboard-item {
  width: 100%;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.storyboard-item-header {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 60px;
}

.tag {
  border-radius: 14px;
  border: 1px solid #F5F5F5;
  cursor: pointer;
  height: 28px;
  line-height: 28px;
  padding-left: 12px;
  padding-right: 12px;
}

.storyboard-item-copy {
  font-size: 14px;
  color: #4b5563;
  line-height: 20px;
  margin-top: 6px;
}

.operate-btn-group {
  display: flex;
  gap: 16px;
  width: 300px;
  justify-content: end;
  align-items: center;
  font-size: 14px;
  color: #4b5563;
  font-weight: bold;
}

.storyboard-item-body {
  padding: 16px;
}

.storyboard-item-images {
  display: flex;
  gap: 16px;
}
</style>