/* public/client.js */
const socket = io();
let canvasSize, pixelData;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 중복을 줄인 팔레트 색상 목록
const paletteColors = [
  '#FFFFFF','#E4E4E4','#888888','#222222', // 흰색 계열
  '#E50000','#E59500','#E5D900','#94E044', // 빨강·주황·노랑·초록
  '#00D3DD','#0083C7','#0000EA','#CF6EE4'  // 청록·파랑·남색·보라
];
let selectedColor = paletteColors[0];

// 초기 상태 수신
socket.on('initialState', ({ canvasSize: size, pixelData: data }) => {
  canvasSize = size;
  pixelData = data;
  drawCanvas();
  createPalette();
});

// 픽셀 업데이트 수신
socket.on('paint', ({ index, color }) => {
  pixelData[index] = color;
  drawPixel(index, color);
});

function drawCanvas() {
  const pixelSize = canvas.width / canvasSize;
  for (let i = 0; i < canvasSize * canvasSize; i++) {
    drawPixel(i, pixelData[i]);
  }
}

function drawPixel(index, color) {
  const pixelSize = canvas.width / canvasSize;
  const x = (index % canvasSize) * pixelSize;
  const y = Math.floor(index / canvasSize) * pixelSize;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, pixelSize, pixelSize);
}

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const pixelSize = canvas.width / canvasSize;
  const x = Math.floor((e.clientX - rect.left) / pixelSize);
  const y = Math.floor((e.clientY - rect.top) / pixelSize);
  const index = y * canvasSize + x;
  socket.emit('paint', { index, color: selectedColor });
});

function createPalette() {
  const palette = document.getElementById('palette');
  paletteColors.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = color;
    swatch.addEventListener('click', () => {
      selectedColor = color;
    });
    palette.appendChild(swatch);
  });
}
