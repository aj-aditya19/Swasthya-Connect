import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(err);
  },
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  verifyOtp: (data) => api.post("/auth/verify-otp", data),
  resendOtp: (data) => api.post("/auth/resend-otp", data),
  login: (data) => api.post("/auth/login", data),
  loginVerify: (data) => api.post("/auth/login-verify", data),
  me: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

export const reportsAPI = {
  getAll: () => api.get("/reports"),
  upload: (formData) =>
    api.post("/reports/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    }),
  delete: (slug) => api.delete(`/reports/${slug}`),
};

export const chatAPI = {
  getSession: (sid) => api.get(`/chat/session/${sid}`),
  sendMessage: (data) => api.post("/chat/message", data),
  clearSession: (sid) => api.delete(`/chat/session/${sid}`),
};

export const remindersAPI = {
  getAll: () => api.get("/reminders"),
  create: (data) => api.post("/reminders", data),
  update: (id, d) => api.put(`/reminders/${id}`, d),
  markTaken: (id, d) => api.patch(`/reminders/${id}/taken`, d),
  delete: (id) => api.delete(`/reminders/${id}`),
};

export const schemesAPI = {
  getAll: (params) => api.get("/schemes", { params }),
};

export default api;
