import Vue from 'vue';
import Vuex from 'vuex';
import taskModule from './modules/task'; // 引入任务管理模块
import shopModule from './modules/shop'; // 引入店铺管理模块

Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        task: taskModule,
        shop: shopModule
    }
});

export default store;
