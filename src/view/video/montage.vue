<template>
  <div class="montage">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="$router.go(-1)">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="montage-h-t">AI混剪</div>
      <div style="width: 36px"></div>
    </div>
    <div class="montage-container">

    </div>
  </div>
</template>

<script>
export default {
  name: 'Montage',
  data() {
    return {}
  },
  mounted() {

  },
  methods: {}
}
</script>

<style scoped>
.back-btn {
  padding: 7px;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  color: #a2a8b3;
  background-color: #FFFFFF;
  margin: 0 0 8px;
}

.back-btn:hover {
  color: #1F2937 !important;
}

.montage-h-t {
  flex: 1;
  margin: 0 0 8px;
  font-weight: bold;
  display: flex;
  justify-content: center;
}

.montage-container {
  display: flex;
}
</style>