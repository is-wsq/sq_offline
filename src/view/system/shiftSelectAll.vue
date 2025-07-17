<template>
  <div>
    <h3>视频拼接播放器</h3>
    <VideoConcatenator :videoUrls="videoUrls" />
  </div>
</template>

<script>
import VideoConcatenator from '@/components/VideoConcatenator.vue';

export default {
  components: {
    VideoConcatenator
  },
  data() {
    return {
      videoUrls: [
        'http://192.168.1.25:6006/uploads/4b09e55e-d81d-4b93-a79e-5753f11c9809.mp4',
        'http://192.168.1.25:6006/uploads/781ee111-4737-4611-ae80-4bf68f444d99.mp4',
      ]
    // { url: "http://192.168.1.25:6006/uploads/4b09e55e-d81d-4b93-a79e-5753f11c9809.mp4", name: '示例视频1', duration: 0 },
    // { url: "http://192.168.1.25:6006/uploads/781ee111-4737-4611-ae80-4bf68f444d99.mp4", name: '示例视频2', duration: 0 }
    }
  }
}
</script>