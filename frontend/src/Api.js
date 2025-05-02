import axios from "axios";

const API_URL = process.env.REACT_APP_DEV_BASE_URL

const Api = axios.create({
  baseURL: API_URL,
});

export default Api;