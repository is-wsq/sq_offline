import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/iconfont/iconfont.css'
import './assets/fonts/font.css';

import store from './store';
Vue.prototype.$store = store;

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App),
}).$mount('#app')
