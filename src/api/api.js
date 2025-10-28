import axios from 'axios';

// 创建一个 Axios 实例
const baseURL = 'http://127.0.0.1';
// const baseURL = 'http://192.168.1.25:6006';
// const baseURL = 'http://120.86.188.249:6006';

const default_port = 6006;
const default_timeout = 60000

const createInstance = (timeout, port) => {
    return axios.create({
        baseURL: baseURL + ':' + port,
        timeout: timeout,
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

const getAction =
    (
        url,
        params = {},
        timeout = default_timeout,
        port = default_port
    ) => {
        instance = createInstance(timeout, port);
        params.user_id = sessionStorage.getItem('user_id');
        return instance.get(
            url,
            {params}
        );
    };

const postAction =
    (
        url,
        data = {},
        timeout = default_timeout,
        port = default_port
    ) => {
        instance = createInstance(timeout, port);
        data.user_id = sessionStorage.getItem('user_id');
        return instance.post(
            url,
            data
        );
    };

const putAction =
    (
        url,
        data = {},
        timeout = default_timeout,
        port = default_port
    ) => {
        instance = createInstance(timeout, port);
        data.user_id = sessionStorage.getItem('user_id');
        return instance.put(
            url,
            data
        );
    };

const delAction =
    (
        url,
        params = {},
        timeout = default_timeout,
        port = default_port
    ) => {
        instance = createInstance(timeout, port);
        params.user_id = sessionStorage.getItem('user_id');
        return instance.delete(
            url,
            {params}
        );
    };

const filePostAction =
    (
        url,
        formData,
        timeout = default_timeout,
        port = default_port
    ) => {
        instance = createInstance(timeout, port);
        formData.append('user_id', sessionStorage.getItem('user_id'));
        return instance.post(
            url,
            formData,
            {
                headers:
                    {'Content-Type': 'multipart/form-data'}
            }
        );
    };

export {
    getAction,
    postAction,
    putAction,
    delAction,
    filePostAction
};