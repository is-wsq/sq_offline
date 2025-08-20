<template>
  <div class="imageToScript">
    <div class="imageToScript-header">
      <el-button type="text" class="back-btn" @click="backToFigure">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <el-steps style="flex: 1;" :active="0" align-center finish-status="success">
        <el-step title="图生脚本"></el-step>
        <el-step title="脚本生图"></el-step>
        <el-step title="图生视频"></el-step>
      </el-steps>
      <div style="width: 36px"></div>
    </div>
    <div class="imageToScript-content">
      <div class="first-operation-content first-left">
        <div class="first-title">展示区</div>
        <div class="view-area" v-if="scripts.length === 0">
          <template v-if="operateProductInfo.images">
            <div class="flex-center" style="flex: 1;">
              <div class="last-btn">
                <i v-if="imageIndex > 0" class="el-icon-arrow-left font-weight cursor-pointer" @click="imageIndex--"></i>
              </div>
              <div class="image-area flex-center">
                <el-image style="width: 300px;" :src="operateProductInfo.images[imageIndex].filepath"></el-image>
              </div>
              <div class="next-btn">
                <i class="el-icon-arrow-right font-weight cursor-pointer"
                   v-if="imageIndex < operateProductInfo.images.length - 1" @click="imageIndex++"></i>
              </div>
            </div>
            <div class="footer-label">{{ imageIndex + 1 + ' / ' + operateProductInfo.images.length }}</div>
          </template>
        </div>
        <div class="view-area" v-else>
          <div class="script-item" v-for="(item, index) in scripts" :key="index">
            <div class="script-item-header">
              <div class="script-item-tags">
                <el-tag v-for="(tag, tag_index) in item.tags" :key="tag_index" size="small" class="tag">
                  {{ tag }}
                </el-tag>
              </div>
              <div class="script-item-btn flex-center">
                <template v-if="editIndex !== index">
                  <i class="el-icon-edit cursor-pointer" style="font-size: 16px;color: #94a3b8"
                     @click="editCopy(index)"></i>
                  <i class="el-icon-delete cursor-pointer" style="font-size: 16px;color: #94a3b8;margin-left: 10px;"
                     @click="deleteCopy(index)"></i>
                </template>
                <template v-else>
                  <i class="el-icon-check cursor-pointer" style="font-size: 16px;color: #94a3b8"
                     @click="saveCopy(index)"></i>
                  <i class="el-icon-close cursor-pointer" style="font-size: 16px;color: #94a3b8;margin-left: 10px;"
                     @click="cancelEdit"></i>
                </template>
              </div>
            </div>
            <div class="script-item-copy">
              <div v-if="editIndex !== index">
                {{ item.copy }}
              </div>
              <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" resize="none" v-model="new_copy" v-else></el-input>
            </div>
          </div>
        </div>
        <div class="first-footer flex-center">
          <div style="flex: 1;">
            <span style="color: #4b5563;font-size: 14px" v-if="scripts.length > 0">
              已生成 {{ scripts.length }} 条视觉脚本，可进行编辑或删除</span>
          </div>
          <el-button type="primary" :disabled="scripts.length === 0" @click="next">下一步：脚本生图</el-button>
        </div>
      </div>
      <div class="first-right">
        <div class="first-operation-content">
          <div class="first-title">图片列表</div>
          <div class="images-grid">
            <div v-for="(item,index) in operateProductInfo.images" :key="index"
                 class="images-grid-item" @click="imageIndex = index">
              <el-image :src="item.filepath" style="width: 100%;height: 100%;" fit="cover"></el-image>
            </div>
          </div>
        </div>
        <div class="first-operation-content design-area">
          <div class="first-title">设计工作区</div>
          <div class="design-area-content">
            <div class="design-label">产品核心卖点</div>
            <el-input type="textarea" resize="none" class="sell-input margin-b-12"
                      placeholder="文案内容..." v-model="sell_point"></el-input>
            <div class="design-label">生成脚本数量</div>
            <div class="flex-center">
              <el-input-number v-model="script_num" :min="1" :max="4" class="margin-b-12"></el-input-number>
              <div class="placeholder-label">可选择1-4条</div>
            </div>
            <el-button type="primary" @click="generateScriptsByImage"><i class="el-icon-bianjiqi btn-icon"></i>
              生成视觉脚本
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {delAction} from "@/api/api";

export default {
  name: 'imageToScript',
  data() {
    return {
      operateProductInfo: {},
      imageIndex: 0,
      sell_point: '',
      script_num: 1,
      scripts: [],
      test_scripts: [
        {
          tags:['产品特写','科技感'],
          copy: '细节镜头：聚焦产品的创新设计细节，配合文字说明突出采用最新一代技术，性能提升30%。通过微距摄影展现工艺品质，突出产品的精致做工'
        },
        {
          tags:['办公场景','办公场景'],
          copy: '特写镜头：展示采用最新一代技术，性能提升30%的核心部件，配合蓝色科技光效，突出科技感，展现未来设计理念。镜头缓慢推进，突出产品细节。'
        },
        {
          tags:['多场景展示','对比强烈'],
          copy: '特写镜头：展示采用最新一代技术，性能提升30%的核心部件，配合蓝色科技光效，突出科技感，展现未来设计理念。镜头缓慢推进，突出产品细节。'
        },
        {
          tags:['产品特写','对比强烈'],
          copy: '对比镜头：将本产品与传统产品并排放置，通过分屏展示采用最新一代技术，性能提升30%带来的显著优势。快速切换镜头强调差异，传递可靠耐用的产品特性。'
        },
      ],
      editIndex: -1,
      new_copy: ''
    };
  },
  mounted() {
    this.initData();
  },
  methods: {
    generateScriptsByImage() {
      if (!this.sell_point) {
        this.$alert('请先输入产品核心卖点','提示')
        return
      }
      this.scripts = this.scripts.concat(this.test_scripts.slice(0, this.script_num));
    },
    editCopy(index) {
      this.new_copy = this.scripts[index].copy;
      this.editIndex = index;
    },
    deleteCopy(index) {
      this.$confirm('确认删除该脚本吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.scripts.splice(index, 1);
        this.$message({type: 'success', message: '删除成功'});
      }).catch(() => {
        this.$message({type: 'info', message: '已取消删除'});
      });
    },
    saveCopy(index) {
      this.scripts[index].copy = this.new_copy;
      this.editIndex = -1;
    },
    cancelEdit() {
      this.editIndex = -1;
    },

    initData() {
      this.operateProductInfo = JSON.parse(sessionStorage.getItem('operate_product'))
      this.imageIndex = parseInt(sessionStorage.getItem('operate_img_index'))
    },
    backToFigure() {
      this.$router.push({path: '/figures'})
    },
    next() {
      sessionStorage.setItem('operate_scripts', JSON.stringify(this.scripts))
      this.$router.push({path: '/scriptToImage'})
    }
  }
}
</script>

<style scoped>
.imageToScript {
  height: 100%;
  min-height: 800px;
  overflow-y: auto;
}

.imageToScript-header {
  padding-bottom: 16px;
  box-sizing: border-box;
  color: #475569;
  display: flex;
  align-items: center;
}

.imageToScript-header >>> .el-step__title.is-process {
  color: #6366fe;
}

.imageToScript-header >>> .el-step__head.is-process {
  color: #6366fe !important;
  border-color: #6366fe !important;
}

.imageToScript-content {
  height: calc(100% - 85px);
  box-sizing: border-box;
  display: flex;
  gap: 16px;
}

.first-operation-content {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.first-left {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.first-title {
  padding: 8px 16px;
  color: #475569;
  font-size: 18px;
  line-height: 28px;
  font-weight: bold;
  border-bottom: 1px solid #f3f4f6;
}

.view-area {
  flex: 1;
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.last-btn,.next-btn {
  width: 45px;
  text-align: center;
  color: #475569;
  font-size: 28px;
}

.image-area {
  flex: 1;
  height: 100%;
}

.script-item {
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.script-item-header {
  display: flex;
  height: 36px;
  margin-bottom: 8px;
}

.script-item-tags {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.script-item-copy {
  font-size: 14px;
  color: #4b5563;
  line-height: 20px;
}

.footer-label {
  font-size: 14px;
  text-align: center;
  font-weight: bold;
  color: #475569;
}

.first-footer {
  padding: 8px 16px;
  height: 40px;
  border-top: 1px solid #f3f4f6;
}

.first-footer >>> .el-button--primary {
  border-color: transparent !important;
}

.first-right {
  /* width: 410px; */
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 16px;
  box-sizing: border-box;
  height: 250px;
  overflow-y: auto;
}

.images-grid-item {
  width: 120px;
  height: 120px;
  cursor: pointer;
}

.design-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.design-area-content {
  padding: 8px 16px;
  box-sizing: border-box;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.design-label {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 4px;
}

.sell-input {
  flex: 1;
}

.design-area-content >>> .el-textarea__inner:focus,
.script-item-copy >>> .el-textarea__inner:focus {
  outline: none;
  background: white;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.script-item-copy >>> .el-textarea__inner {
  font-family: "Helvetica Neue", Arial, sans-serif;
  padding: 5px 10px;
}

.design-area-content >>> .el-textarea__inner {
  height: 100%;
  font-family: "Helvetica Neue", Arial, sans-serif;
  padding: 5px 10px;
}

.design-area-content >>> .el-input__inner:focus {
  outline: none;
  background: white;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.design-area-content >>> .el-input-number__decrease,
.design-area-content >>> .el-input-number__increase {
  background-color: transparent;
  border: none;
}

.placeholder-label {
  flex: 1;
  font-size: 12px;
  color: #4b5563;
  text-align: right;
  line-height: 40px;
}
</style>