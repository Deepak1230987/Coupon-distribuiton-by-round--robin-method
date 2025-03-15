require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Enable trust proxy
app.set('trust proxy', true);

const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.LOCAL_CLIENT_URL, // ✅ Now includes localhost
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.log("Blocked by CORS:", origin);
                callback(new Error("CORS not allowed"));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Session-ID"],
        credentials: true,
    })
);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Handle Preflight Requests
app.options("*", cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 5, // Increased from 3 to 5 requests per windowMs
    message: 'Too many coupon claim attempts from this IP, please try again after 24 hours',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        console.log('Rate limit exceeded for IP:', req.ip);
        res.status(429).json({
            message: 'Too many coupon claim attempts. Please try again later.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / (1000 * 60 * 60)) // hours until reset
        });
    }
});

// Admin login rate limiter
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: 'Too many login attempts, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false
});

// Apply rate limiting to routes
app.use('/api/coupons/claim', limiter);
app.use('/api/auth/login', loginLimiter);

// Routes
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/coupons', require('./routes/coupon.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 