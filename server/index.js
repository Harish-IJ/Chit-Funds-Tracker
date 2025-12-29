const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'data');

// File paths
const FILES = {
  chits: path.join(DATA_DIR, 'chits.json'),
  chitMonths: path.join(DATA_DIR, 'chit-months.json'),
  participants: path.join(DATA_DIR, 'participants.json'),
  payments: path.join(DATA_DIR, 'payments.json'),
  cashMovements: path.join(DATA_DIR, 'cash-movements.json'),
  duesRecoveries: path.join(DATA_DIR, 'dues-recoveries.json'),
};

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory and files exist
async function ensureDataFiles() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  // Create empty files if they don't exist
  const emptyData = {
    chits: [],
    chitMonths: [],
    participants: [],
    payments: [],
    cashMovements: [],
    duesRecoveries: [],
  };

  for (const [key, filePath] of Object.entries(FILES)) {
    try {
      await fs.access(filePath);
    } catch {
      console.log(`Creating ${key}.json...`);
      await fs.writeFile(filePath, JSON.stringify(emptyData[key] || [], null, 2), 'utf8');
    }
  }
}

// Read a single file
async function readFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return [];
  }
}

// Write a single file
async function writeFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Read all data from separate files
async function readAllData() {
  const [chits, chitMonths, participants, payments, cashMovements, duesRecoveries] = await Promise.all([
    readFile(FILES.chits),
    readFile(FILES.chitMonths),
    readFile(FILES.participants),
    readFile(FILES.payments),
    readFile(FILES.cashMovements),
    readFile(FILES.duesRecoveries),
  ]);

  return {
    chits,
    chitMonths,
    participants,
    payments,
    companyCashMovements: cashMovements,
    duesRecoveries,
  };
}

// Write all data to separate files
async function writeAllData(data) {
  await Promise.all([
    writeFile(FILES.chits, data.chits || []),
    writeFile(FILES.chitMonths, data.chitMonths || []),
    writeFile(FILES.participants, data.participants || []),
    writeFile(FILES.payments, data.payments || []),
    writeFile(FILES.cashMovements, data.companyCashMovements || []),
    writeFile(FILES.duesRecoveries, data.duesRecoveries || []),
  ]);
}

// Routes

// Get all data
app.get('/api/data', async (req, res) => {
  try {
    const data = await readAllData();
    res.json(data);
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Save all data
app.post('/api/data', async (req, res) => {
  try {
    const data = req.body;
    await writeAllData(data);
    res.json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Get specific entity
app.get('/api/:entity', async (req, res) => {
  try {
    const { entity } = req.params;
    const fileMap = {
      chits: FILES.chits,
      'chit-months': FILES.chitMonths,
      participants: FILES.participants,
      payments: FILES.payments,
      'cash-movements': FILES.cashMovements,
      'dues-recoveries': FILES.duesRecoveries,
    };

    const filePath = fileMap[entity];
    if (!filePath) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    const data = await readFile(filePath);
    res.json(data);
  } catch (error) {
    console.error('Error reading entity:', error);
    res.status(500).json({ error: 'Failed to read entity' });
  }
});

// Reset data to test data
app.post('/api/reset', async (req, res) => {
  try {
    const testData = req.body;
    await writeAllData(testData);
    res.json({ success: true, message: 'Data reset successfully' });
  } catch (error) {
    console.error('Error resetting data:', error);
    res.status(500).json({ error: 'Failed to reset data' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
async function startServer() {
  await ensureDataFiles();
  app.listen(PORT, () => {
    console.log(`✅ Chit Fund API Server running on http://localhost:${PORT}`);
    console.log(`📁 Data directory: ${DATA_DIR}`);
    console.log(`📄 Files:`);
    Object.entries(FILES).forEach(([key, path]) => {
      console.log(`   - ${key}: ${path}`);
    });
  });
}

startServer().catch(console.error);
