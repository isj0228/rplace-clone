// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const canvasSize = 200;
let pixelData = Array(canvasSize * canvasSize).fill('#FFFFFF');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const pixelSchema = new mongoose.Schema({
  index: { type: Number, unique: true },
  color: String,
  updatedAt: Date
});
const Pixel = mongoose.model('Pixel', pixelSchema);

(async () => {
  try {
    const docs = await Pixel.find();
    docs.forEach(doc => { pixelData[doc.index] = doc.color; });
    console.log('Canvas state loaded from DB');
  } catch (e) {
    console.error('Error loading state:', e);
  }
})();

app.use(express.static('public'));

io.on('connection', socket => {
  socket.emit('initialState', { canvasSize, pixelData });
  socket.on('paint', async ({ index, color }) => {
    pixelData[index] = color;
    io.emit('paint', { index, color });
    try {
      await Pixel.findOneAndUpdate(
        { index },
        { index, color, updatedAt: new Date() },
        { upsert: true }
      );
    } catch (e) {
      console.error('DB write error:', e);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));