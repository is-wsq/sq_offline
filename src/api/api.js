import axios from 'axios';

// 创建一个 Axios 实例
const baseURL = 'http://127.0.0.1:6006';
// const baseURL = 'http://192.168.0.121:6006';
// const baseURL = 'http://192.168.0.116:6006';

const createInstance = (timeout = 60000) => {
    return axios.create({
        baseURL: baseURL, // 设置你的基础 URL
        timeout: timeout, // 设置请求超时
        headers: {'Content-Type': 'application/json'}
    })
}

let instance = createInstance();

// 请求拦截器
instance.interceptors.request.use(
    config => {
        // 这里可以添加请求头等配置
        // config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器
instance.interceptors.response.use(
    response => {
        return {
            status: response.status,
            data: response.data
        };
    },
    error => {
        // 这里可以处理响应错误
        console.log(error);
        return Promise.reject(error);
    }
);

const getAction = (url, params = {}, timeout = 60000) => {
    instance = createInstance(timeout);
    return instance.get(url, {params});
};

const postAction = (url, data = {}, timeout = 60000) => {
    instance = createInstance(timeout);
    return instance.post(url, data);
};

const putAction = (url, data = {}, timeout = 60000) => {
    instance = createInstance(timeout);
    return instance.put(url, data);
};

const delAction = (url, params = {}, timeout = 60000) => {
    instance = createInstance(timeout);
    return instance.delete(url, {params});
};

// 导出所有请求方法
export {getAction, postAction, putAction, delAction};
