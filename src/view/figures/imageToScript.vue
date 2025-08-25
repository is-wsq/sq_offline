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
      <div class="operation-content left">
        <div class="title">{{ scripts.length === 0 ? '展示区' : '选定脚本' }}</div>
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
              <div class="script-item-label">
                分镜脚本{{ index + 1 }}
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
        <div class="footer flex-center">
          <div style="flex: 1;">
            <span style="color: #4b5563;font-size: 14px" v-if="scripts.length > 0">
              已生成 {{ scripts.length }} 条视觉脚本，可进行编辑或删除</span>
          </div>
          <el-button type="primary" :disabled="scripts.length === 0" @click="next">下一步：脚本生图</el-button>
        </div>
      </div>
      <div class="right">
        <template v-if="!isAlreadyGenerated">
          <div class="operation-content">
            <div class="title">图片列表</div>
            <div class="images-grid">
              <div v-for="(item,index) in operateProductInfo.images" :key="index"
                   class="images-grid-item" @click="imageIndex = index">
                <el-image :src="item.filepath" style="width: 100%;height: 100%;" fit="cover"></el-image>
              </div>
            </div>
          </div>
          <div class="operation-content design-area">
            <div class="title">设计工作区</div>
            <div class="design-area-content">
              <div class="design-label">产品核心卖点</div>
              <el-input type="textarea" resize="none" class="sell-input margin-b-12"
                        placeholder="文案内容..." v-model="sell_point"></el-input>
              <div class="design-label">营销亮点</div>
              <div class="marketing-highlights">
                <el-tag v-for="tag in highlights" :key="tag" class="marketing-highlights-tag" @click="selectHighlight(tag)"
                        :class="{'active-highlights-tag': active_highlights.includes(tag)}">{{ tag }}</el-tag>
              </div>
              <div class="design-label margin-t-12">生成脚本数量</div>
              <div class="flex-center">
                <el-input-number v-model="script_num" :min="1" :max="4" class="margin-b-12"></el-input-number>
                <div class="placeholder-label">可选择1-4条</div>
              </div>
              <el-button type="primary" @click="generateScriptsByImage"><i class="el-icon-bianjiqi btn-icon"></i>
                生成视觉脚本
              </el-button>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="chat-area">
            <div class="chat-frame" ref="chatFrameRef">
              <div v-for="(item, index) in chats" :key="index"
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
                      <el-collapse>
                        <el-collapse-item>
                          <template slot="title">
                            <div class="answer-message-label">AI思考过程</div>
                          </template>
                          <div class="ai-thinking-content">{{ item.thinking }}</div>
                        </el-collapse-item>
                      </el-collapse>
                      <div class="answer-message-label margin-t-12">生成的脚本</div>
                      <div class="script-content" v-for="(script,script_index) in item.scripts" :key="script_index">
                        {{ script.copy }}
                        <div class="script-btn-group">
                          <div title="选择该脚本" class="script-btn-item" @click="selectScript(script)">
                            <i class="el-icon-copy-document cursor-pointer"></i>
                          </div>
                          <div title="删除该脚本" class="script-btn-item" @click="deleteScript(index,script_index)">
                            <i class="el-icon-delete cursor-pointer"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="select-script-btn" @click="selectAllScript(item.scripts)">
                    <i class="el-icon-copy-document font-weight"></i>
                    选择本次生成脚本
                  </div>
                </div>
                <div v-if="item.type === 'newChat'">
                  <el-divider>新会话</el-divider>
                </div>
              </div>
              <div class="loading-content" v-if="isGenerating">
                <div class="avatar-area">奇</div>
                <div class="loading-area flex-center"><i class="el-icon-loading"></i></div>
              </div>
            </div>
            <div class="chat-input">
              <template v-if="!isNewChat">
                <div class="create-chat-btn" @click="createNewChat">
                  <i class="el-icon-edit-outline" style="margin-right: 5px"></i>
                  发起新会话
                </div>
                <div class="flex-center">
                  <el-input type="textarea" placeholder="请输入您的修改意见..." resize="none" v-model="chat_input"
                            @keydown.native="enterSendChat"></el-input>
                  <el-button type="primary" style="padding: 0 20px" @click="sendChat">
                    <i class="el-icon-s-promotion" style="font-size: 18px;line-height: 35px"></i>
                  </el-button>
                </div>
                <div class="send-placeholder">按Enter或发送按钮发送，Shift+Enter换行</div>
              </template>
              <template v-else>
                <div class="design-label">产品核心卖点</div>
                <el-input type="textarea" resize="none" class="sell-input margin-b-12"
                          placeholder="文案内容..." v-model="sell_point"></el-input>
                <div class="design-label">营销亮点</div>
                <div class="marketing-highlights">
                  <el-tag v-for="tag in highlights" :key="tag" class="marketing-highlights-tag"
                          :style="{backgroundColor: '#ffffff !important',border: '1px solid #DCDFE6 !important'}"
                          :class="{'active-highlights-tag': active_highlights.includes(tag)}" @click="selectHighlight(tag)">
                    {{ tag }}</el-tag>
                </div>
                <div class="design-label margin-t-12">生成脚本数量</div>
                <div class="flex-center">
                  <el-input-number v-model="script_num" :min="1" :max="4" class="margin-b-12"></el-input-number>
                  <div class="placeholder-label">可选择1-4条</div>
                </div>
                <el-button type="primary" @click="generateScriptsByImage" style="width: 100%;">
                  <i class="el-icon-bianjiqi btn-icon"></i>
                  生成视觉脚本
                </el-button>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import {delAction, postAction} from "@/api/api";

export default {
  name: 'imageToScript',
  data() {
    return {
      operateProductInfo: {},
      imageIndex: 0,
      sell_point: '',
      highlights: ['科技感','运动活力','时尚高级','自然场景','续航性强'],
      active_highlights: [],
      script_num: 1,
      scripts: [],
      lastGeneratedScripts: [],
      editIndex: -1,
      new_copy: '',
      isAlreadyGenerated: false,
      chats: [],
      chat_input: '',
      isGenerating: false,
      isNewChat: false,
      loading: null,
    };
  },
  watch: {
    scripts: {
      handler(newValue, oldValue) {
        sessionStorage.setItem('operate_scripts', JSON.stringify(newValue))
      },
      deep: true
    },
    isAlreadyGenerated: {
      handler(newValue, oldValue) {
        sessionStorage.setItem('operate_isAlreadyGenerated', newValue)
      },
      deep: true
    },
    chats: {
      handler(newValue, oldValue) {
        sessionStorage.setItem('chats', JSON.stringify(newValue))
      },
      deep: true
    },
    isNewChat: {
      handler(newValue, oldValue) {
        sessionStorage.setItem('is_newChat', JSON.stringify(newValue))
      },
      deep: true
    }
  },
  computed: {
    lastNewChatIndex() {
      for (let i = this.chats.length - 1; i >= 0; i--) {
        if (this.chats[i].type === 'newChat') {
          return i;
        }
      }
      return -1;
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    selectHighlight(tag) {
      if (this.active_highlights.includes(tag)) {
        this.active_highlights.splice(this.active_highlights.indexOf(tag), 1);
      } else {
        this.active_highlights.push(tag);
      }
    },
    generateScriptsByImage() {
      if (!this.sell_point) {
        this.$alert('请先输入产品核心卖点','提示')
        return
      }
      this.isAlreadyGenerated = true
      this.isNewChat = false
      this.chats.push({
        type: 'userMessage',
        content: this.sell_point,
      });
      this.isGenerating = true
      this.$nextTick(() => {
        this.scrollToBottom()
      })
      let params = {
        selling_points: this.sell_point,
        marketing_highlights: this.active_highlights,
        product_id: this.operateProductInfo.id,
        num_scripts: this.script_num,
      }
      postAction('/picture/generate_script', params, 600000).then(res => {
        if (res.data.status === 'success') {
          this.isGenerating = false
          this.lastGeneratedScripts = res.data.data.scripts
          sessionStorage.setItem('last_generated_scripts', JSON.stringify(this.lastGeneratedScripts))
          this.chats.push({
            type: 'answerMessage',
            scripts: res.data.data.scripts,
            thinking: res.data.data.thinking,
          })
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        }else {
          this.$alert(res.data.message,'生成失败')
        }
      }).catch(err => {
        this.$alert(err,'生成错误')
      })
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
    scrollToBottom() {
      if (this.$refs.chatFrameRef) {
        this.$refs.chatFrameRef.scrollTop = this.$refs.chatFrameRef.scrollHeight
      }
    },
    createNewChat() {
      this.isNewChat = true
      this.chats.push({ type: 'newChat' })
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    enterSendChat(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.sendChat();
      }
    },
    sendChat() {
      let history_chats = this.chats
      for (let i = this.chats.length - 1; i >= 0; i--) {
        if (this.chats[i].type === 'newChat') {
          history_chats = this.chats.slice(i + 1);
          break;
        }
      }
      this.chats.push({
        type: 'userMessage',
        content: this.chat_input,
      });
      let params = {
        scripts: this.lastGeneratedScripts,
        history_chats: history_chats,
        user_feedback: this.chat_input,
      }
      this.chat_input = '';
      this.isGenerating = true
      this.$nextTick(() => {
        this.scrollToBottom()
      })
      postAction('/picture/refine_scripts_batch', params, 600000).then(res => {
        if (res.data.status ==='success') {
          this.isGenerating = false
          this.lastGeneratedScripts = res.data.data.scripts
          sessionStorage.setItem('last_generated_scripts', JSON.stringify(this.lastGeneratedScripts))
          this.chats.push({
            type: 'answerMessage',
            scripts: res.data.data.scripts,
            thinking: res.data.data.thinking,
          })
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        } else {
          this.isGenerating = false
          this.$alert(res.data.message,'生成失败')
        }
      }).catch(err => {
        this.isGenerating = false
        this.$alert(err,'生成错误')
      })
    },
    selectScript(script) {
      if (this.scripts.some(item => item.original_copy === script.copy)) {
        this.$message.warning('脚本已添加，请勿重复添加');
      } else {
        this.scripts.push({
          ...script,
          original_copy: script.copy
        });
        this.$message.success('脚本已添加到列表');
      }
    },
    selectAllScript(scripts) {
      const existingCopies = new Set(this.scripts.map(item => item.original_copy));
      const newScripts = scripts.filter(script => !existingCopies.has(script.copy));
      const duplicatedScripts = scripts.filter(script => existingCopies.has(script.copy));
      if (newScripts.length === 0) {
        this.$message.warning('本次生成脚本已添加，请勿重复添加');
        return;
      }
      const scriptsToAdd = newScripts.map(item => ({
        ...item,
        original_copy: item.copy
      }));

      this.scripts = this.scripts.concat(scriptsToAdd);
      if (duplicatedScripts.length > 0) {
        this.$message.success('脚本添加成功，已自动忽略重复脚本');
      }
    },
    deleteScript(index,script_index) {
      let copy = this.chats[index].scripts[script_index].copy
      this.$confirm('确认删除该生成脚本吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.chats[index].scripts.splice(script_index, 1);
        this.lastGeneratedScripts = this.lastGeneratedScripts.filter(item => item.copy !== copy)
        sessionStorage.setItem('last_generated_scripts', JSON.stringify(this.lastGeneratedScripts))
        this.$message.success('删除成功')
      }).catch(() => {
        this.$message.info('已取消删除');
      })
    },

    initData() {
      this.operateProductInfo = JSON.parse(sessionStorage.getItem('operate_product'))
      this.imageIndex = parseInt(sessionStorage.getItem('operate_img_index'))
      this.scripts = JSON.parse(sessionStorage.getItem('operate_scripts'))
      this.lastGeneratedScripts = JSON.parse(sessionStorage.getItem('last_generated_scripts'))
      this.isAlreadyGenerated = sessionStorage.getItem('operate_isAlreadyGenerated') === 'true'
      this.isNewChat = sessionStorage.getItem('is_newChat') === 'true'
      this.chats = JSON.parse(sessionStorage.getItem('chats'))
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    backToFigure() {
      sessionStorage.setItem('figure_path', '/figures')
      this.$router.push({path: '/figures'})
    },
    next() {
      this.loading = this.$loading({
        lock: true,
        text: '图片生成中，请稍等...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      let params = {
        product_id: this.operateProductInfo.id,
        scripts: this.scripts,
        size: "portrait"
      }
      postAction('/picture/generate_images_parallel',params, 600000).then(res => {
        if (res.data.status === 'success') {
          this.loading.close();
          this.loading = null;
          sessionStorage.setItem('image_scripts', JSON.stringify(res.data.data))

          sessionStorage.setItem('figure_path', '/scriptToImage')
          this.$router.push({path: '/scriptToImage'})
        } else {
          this.loading.close();
          this.loading = null;
          this.$alert(res.data.message,'提示')
        }
      }).catch(err => {
        this.loading.close();
        this.loading = null;
        this.$alert(err,'提示')
      })
    }
  }
}
</script>

<style scoped>
.imageToScript {
  height: 100%;
  min-height: 800px;
  min-width: 900px;
  overflow-y: auto;
  overflow-x: hidden;
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

.operation-content {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.left {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.title {
  padding: 8px 16px;
  font-size: 18px;
  line-height: 28px;
  font-weight: bold;
  border-bottom: 1px solid #f3f4f6;
  color: #475569;
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

.script-item-label {
  flex: 1;
  font-size: 18px;
  font-weight: bold;
  line-height: 36px;
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

.footer {
  padding: 8px 16px;
  height: 40px;
  border-top: 1px solid #f3f4f6;
}

.footer >>> .el-button--primary {
  border-color: transparent !important;
}

.right {
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

.imageToScript >>> .el-input__inner:focus {
  outline: none;
  background: white;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.imageToScript >>> .el-input-number__decrease,
.imageToScript >>> .el-input-number__increase {
  background-color: transparent;
  border: none;
}

.marketing-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.marketing-highlights-tag {
  background-color: #F5F5F5;
  color: #525252;
  border-radius: 14px;
  border: 1px solid #F5F5F5;
  cursor: pointer;
  height: 28px;
  line-height: 28px;
  padding-left: 12px;
  padding-right: 12px;
}

.active-highlights-tag {
  background-color: #3b82f6 !important;
  color: #FFFFFF !important;
}

.placeholder-label {
  flex: 1;
  font-size: 12px;
  color: #4b5563;
  text-align: right;
  line-height: 40px;
}

.chat-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 408px;
  box-shadow: 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;
  background-color: #FFFFFF;
  border-radius: 12px;
  overflow: hidden;
}

.chat-frame {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
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
  box-shadow: 0 0  #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border-radius: 8px;
  border-top-left-radius: 0 !important;
  color: #4B5563;
  font-size: 14px;
}

.answer-message {
  background-color: #eff6ff;
  padding: 10px;
  box-shadow: 0 0  #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border-radius: 8px;
  border-top-right-radius: 0 !important;
  display: flex;
  gap: 8px;
}

.answer-message >>> .el-collapse  {
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
  width: 65px;
  background-color: #eff6ff;
  padding: 10px;
  box-shadow: 0 0  #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border-radius: 8px;
  border-top-right-radius: 0 !important;
  display: flex;
  gap: 8px;
}

.loading-area {
  font-size: 20px;
  color: #4B5563;
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
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
}

.answer-message-label {
  color: #3b82f6;
  font-weight: bold;
  font-size: 12px;
  line-height: 16px;
}

.ai-thinking-content {
  color: #4b5563;
  font-size: 14px;
  line-height: 20px;
  font-style: italic;
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
  padding: 12px;
  background-color: #f3f4f6;
  border-top: 1px solid #e5e7eb;
}

.create-chat-btn {
  color: #4b5563;
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 8px;
  cursor: pointer;
}

.send-placeholder {
  color: #6b7280;
  font-size: 12px;
  line-height: 16px;
  margin-top: 8px;
}
</style>