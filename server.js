import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { sequelize, EventLog } from './src/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Log user input endpoint
app.post('/api/log-input', async (req, res) => {
  try {
    const { input, userId = 'anonymous' } = req.body;

    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'Invalid input provided' });
    }

    // Create an event log entry
    const event = await EventLog.create({
      timestamp: new Date(),
      event_type: 'user_input',
      event_data: {
        userId,
        input,
        inputLength: input.length,
        timestamp: new Date().toISOString(),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Input logged successfully',
      event: event,
    });
  } catch (error) {
    console.error('Error logging input:', error);
    res.status(500).json({ error: 'Failed to log input', details: error.message });
  }
});

// Get all event logs endpoint
app.get('/api/logs', async (req, res) => {
  try {
    const { limit = 100, offset = 0, event_type } = req.query;

    let query = {};
    if (event_type) {
      query.event_type = event_type;
    }

    const events = await EventLog.findAll({
      where: query,
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const count = await EventLog.count({ where: query });

    res.json({
      events,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs', details: error.message });
  }
});

// Get logs by user endpoint
app.get('/api/logs/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    const events = await EventLog.findAll({
      where: sequelize.where(
        sequelize.fn('jsonb_extract_text', sequelize.col('event_data'), 'userId'),
        '=',
        userId
      ),
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      userId,
      events,
      total: events.length,
    });
  } catch (error) {
    console.error('Error fetching user logs:', error);
    res.status(500).json({ error: 'Failed to fetch user logs', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Log input: POST http://localhost:${PORT}/api/log-input`);
  console.log(`Get all logs: http://localhost:${PORT}/api/logs`);
});
