import axios from "axios";

export const kyberApi = axios.create({
  baseURL: "https://aggregator-api.kyberswap.com/",
  timeout: 120_000,
});
