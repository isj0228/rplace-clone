// public/client.js
const socket = io();
let canvasSize, pixelData;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;

const colorPicker = document.getElementById('colorPicker');
let selectedColor = colorPicker.value;
colorPicker.addEventListener('input', e => selectedColor = e.target.value);

const brushSizeInput = document.getElementById('brushSize');
const brushSizeLabel = document.getElementById('brushSizeLabel');
let brushSize = parseInt(brushSizeInput.value, 10);
brushSizeInput.addEventListener('input', e => {
  brushSize = parseInt(e.target.value, 10);
  brushSizeLabel.textContent = brushSize;
});

socket.on('initialState', ({ canvasSize: size, pixelData: data }) => {
  canvasSize = size;
  pixelData = data;
  drawCanvas();
  createPalette();
});

socket.on('paint', ({ index, color }) => {
  pixelData[index] = color;
  drawPixel(index, color);
});

function drawCanvas() {
  const pixelSize = canvas.width / canvasSize;
  pixelData.forEach((color, i) => drawPixel(i, color));
}

function drawPixel(index, color) {
  const pixelSize = canvas.width / canvasSize;
  const x = (index % canvasSize) * pixelSize;
  const y = Math.floor(index / canvasSize) * pixelSize;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, pixelSize, pixelSize);
}

function getXY(e) {
  const rect = canvas.getBoundingClientRect();
  const pixelSize = canvas.width / canvasSize;
  const x = Math.floor((e.clientX - rect.left) / pixelSize);
  const y = Math.floor((e.clientY - rect.top) / pixelSize);
  return { x, y };
}

canvas.addEventListener('mousedown', e => { isDrawing = true; handlePaint(e); });
canvas.addEventListener('mousemove', e => { if (isDrawing) handlePaint(e); });
canvas.addEventListener('mouseup', () => { isDrawing = false; });
canvas.addEventListener('mouseleave', () => { isDrawing = false; });

function handlePaint(e) {
  const { x, y } = getXY(e);
  for (let dy = 0; dy < brushSize; dy++) {
    for (let dx = 0; dx < brushSize; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < canvasSize && ny >= 0 && ny < canvasSize) {
        const idx = ny * canvasSize + nx;
        socket.emit('paint', { index: idx, color: selectedColor });
      }
    }
  }
}

function createPalette() {
  const palette = document.getElementById('palette');
  const colors = ['#FFFFFF','#E4E4E4','#888888','#222222','#000000','#A06A42','#FFA7D1','#E50000','#E59500','#E5D900','#FFFF00','#94E044','#00FF00','#00D3DD','#0083C7','#0000EA','#CF6EE4','#FF00FF','#800080','#006400'];
  colors.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = color;
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
      selectedColor = color;
      colorPicker.value = color;
    });
    palette.appendChild(swatch);
  });
}
