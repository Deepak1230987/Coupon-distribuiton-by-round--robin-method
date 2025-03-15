require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// CORS Configuration
// const allowedOrigins = [
//     process.env.CLIENT_URL,
//     process.env.LOCAL_CLIENT_URL || "http://localhost:5173"
// ].filter(Boolean); // Remove undefined values
const allowedOrigins =[process.env.CLIENT_URL];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
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
    max: 3, // Limit each IP to 3 requests per windowMs
    message: 'Too many coupon claims from this IP, please try again after 24 hours'
});

// Apply rate limiting to coupon claim route
app.use('/coupons/claim', limiter);

// Routes
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

app.use('/auth', require('./routes/auth.routes'));
app.use('/coupons', require('./routes/coupon.routes'));
app.use('/admin', require('./routes/admin.routes'));

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