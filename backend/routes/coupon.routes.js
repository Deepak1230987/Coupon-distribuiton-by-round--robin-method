const router = require('express').Router();
const Coupon = require('../models/Coupon');

// Middleware to get client IP and session
const getClientInfo = (req, res, next) => {
    try {
        // Get real IP address even behind proxy
        req.clientIp = req.headers['x-forwarded-for']?.split(',')[0] ||
            req.ip ||
            req.connection.remoteAddress;

        // Clean IPv6 localhost to IPv4
        if (req.clientIp === '::1' || req.clientIp === '::ffff:127.0.0.1') {
            req.clientIp = '127.0.0.1';
        }

        req.sessionId = req.cookies.sessionId || req.headers['x-session-id'];
        console.log('Client Info:', {
            ip: req.clientIp,
            sessionId: req.sessionId,
            headers: req.headers
        });
        next();
    } catch (error) {
        console.error('Error in getClientInfo middleware:', error);
        res.status(500).json({ message: 'Error processing request' });
    }
};

// Middleware to check cooldown period
const checkCooldown = async (req, res, next) => {
    try {
        const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        // Find any successful claims by this IP in the last 24 hours
        const recentClaims = await Coupon.find({
            'claimedBy.ip': req.clientIp,
            'claimedBy.claimedAt': { $gt: new Date(Date.now() - cooldownPeriod) }
        });

        // If no claims found, allow the request
        if (!recentClaims || recentClaims.length === 0) {
            console.log('No recent claims found for IP:', req.clientIp);
            return next();
        }

        // Get the most recent claim time for this IP across all coupons
        let mostRecentClaimTime = new Date(0);
        recentClaims.forEach(coupon => {
            coupon.claimedBy.forEach(claim => {
                if (claim.ip === req.clientIp && claim.claimedAt > mostRecentClaimTime) {
                    mostRecentClaimTime = claim.claimedAt;
                }
            });
        });

        const timeLeft = new Date(mostRecentClaimTime.getTime() + cooldownPeriod) - Date.now();
        const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));

        if (timeLeft > 0) {
            console.log('Cooldown active for IP:', req.clientIp, 'Hours left:', hoursLeft);
            return res.status(429).json({
                message: `Please wait ${hoursLeft} hours before claiming another coupon.`
            });
        }

        console.log('Cooldown expired for IP:', req.clientIp);
        next();
    } catch (error) {
        console.error('Cooldown check error:', error);
        res.status(500).json({ message: 'Server error checking cooldown' });
    }
};

// Claim a coupon (Sequential distribution)
router.post('/claim', getClientInfo, checkCooldown, async (req, res) => {
    try {
        console.log('Starting coupon claim process for:', {
            ip: req.clientIp,
            sessionId: req.sessionId
        });

        // Find the next available coupon in sequence
        const coupon = await Coupon.findOne({
            isActive: true,
            isUsed: false,
            expiryDate: { $gt: new Date() }
        }).sort({ lastClaimAt: 1, createdAt: 1 });

        if (!coupon) {
            console.log('No available coupons found');
            return res.status(404).json({ message: 'No available coupons' });
        }

        // Check if this IP has claimed this specific coupon
        const hasClaimedThis = coupon.claimedBy.some(claim => claim.ip === req.clientIp);
        if (hasClaimedThis) {
            console.log('IP has already claimed this coupon:', req.clientIp);
            return res.status(400).json({ message: 'You have already claimed this coupon' });
        }

        // Update coupon with claim information
        coupon.claimedBy.push({
            ip: req.clientIp,
            sessionId: req.sessionId,
            claimedAt: new Date()
        });

        coupon.isUsed = true;
        coupon.lastClaimAt = new Date();

        console.log('Saving coupon claim:', {
            couponId: coupon._id,
            code: coupon.code,
            ip: req.clientIp
        });

        await coupon.save();

        // Set session cookie if not exists
        if (!req.cookies.sessionId && req.sessionId) {
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
        res.status(500).json({
            message: 'Failed to claim coupon',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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