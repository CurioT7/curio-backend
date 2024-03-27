const Websocket = require("ws");
//get .env
require("dotenv").config();

const wss = new Websocket.Server({ port: process.env.PORT });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log(`Received message => ${message}`);
    ws.send(`Received message => ${message}`);

    // Broadcast message to all clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === Websocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
