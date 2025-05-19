require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// In-memory cache
const cache = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

// Cache middleware
const cacheMiddleware = (duration) => async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    const cachedData = cache.get(key);
    
    if (cachedData && Date.now() < cachedData.expiry) {
        return res.json(cachedData.data);
    }
    
    next();
};

// Routes
app.get('/earthquakes', cacheMiddleware(process.env.CACHE_TTL_EARTHQUAKES || 300), async (req, res) => {
    try {
        const { startTime, endTime, minMagnitude, maxMagnitude, limit = 10 } = req.query;
        const params = new URLSearchParams();
        
        if (startTime) params.append('starttime', startTime);
        if (endTime) params.append('endtime', endTime);
        if (minMagnitude) params.append('minmagnitude', minMagnitude);
        if (maxMagnitude) params.append('maxmagnitude', maxMagnitude);
        params.append('limit', limit);
        params.append('format', 'geojson');

        const response = await axios.get(`https://earthquake.usgs.gov/fdsnws/event/1/query?${params}`);
        
        // Cache the response
        const key = `cache:${req.originalUrl}`;
        cache.set(key, {
            data: response.data,
            expiry: Date.now() + ((process.env.CACHE_TTL_EARTHQUAKES || 300) * 1000)
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch earthquake data' });
    }
});

app.get('/earthquakes/:id', cacheMiddleware(process.env.CACHE_TTL_EARTHQUAKE_DETAILS || 600), async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://earthquake.usgs.gov/fdsnws/event/1/query?eventid=${id}&format=geojson`);
        
        // Cache the response
        const key = `cache:${req.originalUrl}`;
        cache.set(key, {
            data: response.data,
            expiry: Date.now() + ((process.env.CACHE_TTL_EARTHQUAKE_DETAILS || 600) * 1000)
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch earthquake details' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 