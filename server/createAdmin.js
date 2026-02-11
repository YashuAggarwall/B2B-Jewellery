import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

/**
 * Create Admin User Script
 * Run this to create your first admin account
 */

async function createAdmin() {
    try {
        await connectDB();

        // Admin user details - CHANGE THESE!
        const adminData = {
            name: 'Admin User',
            email: 'admin@jewellery.com',  // Change this to your email
            password: 'admin123',           // Change this to a secure password
            role: 'Admin',
            company: 'Jewellery Platform',
            isActive: true,
        };

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });

        if (existingAdmin) {
            console.log('❌ Admin user already exists with this email!');
            console.log(`📧 Email: ${existingAdmin.email}`);
            console.log(`👤 Role: ${existingAdmin.role}`);

            // Update existing user to Admin if needed
            if (existingAdmin.role !== 'Admin') {
                existingAdmin.role = 'Admin';
                await existingAdmin.save();
                console.log('✅ Updated existing user to Admin role!');
            }
        } else {
            // Create new admin user
            const admin = await User.create(adminData);
            console.log('\n✅ Admin user created successfully!\n');
            console.log('📧 Email:', admin.email);
            console.log('🔑 Password:', adminData.password);
            console.log('👤 Role:', admin.role);
            console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
}

createAdmin();
