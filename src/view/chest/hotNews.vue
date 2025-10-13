<template>
  <div class="hot-news" @click="searchBlur">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="back">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="hot-news-search flex-center" @click.stop="">
        <el-input prefix-icon="el-icon-search" placeholder="输入关键字，按回车搜索新闻" clearable
                  v-model="search_text" class="hot-news-search-input" @input="searchInput"
                  @keyup.enter.native="searchNews" @focus="searchFocus">
        </el-input>
        <div class="search-result-container" v-if="resultVisible">
          <div class="card-arrow"></div>
          <el-card class="search-result-card" shadow="hover">
            <div class="font-weight">搜索历史</div>
            <div class="search-history">
              <el-tag v-for="(item, index) in search_history" :key="index" type="info"
                      size="small" @click="selectNews(item)">
                {{ item.keyword }}
              </el-tag>
            </div>
            <div class="search-loading flex-center" v-if="search_loading">
              联网搜索中<i class="el-icon-loading" style="margin-left: 5px;"></i>
            </div>
            <div class="search-result-content" v-else-if="!search_loading && search_result"
                 @click="selectNews(search_result)">
              <div class="result-title">{{ search_result.title }}</div>
              <div class="result-details">{{ search_result.details }}</div>
            </div>
<!--            <div class="search-loading flex-center" v-else></div>-->
          </el-card>
        </div>
      </div>
      <div style="width: 36px"></div>
    </div>
    <div class="hot-news-body">
      <div style="flex: 1">
        <el-row style="height: 100%;" :gutter="20">
          <el-col :span="12" :md="10" :lg="8" style="height: 100%">
            <div class="hot-news-left">
              <div style="font-weight: bold">热门新闻榜单</div>
              <div class="hot-news-list">
                <div v-for="(item, index) in hot_news" :key="index" class="hot-news-item"
                     :class="{'active-hot': item === hot_news_info}" @click="selectNews(item)">
                  <div style="width: 40px;text-align: center" class="flex-center">
                    <el-image v-if="index === 0" :src="require('/public/images/hot1.png')" style="width: 25px;height: 25px;"></el-image>
                    <el-image v-if="index === 1" :src="require('/public/images/hot2.png')" style="width: 25px;height: 25px;"></el-image>
                    <el-image v-if="index === 2" :src="require('/public/images/hot3.png')" style="width: 25px;height: 25px;"></el-image>
                    <div v-if="index > 2">{{ index + 1 }}</div>
                  </div>
                  <div class="hot-news-item-title" :title="item.title">{{ item.title }}</div>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12" :md="14" :lg="16" style="height: 100%">
            <div class="hot-news-container">
              <div class="flex-center">
                <div style="font-weight: bold;flex: 1">{{ show_script ? '口播文案' : '新闻详情' }}</div>
                <div v-if="copy_history.length > 0" style="font-size: 14px;color: #6e7572;cursor: pointer"
                     @click="viewCopyHistory">历史文案</div>
              </div>
              <div class="hot-news-info" v-if="!show_script">
                <template v-if="hot_news_info">
                  <div class="hot-news-info-title">{{ hot_news_info.title }}</div>
                  <div v-html="detailHTML" class="hot-news-info-details"></div>
                </template>
                <template v-else>
                  <div class="none-container">
                    <i class="el-icon-document-list none-icon"></i>
                    <div class="none-desc">请先选择新闻或
                      <span class="custom-btn" @click="custom">自定义文案生成</span>
                    </div>
                  </div>
                </template>
              </div>
              <div class="copy-script" v-else>
                <el-input placeholder="文案标题..." v-model="oral_title"></el-input>
                <el-input type="textarea" resize="none" v-model="oral_copy"
                          style="height: calc(100% - 24px) !important;">
                </el-input>
              </div>
              <div style="font-size: 14px;margin-top: 5px;color: #6e7572">
                {{  show_script ? '内容由DeepSeek R1生成，禁止从事违法活动' : '内容来源网络' }}
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="hot-news-right" style="width: 400px;">
        <div style="font-weight: bold">生成设置</div>
        <div class="script-setting" v-if="!show_script">
          <div class="script-setting-title">字数设置</div>
          <el-select v-model="script_params.count" style="width: 100%" class="margin-b-12">
            <el-option
                v-for="item in words"
                :key="item.value"
                :value="item.value"
                :label="item.label">
            </el-option>
          </el-select>
          <div class="script-setting-title">文案风格</div>
          <div class="style-container margin-b-12">
            <div class="style-item" v-for="item in styles" :key="item.id" @click="script_params.style_id = item.id">
              <el-image :class="{'style-selected': script_params.style_id === item.id }"
                        :src="item.avatar" class="style-item-img" fit="cover"></el-image>
              <div class="flex-center">
                <div :class="{'style-title-selected': script_params.style_id === item.id }"
                     :title="item.name" class="style-item-title">
                  {{ item.name }}
                </div>
              </div>
            </div>
          </div>
          <div class="script-setting-title">带货设置</div>
          <el-button icon="el-icon-upload" @click="imageDialogVisible = true">提取商品信息</el-button>
          <div class="script-setting-product_info">{{ script_params.productInfo }}</div>
        </div>
        <div class="script-setting" v-else>
          <div class="script-setting-title">形象选择</div>
          <div class="style-container margin-b-12" style="max-height: calc(100% - 120px)">
            <div class="style-item" v-for="item in figures" :key="item.id" @click="select_figure = item">
              <el-image :class="{'style-selected': select_figure.id === item.id }"
                        :src="item.picture" class="style-item-img" fit="cover"></el-image>
              <div class="flex-center">
                <div :class="{'style-title-selected': select_figure.id === item.id }"
                     :title="item.name" class="style-item-title">
                  {{ item.name }}
                </div>
              </div>
            </div>
          </div>
          <div style="display: flex" @mousedown.stop="">
            <div class="s-voice-title" style="margin-top: 5px">主播声音</div>
            <el-popover ref="modePopoverRef" placement="bottom-start" trigger="click">
              <div class="mode-popover-item" @click="saveMode('common')">
                普通模式
                <i class="el-icon-check mode-select" v-if="mode === 'common'"></i>
              </div>
              <div class="mode-popover-item" @click="saveMode('advanced')">
                高级模式
                <i class="el-icon-check mode-select" v-if="mode === 'advanced'"></i>
              </div>
              <div slot="reference" class="mode-switch">
                {{ mode === 'common' ? '普通模式' : '高级模式' }}
                <i class="el-icon-arrow-down"></i>
              </div>
            </el-popover>
            <div class="mode-info" v-if="mode === 'advanced'">
              <i class="el-icon-info" style="font-size: 16px;margin-right: 5px"></i>
              高级模式将调用云端接口并计费
            </div>
          </div>
          <div class="s-voice-content margin-b-16">
            <div class="s-voice-btn">
              <i class="el-icon-play" @click="previewAudio(timbres, -1)" v-if="audioIndex !== -1"></i>
              <i class="el-icon-pause" @click="stopAudio" v-else></i>
            </div>
            <el-popover ref="voiceRef" placement="bottom" trigger="click" @hide="stopAudio" style="flex: 1">
              <div class="popover-content">
                <el-row>
                  <el-col :span="12" v-for="(voice, index) in mode === 'common'? voices : minimax_voices" :key="voice.id">
                    <div class="voice-item" :class="{ active: voice.id === timbres.id }" @click="selectVoice(voice)">
                      <div class="voice-icon" @click.stop="previewAudio(voice, index)" v-if="audioIndex !== index">
                        <i class="el-icon-play" style="font-size: 13px; color: #6286ed"></i>
                      </div>
                      <div class="voice-icon" @click.stop="stopAudio" v-else>
                        <i class="el-icon-pause" style="font-size: 13px; color: #6286ed"></i>
                      </div>
                      <div class="voice-name" :title="voice.name">{{ voice.name }}</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
              <div class="s-voice-name" slot="reference" :title="timbres.name">{{ timbres.name }}</div>
            </el-popover>
          </div>
        </div>
        <div style="text-align: center">
          <el-button type="primary" style="width: 250px" @click="generateScript" v-if="!show_script">口播文案生成</el-button>
          <el-button type="primary" style="width: 250px" @click="generateVideo" v-else>口播视频生成</el-button>
        </div>
      </div>
    </div>
    <el-dialog class="upload-dialog" :visible.sync="dialogVisible" width="600px">
      <div slot="title" class="upload-dialog-title">历史文案</div>
      <div class="upload-dialog-body" style="display: flex;gap: 12px;flex-direction: column" >
        <div v-for="(item,index) in copy_history" :key="index" class="copy-history-item"
             :class="{ 'copy-active': select_history_copy === item }"
             v-html="convert(item.copywriting)" @click="select_history_copy = item">
        </div>
      </div>
      <div slot="footer" class="upload-dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取消</el-button>
        <el-button type="primary" size="small" @click="sureSelect">确认选择</el-button>
      </div>
    </el-dialog>
    <el-dialog class="upload-dialog" :visible.sync="imageDialogVisible" width="600px" :before-close="beforeUploadClose">
      <div slot="title" class="upload-dialog-title">提取商品信息</div>
      <div class="upload-dialog-body">
        <el-upload
            drag
            ref="imageUpload"
            class="image-uploader"
            style="width: 100%"
            action="#"
            :on-change="handleImagesChange"
            :on-remove="handleImagesChange"
            :auto-upload="false"
            :file-list.sync="img_list"
            multiple>
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
        <div class="margin-t-12" style="line-height: 19px">
          请上传商品详情页的截图
          <el-tooltip placement="top">
            <div slot="content" style="width: 200px">
              <div class="margin-b-4">示例图片</div>
              <div style="text-align: center;width: 100%;">
                <el-image :src="require('/public/hotNews/extract.jpeg')" style="width: 150px;height: 150px" fit="cover"></el-image>
              </div>
              <div class="margin-t-12 margin-b-4">提取的商品信息</div>
              <div style="color: #c6c6c6;font-size: 12px">宜昌无籽蜜桔,蜜桔果肉饱满、色泽鲜艳，外皮部分还能看出带有绿色，其外皮薄，果肉汁水丰富。同时，商品提供顺丰包邮的物流服务，并且承诺 15 点前下单的订单当天就能发货，能让消费者较快收到商品</div>
            </div>
            <i class="el-icon-question"></i>
          </el-tooltip>
        </div>
      </div>
      <div slot="footer" class="upload-dialog-footer">
        <el-button @click="beforeUploadClose" size="small">取消</el-button>
        <el-button type="primary" @click="handleSubmitUpload" size="small" :loading="extract_loading">
          {{ extract_loading? '提取中': '提取' }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";
import {marked} from "marked";
import {getAction, postAction} from "@/api/api";

export default {
  name: 'hotNews',
  data() {
    return {
      search_text: "",
      search_result: null,
      resultVisible: false,
      search_loading: false,
      hot_news: [],
      search_history: [],
      hot_news_info: null,
      userId: '272f4122-ab74-4bc1-9cd6-c29a41fb508f',
      copy_history: [],
      dialogVisible: false,
      select_history_copy: null,
      // urls: {
      //   get_hot_news: "https://live.tellai.tech/api/news_assistant/news/rank",
      //   get_styles: "https://live.tellai.tech/api/news_assistant/copywriting/styles/query/all",
      //   extract_product_info: 'https://live.tellai.tech/api/news_assistant/extract_product_info',
      //   generate: 'https://live.tellai.tech/api/news_assistant/copywriting/voice',
      //   search_news: 'https://live.tellai.tech/api/news_assistant/news/online_search',
      //   get_search_history: 'https://live.tellai.tech/api/news_assistant/news/query/user',
      //   get_copy_history: 'https://live.tellai.tech/api/news_assistant/copywriting_history/query',
      //   generate_video: 'https://live.tellai.tech/api/news_assistant/figure/generate_video',
      // },
      urls: {
        get_hot_news: "http://192.168.1.25:5008/news/rank",
        get_styles: "http://192.168.1.25:5008/copywriting/styles/query/all",
        extract_product_info: 'http://192.168.1.25:5008/extract_product_info',
        generate: 'http://192.168.1.25:5008/copywriting/voice',
        search_news: 'http://192.168.1.25:5008/news/online_search',
        get_search_history: 'http://192.168.1.25:5008/news/query/user',
        get_copy_history: 'http://192.168.1.25:5008/copywriting_history/query',
        generate_video: 'https://live.tellai.tech/api/news_assistant/figure/generate_video',
      },
      script_params: {
        count: 200,
        style_id: 'default',
        productInfo: ''
      },
      words: [
        {value: 200, label: '200（口播约40秒）'},
        {value: 300, label: '300（口播约60秒）'},
        {value: 400, label: '400（口播约80秒）'},
        {value: 500, label: '500（口播约100秒）'},
        {value: 600, label: '600（口播约120秒）'},
      ],
      styles: [],
      img_list: [],
      image_base64_list: [],
      imageDialogVisible: false,
      extract_loading: false,
      show_script: false,
      oral_title: '',
      oral_copy: '',
      mode: 'common',
      audio: null,
      audioIndex: null,
      voices: [],
      minimax_voices: [],
      timbres: {},
      figures: [],
      select_figure: {}
    }
  },
  mounted() {
    this.queryHotNews()
    this.queryStyles()
    this.querySearchHistory()
    this.queryFigures()
    this.querySounds();
    this.queryMiniMaxVoices()
  },
  computed: {
    detailHTML() {
      if (this.hot_news_info.details) {
        return marked(this.hot_news_info.details)
      }
      return ""
    }
  },
  beforeDestroy() {
    this.stopAudio()
  },
  methods: {
    convert(copy) {
      return marked(copy)
    },
    sureSelect() {
      if (!this.select_history_copy) {
        this.$alert('请选择历史文案后重试', '提示');
        return;
      }
      this.oral_title = this.select_history_copy.title
      this.oral_copy = this.select_history_copy.copywriting
      this.dialogVisible = false
      this.show_script = true
    },
    selectVoice(voice) {
      this.timbres = voice
      this.$nextTick(() => {
        this.$refs.voiceRef.showPopper = false
      })
    },
    previewAudio(voice, index) {
      if (voice.id === '') {
        this.$message.warning("无音频预览");
        return;
      }
      this.stopAudio();

      setTimeout(() => {
        this.audio = new Audio(voice.filepath);
        this.audio.play();
        this.audioIndex = index;
        this.audio.onended = () => {
          this.audio = null;
          this.audioIndex = null;
        };
      }, 100);
    },
    stopAudio() {
      if (this.audio) {
        this.audio.pause();
        this.audio = null;
        this.audioIndex = null;
      }
    },
    saveMode(mode) {
      if (this.mode === mode) {
        return
      }
      this.mode = mode
      this.timbres = mode === 'common' ? this.voices[0] : this.minimax_voices[0]
      this.$refs.modePopoverRef.showPopper = false
    },
    custom() {
      this.show_script = true
    },
    searchFocus() {
      this.resultVisible = true;
    },
    searchBlur() {
      this.resultVisible = false;
    },
    searchInput() {
      this.search_result = null;
    },
    selectNews(item) {
      if (this.hot_news_info && item.id === this.hot_news_info.id) {
        return;
      }
      this.hot_news_info = item
      this.oral_title = item.title
      this.oral_copy = ''
      this.show_script = false
      this.resultVisible = false
      this.queryCopyHistory()
    },
    viewCopyHistory() {
      this.dialogVisible = true;
      this.select_history_copy = null
    },
    queryFigures() {
      getAction("/figure/query_success", {video_type: 'figure'}).then((res) => {
        if (res.data.status === "success") {
          this.figures = res.data.data.filter(item => item.status === "success")
        }
      }).catch((error) => {
        console.error("获取形象列表失败:", error);
      });
    },
    querySounds() {
      getAction("/timbres/get_all_common_timbre").then((res) => {
        if (res.data.status === "success") {
          this.voices = res.data.data;
          if (this.voices.length > 0) {
            this.timbres = this.voices[0];
          }
        } else {
          this.$message.error("获取声音列表失败。");
        }
      }).catch((error) => {
        console.error("获取声音列表失败:", error);
      });
    },
    queryMiniMaxVoices() {
      getAction("/timbres/get_all_system_timbres",{voice_mode: 'advanced'}).then((res) => {
        if (res.data.status === "success") {
          this.minimax_voices = res.data.data
        } else {
          this.$message.error("获取高级声音列表失败。");
        }
      }).catch((error) => {
        console.error("获取高级声音列表失败:", error);
      });
    },
    querySearchHistory() {
      let params = {
        user_id: this.userId,
      }
      axios.get(this.urls.get_search_history, { params: params }).then(res => {
        if (res.data.status === 'success') {
          this.search_history = res.data.data
        } else {
          this.$message.error(res.data.message)
        }
      }).catch(err => {
        console.log(err)
        this.$message.error(err)
      })
    },
    queryCopyHistory() {
      let params = {
        user_id: this.userId,
        news_id: this.hot_news_info.id
      }
      axios.get(this.urls.get_copy_history, {params: params}).then(res => {
        if (res.data.status === 'success') {
          this.copy_history = res.data.data
        } else {
          this.$message.error(res.data.message)
        }
      }).catch(err => {
        console.log(err)
        this.$message.error(err)
      })
    },
    searchNews() {
      if (this.search_text.trim() === '') {
        this.$alert('请输入关键字后重试', '提示');
        return;
      }
      this.resultVisible = true;
      this.search_loading = true;
      let params = {
        user_id: this.userId,
        keyword: this.search_text
      }
      axios.get(this.urls.search_news, { params: params, timeout: 1800000 }).then(res => {
        if (res.data.status === 'success') {
          this.search_loading = false;
          this.search_result = res.data.data
          this.querySearchHistory()
        } else {
          this.search_loading = false;
          this.$alert(res.data.message, '提示')
        }
      }).catch(err => {
        this.search_loading = false;
        this.$alert(err, '提示')
      })
    },
    queryHotNews() {
      axios.get(this.urls.get_hot_news).then(res => {
        if (res.data.status === 'success') {
          this.hot_news = res.data.data
        } else {
          this.$alert(res.data.message, '提示')
        }
      }).catch(err => {
        this.$alert(err, '提示')
      })
    },
    queryStyles() {
      axios.get(this.urls.get_styles).then(res => {
        if (res.data.status === 'success') {
          this.styles = res.data.data
        } else {
          this.$alert(res.data.message, '提示')
        }
      }).catch(err => {
        this.$alert(err, '提示')
      })
    },
    handleImagesChange(file, fileList) {
      this.img_list = fileList;

      const reader = new FileReader();
      reader.onload = (e) => {
        file.base64 = e.target.result;
        this.image_base64_list = fileList.map(f => ({
          base64: f.raw ? e.target.result : f.base64
        }));
      };
      reader.readAsDataURL(file.raw);
    },
    beforeUploadClose() {
      if (this.extract_loading) {
        return;
      }
      if (this.$refs.imageUpload) {
        this.$refs.imageUpload.clearFiles();
      }
      this.img_list = [];
      this.imageDialogVisible = false;
    },
    async handleSubmitUpload() {
      if (this.img_list.length === 0) {
        this.$alert('请选择图片后重试', '提示');
        return;
      }
      let params = {
        image_base64_list: this.image_base64_list
      }
      axios.post(this.urls.extract_product_info,params,{ timeout: 1800000 }).then(res => {
        if (res.data.status === 'success') {
          this.script_params.productInfo = res.data.data.product_info
        } else {
          this.$alert('提取失败' + res.data.message, '提示')
        }
      }).catch(err => {
        this.$alert('提取错误' + err, '提示')
      })
    },
    generateScript() {
      if (!this.hot_news_info) {
        this.$alert('请选择热榜新闻后重试', '提示');
        return;
      }
      let params = {
        ...this.script_params,
        user_id: this.userId,
        news_id: this.hot_news_info.id,
        news_details: this.hot_news_info.details,
      }
      const loading = this.$loading({
        lock: true,
        text: '口播文案生成中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      axios.post(this.urls.generate, params, {timeout: 300000}).then(res => {
        if (res.data.status === 'success') {
          loading.close()
          this.oral_copy = res.data.data.script
          this.show_script = true
        } else {
          this.$alert('生成失败' + res.data.message, '提示')
        }
      }).catch(err => {
        this.$alert('生成失败' + err, '提示')
      })
    },
    generateVideo() {
      if (!this.oral_title) {
        this.$alert('请输入口播视频标题后重试', '提示');
        return;
      }
      if (!this.oral_copy) {
        this.$alert('请输入口播视频文案后重试', '提示');
        return;
      }
      if (!this.select_figure.id) {
        this.$alert('请选择数字人形象后重试', '提示');
        return;
      }
      if (!this.timbres.id) {
        this.$alert('请选择音色后重试', '提示');
        return;
      }
      let params = {
        user_id: this.userId,
        voice_id: this.timbres.voice_id,
        video_id: this.select_figure.video_id,
        voice_mode: this.mode,
        filename_list: [this.oral_title],
        text_list: [this.oral_copy],
        title_params: {
          title_text_list: [this.oral_title],
        },
      }
      postAction("/figure/generate_video_v2", params).then(res => {
        if (res.data.status === 'success') {
          this.$alert('已创建口播视频生成任务，视频生成成功后会自动下载到本地', "任务创建提醒");
          setTimeout(() => {
            this.$router.push({path: '/videoList'})
          }, 500)
        } else {
          this.$alert(res.data.message, "生成视频任务创建失败")
        }
      }).catch(err => {
        this.$alert(err, "生成视频任务创建错误")
      })
    },
    back() {
      this.$router.push({ path: '/chest'})
    }
  }
}
</script>

<style scoped>
.hot-news {
  height: 100%;
  min-width: 1200px;
}

.hot-news-search {
  height: 40px;
  width: 100%;
  margin-bottom: 16px;
  position: relative;
}

.hot-news-search-input {
  width: 500px;
}

.hot-news-search >>> .el-input__icon {
  line-height: 40px;
}

.hot-news-search >>> .el-input__inner {
  height: 40px;
  line-height: 40px;
  border-radius: 20px;
  background-color: #F5F5F5;
  font-size: 14px;
}

.search-result-container {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 500px;
  margin-top: 10px;
  z-index: 1000;
}

.search-result-container >>> .el-card__body {
  padding: 16px !important;
}

.card-arrow {
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #fff;
  z-index: 1;
}

.search-result-card {
  margin: 0;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-history {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  max-height: 60px;
  overflow-y: auto;
  margin: 8px 0;
}

::v-deep .el-tag {
  cursor: pointer;
  font-size: 11px;
}

.search-result-content {
  cursor: pointer;
  padding: 5px;
  border-top: 1px solid #f3f4f6;
}

.search-result-content:hover {
  background: #f3f4f6;
  color: #374151;
}

.search-loading {
  height: 60px;
  font-size: 15px;
  border-top: 1px solid #f3f4f6;
}

.result-title {
  font-size: 15px;
  height: 30px;
  line-height: 30px;
  font-weight: bold;
}

.result-details {
  font-size: 14px;
  height: 20px;
  line-height: 20px;
  color: #333333;
  font-weight: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-news-body {
  height: calc(100% - 60px);
  display: flex;
  gap: 20px;
}

.hot-news-left, .hot-news-right {
  width: 100%;
  padding: 19px;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;
  height: 100%;
}

.hot-news-list {
  height: calc(100% - 40px);
  margin-top: 16px;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
}

.hot-news-item {
  display: flex;
  gap: 10px;
  line-height: 40px;
  cursor: pointer;
  font-size: 14px;
  color: #333333;
}

.hot-news-item:hover {
  background: #f3f4f6;
  color: #000000;
  transform: translateX(2px);
}

.active-hot {
  color: #409eff;
  font-weight: bold;
}

.hot-news-item-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-news-container {
  width: 100%;
  padding: 19px;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;
  height: 100%;
}

.hot-news-info {
  height: calc(100% - 55px);
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  padding: 0 12px;
  margin-top: 10px;
  box-sizing: border-box;
  border-radius: 8px;
  background-color: #f8fafc;
}

.hot-news-info-title {
  font-size: 15px;
  font-weight: bold;
  margin: 10px 0;
}

.hot-news-info-details {
  font-size: 14px;
  line-height: 24px;
}

.hot-news-right >>> .el-input__inner {
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #DCDFE6;
  height: 35px;
  line-height: 35px;
  padding: 0 5px 0 15px;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.hot-news-right >>> .el-input__icon {
  line-height: 35px;
}

.script-setting {
  height: calc(100% - 80px);
  margin: 10px 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.script-setting-title {
  font-size: 12px;
  color: #4b5563;
  margin-bottom: 4px;
}

.style-container {
  display: grid;
  gap: 15px;
  background-color: #FFFFFF;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  grid-auto-rows: min-content;
  position: relative;
  cursor: pointer;
  margin-top: 5px;
  overflow-y: auto;
}

.style-item {
  max-width: 140px;
}

.style-item-img {
  width: 100%;
  max-width: 140px;
  aspect-ratio: 3 / 4;
  border-radius: 10px;
  box-sizing: border-box;
}

.style-selected {
  border: 2px solid #4c8df1;
}

.style-title-selected {
  color: #4c8df1 !important;
}

.style-item-title {
  font-size: 14px;
  color: #1e1f20;
  width: 100%;
  max-width: 120px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.script-setting-product_info {
  width: 100%;
  min-height: 100px;
  padding: 0 12px;
  margin-top: 10px;
  box-sizing: border-box;
  border-radius: 8px;
  background-color: #f8fafc;
  font-size: 13px;
}

.upload-dialog >>> .el-dialog {
  border-radius: 10px;
}

.upload-dialog-title {
  padding: 20px 20px 10px;
  line-height: 24px;
  font-size: 18px;
  color: #303133;
  font-weight: 700;
}

.upload-dialog-body {
  padding: 10px 20px;
  max-height: calc(70vh - 120px);
  overflow-y: auto;
  overflow-x: hidden;
}

.upload-dialog-footer {
  padding: 10px 20px 20px;
}

.upload-dialog >>> .el-dialog__header {
  padding: 0;
}

.upload-dialog >>> .el-dialog__close {
  color: #9ca3af;
  font-size: 24px;
}

.upload-dialog >>> .el-dialog__body {
  padding: 0;
}

.upload-dialog >>> .el-dialog__footer {
  padding: 0;
}

.image-uploader >>> .el-upload {
  width: 100%;
}

.image-uploader >>> .el-upload-dragger {
  width: 100%;
}

.image-uploader >>> .el-upload-list {
  max-height: 80px;
  overflow: auto;
}

.none-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.none-icon {
  font-size: 54px;
  color: #9ca3af;
}

.none-desc {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 8px;
}

.custom-btn {
  color: #409eff !important;
  cursor: pointer;
}

.copy-script {
  height: calc(100% - 55px);
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  margin-top: 10px;
  box-sizing: border-box;
}

.copy-script >>> .el-input__inner {
  border: none;
  text-align: center;
  height: 24px;
  line-height: 24px;
  font-size: 15px;
  font-weight: bold;
}

.copy-script >>> .el-textarea__inner {
  height: 100%;
  background-color: #f8fafc;
  font-size: 13px !important;
  border: none;
}

.copy-script >>> .el-textarea__inner:focus {
  outline: none;
  box-shadow: none;
}

.s-voice-title {
  font-size: 12px;
  color: #374151;
}

.mode-switch {
  background-color: #f3f4f6;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: 16px;
}

.mode-popover-item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 20px;
  line-height: 20px;
}

.mode-popover-item:hover {
  background-color: #f5f7fa;
}

.mode-select {
  color: #409EFF;
  font-weight: bold;
  font-size: 14px;
  margin-left: auto;
}

.mode-info {
  margin-left: 10px;
  font-size: 12px;
  display: flex;
  align-items: center;
  color: #909399;
}

.s-voice-content {
  padding: 8px;
  border-radius: 6px;
  margin-top: 4px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
}

.s-voice-btn {
  aspect-ratio: 1 / 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  color: #6286ed;
  cursor: pointer;
}

.popover-content {
  width: 350px;
  height: 250px;
  border-radius: 10px;
  overflow: auto;
}

.voice-item {
  height: 80px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.active {
  background-color: #e0e7fb;
}

.voice-icon {
  width: 42px;
  height: 37px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #c7d4f8;
  border-radius: 10px;
}

.voice-name {
  width: 100px;
  margin-left: 10px;
  font-size: 14px;
  color: #101010;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.s-voice-name {
  background-color: #f3f4f6;
  padding: 4px 4px 4px 8px;
  box-sizing: border-box;
  font-size: 12px;
  height: 22px;
  border-radius: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.copy-history-item {
  max-height: 140px;
  overflow: auto;
  background-color: #f3f4f6;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 20px;
  cursor: pointer;
}

.copy-history-item:hover {
  background-color: #e0edff;
}

.copy-active {
  border: 1px solid #6286ed;
  box-sizing: border-box;
  background-color: #e7edff;
}
</style>