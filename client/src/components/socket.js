import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const SOCKET_URL = "https://slippery-aleen-denish1633-9ece0d96.koyeb.app/ws"; // ws endpoint

const sock = new SockJS(SOCKET_URL);

const stompClient = new Client({
  webSocketFactory: () => sock,
  reconnectDelay: 5000,
  debug: (msg) => console.log(msg),
});

stompClient.onConnect = () => {
  console.log("🟢 Connected to WebSocket server");

  stompClient.subscribe("/topic/messages", (message) => {
    console.log("New message:", JSON.parse(message.body));
  });
};

stompClient.activate();

export default stompClient;
