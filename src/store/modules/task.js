// store/modules/task.js
import {getAction} from "@/api/api";
import Vue from "vue";

const state = {
    videoTasks: [],
    videoPreviousStatusMap: {},

    voiceTasks: [],
    voicePreviousStatusMap: {},

    figureTasks: [],
    figurePreviousStatusMap: {},
};

const mutations = {
    setVideoTasks(state, list) {
        state.videoTasks = list;
    },
    updatePreviousStatusMap(state, newMap) {
        // ✅ 确保是直接替换整个对象
        state.videoPreviousStatusMap = { ...newMap };
    },

    setVoiceTasks(state, tasks) {
        state.voiceTasks = tasks;
    },
    updateVoicePreviousStatusMap(state, map) {
        state.voicePreviousStatusMap = map;
    },

    setFigureTasks(state, tasks) {
        state.figureTasks = tasks;
    },
    updateFigurePreviousStatusMap(state, map) {
        state.figurePreviousStatusMap = map;
    },
};

const actions = {
    async pollFigureTasks({ state, commit }) {
        await getAction("/figure/query_success").then(res => {
            if (res.data.status ==='success') {
                const list = res.data.data;
                list.forEach(figure => {
                    const prev = state.figurePreviousStatusMap[figure.id];
                    if (prev === "pending" && figure.status === "success") {
                        Vue.prototype.$notify({
                            title: "形象克隆成功",
                            message: `《${figure.name}》形象克隆任务已完成`,
                            type: "success",
                            duration: 20000
                        });
                    }else if (prev === "pending" && figure.status === "failed") {
                        Vue.prototype.$notify({
                            title: "形象克隆失败",
                            message: `《${figure.name}》形象克隆任务失败,${figure.message}`,
                            duration: 0,
                            type: "error",
                        })
                    }
                });

                const newStatusMap = {};
                list.forEach(v => { newStatusMap[v.id] = v.status; });

                commit("setFigureTasks", list);
                commit("updateFigurePreviousStatusMap", newStatusMap);
            }else {
                this.$message.error(res.data.message);
            }
        })
    },

    async pollVoiceTasks({ state, commit }) {
        await getAction("/timbres/query_success").then(res => {
            if (res.data.status ==='success') {
                const list = res.data.data;
                list.forEach(voice => {
                    const prev = state.voicePreviousStatusMap[voice.id];
                    if (prev === "pending" && voice.status === "success") {
                        Vue.prototype.$notify({
                            title: "语音合成成功",
                            message: `《${voice.name}》语音合成任务已完成`,
                            type: "success",
                            duration: 20000
                        });
                    }else if (prev === "pending" && voice.status === "failed") {
                        Vue.prototype.$notify({
                            title: "语音合成失败",
                            message: `《${voice.name}》语音合成任务失败,${voice.message}`,
                            duration: 0,
                            type: "error",
                        })
                    }
                });

                const newStatusMap = {};
                list.forEach(v => { newStatusMap[v.id] = v.status; });

                commit("setVoiceTasks", list);
                commit("updateVoicePreviousStatusMap", newStatusMap);
            }else {
                this.$message.error(res.data.message);
            }
        })
    },

    async pollVideoTasks({ state, commit }) {
        await getAction("/video_record/query").then(res => {
            if (res.data.status === 'success') {
                const list = res.data.data;

                const newStatusMap = {};
                list.forEach(v => { newStatusMap[v.id] = v.status; });

                list.forEach(video => {
                    const prev = state.videoPreviousStatusMap[video.id];
                    console.log('Vuex中的状态' + prev + '  -------------库中的状态  ' + video.status)
                    if (prev === "pending" && video.status === "success") {
                        Vue.prototype.$notify({
                            title: "视频生成成功",
                            message: `《${video.filename}》视频生成任务已完成`,
                            type: "success",
                            duration: 20000
                        });
                        // let downloadPath = localStorage.getItem('downloadPath') || 'D:\\Downloads'
                        // window.electronAPI.downloadFile(video.video_path, downloadPath, video.filename)
                        // Vue.prototype.$message.success(`视频已保存到${downloadPath}`)
                    }else if (prev === "pending" && video.status === "failed") {
                        Vue.prototype.$notify({
                            title: "视频生成失败",
                            message: `《${video.filename}》视频生成任务失败,${video.message}`,
                            duration: 0,
                            type: "error",
                        })
                    }
                });

                commit("setVideoTasks", list);
                commit("updatePreviousStatusMap", newStatusMap);
            }else {
                Vue.prototype.$message.error(res.data.message);
            }
        }).catch(err => {
            console.log(err)
        })
    },
};

const getters = {
    videoTasks: (state) => state.videoTasks,
    voiceTasks: (state) => state.voiceTasks,
    figureTasks: (state) => state.figureTasks,
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
