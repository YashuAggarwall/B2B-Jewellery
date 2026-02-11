import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

/**
 * Create Sales User Script
 */

async function createSalesUser() {
    try {
        await connectDB();

        const salesData = {
            name: 'Sales User',
            email: 'sales@jewellery.com',
            password: 'sales123',
            role: 'Sales',
            company: 'Jewellery Platform',
            isActive: true,
        };

        const existingUser = await User.findOne({ email: salesData.email });

        if (existingUser) {
            console.log('❌ User already exists!');
            if (existingUser.role !== 'Sales') {
                existingUser.role = 'Sales';
                await existingUser.save();
                console.log('✅ Updated existing user to Sales role!');
            }
        } else {
            const user = await User.create(salesData);
            console.log('\n✅ Sales user created successfully!\n');
            console.log('📧 Email:', user.email);
            console.log('🔑 Password:', salesData.password);
            console.log('👤 Role:', user.role);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createSalesUser();
