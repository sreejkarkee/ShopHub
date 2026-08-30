import authController from './controllers/authController.js';
import dbConnection from './config/db.js';
import express from 'express';

app = express();
app.use(express.json());

// Connect to database
dbConnection();

// Routes
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);

export default app;