const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Initialize PIN (first time setup)
const initializePIN = async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin || pin.length < 4 || pin.length > 6) {
      return res.status(400).json({ error: 'PIN must be 4-6 digits' });
    }

    // Check if PIN already exists
    const checkResult = await pool.query('SELECT id FROM app_config LIMIT 1');
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'PIN already initialized' });
    }

    const pinHash = await bcrypt.hash(pin, parseInt(process.env.PIN_SALT_ROUNDS));
    
    await pool.query(
      'INSERT INTO app_config (pin_hash) VALUES ($1)',
      [pinHash]
    );

    res.json({ message: 'PIN initialized successfully' });
  } catch (error) {
    console.error('Error initializing PIN:', error);
    res.status(500).json({ error: 'Failed to initialize PIN' });
  }
};

// Verify PIN
const verifyPIN = async (req, res) => {
  try {
    const { pin } = req.body;

    const result = await pool.query('SELECT pin_hash FROM app_config LIMIT 1');
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'PIN not initialized' });
    }

    const isValid = await bcrypt.compare(pin, result.rows[0].pin_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    const token = jwt.sign(
      { authenticated: true },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, message: 'Authentication successful' });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Check if PIN exists
const checkPINExists = async (req, res) => {
  try {
    const result = await pool.query('SELECT id FROM app_config LIMIT 1');
    res.json({ exists: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking PIN:', error);
    res.status(500).json({ error: 'Failed to check PIN status' });
  }
};

// Change PIN
const changePIN = async (req, res) => {
  try {
    const { currentPin, newPin } = req.body;

    if (!currentPin || !newPin) {
      return res.status(400).json({ error: 'Current PIN and new PIN are required' });
    }

    if (newPin.length < 4 || newPin.length > 6) {
      return res.status(400).json({ error: 'New PIN must be 4-6 digits' });
    }

    if (!/^\d+$/.test(newPin)) {
      return res.status(400).json({ error: 'PIN must contain only numbers' });
    }

    // Get current PIN hash
    const result = await pool.query('SELECT pin_hash FROM app_config LIMIT 1');
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'PIN not initialized' });
    }

    // Verify current PIN
    const isValid = await bcrypt.compare(currentPin, result.rows[0].pin_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Current PIN is incorrect' });
    }

    // Hash new PIN
    const newPinHash = await bcrypt.hash(newPin, parseInt(process.env.PIN_SALT_ROUNDS));
    
    // Update PIN
    await pool.query(
      'UPDATE app_config SET pin_hash = $1, updated_at = CURRENT_TIMESTAMP',
      [newPinHash]
    );

    res.json({ message: 'PIN changed successfully' });
  } catch (error) {
    console.error('Error changing PIN:', error);
    res.status(500).json({ error: 'Failed to change PIN' });
  }
};

module.exports = {
  initializePIN,
  verifyPIN,
  checkPINExists,
  changePIN
};
