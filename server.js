// server.js
// 단순 웹소켓 서버: 채팅 연동 제거 (ngrok/Railway 배포용)
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// 캔버스 해상도를 200×200으로 설정하여 픽셀 크기를 5px로 고정
const canvasSize = 200;
const pixelData = Array(canvasSize * canvasSize).fill('#FFFFFF');

app.use(express.static('public'));

// Socket.io 연결 처리
io.on('connection', socket => {
  // 초기 캔버스 상태 전송
  socket.emit('initialState', { canvasSize, pixelData });

  // 클라이언트 픽셀 업데이트 수신
  socket.on('paint', ({ index, color }) => {
    pixelData[index] = color;
    io.emit('paint', { index, color });
  });
});

// 포트는 환경 변수 또는 기본 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
});
