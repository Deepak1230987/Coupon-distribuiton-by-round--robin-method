const router = require('express').Router();
const Coupon = require('../models/Coupon');

// Middleware to get client IP and session
const getClientInfo = (req, res, next) => {
    // Get real IP address even behind proxy
    req.clientIp = req.headers['x-forwarded-for']?.split(',')[0] ||
        req.ip ||
        req.connection.remoteAddress;

    // Clean IPv6 localhost to IPv4
    if (req.clientIp === '::1' || req.clientIp === '::ffff:127.0.0.1') {
        req.clientIp = '127.0.0.1';
    }

    req.sessionId = req.cookies.sessionId || req.headers['x-session-id'];
    console.log('Client IP:', req.clientIp, 'Session:', req.sessionId);
    next();
};

// Middleware to check cooldown period
const checkCooldown = async (req, res, next) => {
    try {
        const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        // Only check for successful claims
        const recentClaim = await Coupon.findOne({
            'claimedBy': {
                $elemMatch: {
                    ip: req.clientIp,
                    claimedAt: { $gt: new Date(Date.now() - cooldownPeriod) }
                }
            },
            isUsed: true // Only consider successful claims
        });

        if (recentClaim) {
            // Find the most recent claim by this IP
            const lastClaim = recentClaim.claimedBy
                .filter(claim => claim.ip === req.clientIp)
                .sort((a, b) => b.claimedAt - a.claimedAt)[0];

            const timeLeft = new Date(lastClaim.claimedAt.getTime() + cooldownPeriod) - Date.now();
            const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));

            console.log('Cooldown active for IP:', req.clientIp, 'Hours left:', hoursLeft);
            return res.status(429).json({
                message: `Please wait ${hoursLeft} hours before claiming another coupon.`
            });
        }

        console.log('No cooldown for IP:', req.clientIp);
        next();
    } catch (error) {
        console.error('Cooldown check error:', error);
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
            // Check if this IP or session has already claimed this specific coupon
            'claimedBy.ip': { $ne: req.clientIp },
            'claimedBy.sessionId': { $ne: req.sessionId }
        }).sort({ lastClaimAt: 1, createdAt: 1 }); // Sort by last claim time and creation time

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
                sameSite: 'None',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });
        }

        console.log('Coupon claimed successfully:', {
            ip: req.clientIp,
            couponCode: coupon.code,
            claimTime: new Date()
        });

        res.json({
            message: 'Coupon claimed successfully',
            coupon: {
                code: coupon.code,
                description: coupon.description,
                expiryDate: coupon.expiryDate
            }
        });
    } catch (error) {
        console.error('Claim error:', error);
        res.status(500).json({ message: 'Failed to claim coupon' });
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