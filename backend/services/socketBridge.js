import { io } from "socket.io-client";
const flaskSocket = io(process.env.FLASK_SOCKET_URL, { transports: ["websocket"] });
flaskSocket.on("connect", () => console.log("Connected to Flask Microservice"));
flaskSocket.on("disconnect", () => console.log("Disconnected from Flask"));
export default flaskSocket;
