import axios from "axios";

// axios for API CMS
export const AxiosClient = axios.create({
  baseURL: import.meta.env.VITE_CMS,
  headers: {
    "Content-Type": "application/json",
  },
});
AxiosClient.interceptors.response.use(function (response: any) {
  return response;
});


// axios for API Go
export const AxiosAPI = axios.create({
  baseURL: import.meta.env.VITE_API,
  headers: {
    "Content-Type": "application/json",
  },
});
AxiosAPI.interceptors.response.use(function (response: any) {
  return response;
});

export const fetcherClient = (url: any, params: any) => {
  if (url) {
    return AxiosClient.get(url, { params });
  }
};
export const optionsFetch = {
  fetcher: fetcherClient,
};
export default AxiosClient;
