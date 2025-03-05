<template>
  <div class="agreement">
    <h2>用户协议 & 隐私政策</h2>

    <!-- 选择查看哪个文档 -->
    <button @click="previewWord('userAgreement')">查看用户协议</button>
    <button @click="previewWord('privacyPolicy')">查看隐私政策</button>

    <!-- 预览 Word 文件 -->
    <div v-if="selectedFile">
      <h3>{{ selectedFile === 'userAgreement' ? '用户协议' : '隐私政策' }}</h3>
      <iframe
          :src="localFiles"
          width="100%"
          height="600px"
          frameborder="0"
      ></iframe>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedFile: '', // 记录当前选中的文件
      wordFiles: {
        wordFileUrl1: window.location.origin + '/timbre-clone.docx',
        wordFileUrl2: window.location.origin + '/figure-clone.docx',
      },
      localFiles: 'file:///D:/Documents/timbre-clone.docx'
    };
  },
  computed: {
    wordPreviewUrl() {
      if (!this.selectedFile) return '';
      return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(this.wordFiles[this.selectedFile])}`;
    },
  },
  methods: {
    previewWord(fileKey) {
      this.selectedFile = fileKey; // 设置选中的文档
    },
  },
};
</script>