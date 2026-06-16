import { serverFetch } from "@/lib/api/server-fetch";

export const usersApi = {
  getAll: (params) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return serverFetch(`/user/list${query}`);
  },

  getById: (id) => serverFetch(`/user/details/${id}`),

  create: (dto) => api.post("/user", dto),

  update: (id, dto) => api.put(`/user/${id}`, dto),

  delete: (id) => api.delete(`/user/${id}`),
};
