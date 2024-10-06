// server.js

const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors'); // Ensure cors is required

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Enable CORS
app.use(cors());

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }
  console.log('Connected to the MySQL database.');
  connection.release();
});

// Root route for testing
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// GET endpoint to retrieve all patients
app.get('/patients', (req, res) => {
    const sql = `
      SELECT 
        patient_id, 
        first_name, 
        last_name, 
        date_of_birth 
      FROM 
        patients
     `;
    pool.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching patients:', err.message);
        return res.status(500).json({ error: 'Database query failed' });
      }
      res.json(results);
    });
  });
  
// GET endpoint to retrieve all providers
app.get('/providers', (req, res) => {
    const sql = `
      SELECT 
        first_name, 
        last_name, 
        provider_specialty 
      FROM 
        providers
    `;
    pool.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching providers:', err.message);
        return res.status(500).json({ error: 'Database query failed' });
      }
      res.json(results);
    });
  });

  // GET endpoint to retrieve patients by first name
app.get('/patients/search', (req, res) => {
    const { first_name } = req.query;
    
    if (!first_name) {
      return res.status(400).json({ error: 'First name is required' });
    }
  
    const sql = `
      SELECT 
        patient_id, 
        first_name, 
        last_name, 
        date_of_birth 
      FROM 
        patients 
      WHERE 
        first_name = ?
    `;
  
    pool.query(sql, [first_name], (err, results) => {
      if (err) {
        console.error('Error fetching patients:', err.message);
        return res.status(500).json({ error: 'Database query failed' });
      }
  
      // If no patients are found
      if (results.length === 0) {
        return res.status(404).json({ message: `No patients found with the first name: ${first_name}` });
      }
  
      // Return the found patients
      res.json(results);
    });
  });

  // GET endpoint to retrieve providers by specialty
app.get('/providers/search', (req, res) => {
    const { provider_specialty } = req.query;
  
    // Check if provider_specialty is provided in the query
    if (!provider_specialty) {
      return res.status(400).json({ error: 'Provider specialty is required' });
    }
  
    const sql = `
      SELECT 
        first_name, 
        last_name, 
        provider_specialty 
      FROM 
        providers 
      WHERE 
        provider_specialty = ?
    `;
  
    pool.query(sql, [provider_specialty], (err, results) => {
      if (err) {
        console.error('Error fetching providers:', err.message);
        return res.status(500).json({ error: 'Database query failed' });
      }
  
      // If no providers are found
      if (results.length === 0) {
        return res.status(404).json({ message: `No providers found with the specialty: ${provider_specialty}` });
      }
  
      // Return the found providers
      res.json(results);
    });
  });
  
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
