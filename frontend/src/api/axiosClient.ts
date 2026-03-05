import axios, { type AxiosError, type AxiosInstance } from "axios";

const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;

    if (status === 401) {
      localStorage.setItem("TOKEN_EXPIRED", "Please login again.");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
