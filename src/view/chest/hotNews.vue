<template>
  <div class="hot-news">
    <div class="hot-news-search">
      <el-input prefix-icon="el-icon-search" placeholder="输入关键字搜索新闻" clearable
                class="hot-news-search-input" v-model="search_text"></el-input>
    </div>
    <div class="hot-news-body">
      <div style="flex: 1">
        <el-row style="height: 100%;" :gutter="20">
          <el-col :span="12" :md="10" :lg="8" style="height: 100%">
            <div class="hot-news-left">
              <div style="font-weight: bold">热门新闻榜单</div>
              <div class="hot-news-list">
                <div v-for="(item, index) in hot_news" :key="index" class="hot-news-item"
                     :class="{'active-hot': item === hot_news_info}" @click="hot_news_info = item">
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
                <div v-if="hot_news_info" style="font-size: 14px;color: #6e7572">历史文案</div>
              </div>
              <div class="hot-news-info" v-if="!show_script">
                <template v-if="hot_news_info">
                  <div class="hot-news-info-title">{{ hot_news_info.title }}</div>
                  <div v-html="detailHTML" class="hot-news-info-details"></div>
                </template>
                <template v-else>
                  <div class="none-container">
                    <i class="el-icon-document-list none-icon"></i>
                    <div class="none-desc">请点击左侧榜单选择新闻或<span class="custom-btn">自定义文案生成</span></div>
                  </div>
                </template>
              </div>
              <div class="hot-news-info" v-else>

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
        <div class="script-setting">
          <div class="script-setting-title">字数设置</div>
          <el-select v-model="script_params.words" style="width: 100%" class="margin-b-12">
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
                        :src="item.avatar" class="style-item-img"></el-image>
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
        <div style="text-align: center">
          <el-button type="primary" style="width: 250px" @click="generateScript">口播文案生成</el-button>
        </div>
      </div>
    </div>
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
        <div class="margin-t-12">上传单个商品详情页一张或多张截图提取商品信息</div>
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

export default {
  name: 'hotNews',
  data() {
    return {
      search_text: "",
      hot_news: [],
      hot_news_info: null,
      urls: {
        get_hot_news: "https://live.tellai.tech/api/news_assistant/news/rank",
        get_styles: "https://live.tellai.tech/api/news_assistant/copywriting/styles/query/all",
        extract_product_info: 'https://live.tellai.tech/api/news_assistant/extract_product_info',
        generate: 'https://live.tellai.tech/api/news_assistant/copywriting/voice',
      },
      script_params: {
        words: 200,
        style_id: '',
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
      show_script: true,
    }
  },
  mounted() {
    this.queryHotNews()
    this.queryStyles()
  },
  computed: {
    detailHTML() {
      if (this.hot_news_info.details) {
        return marked(this.hot_news_info.details)
      }
      return ""
    }
  },
  methods: {
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
        this.$alert('请选择图片', '提示');
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
      let params = {
        ...this.script_params,
        news_id: this.hot_news_info.id,
        news_details: this.hot_news_info.details,
      }
      axios.post(this.urls.generate, params, {timeout: 300000}).then(res => {
        if (res.data.status === 'success') {
          console.log(res.data)
        } else {
          this.$alert('生成失败' + res.data.message, '提示')
        }
      }).catch(err => {
        this.$alert('生成失败' + err, '提示')
      })
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
  text-align: center;
  margin-bottom: 16px;
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
</style>