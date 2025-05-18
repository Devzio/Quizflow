import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Path to the edge criteria JSON file
const edgeCriteriaFilePath = join(__dirname, 'src', 'config', 'edgeCriteriaOptions.json');

// Path to the node criteria JSON file
const nodeCriteriaFilePath = join(__dirname, 'src', 'config', 'nodeCriteriaOptions.json');

// Endpoint to get all edge criteria
app.get('/api/edge-criteria', (req, res) => {
  try {
    const data = fs.readFileSync(edgeCriteriaFilePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading edge criteria file:', error);
    res.status(500).json({ error: 'Failed to read edge criteria' });
  }
});

// Endpoint to update all edge criteria
app.put('/api/edge-criteria', (req, res) => {
  try {
    const updatedCriteria = req.body;

    if (!Array.isArray(updatedCriteria)) {
      return res.status(400).json({ error: 'Invalid data format. Expected an array.' });
    }

    // Sort the criteria before saving
    const sortedCriteria = updatedCriteria.sort((a, b) => a.label.localeCompare(b.label));

    // Write to file with pretty formatting
    fs.writeFileSync(edgeCriteriaFilePath, JSON.stringify(sortedCriteria, null, 2), 'utf8');

    res.json({ success: true, message: 'Edge criteria updated successfully' });
  } catch (error) {
    console.error('Error updating edge criteria file:', error);
    res.status(500).json({ error: 'Failed to update edge criteria' });
  }
});

// Endpoint to get all node criteria
app.get('/api/node-criteria', (req, res) => {
  try {
    // Directly reads the node CriteriaOptions file
    const data = fs.readFileSync(nodeCriteriaFilePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading node criteria file:', error);
    res.status(500).json({ error: 'Failed to read node criteria' });
  }
});

// Endpoint to update all node criteria
app.put('/api/node-criteria', (req, res) => {
  try {
    const updatedCriteria = req.body;

    if (!Array.isArray(updatedCriteria)) {
      return res.status(400).json({ error: 'Invalid data format. Expected an array.' });
    }

    // Sort the criteria before saving
    const sortedCriteria = updatedCriteria.sort((a, b) => a.label.localeCompare(b.label));

    // Write to file with pretty formatting
    fs.writeFileSync(nodeCriteriaFilePath, JSON.stringify(sortedCriteria, null, 2), 'utf8');

    res.json({ success: true, message: 'Node criteria updated successfully' });
  } catch (error) {
    console.error('Error updating node criteria file:', error);
    res.status(500).json({ error: 'Failed to update node criteria' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});