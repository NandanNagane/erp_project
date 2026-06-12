import axios from "axios";

const API_BASE_URL = process.env.API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ── Response interceptor: auto-refresh on 401 ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        await api.post("/auth/refresh");
        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login on refresh failure (session expired)
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// ── Auth helpers ──

export async function login(formData) {
  const response = await api.post("/auth/login", {
    userName: formData.username,
    password: formData.password,
    rememberMe: formData.rememberMe,
  });
  return response;
}

export async function logout() {
  const response = await api.post("/auth/logout");
  return response;
}

export default api;
