/*import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
export default api;
*/

import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Separate instance prevents refresh requests from triggering
// the same response interceptor recursively.

const refreshApi = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Do not try refreshing for login, refresh, or logout requests.
    const url = originalRequest.url || "";

    if (
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout") ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Multiple failed requests share one refresh operation.
      if (!refreshPromise) {
        refreshPromise = refreshApi.post("/auth/refresh").finally(() => {
          refreshPromise = null;
        });
      }

      await refreshPromise;

      // The backend should set a new access-token cookie.
      // The browser sends it automatically on this retry.
      return api(originalRequest);
    } catch (refreshError) {
      // The session has expired or the refresh token is invalid.
      if (refreshError.response?.status === 401) {
        window.dispatchEvent(new Event("auth:session-expired"));
      }

      return Promise.reject(refreshError);
    }
  },
);

export default api;
