<template>
  <div class="home">
    <el-container>
      <el-aside class="aside">
        <div class="logo">
          <div class="logo-icon">奇</div>
          <span class="logo-text">奇点AI矩阵</span>
        </div>
        <div class="nav-menu">
          <div v-for="(menu, index) in menus" :key="index" class="nav-item" :class="{'nav-active': active === index}"
               @click="changeActive(index,menu.path)">
            <div v-if="menu.class" class="flex-center nav-icon">
              <i :class="menu.class" style="font-size: 18px"></i>
            </div>
            <svg v-else class="nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                 stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" :d="menu.svg"></path>
            </svg>
            <span class="nav-text">{{ menu.name }}</span>
          </div>
        </div>
      </el-aside>
      <el-main class="main" :class="{'padding0': $route.path === '/material'}">
        <keep-alive>
          <router-view v-if="alive_routers.includes($route.path)"></router-view>
        </keep-alive>
        <router-view v-if="!alive_routers.includes($route.path)"></router-view>
<!--        <router-view></router-view>-->
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
        {
          name: "AI大模型",
          path: "/",
          svg: 'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z'
        },
        {name: "AI八宝箱", path: "/chest", class: 'el-icon-treasure-chest'},
        {name: "克隆形象", path: "/figures", class: 'el-icon-figure'},
        {name: "克隆声音", path: "/voice", class: 'el-icon-voice'},
        {name: "生成视频", path: "/video", class: 'el-icon-video'},
        {name: "视频列表", path: "/videoList", class: 'el-icon-view-list'},
        {name: "品牌店铺", path: "/shop", class: 'el-icon-s-shop'},
        {name: "设置", path: "/system", class: 'el-icon-setting'},
      ],
      alive_routers: ['/syncCv','/montage','/remix','/segments','/smartGenerate','/duplicate']
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
      let figure_path = sessionStorage.getItem("figure_path");
      if (type === 2 && figure_path) {
        this.$router.push({path: figure_path})
        return;
      }
      let video_path = sessionStorage.getItem("video_path");
      if (type === 4 && video_path) {
        this.$router.push({path: video_path})
        return;
      }
      this.$router.push({path: path})
    },
    updateActiveFromRoute() {
      let paths = ['/human', '/material', '/smartGenerate', '/syncCv', '/duplicate', '/segments', '/montage', '/hot', '/remix']
      let first_paths = ['/imageToScript', '/scriptToImage', '/imageToVideo']
      let chest_paths = ['/hotNews', '/eCommerce', '/reWriting']
      if (first_paths.includes(this.$route.path)) {
        this.active = 2;
        return;
      }
      if (paths.includes(this.$route.path)) {
        this.active = 4;
        return;
      }
      if (chest_paths.includes(this.$route.path)) {
        this.active = 1;
        return;
      }
      for (let i = 0; i < this.menus.length; i++) {
        if (this.$route.path === this.menus[i].path) {
          this.active = i;
          break;
        }
      }
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
  background-color: #f8fafc;
}

.aside {
  width: 200px !important;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 80px;
  width: 100%;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
  background: #ffffff;
  margin: 0;
  padding: 0 24px;
  box-sizing: border-box;
}

.logo::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 24px;
  right: 24px;
  height: 2px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
  border-radius: 1px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
}

.logo-text {
  margin-left: 12px;
  font-size: 15px;
  font-weight: 700;
  background: linear-gradient(135deg, #1f2937, #4b5563);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  flex: 1;
  padding: 24px 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 10px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  position: relative;
  background: transparent;
}

.nav-item:hover {
  background: #f3f4f6;
  color: #374151;
  transform: translateX(2px);
}

.nav-active {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #6366f1;
  border-left: 3px solid #6366f1;
  margin-left: 0;
  padding-left: 13px;
}

.nav-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  transition: all 0.2s ease;
}

.nav-text {
  font-weight: 500;
  display: inline;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;;
  line-height: 22.39px;
}

.main {
  padding: 20px;
  background-color: rgb(239, 239, 239, 1%);
  height: 100vh;
  overflow: auto;
}

.padding0 {
  padding: 0 !important;
}
</style>