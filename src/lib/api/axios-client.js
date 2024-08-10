import axios from "axios";

// axios for API CMS
export const AxiosClient = axios.create({
  baseURL: "https://admin.qnsport.vn",
  headers: {
    "Content-Type": "application/json",
  },
});
AxiosClient.interceptors.response.use(function (response) {
  return response;
});

// axios for API Go
export const AxiosAPI = axios.create({
  baseURL: "https://admin.qnsport.vn",
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
