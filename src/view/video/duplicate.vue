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
          <div class="smart-generate-c-l" :class="{' smart-generate-c-l-chat': script_chat.length > 0 && !isNewChat}">
            <div class="font-weight margin-b-12">生成文案</div>
            <div class="smart-generate-c-l-ai"  v-if="script_chat.length === 0 || isNewChat">
              <div style="height: calc(100% - 50px); overflow-y: auto;overflow-x: hidden">
                <div class="smart-generate-c-l-ai-title">语言选择</div>
                <el-select v-model="language" placeholder="请选择" style="width: 100%" @change="saveSetting">
                  <el-option label="中文" value="中文"></el-option>
                  <el-option label="英文" value="英文"></el-option>
                  <el-option label="日文" value="日文"></el-option>
                  <el-option label="其他（需在文案要求指定语言类型）" value="其他"></el-option>
                </el-select>
                <div class="smart-generate-c-l-ai-title margin-t-12">文案要求</div>
                <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }"
                          placeholder="例如：关于 店铺品类(如火锅店、服装店等)相关文案，主推 产品/服务(如招牌菜、爆款服装等)"
                          class="margin-b-12" v-model="copy_require"
                          resize="none" @change="saveSetting">
                </el-input>
                <template v-if="exampleTexts">
                  <div class="smart-generate-c-l-ai-title">示例文案</div>
                  <div class="flex-center margin-b-8">
                    <div class="copy-item-example">{{ exampleTexts }}</div>
                  </div>
                </template>
                <div style="display: flex;gap: 12px" class="margin-b-12">
                  <div style="flex: 1" v-if="exampleTexts">
                    <div class="smart-generate-c-l-ai-title">文案字数</div>
                    <el-select v-model="copy_num" placeholder="请选择" style="width: 100%">
                      <el-option label="100" value="100"></el-option>
                      <el-option label="150" value="150"></el-option>
                      <el-option label="200" value="200"></el-option>
                      <el-option label="250" value="250"></el-option>
                      <el-option label="300" value="300"></el-option>
                      <el-option label="350" value="350"></el-option>
                      <el-option label="400" value="400"></el-option>
                      <el-option label="450" value="450"></el-option>
                      <el-option label="500" value="500"></el-option>
                    </el-select>
                  </div>
                  <div style="flex: 1" v-if="!exampleTexts">
                    <div class="smart-generate-c-l-ai-title">时长 (秒)</div>
                    <el-input type="number" v-model="video_time" :step="15"></el-input>
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
            <div class="smart-generate-c-l-ai" v-else style="height: calc(100% - 33px)">
              <div class="chat-area">
                <div class="chat-frame" ref="scriptChatRef">
                  <div v-for="(item, index) in script_chat" :key="index"
                       :class="{'historical-chat': lastNewChatIndex !== -1 && index < lastNewChatIndex}">
                    <div v-if="item.type === 'userMessage'" style="display: flex;justify-content: end;">
                      <div class="user-message">
                        {{ item.content }}
                      </div>
                    </div>
                    <div v-if="item.type === 'answerMessage'" class="answer-message-content">
                      <div class="answer-message">
                        <div class="avatar-area">奇</div>
                        <div style="flex: 1">
                          <div class="answer-message-label">生成的文案</div>
                          <div class="script-content" v-for="(script,script_index) in item.scripts" :key="script_index">
                            <div class="font-weight margin-b-4">{{ script.title }}</div>
                            <div>{{ script.script }}</div>
                            <div class="script-btn-group">
                              <div title="选择该文案" class="script-btn-item" @click="selectScript(script)">
                                <i class="el-icon-tianjia cursor-pointer"></i>
                              </div>
                              <div title="删除该文案" class="script-btn-item" @click="deleteScript(index,script_index)">
                                <i class="el-icon-delete cursor-pointer"></i>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="select-script-btn" @click="selectAllScript(item.scripts)">
                        <i class="el-icon-tianjia font-weight"></i>
                        选择本次生成文案
                      </div>
                    </div>
                    <div v-if="item.type === 'newChat'">
                      <el-divider>新会话</el-divider>
                    </div>
                  </div>
                  <div class="loading-content" v-if="isGenerating">
                    <div class="avatar-area">奇</div>
                    <div class="answer-message-label" style="font-size: 14px">
                      文案生成中
                      <i class="el-icon-loading" style="font-size: 16px;margin-left: 4px"></i>
                    </div>
                  </div>
                </div>
                <div class="chat-input">
                  <div class="create-chat-btn" @click="createNewChat">
                    <i class="el-icon-edit-outline" style="margin-right: 5px"></i>
                    发起新会话
                  </div>
                  <div class="chat-text-area">
                    <el-input type="textarea" placeholder="请输入您的修改意见..." resize="none" v-model="chat_input"
                              :rows="3" @keydown.native="enterSendChat"></el-input>
                    <div style="text-align: right;margin: 5px 8px">
                      <el-tooltip class="item" effect="dark" content="发送(Enter)" placement="top">
                        <el-button type="primary" style="padding: 0 15px" @click="sendChat" :disabled="isGenerating">
                          <i class="el-icon-s-promotion" style="font-size: 16px;line-height: 24px"></i>
                        </el-button>
                      </el-tooltip>
                    </div>
                  </div>
                  <div class="send-placeholder">Shift + Enter 换行</div>
                </div>
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
      <el-button type="primary" style="width: 176px" @click="nextStep">下一步：混剪复刻</el-button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {ClearCacheMixin} from "@/mixins/ClearCacheMixin";
export default {
  name: 'Duplicate',
  mixins: [ClearCacheMixin],
  data() {
    return {
      activeName: '1',
      language: '中文',
      copy_require: '',
      exampleTexts: '',
      copy_num: 100,
      video_time: 15,
      script_num: 1,
      ai_model: 'deepseek_v3',
      showChecked: false,
      deleteCheckeds: [],
      hot_copy_list: [],
      new_title: '',
      new_content: '',
      material_bgm: {},
      mention_list: [],
      voice: {},

      script_chat: [],
      isNewChat: true,
      chat_input: '',
      isGenerating: false,
      conversation_id: '',
      lastGenerateScripts: []
    }
  },
  watch: {
    script_chat: {
      handler(newValue, oldValue) {
        sessionStorage.setItem('dup_chat', JSON.stringify(newValue))
      },
      deep: true
    },
    isNewChat: {
      handler(newValue, oldValue) {
        sessionStorage.setItem('dup_is_newChat', JSON.stringify(newValue))
      },
      deep: true
    },
    conversation_id: {
      handler(newValue, oldValue) {
        sessionStorage.setItem('dup_conversation_id', newValue)
      },
      deep: true
    },
    lastGenerateScripts: {
      handler(newValue, oldValue) {
        sessionStorage.setItem('dup_last_generate', JSON.stringify(newValue))
      },
      deep: true
    }
  },
  computed: {
    lastNewChatIndex() {
      for (let i = this.script_chat.length - 1; i >= 0; i--) {
        if (this.script_chat[i].type === 'newChat') {
          return i;
        }
      }
      return -1;
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    scrollToBottom() {
      if (this.$refs.scriptChatRef) {
        this.$refs.scriptChatRef.scrollTop = this.$refs.scriptChatRef.scrollHeight
      }
    },
    createNewChat() {
      if (this.isGenerating) {
        this.$alert('请等待生成结束后再发起新会话','提示')
        return
      }
      this.isNewChat = true
      this.conversation_id = null
      sessionStorage.removeItem('script_conversation_id')
      this.script_chat.push({type: 'newChat'})
      this.$nextTick(() => { this.scrollToBottom() })
    },
    enterSendChat(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (this.isGenerating) {
          return;
        }
        this.sendChat();
      }
    },
    sendChat() {
      if (this.chat_input.trim() === '') {
        this.$alert('请先输入修改意见', '提示')
        return
      }
      this.isNewChat = false
      this.script_chat.push({
        type: 'userMessage',
        content: this.chat_input || '随意生成合适文案即可',
      });
      this.isGenerating = true
      this.$nextTick(() => { this.scrollToBottom() })

      let params = {
        requirements: this.chat_input,
        num_of_words: this.exampleTexts ? parseInt(this.copy_num) : null,
        store_id: this.mention_list[0].store_id,
        conversation_id: this.conversation_id,
        scripts: this.lastGenerateScripts,
        duration: this.exampleTexts ? null : parseInt(this.video_time),
        voice_id: this.voice.id,
      }
      this.chat_input = ''
      axios.post('http://127.0.0.1:9669/api/re_generate_script', params).then(res => {
        if (res.data.status === "success") {
          this.isGenerating = false
          this.lastGenerateScripts = res.data.data.scripts
          this.script_chat.push({
            type: 'answerMessage',
            scripts: res.data.data.scripts,
          })
          this.$nextTick(() => { this.scrollToBottom() })
        } else {
          this.isGenerating = false
          this.$alert(res.data.message,'文案生成失败')
        }
      }).catch(err => {
        this.isGenerating = false
        this.$alert(err,'文案生成错误')
      })
    },
    selectScript(script) {
      if (this.hot_copy_list.some(item => item.content === script.script)) {
        this.$message.warning('文案已添加，请勿重复添加');
      } else {
        this.hot_copy_list.push({
          title: script.title,
          content: script.script,
          isEdit: false,
          bgm: this.material_bgm
        })
        sessionStorage.setItem("hot_copy_list", JSON.stringify(this.hot_copy_list))
        sessionStorage.removeItem('hot_montage_data')

        this.$message.success('文案已添加到列表');
      }
    },
    deleteScript(index, script_index) {
      let copy = this.script_chat[index].scripts[script_index].script
      this.$confirm('确认删除该生成文案吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.script_chat[index].scripts.splice(script_index, 1);
        this.$message.success('删除成功')
      }).catch(() => {
        this.$message.info('已取消删除');
      })
    },
    selectAllScript(scripts) {
      const existingCopies = new Set(this.hot_copy_list.map(item => item.content));
      const newScripts = scripts.filter(script => !existingCopies.has(script.script));
      const duplicatedScripts = scripts.filter(script => existingCopies.has(script.script));
      if (newScripts.length === 0) {
        this.$message.warning('本次生成文案已添加，请勿重复添加');
        return;
      }
      const scriptsToAdd = newScripts.map(item => ({
        title: item.title,
        content: item.script,
        isEdit: false,
        bgm: this.material_bgm
      }));

      this.hot_copy_list = this.hot_copy_list.concat(scriptsToAdd);
      sessionStorage.setItem("hot_copy_list", JSON.stringify(this.hot_copy_list))
      sessionStorage.removeItem('hot_montage_data')
      if (duplicatedScripts.length > 0) {
        this.$message.success('文案添加成功，已自动忽略重复文案');
      }
    },

    findNearestHundred(length) {  // 动态设置字数
      const nearestMultiple = Math.round(length / 50) * 50;
      return Math.min(500, Math.max(100, nearestMultiple))
    },
    findNearestHundredTime(length) {  // 动态设置时长
      const nearestMultiple = Math.round(length / 15) * 15;
      return Math.max(15, nearestMultiple)
    },
    saveSetting() {
      this.validateNum()
      let duplicate_setting = {
        language: this.language,
        copy_require: this.copy_require,
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
      this.language = duplicate_setting.language || '中文'
      this.copy_require = duplicate_setting.copy_require || ''
      this.script_num = parseInt(duplicate_setting.script_num) || 1
      this.ai_model = duplicate_setting.ai_model || 'deepseek_v3'

      this.mention_list = JSON.parse(sessionStorage.getItem('mention_list')) || []

      this.hot_copy_list = sessionStorage.getItem("hot_copy_list") ?
          JSON.parse(sessionStorage.getItem("hot_copy_list")) : []
      let hots = JSON.parse(sessionStorage.getItem("select_hots"))
      this.material_bgm = JSON.parse(sessionStorage.getItem('setting_bgm')) || {}
      this.conversation_id = sessionStorage.getItem('dup_conversation_id')
      this.isNewChat = sessionStorage.getItem('dup_is_newChat') === 'true'
      this.script_chat = JSON.parse(sessionStorage.getItem('dup_chat')) || []
      this.lastGenerateScripts = JSON.parse(sessionStorage.getItem('dup_last_generate')) || []
      this.$nextTick(() => { this.scrollToBottom() })

      this.voice = JSON.parse(sessionStorage.getItem('setting_voice')) || {}
      this.exampleTexts = hots.segments.map(segment => segment.asr_text ? segment.asr_text : '').join('');
      let video_time = Math.round(hots.duration)
      this.video_time = this.findNearestHundredTime(video_time)
      this.copy_num = this.findNearestHundred(this.exampleTexts.length)
    },
    batchGenerate() {
      if (this.copy_require.trim() === '') {
        this.$alert('文案要求不能为空，请先填写文案要求', '提示')
        return
      }
      this.isNewChat = false
      this.script_chat.push({
        type: 'userMessage',
        content: this.copy_require || '随意生成合适文案即可',
      });
      this.isGenerating = true
      this.$nextTick(() => { this.scrollToBottom() })
      let url = this.exampleTexts ? 'http://127.0.0.1:9669/api/generate_script' : 'http://127.0.0.1:9669/api/generate_script_by_duration'
      let params = {}
      if (this.exampleTexts) {
        let examples = []
        examples[0] = this.exampleTexts
        params = {
          language: this.language,
          examples: examples,
          requirements: this.copy_require,
          num_of_words: parseInt(this.copy_num),
          script_count: parseInt(this.script_num),
          store_id: this.mention_list[0].store_id
        }
      }else {
        params = {
          language: this.language,
          requirements: this.copy_require,
          duration: parseInt(this.video_time),
          voice_id: this.voice.id,
          script_count: parseInt(this.script_num),
          store_id: this.mention_list[0].store_id
        }
      }
      axios.post(url, params).then(res => {
        if (res.data.status === "success") {
          this.isGenerating = false
          this.lastGenerateScripts = res.data.data
          this.script_chat.push({
            type: 'answerMessage',
            scripts: res.data.data
          })
          this.$nextTick(() => { this.scrollToBottom() })
        } else {
          this.isGenerating = false
          this.$alert(res.data.message,'文案生成失败')
        }
      }).catch(err => {
        this.isGenerating = false
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
      this.clearCache()
      this.$router.push({path: '/remix'})
      sessionStorage.setItem('video_path', '/remix')
    },
    back() {
      if (this.isGenerating) {
        this.$message.warning('请等待当前生成完成之后返回')
        return
      }
      this.clearCache()
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

.smart-generate-c-l-chat {
  padding-bottom: 0 !important;
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

.chat-area {
  display: flex;
  flex-direction: column;
  margin: 0 -16px;
  height: 100%;
  overflow: hidden;
}

.chat-frame {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 12px;
  overflow-y: auto;
}

.chat-frame >>> .el-divider--horizontal {
  margin: 10px 0 !important;
}

.chat-frame >>> .el-divider__text {
  color: #9ca3af;
}

.historical-chat {
  opacity: 0.5;
  /* pointer-events: none; */
  transition: opacity 0.3s ease-in-out;
}

.user-message {
  max-width: 85%;
  background-color: #dbeafe;
  padding: 10px;
  box-shadow: 0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border-radius: 8px;
  border-top-left-radius: 0 !important;
  color: #4B5563;
  font-size: 14px;
}

.answer-message {
  background-color: #eff6ff;
  padding: 10px;
  box-shadow: 0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border-radius: 8px;
  border-top-right-radius: 0 !important;
  display: flex;
  gap: 8px;
}

.answer-message >>> .el-collapse {
  border: none;
}

.answer-message >>> .el-collapse-item__wrap {
  background-color: transparent;
  border: none;
}

.answer-message >>> .el-collapse-item__header {
  height: 32px;
  line-height: 32px;
  background-color: transparent;
  border: none;
}

.answer-message >>> .el-collapse-item__arrow {
  margin: 0 10px;
  font-weight: bold;
}

.answer-message >>> .el-collapse-item__content {
  padding-bottom: 0;
}

.loading-content {
  width: 80%;
  background-color: #eff6ff;
  padding: 10px;
  box-shadow: 0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border-radius: 8px;
  border-top-right-radius: 0 !important;
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.select-script-btn {
  width: 120px;
  font-size: 12px;
  color: #4B5563;
  margin-top: 4px;
  cursor: pointer;
  opacity: 0;
}

.answer-message-content {
  max-width: 85%;
}

.answer-message-content:hover .select-script-btn {
  opacity: 1;
}

.avatar-area {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
}

.answer-message-label {
  color: #3b82f6;
  font-weight: bold;
  font-size: 12px;
  line-height: 24px;
}

.script-content {
  margin-top: 5px;
  background-color: #ffffff;
  font-size: 12px;
  line-height: 18px;
  border: 1px solid #f3f4f6;
  border-radius: 6px;
  padding: 10px;
  color: #4b5563;
  position: relative;
  cursor: pointer;
}

.script-btn-group {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 4px 8px;
  border-radius: 5px;
  opacity: 0;
}

.script-content:hover .script-btn-group {
  opacity: 1;
}

.script-btn-item {
  color: #ffffff;
  font-size: 14px;
  padding: 2px 5px;
}

.chat-input {
  padding: 2px 12px;
  background-color: #f3f4f6;
  border-top: 1px solid #e5e7eb;
}

.create-chat-btn {
  color: #4b5563;
  font-size: 14px;
  line-height: 20px;
  margin: 4px 0;
  cursor: pointer;
}

.chat-text-area {
  background-color: #f9f9f9;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
}

.chat-text-area >>> .el-textarea__inner {
  border: none !important;
}

.chat-text-area:focus-within {
  outline: none;
  background: white;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.chat-text-area >>> .el-textarea__inner:focus {
  outline: none;
  background: white;
  box-shadow: none;
}

.send-placeholder {
  color: #6b7280;
  font-size: 10px;
  text-align: right;
}
</style>