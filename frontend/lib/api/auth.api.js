import axios from "axios";
import clientApi from "./client-api";

const authApi = {
  login: async function (formData) {
    const response = await clientApi.post("/auth/login", {
      username: formData.username,
      password: formData.password,
      rememberMe: formData.rememberMe,
    });
    return response;
  },

  logout: async function () {
    const response = await clientApi.post("/auth/logout");
    return response;
  },
};

export default authApi;
