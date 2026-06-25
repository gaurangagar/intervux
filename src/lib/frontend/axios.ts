import axios from "axios";
import { env } from "../env";

const axiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export default axiosInstance;