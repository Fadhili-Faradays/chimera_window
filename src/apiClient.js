import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "https://faradays.alwaysdata.net/api";

const apiClient = axios.create({
  baseURL: API_BASE,
});

let unauthorizedInterceptor = null;

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

export const registerUnauthorizedHandler = (handler) => {
  if (unauthorizedInterceptor !== null) {
    apiClient.interceptors.response.eject(unauthorizedInterceptor);
  }

  unauthorizedInterceptor = apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        handler?.();
      }
      return Promise.reject(error);
    }
  );
};

export default apiClient;
