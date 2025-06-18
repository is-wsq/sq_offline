<template>
  <div class="smart-generate">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="$router.go(-1)">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="smart-generate-h-t">编辑文案</div>
      <div style="width: 36px"></div>
    </div>
    <div class="smart-generate-c margin-b-12">
      <el-row style="height: 100%;" :gutter="20">
        <el-col :span="12" :md="10" :lg="8" style="height: 100%">
          <div class="smart-generate-c-l">
            <div class="font-weight margin-b-12">生成文案</div>
            <el-collapse v-model="activeName" accordion>
              <el-collapse-item title="AI批量生成" name="1">
                <div class="smart-generate-c-l-ai">
                  <div class="smart-generate-c-l-ai-title">文案要求</div>
                  <el-input type="textarea" :rows="2" placeholder="例如：写一个关于猫咪的搞笑段子"
                      class="margin-b-12" v-model="copy_require"></el-input>
                  <div class="smart-generate-c-l-ai-title">示例文案（选填）</div>
                  <el-input type="textarea" :rows="2" placeholder="提供一个你喜欢的风格的例子"
                      class="margin-b-12" v-model="example_copy"></el-input>
                  <div style="display: flex;gap: 12px" class="margin-b-12">
                    <div style="flex: 1">
                      <div class="smart-generate-c-l-ai-title">文案字数</div>
                      <el-select v-model="copy_num" placeholder="请选择">
                        <el-option label="100" value="100"></el-option>
                        <el-option label="200" value="200"></el-option>
                        <el-option label="300" value="300"></el-option>
                      </el-select>
                    </div>
                    <div style="flex: 1">
                      <div class="smart-generate-c-l-ai-title">文案数量</div>
                      <el-input type="number" v-model="script_num"></el-input>
                    </div>
                  </div>
                  <div class="smart-generate-c-l-ai-title">模型选择</div>
                  <el-select v-model="ai_model" style="width: 100%" class="margin-b-12">
                    <el-option label="本地大模型" value="local_model"></el-option>
                    <el-option label="deepseek v3" value="deepseek_v3"></el-option>
                  </el-select>
                  <el-button class="batch-btn" @click="batchGenerate">批量生成</el-button>
                </div>
              </el-collapse-item>
              <el-collapse-item title="手动添加文案" name="2">
                <div class="smart-generate-c-l-manual">
                  <el-input type="textarea" :rows="1" placeholder="文案标题..." class="margin-b-12"
                            v-model="copy_title"></el-input>
                  <el-input type="textarea" :rows="3" placeholder="文案内容..." class="margin-b-12"
                            v-model="copy_content"></el-input>
                  <el-button class="batch-btn" @click="addCopy">添加文案</el-button>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-col>
        <el-col :span="12" :md="14" :lg="16" style="height: 100%">
          <div class="smart-generate-c-r">
            <div class="font-weight margin-b-12">文案列表</div>
            <div class="smart-generate-c-r-list">
              <div v-if="copy_list.length > 0" style="width: 100%">
                <div v-for="(item, index) in copy_list" :key="index" class="copy-item">
                  <i class="el-icon-tuodong" style="color: #9ca3af;font-size: 18px"></i>
                  <div class="copy-item-content" style="cursor: pointer"
                       v-if="!item.isEdit" @click="item.isEdit = true">
                    <div class="copy-item-title" :title="item.title">{{ item.title }}</div>
                    <div class="copy-item-desc">{{ item.content }}</div>
                  </div>
                  <div class="copy-item-content" v-else>
                    <el-input type="textarea" :rows="1" placeholder="文案标题..." class="margin-b-12"
                              v-model="item.title"></el-input>
                    <el-input type="textarea" :rows="3" placeholder="文案内容..." class="margin-b-12"
                              v-model="item.content"></el-input>
                    <el-button class="copy-item-save" type="primary" @click="item.isEdit = false">保存修改</el-button>
                  </div>
                  <i class="el-icon-close copy-item-close" @click="removeCopy(index)"></i>
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
  data(){
    return {
      activeName: '1',
      copy_require: '',
      example_copy: '',
      copy_num: 100,
      script_num: 1,
      ai_model: 'deepseek_v3',
      copy_title: '',
      copy_content: '',
      copy_list: []
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    initData() {
      this.copy_list = sessionStorage.getItem("copy_list") ? JSON.parse(sessionStorage.getItem("copy_list")) : []
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
      let params = {
        examples: this.example_copy,
        requirements: this.copy_require,
        num_of_words: parseInt(this.copy_num),
        script_count: parseInt(this.script_num)
      }
      this.loading = this.$loading({
        lock: true, text: '文案生成中，请耐心等待...',
        spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, 0.7)'
      });
      axios.post(url, params).then(res => {
        this.loading.close();
        this.loading = null;
        if (res.data.status === "success") {
          this.copy_list = this.copy_list.concat(res.data.data.map(
              (item, index) => ({title: `AI生成标题${index + 1}`, content: item, isEdit: false})))
          sessionStorage.setItem("copy_list", JSON.stringify(this.copy_list))
        } else {
          this.$notify({
            title: "文案生成失败", message: `${res.data.message}`,
            type: "error", duration: 0});
        }
      }).catch(err => {
        this.loading.close();
        this.loading = null;
        this.$notify({
          title: "文案生成失败", message: `${err}`,
          type: "error", duration: 0});
      })
    },
    addCopy() {
      if (this.copy_title === '') {
        this.$alert('请输入文案标题', '提示')
        return
      }
      if (this.copy_content === '') {
        this.$alert('请输入文案内容', '提示')
        return
      }
      this.copy_list.push({
        title: this.copy_title,
        content: this.copy_content,
        isEdit: false
      });
      this.copy_title = '';
      this.copy_content = '';
      sessionStorage.setItem("copy_list", JSON.stringify(this.copy_list))
    },
    removeCopy(index) {
      this.copy_list.splice(index, 1);
      sessionStorage.setItem("copy_list", JSON.stringify(this.copy_list))
    },
    nextStep() {
      this.$router.push({path: '/montage'})
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

.back-btn {
  padding: 7px;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  color: #a2a8b3;
  background-color: #FFFFFF;
  margin: 0 0 8px;
}

.back-btn:hover {
  color: #1F2937 !important;
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

.smart-generate-c-l-ai, .smart-generate-c-l-manual {
  padding: 16px 4px;
}

.smart-generate-c-l-ai >>> .el-textarea__inner,
.smart-generate-c-l-manual >>> .el-textarea__inner,
.copy-item-content >>> .el-textarea__inner {
  padding: 6px 12px;
  font-size: 13px;
  color: #4f5153;
  background-color: #f3f4f6;
  border: none;
  border-radius: 6px;
}

.smart-generate-c-l-ai >>> .el-input__inner,
.smart-generate-c-l-manual >>> .el-input__inner,
.copy-item-content >>> .el-input__inner {
  background-color: #f3f4f6;
  border-radius: 6px;
  border: none;
  height: 30px;
  line-height: 30px;
  padding: 0 5px 0 15px;
}

.smart-generate-c-l-ai >>> .el-input__icon,
.smart-generate-c-l-manual >>> .el-input__icon{
  line-height: 30px;
}

.batch-btn {
  width: 100%;
}

.smart-generate-c-l-ai >>> .el-button,
.smart-generate-c-l-manual >>> .el-button{
  cursor: pointer;
  border: 1px solid #DCDFE6;
  color: #ffffff;
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: bold;
}

.smart-generate-c-l-ai >>> .el-button {
  background: #6366fe;
}

.smart-generate-c-l-manual >>> .el-button {
  background: #3b82f6;
}

.smart-generate-c-l-ai-title {
  font-size: 12px;
  color: #4b5563;
  margin-bottom: 4px;
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
  color: #9ca3af;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
}

.copy-item-content >>> .el-button{
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