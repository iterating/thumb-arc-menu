import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Existing routes
app.get('/api/data', (req, res) => {
  res.json({ message: 'Data from Vercel deployment!' });
});

// Log endpoints
app.post('/api/logs', (req, res) => {
  try {
    const logs = req.body;
    if (!Array.isArray(logs)) {
      return res.status(400).json({ error: 'Logs must be an array' });
    }
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Error processing logs:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
