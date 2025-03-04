import axios from 'axios';

// 创建一个 Axios 实例
const baseURL = 'https://u480621-aa32-189366b9.cqa1.seetacloud.com';
// const baseURL = 'https://live.tellai.tech/api/dhuman_live';
// const baseURL = 'http://192.168.0.117:5006';
const instance = axios.create({
    baseURL: baseURL, // 设置你的基础 URL
    timeout: 1800000, // 设置请求超时
    headers: {'Content-Type': 'application/json'}
});

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
        return Promise.reject(error);
    }
);

const getAction = (url, params = {}) => {
    return instance.get(url, {params});
};

const postAction = (url, data = {}, headers = {}) => {
    return instance.post(url, data, headers);
};

const putAction = (url, data = {}) => {
    return instance.put(url, data);
};

const delAction = (url, params = {}) => {
    return instance.delete(url, {params});
};

// 导出所有请求方法
export {getAction, postAction, putAction, delAction};
