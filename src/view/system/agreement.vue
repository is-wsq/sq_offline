<template>
  <div class="agreement">
    <i class="el-icon-back back" @click="goBack"></i>
    <div style="width: 100%;text-align: center">
      <el-radio-group v-model="type">
        <el-radio-button label="声音复刻协议"></el-radio-button>
        <el-radio-button label="形象克隆协议"></el-radio-button>
      </el-radio-group>
    </div>
    <div class="iframe-container" v-loading="loading">
      <iframe
        :src="docUrl"
        width="100%"
        height="100%"
        frameborder="0"
        @load="loading = false"
      ></iframe>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      type: "声音复刻协议",
      docFile: "", // 替换为你的 .doc 文件地址
      loading: true,
    };
  },
  computed: {
    docUrl() {
      this.loading = true;
      this.type === "声音复刻协议"
       ? (this.docFile = "https://live.tellai.tech/files/timbre.docx")
       : (this.docFile = "https://live.tellai.tech/files/figure.docx");
      return `https://docs.google.com/gview?url=${encodeURIComponent(this.docFile)}&embedded=true`;
    },
  },
  methods: {
    goBack() {
      this.$router.push("/system");
    }
  },
};
</script>

<style scoped>
.agreement {
  height: 100%;
  position: relative;
}
.back {
  position: absolute;
  top: 0;
  left: 0;
  font-size: 24px;
  line-height: 40px;
  color: #9A9A9A;
  cursor: pointer;
}
.iframe-container {
  height: calc(100% - 45px);
  margin-top: 5px;
}
</style>