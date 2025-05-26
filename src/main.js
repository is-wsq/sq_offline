import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/iconfont/iconfont.css'
import './assets/fonts/font.css';

import store from './store';
import {Notification} from 'element-ui';

let lastTaskStatus = {};

Vue.prototype.$store = store;
// store.watch(
//     (state) => state.tasks,
//     (newTasks) => {
//         newTasks.forEach((task) => {
//             console.log(task.status)
//             if (lastTaskStatus[task.id] === 'running' && (task.status === 'success' || task.status === 'error')) {
//                 let taskName = task.type === 'voice' ? '音色克隆' : '口播视频生成';
//                 let title = task.status === 'success' ? '任务成功' : '任务失败';
//                 let message = task.status === 'success' ? `${taskName}任务 "${task.id}" 已完成！` : `${taskName}任务 "${task.id}" 失败！`;
//                 console.log(title)
//                 console.log(message)
//                 Notification.success({
//                     title: title,
//                     message: message,
//                 });
//                 store.dispatch('task/removeTask', task.id);
//             }
//         });
//     },
//     {deep: true}
// );

Vue.use(ElementUI);

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App),
}).$mount('#app')
