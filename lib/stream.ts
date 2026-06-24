import { StreamChat } from "stream-chat";
import { StreamClient } from "@stream-io/node-sdk";
import { env } from "./env.js";

const apiKey = env.STREAM_API_KEY;
const apiSecret = env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error("STREAM_API_KEY or STREAM_API_SECRET is missing");
}

export const chatClient = StreamChat.getInstance(apiKey, apiSecret);
export const streamClient = new StreamClient(apiKey, apiSecret);

export interface StreamUserData {
  id: string;
  name?: string;
  image?: string;
  role?: string;
  [key: string]: unknown;
}

export const upsertStreamUser = async (
  userData: StreamUserData
): Promise<void> => {
  try {
    await chatClient.upsertUser(userData);
    console.log("Stream user upserted successfully:", userData);
  } catch (error) {
    console.error("Error upserting Stream user:", error);
  }
};

export const deleteStreamUser = async (
  userId: string
): Promise<void> => {
  try {
    await chatClient.deleteUser(userId);
    console.log("Stream user deleted successfully:", userId);
  } catch (error) {
    console.error("Error deleting Stream user:", error);
  }
};