import {getAction} from "@/api/api";
import Vue from "vue";

const state = {
    voiceTaskIds: [],
    successVoices: [],
    processVoices: [],

    figureTaskIds: [],
    figureTasks: [],

    videoTaskIds: [],
    videoTasks: [],
}

const mutations = {
    SET_VOICE_TASKS(state, list) {
        state.voiceTaskIds = list
    },
    SET_VOICES(state, voices) {
        state.successVoices = voices.successVoices
        state.processVoices = voices.processVoices
    },

    SET_FIGURE_TASK(state, list) {
        state.figureTaskIds = list
    },
    SET_FIGURES(state, list) {
        state.figureTasks = list
    },

    SET_VIDEO_TASK(state, list) {
        state.videoTaskIds = list
    },
    SET_VIDEOS(state, list) {
        state.videoTasks = list
    }
}

const actions = {
    async pollVoiceTasks({ state, commit }) {
        const pendingTasks = state.voiceTaskIds

        await getAction("/timbres/query_success").then(res => {
            if (res.data.status ==='success') {
                let result = res.data.data
                commit('SET_VOICES', {
                    successVoices: result.filter(item => item.type === "clone" && item.status ==='success'),
                    processVoices: result.filter(task => task.status === 'pending')
                })
                commit('SET_VOICE_TASKS', result.filter(task => task.status === 'pending').map(item => item.id))

                let task_in_pending = result.filter(task => pendingTasks.includes(task.id))
                task_in_pending.forEach(task => {
                    if (task.status === 'success') {
                        Vue.prototype.$notify({
                            title: "语音合成成功",
                            message: `${task.name}语音合成任务已完成`,
                            type: "success",
                            duration: 5000
                        });
                    } else if (task.status === 'failed') {
                        Vue.prototype.$notify({
                            title: "语音合成失败",
                            message: `${task.name}语音合成任务失败,${task.message}`,
                            duration: 0,
                            type: "error",
                        })
                    }
                })
            }else {
                Vue.prototype.$message.error(res.data.message);
            }
        }).catch(err => {
            console.log(err)
        })
    },

    async pollFigureTasks({ state, commit }) {
        const pendingTasks = state.figureTaskIds

        await getAction("/figure/query_success").then(res => {
            if (res.data.status ==='success') {
                let result = res.data.data

                commit("SET_FIGURES", res.data.data);
                commit('SET_FIGURE_TASK',
                    result.filter(figure => figure.status === 'ready' || figure.status === 'pending')
                        .map(item => item.id))
                let figure_in_pending = result.filter(task => pendingTasks.includes(task.id))
                figure_in_pending.forEach(task => {
                    let taskName = task.video_type === 'figure' ? '形象克隆' : task.video_type === 'material' ? '素材上传' : '爆款视频上传'
                    if (task.status === 'success') {
                        Vue.prototype.$notify({
                            title: taskName + "成功",
                            message: task.name + taskName + "任务已完成",
                            type: "success",
                            duration: 5000
                        });
                    } else if (task.status === 'failed') {
                        Vue.prototype.$notify({
                            title: taskName + "失败",
                            message: task.name + taskName + "任务失败," + task.message,
                            duration: 0,
                            type: "error",
                        })
                    }
                })
            }else {
                Vue.prototype.$message.error(res.data.message);
            }
        }).catch(err => {
            console.log(err)
        })
    },

    async pollVideoTasks({ state, commit }) {
        const pendingTasks = state.videoTaskIds

        await getAction("/video_record/query").then(res => {
            if (res.data.status ==='success') {
                let result = res.data.data

                commit("SET_VIDEOS", res.data.data);
                commit('SET_VIDEO_TASK', result.filter(video => video.status === 'pending').map(item => item.id))
                let video_in_pending = result.filter(task => pendingTasks.includes(task.id))
                video_in_pending.forEach(task => {
                    if (task.status === 'success') {
                        Vue.prototype.$notify({
                            title: "视频生成成功",
                            message: `${task.filename}视频生成任务已完成`,
                            type: "success",
                            duration: 5000
                        });
                        let downloadPath = localStorage.getItem('downloadPath') || 'C:\\offline'
                        window.electronAPI.downloadFile(task.video_path, downloadPath, task.filename)
                        Vue.prototype.$message.success(`视频已保存到${downloadPath}`)
                    } else if (task.status === 'failed') {
                        Vue.prototype.$notify({
                            title: "视频生成失败",
                            message: `${task.filename}视频生成任务失败,${task.message}`,
                            duration: 0,
                            type: "error",
                        })
                    }
                })
            }else {
                Vue.prototype.$message.error(res.data.message);
            }
        }).catch(err => {
            console.log(err)
        })
    },
}

const getters = {
    successVoices: state => {
        return state.successVoices
    },
    processVoices: state => {
        return state.processVoices
    },
    pendingVoiceTaskIds: state => {
        return state.voiceTaskIds
    },

    figureTasks: state => {
        return state.figureTasks
    },
    pendingFigureTaskIds: state => {
        return state.figureTaskIds
    },

    videoTasks: state => {
        return state.videoTasks
    },
    pendingVideoTaskIds: state => {
        return state.videoTaskIds
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}