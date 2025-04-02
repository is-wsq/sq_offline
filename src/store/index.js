import Vue from 'vue';
import Vuex from 'vuex';
import taskModule from './modules/task'; // 引入任务管理模块

Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        task: taskModule // 注册任务模块
    }
});

// 载入本地存储的任务数据
store.dispatch('task/loadTasks');

export default store;
