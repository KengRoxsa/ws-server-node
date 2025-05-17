const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3001 });

const rooms = {}; // เก็บข้อมูลห้องต่างๆ

wss.on('connection', (ws, req) => {
  const params = new URLSearchParams(req.url.slice(1)); // ดึง query params จาก URL
  const roomId = params.get('roomId');

  // ถ้ายังไม่มีห้องนี้ใน rooms, สร้างห้องใหม่
  if (!rooms[roomId]) {
    rooms[roomId] = [];
  }

  // เพิ่มผู้ใช้เข้าห้องที่กำหนด
  rooms[roomId].push(ws);

  // เมื่อมีการรับข้อความจาก client
  ws.on('message', (message) => {
    // ส่งข้อความไปยังทุกคนในห้องเดียวกัน
    rooms[roomId].forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message); // ส่งข้อความไปยังผู้ใช้ทุกคนในห้อง
      }
    });
  });

  // เมื่อผู้ใช้ปิดการเชื่อมต่อ
  ws.on('close', () => {
    // ลบผู้ใช้ที่ออกจากห้อง
    rooms[roomId] = rooms[roomId].filter((client) => client !== ws);
  });
});
