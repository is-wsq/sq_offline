<template>
  <div class="home">
    <el-container>
      <el-aside class="aside">
        <span style="font-size: 20px;margin-bottom: 20px;font-weight: bold;color: #5478FE">奇点</span>
        <div class="aside-menu">
          <div v-for="(menu, index) in menus"
               :key="index"
               class="menu-group"
               :style="{'background-color': active === index? '#e3eaff' : '#ffffff'}">
            <div class="menu-item"
                 :class="{'active': active === index, 'inactive': active !== index}"
                 title="克隆形象"
                 @click="changeActive(index,menu.path)">
              <i :class="menu.class"
                 :style="{ 'color': active === index? '#FFFFFF' : '#8F92A1', 'font-size': '20px' }">
              </i>
            </div>
            <div style="font-size: 12px;color: #6D7177;margin-top: 5px">{{ menu.name }}</div>
          </div>
        </div>
      </el-aside>
      <el-main class="main">
        <router-view/>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import axios from "axios";

export default {
  components: {},
  data() {
    return {
      active: 0,
      menus: [
        {name: "AI大模型", path: "/", class: 'el-icon-robot'},
        {name: "克隆形象", path: "/figures", class: 'el-icon-figure'},
        {name: "克隆声音", path: "/voice", class: 'el-icon-voice'},
        {name: "生成视频", path: "/video", class: 'el-icon-video'},
        {name: "视频列表", path: "/videoList", class: 'el-icon-view-list'},
        {name: "关于我们", path: "/system", class: 'el-icon-s-tools'},
      ],
    };
  },
  async mounted() {
    this.updateActiveFromRoute()
  },
  watch: {
    $route(to) {
      this.updateActiveFromRoute();
    }
  },
  methods: {
    async queryServiceStatus() {
      return axios.get("http://127.0.0.1:11434/api/ps").then((res) => {
        return res.data.models.length > 0;
      }).catch((err) => {
        return false;
      });
    },
    async changeActive(type, path) {
      if (this.active === type)
        return;
      if (this.active === 0 && await this.queryServiceStatus()) {
        this.$message.error("请先关闭AI大模型服务");
        return;
      }
      this.active = type;
      this.$router.push({path: path})
    },
    updateActiveFromRoute() {
      for (let i = 0; i < this.menus.length; i++) {
        if (this.$route.path === this.menus[i].path) {
          this.active = i;
          break;
        }
      }
      console.log('跳转后的active', this.active)
    },
  },
  beforeRouteUpdate(to, from, next) {
    this.updateActiveFromRoute()
    next()
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
  height: 700px;
  width: 100%;
  margin: auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.menu-group {
  width: 75px;
  height: 75px;
  display: flex;
  border-radius: 10px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
  padding: 20px;
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