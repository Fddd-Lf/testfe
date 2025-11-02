import axios from "axios";
import { message } from "antd";

let hideLoading = null;

const api = axios.create({
  baseURL: "",
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    hideLoading = message.loading("加载中...", 0); // 0 表示不会自动关闭
    return config;
  },
  (error) => {
    if (hideLoading) hideLoading();
    message.error("请求发送失败");
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    if (hideLoading) hideLoading();
    return response.data;
  },
  (error) => {
    console.log(error, "error");

    if (hideLoading) hideLoading();
    message.error(error.response?.data?.message || "请求失败");
    return Promise.reject(error);
  }
);

export default api;
