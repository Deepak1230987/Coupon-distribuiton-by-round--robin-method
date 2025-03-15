const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        trim: true,
        uppercase: true,
        validate: {
            validator: function (v) {
                return v && v.toLowerCase() !== 'null' && v.trim().length > 0;
            },
            message: 'Invalid coupon code'
        }
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        validate: {
            validator: function (v) {
                return v && v.toLowerCase() !== 'null' && v.trim().length > 0;
            },
            message: 'Invalid description'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiryDate: {
        type: Date,
        required: [true, 'Expiry date is required'],
        validate: {
            validator: function (v) {
                return v > new Date();
            },
            message: 'Expiry date must be in the future'
        }
    },
    claimedBy: [{
        ip: String,
        sessionId: String,
        claimedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isUsed: {
        type: Boolean,
        default: false
    },
    lastClaimAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for optimizing round-robin queries
couponSchema.index({ lastClaimAt: 1, createdAt: 1 });

// Index for optimizing cooldown period checks
couponSchema.index({ 'claimedBy.ip': 1, 'claimedBy.claimedAt': 1 });

// Pre-save middleware to ensure code is uppercase and properly formatted
couponSchema.pre('save', function (next) {
    if (this.code) {
        this.code = this.code.trim().toUpperCase();
    }
    if (this.description) {
        this.description = this.description.trim();
    }
    next();
});

module.exports = mongoose.model('Coupon', couponSchema); 