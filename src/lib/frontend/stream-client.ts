import { StreamVideoClient } from "@stream-io/video-react-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

let client: StreamVideoClient | null = null;
let currentUserId: string | null = null;

export const initializeStreamClient = async (user: any, token: string) => {
  if (client && currentUserId === user.id) {
    return client;
  }

  if (client) {
    await disconnectStreamClient();
  }

  client = new StreamVideoClient({
    apiKey,
    user,
    token,
  });

  currentUserId = user.id;

  return client;
};

export const disconnectStreamClient = async () => {
  if (client) {
    await client.disconnectUser();
    client = null;
    currentUserId = null;
  }
};