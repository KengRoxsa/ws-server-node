const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.PORT || 3001 });

const rooms = {};

wss.on('connection', (ws, req) => {
  const params = new URLSearchParams(req.url.slice(1));
  const roomId = params.get('roomId');

  if (!roomId) {
    console.log("❌ No roomId provided");
    ws.close();
    return;
  }

  console.log(`🟢 Connected to room: ${roomId}`);
  if (!rooms[roomId]) rooms[roomId] = [];
  rooms[roomId].push(ws);

  ws.on('message', (message) => {
    console.log(`📨 Message received in room ${roomId}:`, message);

    // Broadcast to all clients in the room
    rooms[roomId].forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log(`🔴 Disconnected from room: ${roomId}`);
    rooms[roomId] = rooms[roomId].filter((client) => client !== ws);
    if (rooms[roomId].length === 0) delete rooms[roomId];
  });
});
