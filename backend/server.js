// backend/server.js
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const WSPORT = 3001;


let wateringActive = false;

// 模拟传感器数据
function generateSensorData() {
  const ts = Math.floor(Date.now() / 1000);
  return {
    id: 'sensor1',
    temperature: (20 + Math.random() * 5).toFixed(1),
    humidity: (40 + Math.random() * 20).toFixed(1),
    soil: (30 + Math.random() * 20).toFixed(1),
    light: Math.floor(200 + Math.random() * 800),
    pressure: (1010 + Math.random() * 5).toFixed(1),
    timestamp: ts
  };
}

// REST API
app.get('/api/sensors', (req, res) => {
  res.json([{
    id: 'sensor1',
    last: generateSensorData(),
    history: []
  }]);
});

app.post('/api/water', (req, res) => {
  const { action } = req.body;
  wateringActive = action === 'start';
  res.json({ active: wateringActive });
});

app.listen(PORT, () => console.log(`REST API running on http://localhost:${PORT}`));

// WebSocket server
const wss = new WebSocketServer({ port: WSPORT });
wss.on('connection', ws => {
  console.log('WebSocket client connected');

  const interval = setInterval(() => {
    const data = generateSensorData();
    ws.send(JSON.stringify({ type: 'sensor', payload: data }));
    ws.send(JSON.stringify({ type: 'water', payload: { active: wateringActive } }));
  }, 5000);

  ws.on('close', () => clearInterval(interval));
});

console.log(`WebSocket running on ws://localhost:${WSPORT}`);
