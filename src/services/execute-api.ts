import axiosInstance from "../lib/frontend/axios";

export interface ExecuteCodeRequest {
  language: string;
  code: string;
}

export interface ExecuteCodeResponse {
  success: boolean;
  output: string;
  error?: string;
  cpuTime?: string;
  memory?: string;
}

export const codeExecutionApi = {
  execute: async (data: ExecuteCodeRequest) => {
    const response = await axiosInstance.post("/api/execute", data);
    return response.data as ExecuteCodeResponse;
  },
};