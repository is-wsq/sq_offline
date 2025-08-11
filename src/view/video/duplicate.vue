<template>
  <div class="smart-generate">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="back">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="smart-generate-h-t">爆款复刻</div>
      <div style="width: 36px"></div>
    </div>
    <div class="smart-generate-c margin-b-12">
      <el-row style="height: 100%;" :gutter="20">
        <el-col :span="12" :md="10" :lg="8" style="height: 100%">
          <div class="smart-generate-c-l">
            <div class="font-weight margin-b-12">生成文案</div>
            <div class="smart-generate-c-l-ai">
              <div style="height: calc(100% - 50px); overflow-y: auto">
                <div class="smart-generate-c-l-ai-title">文案要求</div>
                <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }"
                          placeholder="例如：关于 店铺品类(如火锅店、服装店等)相关文案，主推 产品/服务(如招牌菜、爆款服装等)"
                          class="margin-b-12" v-model="copy_require"
                          resize="none" @change="saveSetting">
                </el-input>
                <div class="smart-generate-c-l-ai-title">示例文案</div>
                <div class="flex-center margin-b-8" v-for="(text, index) in exampleTexts" :key="index">
                  <div class="copy-item-example">{{ exampleTexts[index] }}</div>
                </div>
                <div style="display: flex;gap: 12px" class="margin-b-12">
                  <div style="flex: 1">
                    <div class="smart-generate-c-l-ai-title">文案字数</div>
                    <el-select v-model="copy_num" placeholder="请选择" style="width: 100%" @change="saveSetting">
                      <el-option label="100" value="100"></el-option>
                      <el-option label="200" value="200"></el-option>
                      <el-option label="300" value="300"></el-option>
                      <el-option label="400" value="400"></el-option>
                      <el-option label="500" value="500"></el-option>
                    </el-select>
                  </div>
                  <div style="flex: 1">
                    <div class="smart-generate-c-l-ai-title">文案数量</div>
                    <el-input type="number" v-model="script_num" min="1" max="10" @blur="validateNum"
                              @change="saveSetting"></el-input>
                  </div>
                </div>
                <div class="smart-generate-c-l-ai-title">模型选择</div>
                <el-select v-model="ai_model" style="width: 100%" class="margin-b-12" @change="saveSetting">
                  <el-option label="本地大模型" value="local_model"></el-option>
                  <el-option label="deepseek v3" value="deepseek_v3"></el-option>
                </el-select>
              </div>
              <div class="smart-generate-c-l-ai-generate margin-t-8">
                <el-button type="primary" @click="batchGenerate" style="width: 100%">批量生成</el-button>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="12" :md="14" :lg="16" style="height: 100%">
          <div class="smart-generate-c-r">
            <div class="flex-center" style="line-height: 50px">
              <div class="font-weight" style="flex: 1">文案列表</div>
              <template v-if="showChecked">
                <el-button type="primary" size="mini" class="delete-group-btn" @click="batchRemoveCopy">确认删除</el-button>
                <el-button class="delete-group-btn" size="mini" @click="showChecked = false">取消</el-button>
              </template>
              <el-button type="primary" size="mini" class="delete-group-btn" v-else @click="showChecked = true">批量删除</el-button>
            </div>
            <div class="smart-generate-c-r-list">
              <div v-if="hot_copy_list.length > 0" style="width: 100%">
                <div v-for="(item, index) in hot_copy_list" :key="index" class="copy-item">
                  <i class="el-icon-tuodong" style="color: #9ca3af;font-size: 18px" v-if="!showChecked"></i>
                  <el-checkbox v-model="deleteCheckeds[index]" style="margin-right: 10px" v-if="showChecked"></el-checkbox>
                  <div class="copy-item-content" style="cursor: pointer"
                       v-if="!item.isEdit" @click="showEdit(index)">
                    <div class="copy-item-title" :title="item.title">{{ item.title }}</div>
                    <div class="copy-item-desc">{{ item.content }}</div>
                  </div>
                  <div class="copy-item-content" v-else>
                    <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 3 }" placeholder="文案标题..."
                              class="margin-b-12" v-model="new_title" resize="none"></el-input>
                    <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" placeholder="文案内容..."
                              class="margin-b-12" v-model="new_content" resize="none"></el-input>
                    <el-button class="copy-item-save" type="primary" @click="saveCopy(index)">保存修改</el-button>
                  </div>
                  <i class="el-icon-close copy-item-close" @click="removeCopy(index)" v-if="!showChecked"></i>
                </div>
              </div>
              <div class="none-copy" v-else>
                <i class="el-icon-document-list none-copy-icon"></i>
                <div class="none-copy-title">暂无文案</div>
                <div class="none-copy-desc">请使用左侧工具生成您的第一条文案</div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="flex-center">
      <el-button type="primary" style="width: 176px" @click="nextStep">下一步：智能成片</el-button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      activeName: '1',
      copy_require: '',
      exampleTexts: [''],
      copy_num: 100,
      script_num: 1,
      ai_model: 'deepseek_v3',
      showChecked: false,
      deleteCheckeds: [],
      hot_copy_list: [],
      new_title: '',
      new_content: '',
      material_bgm: {},
      mention_list: [],
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    saveSetting() {
      this.validateNum()
      let duplicate_setting = {
        copy_require: this.copy_require,
        copy_num: this.copy_num,
        script_num: this.script_num,
        ai_model: this.ai_model,
      }
      sessionStorage.setItem('duplicate_setting', JSON.stringify(duplicate_setting))
    },
    validateNum() {
      let val = this.script_num
      if (val < 1) {
        this.script_num = 1
      } else if (val > 10) {
        this.script_num = 10
      } else {
        this.script_num = val
      }
    },
    initData() {
      let duplicate_setting = JSON.parse(sessionStorage.getItem("duplicate_setting")) || {}
      this.copy_require = duplicate_setting.copy_require || ''
      this.copy_num = parseInt(duplicate_setting.copy_num) || 100
      this.script_num = parseInt(duplicate_setting.script_num) || 1
      this.ai_model = duplicate_setting.ai_model || 'deepseek_v3'

      this.mention_list = JSON.parse(sessionStorage.getItem('mention_list')) || []

      this.hot_copy_list = sessionStorage.getItem("hot_copy_list") ?
          JSON.parse(sessionStorage.getItem("hot_copy_list")) : []
      let hots = JSON.parse(sessionStorage.getItem("select_hots"))
      this.material_bgm = JSON.parse(sessionStorage.getItem('setting_bgm')) || {}
      this.exampleTexts = []
      this.exampleTexts[0] = hots.segments.map(segment => segment.asr_text).join('');
    },
    batchGenerate() {
      let url = ''
      switch (this.ai_model) {
        case 'local_model':
          url = 'http://127.0.0.1:9669/generate_script'
          break
        case 'deepseek_v3':
          url = 'http://127.0.0.1:9669/api/generate_script'
          break
      }
      const cleanTexts = this.exampleTexts.map(text => text.trim()).filter(text => text !== '');
      let params = {
        examples: cleanTexts,
        requirements: this.copy_require,
        num_of_words: parseInt(this.copy_num),
        script_count: parseInt(this.script_num),
        store_id: this.mention_list[0].store_id
      }
      this.loading = this.$loading({
        lock: true, text: '文案生成中，请耐心等待...',
        spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, 0.7)'
      });
      axios.post(url, params).then(res => {
        this.loading.close();
        this.loading = null;
        if (res.data.status === "success") {
          this.hot_copy_list = this.hot_copy_list.concat(res.data.data.map(
              item => ({title: item.title, content: item.script, isEdit: false, bgm: this.material_bgm})))
          sessionStorage.setItem("hot_copy_list", JSON.stringify(this.hot_copy_list))
          sessionStorage.removeItem('hot_montage_data')
        } else {
          this.$alert(res.data.message,'文案生成失败')
        }
      }).catch(err => {
        this.loading.close();
        this.loading = null;
        this.$alert(err,'文案生成错误')
      })
    },
    showEdit(index) {
      if (this.showChecked) {
        this.deleteCheckeds[index] = !this.deleteCheckeds[index]
        this.$forceUpdate()
        return
      }
      this.hot_copy_list.forEach((copy, i) => {
        copy.isEdit = i === index;
      })
      this.new_title = this.hot_copy_list[index].title
      this.new_content = this.hot_copy_list[index].content
    },
    saveCopy(index) {
      if (this.new_title === '') {
        this.$alert('请输入文案标题', '提示')
        return
      }
      if (this.new_content === '') {
        this.$alert('请输入文案内容', '提示')
        return;
      }
      this.hot_copy_list[index].isEdit = false;
      this.hot_copy_list[index].title = this.new_title;
      this.hot_copy_list[index].content = this.new_content;
      sessionStorage.setItem("hot_copy_list", JSON.stringify(this.hot_copy_list));
      sessionStorage.removeItem('hot_montage_data')
    },
    removeCopy(index) {
      this.$confirm('确认删除该文案吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.hot_copy_list.splice(index, 1);
        sessionStorage.setItem("hot_copy_list", JSON.stringify(this.hot_copy_list))
        sessionStorage.removeItem('hot_montage_data')
      }).catch((err) => {
        this.$message({type: 'info', message: '已取消删除'});
      });
    },
    batchRemoveCopy() {
      if (this.deleteCheckeds.every(item => !item)) {
        this.$alert('请选择要删除的文案', '提示')
        return
      }
      this.$confirm('确认删除选择的文案吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.hot_copy_list = this.hot_copy_list.filter((item, i) => !this.deleteCheckeds[i]);
        this.deleteCheckeds = []
        this.showChecked = false
        this.$forceUpdate()
        sessionStorage.setItem("hot_copy_list", JSON.stringify(this.hot_copy_list))
        sessionStorage.removeItem('hot_montage_data')
      }).catch((err) => {
        this.$message({type: 'info', message: '已取消删除'});
      });
    },
    nextStep() {
      if (this.hot_copy_list.length === 0) {
        this.$alert('请添加文案，您至少需要一条文案才能开始制作。', "提示")
        return;
      }
      this.$router.push({path: '/montage'})
      sessionStorage.setItem('video_path', '/montage')
    },
    back() {
      this.$router.push({path: '/material'})
      sessionStorage.setItem('video_path', '/material')
    }
  }
}
</script>

<style scoped>
.smart-generate {
  min-height: 700px;
  height: 100%;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.smart-generate-h-t {
  flex: 1;
  margin: 0 0 8px;
  font-weight: bold;
  display: flex;
  justify-content: center;
}

.smart-generate-c {
  height: calc(100% - 100px);
}

.smart-generate-c-l,
.smart-generate-c-r {
  height: 100%;
  width: 100%;
  background-color: #FFFFFF;
  border-radius: 16px;
  padding: 16px;
  box-sizing: border-box;
}

.delete-group-btn {
  padding: 8px !important;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.smart-generate-c-l >>> .el-collapse {
  border-top: none;
}

.smart-generate-c-l >>> .el-collapse-item__header {
  font-weight: bold;
  font-size: 14px;
}

.smart-generate-c-l >>> .el-collapse-item__content {
  padding-bottom: 0;
}

.smart-generate-c-l-ai {
  height: calc(100% - 40px);
}

.smart-generate-c-l-ai >>> .el-textarea__inner,
.copy-item-content >>> .el-textarea__inner {
  padding: 8px;
  font-size: 13px;
  color: #4f5153;
  background-color: #f9f9f9;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.smart-generate-c-l-ai >>> .el-textarea__inner:focus,
.copy-item-content >>> .el-textarea__inner:focus {
  outline: none;
  background: white;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.smart-generate-c-l-ai >>> .el-input__inner,
.copy-item-content >>> .el-input__inner {
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #DCDFE6;
  height: 30px;
  line-height: 30px;
  padding: 0 5px 0 15px;
}

.smart-generate-c-l-ai >>> .el-input__icon {
  line-height: 30px;
}

.smart-generate-c-l-ai-title {
  font-size: 12px;
  color: #4b5563;
  margin-bottom: 4px;
}

.copy-item-example {
  padding: 8px;
  font-size: 13px;
  color: #4f5153;
  background-color: #f9f9f9;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  max-height: 200px;
  width: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}

.smart-generate-c-r-list {
  height: calc(100% - 35px);
  width: 100%;
  padding: 12px;
  box-sizing: border-box;
  overflow-y: auto;
  border-radius: 8px;
  background-color: #f8fafc;
}

.copy-item {
  width: 100%;
  border-radius: 8px;
  background-color: #FFFFFF;
  margin-top: 12px;
  padding: 12px;
  box-sizing: border-box;
  display: flex;
}

.copy-item-content {
  margin: 0 12px;
  width: calc(100% - 64px);
}

.copy-item-title {
  width: 100%;
  font-size: 14px;
  color: #262626;
  margin-bottom: 4px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copy-item-desc {
  width: 100%;
  color: #4b5563;
  font-size: 12px;
  margin-top: 4px;
  max-height: 100px;
  overflow-y: auto;
  overflow-wrap: break-word;
}

.copy-item-close {
  width: 20px;
  height: 20px;
  color: #9ca3af;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
}

.copy-item-content >>> .el-button {
  cursor: pointer;
  border-radius: 6px;
  font-size: 12px;
  padding: 6px 20px;
  font-weight: bold;
}

.none-copy {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.none-copy-icon {
  font-size: 54px;
  color: #9ca3af;
}

.none-copy-title {
  font-size: 14px;
  color: #9ca3af;
  margin-top: 8px;
}

.none-copy-desc {
  font-size: 12px;
  color: #9ca3af;
}
</style>