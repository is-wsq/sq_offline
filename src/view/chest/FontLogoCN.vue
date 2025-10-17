<template>
  <div class="font-logo-cn"
       v-loading="loading"
       element-loading-text="logo制作中..."
       element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.8)">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="back">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="c-page-header">中文字体logo</div>
      <div style="width: 36px"></div>
    </div>
    <div class="font-logo-cn-content">
      <div class="work-setting-area">
        <div class="font-weight">工作台</div>
        <div style="flex: 1;overflow-y: auto">
          <div class="work-setting-label">logo设计要求</div>
          <el-input type="textarea" v-model="design_requirements" :autosize="{ minRows: 3 }"
                    placeholder="请输入设计要求..." resize="none"></el-input>
        </div>
        <div class="generate-btn">
          <el-button @click="generate" :loading="!!loading" :disabled="!design_requirements">
            <i class="el-icon-bianjiqi btn-icon" v-if="!loading"></i>
            {{ !!loading ? 'logo制作中...' : '制作logo' }}
          </el-button>
        </div>
      </div>
      <div class="font-logo-cn-preview">
        <div class="preview-header">
          <div class="preview-header-title">应用介绍&输入建议</div>
          <div class="preview-header-desc">
            <div>
              填写logo设计要求，即可直出中文字体logo
            </div>
          </div>
        </div>
        <div class="preview-body">
          <el-button type="text" class="cut-btn" @click="activeIndex --" :disabled="activeIndex === 0">
            <i class="el-icon-arrow-left"></i>
          </el-button>
          <div class="preview-result">
            <el-image :src="resultList[activeIndex]" class="preview-image" fit="contain"></el-image>
          </div>
          <el-button type="text" class="cut-btn" @click="activeIndex ++" :disabled="activeIndex === resultList.length - 1">
            <i class="el-icon-arrow-right"></i>
          </el-button>
          <div class="preview-list">
            <div v-for="(item, index) in resultList" :key="index">
              <el-image class="preview-list-item" :class="{ 'preview-list-item-active': index === activeIndex }"
                        :src="item" fit="cover" @click="activeIndex = index"></el-image>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ClearCacheMixin} from "@/mixins/ClearCacheMixin";
import {postAction} from "@/api/api";

export default {
  name: 'FontLogoCN',
  mixins: [ClearCacheMixin],
  data() {
    return {
      design_requirements: '版画标志设计，黑白印刷风格的标志。图形打印，简单的细节。抽象的图形。标志设计，大面积留白。品牌logo地图，整体设计风格简约而富有古典气息。在图片的左边是一个穿着传统服装的女人的形象。她的头发梳成一个发髻，她的脸很平静，她的右手放在她的嘴，她似乎轻轻地触摸她的嘴唇在一个优雅的姿势。女性形象以黑色线条勾勒，背景为白色，简洁优雅。在图片的右侧是三个汉字“中文”，字体是黑色的，旁边是拼音“PINMINGXUAN”。在拼音的底部，有四个红色的圆形标志，每个都有一个汉字，连接着“喝茶听音乐”，传达着悠闲优雅的氛围。从整体上看，标志传达了一种传统优雅的品牌形象，这可能与茶馆或传统茶文化有关。',
      resultList: [
        '/chest/fontLogoCN_result1.webp',
        // '/chest/fontLogoCN_result2.gif',
      ],
      activeIndex: 0,
      loading: false,
    }
  },
  mounted() {

  },
  methods: {
    generate() {
      if (!this.design_requirements) {
        this.$alert('请填写设计要求后重试', '提示')
        return
      }
      this.loading = true
      let params = {

      }
      postAction("/running_hub/imitate_person_pose", params, 1800000).then(res => {
        if (res.data.status === 'success') {
          this.activeIndex = 0
          this.resultList = res.data.data.image_paths
          this.loading = false
        } else {
          this.loading = false
          this.$alert(`生成失败，${res.data.message}`, '提示')
        }
      }).catch(err => {
        this.loading = false
        this.$alert(`生成错误，${err}`, '提示')
      })
    },
    back() {
      this.clearCache()
      sessionStorage.setItem('chest_path', '/chest')
      this.$router.push({ path: '/chest'})
    }
  }
}
</script>

<style scoped>
.font-logo-cn {
  height: 100%;
  min-width: 1200px
}

.font-logo-cn-content {
  height: calc(100% - 50px);
  display: flex;
  gap: 20px;
}

.work-setting-area {
  width: 320px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;
}

.work-setting-label {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 4px;
  margin-top: 16px;
}

.generate-btn >>> .el-button {
  width: 100%;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border: none;
  padding: 12px 24px;;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 8px;
}

.font-logo-cn-preview {
  flex: 1;
  height: 100%;
}

.preview-header {
  height: 80px;
  margin-bottom: 40px;
  opacity: 1;
  overflow-x: hidden;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border-radius: 12px;
  background-color: #fbfbfb;
  box-shadow: 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;
}

.preview-header-title {
  color: #000;
  font-size: 14px;
  font-weight: bold;
  line-height: 22px;
}

.preview-header-desc {
  color: #000;
  display: block;
  font-size: 14px;
  width: 100%;
  opacity: .8;
  margin-top: 4px;
  line-height: 22px;
}

.preview-body {
  height: calc(100% - 170px);
  display: flex;
  gap: 40px;
}

.cut-btn {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  color: #a2a8b3;
  background-color: #FFFFFF;
  margin: auto 0;
  cursor: pointer;
}

.preview-result {
  flex: 1;
  height: 100%;
}

.preview-list {
  width: 160px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  margin-right: 24px;
}

.preview-list-item {
  width: 160px;
  height: 160px;
  box-sizing: border-box;
  cursor: pointer;
}

.preview-list-item-active {
  border: 2px solid #409EFF;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.font-logo-cn >>> .el-textarea__inner {
  font-size: 12px !important;
  color: #5f5f5f !important;
  padding: 5px 8px !important;
}
</style>