const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.get('/', (req, res) => {
  console.log(`[GET /] Request received from ${req.ip}`);
  res.send('Hello from backend!');
});

app.post('/data', (req, res) => {
  console.log(`[POST /data] Received payload:`, req.body);
  res.status(201).send({ message: 'Data received' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});