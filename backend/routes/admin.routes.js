const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Coupon = require('../models/Coupon');

// Middleware to verify admin token
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.adminId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Get all coupons (admin only)
router.get('/coupons', verifyToken, async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ message: 'Failed to fetch coupons' });
    }
});

// Get next available coupon
router.get('/coupons/next', async (req, res) => {
    try {
        const ip = req.ip;
        const sessionId = req.cookies.sessionId;

        // Check cooldown period (24 hours)
        const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const lastClaim = await Coupon.findOne({
            'claimedBy.ip': ip,
            'claimedBy.claimedAt': {
                $gt: new Date(Date.now() - cooldownPeriod)
            }
        });

        if (lastClaim) {
            const timeLeft = cooldownPeriod - (Date.now() - new Date(lastClaim.claimedBy[lastClaim.claimedBy.length - 1].claimedAt).getTime());
            return res.status(429).json({
                message: 'Please wait before claiming another coupon',
                timeLeft: Math.ceil(timeLeft / (1000 * 60 * 60)) // hours remaining
            });
        }

        // Find next available coupon
        const nextCoupon = await Coupon.findOne({
            isActive: true,
            isUsed: false,
            expiryDate: { $gt: new Date() },
            'claimedBy.sessionId': { $ne: sessionId },
            'claimedBy.ip': { $ne: ip }
        }).sort({ lastClaimAt: 1, createdAt: 1 });

        if (!nextCoupon) {
            return res.status(404).json({ message: 'No coupons available' });
        }

        res.json({ code: nextCoupon.code });
    } catch (error) {
        console.error('Error getting next coupon:', error);
        res.status(500).json({ message: 'Failed to get next coupon' });
    }
});

// Add new coupon
router.post('/coupons', verifyToken, async (req, res) => {
    try {
        const { code, description, expiryDate } = req.body;

        // Validate required fields
        if (!code || !description || !expiryDate) {
            return res.status(400).json({
                message: 'Missing required fields',
                details: {
                    code: !code ? 'Code is required' : null,
                    description: !description ? 'Description is required' : null,
                    expiryDate: !expiryDate ? 'Expiry date is required' : null
                }
            });
        }

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        // Create and save the new coupon
        const coupon = new Coupon({
            code,
            description,
            expiryDate,
            isActive: true
        });

        await coupon.save();
        res.status(201).json(coupon);
    } catch (error) {
        console.error('Error creating coupon:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Failed to create coupon', error: error.message });
    }
});

// Claim coupon
router.post('/coupons/:code/claim', async (req, res) => {
    try {
        const { code } = req.params;
        const ip = req.ip;
        const sessionId = req.cookies.sessionId;

        // Check cooldown period (24 hours)
        const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const lastClaim = await Coupon.findOne({
            'claimedBy.ip': ip,
            'claimedBy.claimedAt': {
                $gt: new Date(Date.now() - cooldownPeriod)
            }
        });

        if (lastClaim) {
            const timeLeft = cooldownPeriod - (Date.now() - new Date(lastClaim.claimedBy[lastClaim.claimedBy.length - 1].claimedAt).getTime());
            return res.status(429).json({
                message: 'Please wait before claiming another coupon',
                timeLeft: Math.ceil(timeLeft / (1000 * 60 * 60)) // hours remaining
            });
        }

        // Find and update the coupon
        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true,
            isUsed: false,
            expiryDate: { $gt: new Date() },
            'claimedBy.sessionId': { $ne: sessionId },
            'claimedBy.ip': { $ne: ip }
        });

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not available' });
        }

        // Update coupon with claim information
        coupon.claimedBy.push({ ip, sessionId });
        coupon.lastClaimAt = new Date();
        coupon.isUsed = true;
        await coupon.save();

        res.json({
            message: 'Coupon claimed successfully',
            code: coupon.code,
            description: coupon.description
        });
    } catch (error) {
        console.error('Error claiming coupon:', error);
        res.status(500).json({ message: 'Failed to claim coupon' });
    }
});

// Update coupon
router.put('/coupons/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive, description, expiryDate } = req.body;

        const coupon = await Coupon.findByIdAndUpdate(
            id,
            { isActive, description, expiryDate },
            { new: true, runValidators: true }
        );

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        res.json(coupon);
    } catch (error) {
        console.error('Error updating coupon:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Failed to update coupon' });
    }
});

// Get claim history
router.get('/claims', verifyToken, async (req, res) => {
    try {
        const coupons = await Coupon.find({ 'claimedBy.0': { $exists: true } })
            .select('code claimedBy createdAt')
            .sort({ 'claimedBy.claimedAt': -1 });
        res.json(coupons);
    } catch (error) {
        console.error('Error fetching claims:', error);
        res.status(500).json({ message: 'Failed to fetch claims' });
    }
});

module.exports = router; 
