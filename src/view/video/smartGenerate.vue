<template>
  <div class="smart-generate">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="back">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="smart-generate-h-t">编辑文案</div>
      <div style="width: 36px"></div>
    </div>
    <div class="smart-generate-c margin-b-12">
      <el-row style="height: 100%;" :gutter="20">
        <el-col :span="12" :md="10" :lg="8" style="height: 100%">
          <div class="smart-generate-c-l">
            <div class="font-weight">生成文案</div>
            <el-collapse v-model="activeName" accordion>
              <el-collapse-item title="AI批量生成" name="1">
                <div class="smart-generate-c-l-ai">
                  <div style="max-height: max(calc(100vh - 410px), 330px); overflow-y: auto" ref="scriptForm">
                    <div class="smart-generate-c-l-ai-title">文案要求</div>
                    <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }"
                              placeholder="例如：关于 店铺品类(如火锅店、服装店等)相关文案，主推 产品/服务(如招牌菜、爆款服装等)"
                              class="margin-b-12" v-model="copy_require" resize="none" @change="saveSetting"></el-input>
                    <div class="smart-generate-c-l-ai-title">示例文案（选填）</div>
                    <div class="flex-center margin-b-16 example_textarea" v-for="(text, index) in exampleTexts"
                         :key="index">
                      <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }"
                                placeholder="提供一个你喜欢的风格的例子"
                                v-model="exampleTexts[index]" resize="none" @change="saveSetting"></el-input>
                      <!--                      <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeText(index)"></el-button>-->
                      <i class="el-icon-close example-close-icon" @click="removeText(index)" v-if="index !== 0"></i>
                    </div>
                    <div class="margin-b-16 add_example_btn">
                      <el-button @click="addExampleText"><i class="el-icon-plus add_example_icon"></i>
                        添加示例文案
                      </el-button>
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
                        <el-input type="number" v-model="script_num" min="1" max="10" @change="saveSetting"
                                  @blur="validateNum"></el-input>
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
              </el-collapse-item>
              <el-collapse-item title="手动添加文案" name="2">
                <div class="smart-generate-c-l-manual">
                  <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 3 }" placeholder="文案标题..."
                            class="margin-b-12" v-model="copy_title" resize="none"></el-input>
                  <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" placeholder="文案内容..."
                            class="margin-b-12" v-model="copy_content" resize="none"></el-input>
                  <el-button type="primary" style="width: 100%" @click="addCopy">添加文案</el-button>
                </div>
              </el-collapse-item>
              <el-collapse-item title="无文案内容" name="3" v-if="script_type === 'material' && !selected_figure.id">
                <div class="no-copy-content">
                  <div style="display: flex;gap: 12px" class="margin-b-12">
                    <div style="flex: 1">
                      <div class="panel-label">时长 (秒)</div>
                      <el-input type="number" v-model="no_copy_duration" :step="15"></el-input>
                    </div>
                    <div style="flex: 1">
                      <div class="panel-label">数量</div>
                      <el-input type="number" v-model="no_copy_nums" min="1" max="10" @blur="validateNum"></el-input>
                    </div>
                  </div>
                  <el-button type="primary" style="width: 100%" @click="generateNoCopy">生成</el-button>
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
                       v-if="!item.isEdit" @click="showEdit(index)">
                    <div class="copy-item-title" :title="item.title">{{ item.title }}</div>
                    <div class="copy-item-desc" :title="item.content" v-if="item.content">
                      {{ item.content }}
                    </div>
                    <div class="copy-item-desc" style="display: flex;gap: 2px" v-else>
                      <i class="el-icon-wuneirong" style="line-height: 16px"></i>
                      <div style="line-height: 16px">无文案</div>
                      <div style="margin: 0 5px;line-height: 15px">|</div>
                      <i class="el-icon-time" style="line-height: 16px"></i>
                      <div style="line-height: 16px">{{ item.duration + 's' }}</div>
                    </div>
                  </div>
                  <div class="copy-item-content" v-else>
                    <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 3 }" placeholder="文案标题..."
                              class="margin-b-12" v-model="new_title" resize="none"></el-input>
                    <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" placeholder="文案内容..."
                              class="margin-b-12" v-model="new_content" resize="none" v-if="!item.duration"></el-input>
                    <div class="copy-item-desc margin-b-12" style="display: flex;gap: 2px" v-if="item.duration">
                      <i class="el-icon-wuneirong" style="line-height: 16px"></i>
                      <div style="line-height: 16px">无文案</div>
                      <div style="margin: 0 5px;line-height: 15px">|</div>
                      <i class="el-icon-time" style="line-height: 16px"></i>
                      <div style="line-height: 16px">{{ item.duration + 's' }}</div>
                    </div>
                    <el-button class="copy-item-save" type="primary" @click="saveCopy(index)">保存修改</el-button>
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
      <el-button type="primary" style="width: 176px" @click="nextStep"
                 v-if="script_type === 'material'">下一步：智能成片
      </el-button>
      <el-button type="primary" style="width: 176px" @click="verify" v-else>生成视频</el-button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {getAction, postAction} from "@/api/api";

export default {
  data() {
    return {
      activeName: '1',
      copy_require: '',
      exampleTexts: [''],
      copy_num: 100,
      script_num: 1,
      ai_model: 'deepseek_v3',
      copy_title: '',
      copy_content: '',
      copy_list: [],
      new_title: '',
      new_content: '',
      script_type: '',

      figure: {},
      sound: {},
      voice_mode: '',
      bgm: {},
      material_bgm: {},
      top_offset_ratio: 0,
      bottom_offset_ratio: 0,
      withSubtitle: false,
      withTitle: false,
      bg_volume: 0.5,
      subtitleParams: {},
      subtitleNameParams: {},
      use_background: false,
      name_use_background: false,
      show_model: '',

      no_copy_duration: 15,
      no_copy_nums: 1,

      reverse: false,
      mention_list: [], //选择的素材列表
      selected_figure: {}
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    generateNoCopy() {
      const maxTitleNumber = this.copy_list.reduce((max, item) => {
        const match = item.title.match(/无文案剪辑视频(\d+)/);
        if (match) {
          const currentNumber = parseInt(match[1], 10);
          return Math.max(max, currentNumber);
        }
        return max;
      }, 0);
      this.copy_list = [
        ...this.copy_list,
        ...Array.from({length: this.no_copy_nums}, (_, i) => ({
          title: `无文案剪辑视频${maxTitleNumber + i + 1}`,
          content: '',
          isEdit: false,
          bgm: this.material_bgm,
          duration: this.no_copy_duration
        }))
      ];
      sessionStorage.setItem("copy_list", JSON.stringify(this.copy_list));
      sessionStorage.removeItem('montage_data')
    },
    saveSetting() {
      this.validateNum()
      let smart_generate_setting = {
        copy_require: this.copy_require,
        exampleTexts: this.exampleTexts,
        copy_num: this.copy_num,
        script_num: this.script_num,
        ai_model: this.ai_model
      }
      sessionStorage.setItem("smart_generate_setting", JSON.stringify(smart_generate_setting))
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
    addExampleText() {
      this.exampleTexts.push('');
      this.$nextTick(() => { //自动滚到到底部
        const scriptForm = this.$refs.scriptForm;
        scriptForm.scrollTop = scriptForm.scrollHeight;
      });
      this.saveSetting()
    },
    removeText(index) {
      this.exampleTexts.splice(index, 1);
      this.saveSetting()
    },
    initData() {
      this.mention_list = JSON.parse(sessionStorage.getItem('mention_list')) || []
      this.selected_figure = JSON.parse(sessionStorage.getItem('material_figure')) || {}
      this.script_type = sessionStorage.getItem("script_type")
      if (this.script_type === 'material') {
        this.copy_list = sessionStorage.getItem("copy_list") ? JSON.parse(sessionStorage.getItem("copy_list")) : []
        this.material_bgm = JSON.parse(sessionStorage.getItem('setting_bgm')) || {}
      } else {
        this.copy_list = sessionStorage.getItem("figure_copy_list") ? JSON.parse(sessionStorage.getItem("figure_copy_list")) : []
        this.material_bgm = JSON.parse(sessionStorage.getItem('figure_setting_bgm')) || {}
      }
      let smart_generate_setting = JSON.parse(sessionStorage.getItem("smart_generate_setting")) || {}
      this.copy_require = smart_generate_setting.copy_require || ''
      this.exampleTexts = smart_generate_setting.exampleTexts || ['']
      this.copy_num = parseInt(smart_generate_setting.copy_num) || 100
      this.script_num = parseInt(smart_generate_setting.script_num) || 1
      this.ai_model = smart_generate_setting.ai_model || 'deepseek_v3'
      this.initParams()
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
      const store_id = this.script_type === 'material' ? this.mention_list[0].store_id : ''
      let params = {
        examples: cleanTexts,
        requirements: this.copy_require,
        num_of_words: parseInt(this.copy_num),
        script_count: parseInt(this.script_num),
        store_id: store_id
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
              item => ({title: item.title, content: item.script, isEdit: false, bgm: this.material_bgm})))
          if (this.script_type === 'material') {
            sessionStorage.setItem("copy_list", JSON.stringify(this.copy_list))
            sessionStorage.removeItem('montage_data')
          }else {
            sessionStorage.setItem("figure_copy_list", JSON.stringify(this.copy_list))
          }
        } else {
          this.$alert(res.data.message,'文案生成失败')
        }
      }).catch(err => {
        this.loading.close();
        this.loading = null;
        this.$alert(err,'文案生成错误')
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
        isEdit: false,
        bgm: this.material_bgm
      });
      this.copy_title = '';
      this.copy_content = '';
      if (this.script_type === 'material') {
        sessionStorage.setItem("copy_list", JSON.stringify(this.copy_list))
        sessionStorage.removeItem('montage_data')
      }else {
        sessionStorage.setItem("figure_copy_list", JSON.stringify(this.copy_list))
      }
    },
    showEdit(index) {
      this.copy_list.forEach((copy, i) => {
        copy.isEdit = i === index;
      })
      this.new_title = this.copy_list[index].title
      this.new_content = this.copy_list[index].content
    },
    saveCopy(index) {
      if (this.new_title === '') {
        this.$alert('请输入文案标题', '提示')
        return
      }
      if (this.new_content === '' && !this.copy_list[index].duration) {
        this.$alert('请输入文案内容', '提示')
        return;
      }
      this.copy_list[index].isEdit = false;
      this.copy_list[index].title = this.new_title;
      this.copy_list[index].content = this.new_content;
      if (this.script_type === 'material') {
        sessionStorage.setItem("copy_list", JSON.stringify(this.copy_list))
        sessionStorage.removeItem('montage_data')
      }else {
        sessionStorage.setItem("figure_copy_list", JSON.stringify(this.copy_list))
      }
    },
    removeCopy(index) {
      this.$confirm('确认删除该文案吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.copy_list.splice(index, 1);
        if (this.script_type === 'material') {
          sessionStorage.setItem("copy_list", JSON.stringify(this.copy_list))
          sessionStorage.removeItem('montage_data')
        }else {
          sessionStorage.setItem("figure_copy_list", JSON.stringify(this.copy_list))
        }
      }).catch((err) => {
        this.$message({type: 'info', message: '已取消删除'});
      });
    },
    nextStep() {
      if (this.copy_list.length === 0) {
        this.$alert('请先添加口播文案', "提示")
        return;
      }
      if (this.selected_figure.id && this.copy_list.some(item => item.duration)) {
        this.$alert('已选择数字人出境，请先删除无文案剪辑视频','提示')
        return;
      }
      sessionStorage.setItem('video_path', '/montage')
      this.$router.push({path: '/montage'})
    },
    verify() {
      getAction('/verify/activation').then(res => {
        if (res.data.status === 'success') {
          this.generateVideo()
        } else {
          this.$alert(res.data.message, "验证失败");
        }
      }).catch(err => {
        console.log(err)
      })
    },
    initParams() {
      this.figure = JSON.parse(sessionStorage.getItem('figure')) || {}
      this.sound = JSON.parse(sessionStorage.getItem('figure_setting_voice')) || {}
      this.voice_mode = sessionStorage.getItem('figure_setting_mode') || 'common'
      this.bgm = JSON.parse(sessionStorage.getItem('figure_setting_bgm')) || {}

      this.reverse = sessionStorage.getItem("figure_setting_reverse") === 'true'

      this.top_offset_ratio = Number(sessionStorage.getItem('figure_top_offset_ratio'))
      this.bottom_offset_ratio = Number(sessionStorage.getItem('figure_bottom_offset_ratio'))

      this.withSubtitle = sessionStorage.getItem("figure_with_subtitle") === 'true'
      this.withTitle = sessionStorage.getItem("figure_with_title") === 'true'
      this.bg_volume = Number(sessionStorage.getItem("figure_bg_volume")) || 0.5

      this.use_background = sessionStorage.getItem("figure_use_background") === 'true'
      this.name_use_background = sessionStorage.getItem("figure_name_use_background") === 'true'
      this.subtitleParams.fontsize = parseInt(sessionStorage.getItem("figure_fontsize")) || 5
      this.subtitleParams.color = sessionStorage.getItem("figure_color") || '#ffffff'
      this.subtitleParams.font = sessionStorage.getItem("figure_font") || 'SJxingkai-C-Regular'
      this.subtitleParams.background_color = sessionStorage.getItem("figure_background_color") || '#404040'
      this.subtitleParams.background_opacity = Number(sessionStorage.getItem("figure_background_opacity")) || 0.6
      this.subtitleParams.content_font_opacity = Number(sessionStorage.getItem("figure_content_font_opacity")) || 1
      this.subtitleParams.stroke_color = sessionStorage.getItem("figure_stroke_color") || '#000000'

      this.show_model = sessionStorage.getItem('figure_show_model') || 'begin'
      this.subtitleNameParams.name_fontsize = parseInt(sessionStorage.getItem("figure_name_fontsize")) || 10
      this.subtitleNameParams.name_color = sessionStorage.getItem("figure_name_color") || '#ffffff'
      this.subtitleNameParams.name_font = sessionStorage.getItem("figure_name_font") || 'SJxingkai-C-Regular'
      this.subtitleNameParams.name_background_color = sessionStorage.getItem("figure_name_background_color") || '#404040'
      this.subtitleNameParams.name_background_opacity = Number(sessionStorage.getItem("figure_name_background_opacity")) || 0.6
      this.subtitleNameParams.title_font_opacity = Number(sessionStorage.getItem("figure_title_font_opacity")) || 1
      this.subtitleNameParams.name_stroke_color = sessionStorage.getItem("figure_name_stroke_color") || '#000000'
    },
    generateVideo() {
      if (this.copy_list.length === 0) {
        this.$alert('请先添加口播文案', "提示")
        return;
      }
      if (this.copy_list.some(item => item.title === "" || item.content === "")) {
        this.$alert('文案标题、内容不能为空', "提示");
        return
      }

      let name = this.setName()
      let params = {
        video_id: this.figure.video_id,
        voice_id: this.sound.voice_id,
        voice_mode: this.voice_mode,
        bgm_id: this.bgm.id,
        bg_volume: this.bg_volume,
        filename_list: name,
        reverse: this.reverse,
        text_list: this.copy_list.map(item => item.content),
        with_subtitle: this.withSubtitle,
        with_title: this.withTitle,
        subtitle_params: {
          y_offset: this.bottom_offset_ratio,
          font: this.subtitleParams.font,
          fontsize: this.subtitleParams['fontsize'],
          color: this.subtitleParams.color,
          font_opacity: this.subtitleParams.content_font_opacity,
          stroke_color: this.subtitleParams.stroke_color,
          use_background: this.use_background,
          background_color: this.subtitleParams.background_color,
          background_opacity: this.subtitleParams.background_opacity
        },
        title_params: {
          y_offset: this.top_offset_ratio,
          title_text_list: this.copy_list.map(item => item.title),
          show_model: this.show_model,
          font: this.subtitleNameParams.name_font,
          fontsize: this.subtitleNameParams.name_fontsize,
          color: this.subtitleNameParams.name_color,
          font_opacity: this.subtitleNameParams.title_font_opacity,
          stroke_color: this.subtitleNameParams.name_stroke_color,
          use_background: this.name_use_background,
          background_color: this.subtitleNameParams.name_background_color,
          background_opacity: this.subtitleNameParams.name_background_opacity
        },
      };
      postAction("/figure/generate_video_v2", params).then((res) => {
        if (res.data.status === "success") {
          this.$alert('已创建视频生成任务，视频生成成功后会自动下载到本地', "任务创建提醒");
          sessionStorage.clear()
          setTimeout(() => {
            this.$router.push({path: '/videoList'})
          }, 500)
        } else {
          this.$alert(res.data.message, "生成视频任务创建失败")
        }
      }).catch((error) => {
        this.$alert(error, "生成视频任务创建错误")
      });
    },
    setName() {
      let data = new Date();
      let year = data.getFullYear();
      let month = String(data.getMonth() + 1).padStart(2, "0");
      let day = String(data.getDate()).padStart(2, "0");
      let hours = String(data.getHours()).padStart(2, "0");
      let minutes = String(data.getMinutes()).padStart(2, "0");
      let seconds = String(data.getSeconds()).padStart(2, "0");
      let base = month + '-' + day + '_' + hours + '-' + minutes + '-' + seconds

      let result = [];
      for (let i = 1; i <= this.copy_list.length; i++) {
        result.push(base + '_' + i);
      }

      return result;
    },
    back() {
      let path = this.script_type === 'material' ? '/material' : '/human'
      sessionStorage.setItem('video_path', path)
      this.$router.push({path: path})
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

.smart-generate-c-r {
  display: flex;
  flex-direction: column;
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
  padding: 0 4px 16px 4px;
}

.smart-generate-c-l-ai >>> .el-textarea__inner,
.smart-generate-c-l-manual >>> .el-textarea__inner,
.copy-item-content >>> .el-textarea__inner {
  padding: 8px;
  font-size: 13px;
  color: #4f5153;
  background-color: #f9f9f9;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.example_textarea {
  position: relative;
}

.example-close-icon {
  position: absolute;
  right: 8px;
  top: 8px;
  color: #9ca3af;
  font-size: 16px;
  cursor: pointer;
  font-weight: 600;
}

.example-close-icon:hover {
  color: #ef4444;
}

.example_textarea >>> .el-textarea__inner {
  padding-right: 30px !important;
}

.smart-generate-c-l-ai >>> .el-textarea__inner:focus,
.smart-generate-c-l-manual >>> .el-textarea__inner:focus,
.copy-item-content >>> .el-textarea__inner:focus {
  outline: none;
  background: white;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.smart-generate-c-l-ai >>> .el-input__inner,
.no-copy-content >>> .el-input__inner,
.smart-generate-c-l-manual >>> .el-input__inner,
.copy-item-content >>> .el-input__inner {
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #DCDFE6;
  height: 30px;
  line-height: 30px;
  padding: 0 5px 0 15px;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.smart-generate-c-l-ai >>> .el-input__icon,
.smart-generate-c-l-manual >>> .el-input__icon {
  line-height: 30px;
}

.batch-btn {
  width: 100%;
}

.add_example_btn >>> .el-button {
  width: 100%;
  background-color: #eef2ff;
  color: #4338ca;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #c7d2fe;
}

.add_example_icon {
  font-size: 10px;
  font-weight: bold;
  line-height: 16px;
}

.smart-generate-c-l-ai-title {
  font-size: 12px;
  color: #4b5563;
  margin-bottom: 4px;
}

.smart-generate-c-r-list {
  flex: 1;
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

::v-deep .el-switch__label {
  font-weight: bold;
}
</style>