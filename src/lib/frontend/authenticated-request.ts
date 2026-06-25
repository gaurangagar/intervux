import axiosInstance from "./axios";
import { AxiosRequestConfig } from "axios";

export async function authenticatedRequest<T = unknown>(
  token: string,
  config: AxiosRequestConfig
): Promise<T> {
  const response = await axiosInstance({
    ...config,
    headers: {
      Authorization: `Bearer ${token}`,
      ...config.headers,
    },
  });

  return response.data;
}