import { Client } from "@stomp/stompjs";

let stompClient = null;

export const connectSocket = (token, roomCode, handlers) => {
  // prevent duplicate connections
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }

  stompClient = new Client({
    brokerURL: "ws://localhost:8080/ws",
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    debug: (str) => console.log("STOMP:", str),

    onConnect: () => {
      console.log("✅ STOMP CONNECTED");

      stompClient.subscribe(`/topic/watch/${roomCode}`, (msg) => {
        handlers?.onWatch?.(JSON.parse(msg.body));
      });

      stompClient.subscribe(`/topic/chat/${roomCode}`, (msg) => {
        handlers?.onChat?.(JSON.parse(msg.body));
      });
    },
  });

  stompClient.activate();
};

export const sendWatchEvent = (roomCode, payload) => {
  if (!stompClient?.connected) return;

  stompClient.publish({
    destination: `/app/watch/${roomCode}`,
    body: JSON.stringify(payload),
  });
};

export const sendChat = (roomCode, content) => {
  if (!stompClient?.connected) return;

  stompClient.publish({
    destination: `/app/chat/${roomCode}`,
    body: JSON.stringify({ content }),
  });
};