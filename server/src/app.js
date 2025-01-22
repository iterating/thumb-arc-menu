import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log file path
const LOG_FILE = path.join(process.cwd(), 'logs', 'console.log');
const LOG_FILE_TEMP = LOG_FILE + '.tmp';

// Ensure logs directory exists
fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });

// Atomic write function
const atomicWrite = (filePath, data) => {
  const tempPath = filePath + '.tmp';
  fs.writeFileSync(tempPath, data);
  fs.renameSync(tempPath, filePath);
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Log endpoints
app.post('/api/logs', (req, res) => {
  try {
    const logs = req.body;
    if (!Array.isArray(logs)) {
      return res.status(400).json({ error: 'Logs must be an array' });
    }
    
    // Write logs atomically
    atomicWrite(LOG_FILE, JSON.stringify(logs, null, 2));
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Error writing logs:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/logs', (req, res) => {
  try {
    if (fs.existsSync(LOG_FILE)) {
      fs.unlinkSync(LOG_FILE);
    }
    if (fs.existsSync(LOG_FILE_TEMP)) {
      fs.unlinkSync(LOG_FILE_TEMP);
    }
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Error deleting logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
