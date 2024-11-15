import axios from "axios";


// const API = axios.create({ baseURL: "https://csuite-production.up.railway.app" });
const API = axios.create({
  baseURL: "https://csuite-ui0f.onrender.com",
});
 
// user
// export const check = (userdata) => API.post("/api/user");

export const check = (userdata) =>
  API.get("/api/user/check", {
    params: { email: userdata.email },
  }); 

export const loginCheck = (userdata) => API.post("/api/user/login", userdata);

export const signupCheck = (userdata, config) =>
  API.post("/api/user/signup", userdata, config);

export const fetchela = () => API.get("/api/user/fetchela");

export const fetchUserData = (id) => API.get(`/api/user/user/${id}`);

export const Elacompleted = (userId, data) =>
  API.put(`/api/user/${userId}/ela`, data);

export const elaTestScore = (userId, data) =>
  API.put(`/api/user/updateElaScore/${userId}`, data);


