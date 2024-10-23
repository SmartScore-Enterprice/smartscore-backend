const express = require('express');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware to parse incoming JSON
app.use(express.json());

// Test route to check if server is working
app.get('/', (req, res) => {
  res.send('Welcome to SmartScore Backend');
});

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
