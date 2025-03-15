require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const createFirstAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Check if admin already exists
        const adminExists = await Admin.findOne({ username: 'admin' });
        if (adminExists) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create new admin user
        const admin = new Admin({
            username: 'admin',
            password: 'admin123', // This will be hashed by the pre-save middleware
            email: 'admin@example.com'
        });

        await admin.save();
        console.log('Admin user created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createFirstAdmin(); 