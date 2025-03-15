const router = require('express').Router();
const Coupon = require('../models/Coupon');

// Middleware to get client IP and session
const getClientInfo = (req, res, next) => {
    req.clientIp = req.ip || req.connection.remoteAddress;
    req.sessionId = req.cookies.sessionId || req.headers['x-session-id'];
    next();
};

// Middleware to check cooldown period
const checkCooldown = async (req, res, next) => {
    try {
        const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const recentClaim = await Coupon.findOne({
            'claimedBy.ip': req.clientIp,
            'claimedBy.claimedAt': {
                $gt: new Date(Date.now() - cooldownPeriod)
            }
        });

        if (recentClaim) {
            const timeLeft = new Date(recentClaim.claimedBy[0].claimedAt.getTime() + cooldownPeriod) - Date.now();
            const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));
            return res.status(429).json({
                message: `Please wait ${hoursLeft} hours before claiming another coupon.`
            });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error checking cooldown' });
    }
};

// Claim a coupon (Sequential distribution)
router.post('/claim', getClientInfo, checkCooldown, async (req, res) => {
    try {
        // Find the next available coupon in sequence
        const coupon = await Coupon.findOne({
            isActive: true,
            isUsed: false,
            expiryDate: { $gt: new Date() },
            'claimedBy.ip': { $ne: req.clientIp },
            'claimedBy.sessionId': { $ne: req.sessionId }
        }).sort({ sequenceNumber: 1 }); // Sort by sequence number for sequential assignment

        if (!coupon) {
            return res.status(404).json({ message: 'No available coupons' });
        }

        // Update coupon with claim information
        coupon.claimedBy.push({
            ip: req.clientIp,
            sessionId: req.sessionId,
            claimedAt: new Date()
        });
        coupon.isUsed = true;
        coupon.lastClaimAt = new Date();
        await coupon.save();

        // Set session cookie if not exists
        if (!req.cookies.sessionId) {
            res.cookie('sessionId', req.sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });
        }

        res.json({
            message: 'Coupon claimed successfully',
            coupon: {
                code: coupon.code,
                description: coupon.description,
                expiryDate: coupon.expiryDate,
                sequenceNumber: coupon.sequenceNumber
            }
        });
    } catch (error) {
        console.error('Claim error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get available coupon count (public)
router.get('/available', async (req, res) => {
    try {
        const count = await Coupon.countDocuments({
            isActive: true,
            isUsed: false,
            expiryDate: { $gt: new Date() }
        });
        res.json({ availableCoupons: count });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 