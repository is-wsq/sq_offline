import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);
import LogIn from '../view/login/Login.vue';
import Register from '../view/login/Register.vue';

const routes = [
    {
        path: '/',
        name: 'Login',
        component: LogIn
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
];

const router = new Router({
    mode: 'history',
    routes
});

export default router;
