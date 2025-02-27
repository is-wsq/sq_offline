<template>
  <div class="home">
    <el-container>
      <el-aside class="aside">
        <span style="font-size: 20px;font-weight: bold;color: #5478FE">奇点</span>
        <div class="aside-menu">
          <div class="menu-item" :class="{'active': active === '1', 'inactive': active !== '1'}"
               title="克隆形象" @click="changeActive('1','/')">
            <i class="el-icon-user-solid"
               :style="{ 'color': active === '1'? '#FFFFFF' : '#8F92A1', 'font-size': '20px' }">
            </i>
          </div>
          <div class="menu-item" :class="{'active': active === '2', 'inactive': active !== '2'}"
               title="克隆声音" @click="changeActive('2','/voice')">
            <i class="el-icon-s-home"
               :style="{ 'color': active === '2'? '#FFFFFF' : '#8F92A1', 'font-size': '20px' }">
            </i>
          </div>
          <div class="menu-item" :class="{'active': active === '3', 'inactive': active !== '3'}"
               title="生成视频" @click="changeActive('3','/video')">
            <i class="el-icon-document"
               :style="{ 'color': active === '3'? '#FFFFFF' : '#8F92A1', 'font-size': '20px' }">
            </i>
          </div>
          <div class="menu-item" :class="{'active': active === '4', 'inactive': active !== '4'}"
               title="关于我们" @click="changeActive('4','/system')">
            <i class="el-icon-s-tools"
               :style="{ 'color': active === '4'? '#FFFFFF' : '#8F92A1', 'font-size': '20px' }">
            </i>
          </div>
        </div>
      </el-aside>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script>

export default {
  components: {

  },
  data() {
    return {
      active: "1",
    };
  },
  mounted() {
    switch (this.$route.path) {
      case "/":
        this.active = "1";
        break;
      case "/voice":
        this.active = "2";
        break;
        case "/video":
        this.active = "3";
        break;
      case "/system":
        this.active = "4";
        break;
      default:
        this.active = "1";
        break;
    }
  },
  methods: {
    changeActive(type, path) {
      if (this.active === type)
        return;
      this.active = type;
      this.$router.push({path: path})
    },
  }
}
</script>

<style>
.home {
  background-color: #EFF0F2;
}

.aside {
  background-color: #FFFFFF;
  height: 100vh;
  width: 100px !important;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #bbbbbb;
}

.aside-menu {
  height: 40%;
  width: 100%;
  margin: auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.menu-item {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.main {
  padding: 0;
  background-color: rgb(239, 239, 239, 1%);
  height: 100vh;
  overflow: auto
}

.active {
  background-color: #6286ed;
}

.inactive {
  background-color: #F7F7F7;
}
</style>