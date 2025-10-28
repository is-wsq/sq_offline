import Vue from 'vue';
import Vuex from 'vuex';
import generateModule from './modules/generate';

Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        generate: generateModule
    }
});

export default store;
