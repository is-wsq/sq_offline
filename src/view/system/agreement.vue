<template>
  <div class="agreement">
    <div>
      <el-radio-group v-model="type">
        <el-radio-button label="声音克隆协议"></el-radio-button>
        <el-radio-button label="形象克隆协议"></el-radio-button>
      </el-radio-group>
    </div>
    <div class="iframe-container">
      <iframe
        :src="docUrl"
        width="100%"
        height="100%"
        frameborder="0"
      ></iframe>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      type: "声音克隆协议",
      docFile: "", // 替换为你的 .doc 文件地址
    };
  },
  computed: {
    docUrl() {
      this.type === "声音克隆协议"
       ? (this.docFile = "https://live.tellai.tech/files/timbre-clone.doc")
       : (this.docFile = "https://live.tellai.tech/files/figure-clone.doc");
      return `https://docs.google.com/gview?url=${encodeURIComponent(this.docFile)}&embedded=true`;
    },
  },
  methods: {

  },
};
</script>

<style scoped>
.agreement {
  height: 100%;
}
.iframe-container {
  height: calc(100% - 45px);
  margin-top: 5px;
}
</style>