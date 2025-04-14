const TASK_STORAGE_KEY = 'task_list'; // 存储任务列表的 key

const state = {
    tasks: []
};

const mutations = {
    ADD_TASK(state, task) {
        state.tasks.push(task);
        // 更新本地存储
        // localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(state.tasks));
        sessionStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(state.tasks));
        // uni.setStorageSync(TASK_STORAGE_KEY, state.tasks);
    },
    UPDATE_TASK(state, updatedTask) {
        const index = state.tasks.findIndex((task) => task.id === updatedTask.id);
        if (index !== -1) {
            // state.tasks[index] = updatedTask;
            state.tasks.splice(index, 1, updatedTask);
            // 更新本地存储
            // uni.setStorageSync(TASK_STORAGE_KEY, state.tasks);
            // localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(state.tasks));
            sessionStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(state.tasks));
        }
    },
    REMOVE_TASK(state, id) {
        state.tasks = state.tasks.filter(task => task.id !== id)
        // uni.setStorageSync(TASK_STORAGE_KEY, state.tasks);
        // localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(state.tasks));
        sessionStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(state.tasks));
    },
    SET_TASKS(state, tasks) {
        state.tasks = tasks;
        // 初始化时同步到本地存储
        // uni.setStorageSync(TASK_STORAGE_KEY, tasks);
        // localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
        sessionStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
    }
};

const actions = {
    addTask({ commit }, task) {
        commit('ADD_TASK', task);
    },
    updateTask({ commit }, updatedTask) {
        commit('UPDATE_TASK', updatedTask);
    },
    removeTask({ commit }, id) {
        commit('REMOVE_TASK', id);
    },
    loadTasks({ commit }) {
        // 从本地存储读取任务
        // const tasks = uni.getStorageSync(TASK_STORAGE_KEY) || [];
        // const tasks = JSON.parse(localStorage.getItem(TASK_STORAGE_KEY)) || [];
        const tasks = [];
        commit('SET_TASKS', tasks);
    }
};

const getters = {
    allTasks: (state) => state.tasks
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
