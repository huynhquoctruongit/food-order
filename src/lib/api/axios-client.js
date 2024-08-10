import axios from "axios";
import { interceptorError } from "./refresh-token";
import { cms } from "../config";
import { getCookie } from "react-use-cookie";

// axios for API CMS
export const AxiosClient = axios.create({
  baseURL: cms,
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + getCookie("auth_token"),
  },
});
AxiosClient.interceptors.response.use(function (response) {
  return response?.data;
}, interceptorError);

// axios for API Go
export const AxiosAPI = axios.create({
  baseURL: cms,
  headers: {
    "Content-Type": "application/json",
  },
});
AxiosAPI.interceptors.response.use(function (response) {
  return response;
});

export const fetcherClient = (url, params) => {
  if (url) {
    return AxiosClient.get(url, { params });
  }
};
export const optionsFetch = {
  fetcher: fetcherClient,
};
export default AxiosClient;
