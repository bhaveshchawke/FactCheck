require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const multer = require('multer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/fact-check', require('./routes/factCheck'));

// Global Error Handler
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ msg: 'File too large. Max limit is 10MB.' });
        }
    }
    console.error(err.stack);
    res.status(500).json({ msg: 'Server Error', error: err.message });
});


const path = require('path');
// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../client/dist')));

    // Handle SPA fallback
    app.get(/.*/, (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
