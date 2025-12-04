// src/utils/request.js
import axios from 'axios';
import { message } from 'antd';

// 创建 axios 实例
const request = axios.create({
  baseURL: 'https://bcapkv2.hash512ecc.workers.dev/api/v1', // 配合 vite.config.js 代理使用，或者直接写完整后端地址
  timeout: 5000,
});

// 请求拦截器：自动添加 Token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // 假设后端需要 Bearer 格式，如果不需要可去掉 'Bearer '
      config.headers['token'] = `${token}`; 
      // 注意：有些后端可能要求 header key 是 'token' 或 'x-token'，请根据实际调整
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：统一处理错误
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if(response.status == 401){
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
    // 假设 code === 200 代表成功
    if (res.code !== 200) {
      message.error(res.message || 'Error');
      if (res.code === 1003) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return res;
  },
  (error) => {
    message.error(error.message || 'Network Error');
    return Promise.reject(error);
  }
);

export default request;